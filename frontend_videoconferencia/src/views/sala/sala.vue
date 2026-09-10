<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerUsuario } from '@/services/sesionUsuario'
import { sesionServicio, type Sesion } from '@/services/sesion.servicio'
import { obtenerSocket, cerrarSocket } from '@/services/senalizacion.servicio'
import { crearConexionPar } from '@/services/sala.rtc'

interface UsuarioRemoto {
  _id: string
  nombre: string
}

interface SolicitudIngreso {
  socketId: string
  usuario: UsuarioRemoto
}

interface ConexionParticipante {
  socketId: string
  usuario: UsuarioRemoto
  conexion: RTCPeerConnection
  stream: MediaStream | null
  debeCederAnteChoque: boolean
  haciendoOferta: boolean
  respuestaPendiente: boolean
}

type EstadoConexion = 'conectando' | 'esperando' | 'admitido' | 'rechazado' | 'error'

const route = useRoute()
const router = useRouter()
const sesionId = route.params.sesionId as string
const usuario = obtenerUsuario()
const socket = obtenerSocket()

const sesion = ref<Sesion | null>(null)
const estadoConexion = ref<EstadoConexion>('conectando')
const mensajeEstado = ref('')
const solicitudesPendientes = ref<SolicitudIngreso[]>([])
const participantes = reactive(new Map<string, ConexionParticipante>())
const listaParticipantes = computed(() => [...participantes.values()])

type Dispositivo = 'audio' | 'video'
const activos = reactive({ audio: false, video: false })
const solicitando = reactive({ audio: false, video: false })
const errores = reactive({ audio: '', video: '' })
const videoLocal = ref<HTMLVideoElement | null>(null)
const flujos: Record<Dispositivo, MediaStream | null> = { audio: null, video: null }
let salaCerrada = false

// Cuando ambos lados intentan renegociar la conexión al mismo tiempo (ej. los dos
// activan la cámara a la vez), alguien debe ceder para evitar un choque de ofertas.
// Se decide comparando los ids de socket: siempre da el mismo resultado en ambos
// extremos, así que no hace falta coordinarlo por señalización.
function debeCederElPasoAntesChoque(socketIdRemoto: string): boolean {
  return socket.id! > socketIdRemoto
}

function vincularVideoRemoto(elemento: Element | null, entrada: ConexionParticipante): void {
  if (elemento instanceof HTMLVideoElement) {
    elemento.srcObject = entrada.stream
  }
}

function agregarPistasLocales(conexion: RTCPeerConnection): void {
  for (const flujo of Object.values(flujos)) {
    flujo?.getTracks().forEach((pista) => conexion.addTrack(pista, flujo))
  }
}

function obtenerOCrearParticipante(socketId: string, usuarioRemoto: UsuarioRemoto): ConexionParticipante {
  const existente = participantes.get(socketId)
  if (existente) {
    return existente
  }

  const conexion = crearConexionPar()
  const entrada: ConexionParticipante = {
    socketId,
    usuario: usuarioRemoto,
    conexion,
    stream: null,
    debeCederAnteChoque: debeCederElPasoAntesChoque(socketId),
    haciendoOferta: false,
    respuestaPendiente: false,
  }

  conexion.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit('senal:candidato', { destino: socketId, candidato: candidate })
    }
  }

  conexion.ontrack = (evento) => {
    entrada.stream = evento.streams[0] ?? null
  }

  conexion.onnegotiationneeded = async () => {
    try {
      entrada.haciendoOferta = true
      await conexion.setLocalDescription()
      socket.emit('senal:oferta', { destino: socketId, oferta: conexion.localDescription })
    } catch (error) {
      console.error('No se pudo negociar la conexión de video', error)
    } finally {
      entrada.haciendoOferta = false
    }
  }

  agregarPistasLocales(conexion)
  participantes.set(socketId, entrada)
  return entrada
}

async function alRecibirDescripcion(
  socketId: string,
  descripcion: RTCSessionDescriptionInit,
  usuarioRemoto?: UsuarioRemoto,
): Promise<void> {
  const entrada = usuarioRemoto ? obtenerOCrearParticipante(socketId, usuarioRemoto) : participantes.get(socketId)

  if (!entrada) {
    return
  }

  const esOferta = descripcion.type === 'offer'
  const listoParaOfertaRemota =
    !entrada.haciendoOferta && (entrada.conexion.signalingState === 'stable' || entrada.respuestaPendiente)

  if (esOferta && !listoParaOfertaRemota && !entrada.debeCederAnteChoque) {
    return
  }

  entrada.respuestaPendiente = descripcion.type === 'answer'
  await entrada.conexion.setRemoteDescription(descripcion)
  entrada.respuestaPendiente = false

  if (esOferta) {
    await entrada.conexion.setLocalDescription()
    socket.emit('senal:respuesta', { destino: socketId, respuesta: entrada.conexion.localDescription })
  }
}

function cerrarParticipante(socketId: string): void {
  participantes.get(socketId)?.conexion.close()
  participantes.delete(socketId)
}

function registrarEventosSocket(): void {
  socket.on('sala:esperando', () => {
    estadoConexion.value = 'esperando'
  })

  socket.on('sala:solicitudIngreso', (solicitud: SolicitudIngreso) => {
    solicitudesPendientes.value.push(solicitud)
  })

  socket.on('sala:admitido', ({ participantes: existentes }: { participantes: SolicitudIngreso[] }) => {
    estadoConexion.value = 'admitido'
    existentes.forEach(({ socketId, usuario: usuarioRemoto }) => obtenerOCrearParticipante(socketId, usuarioRemoto))
  })

  socket.on('sala:nuevoParticipante', ({ socketId, usuario: usuarioRemoto }: SolicitudIngreso) => {
    obtenerOCrearParticipante(socketId, usuarioRemoto)
  })

  socket.on('sala:participanteSalio', ({ socketId }: { socketId: string }) => {
    cerrarParticipante(socketId)
  })

  socket.on('sala:rechazado', () => {
    estadoConexion.value = 'rechazado'
  })

  socket.on('sala:error', ({ mensaje }: { mensaje: string }) => {
    estadoConexion.value = 'error'
    mensajeEstado.value = mensaje
  })

  socket.on('senal:oferta', ({ origen, oferta }: { origen: string; oferta: RTCSessionDescriptionInit }) => {
    void alRecibirDescripcion(origen, oferta)
  })

  socket.on('senal:respuesta', ({ origen, respuesta }: { origen: string; respuesta: RTCSessionDescriptionInit }) => {
    void alRecibirDescripcion(origen, respuesta)
  })

  socket.on('senal:candidato', ({ origen, candidato }: { origen: string; candidato: RTCIceCandidateInit }) => {
    participantes.get(origen)?.conexion.addIceCandidate(candidato).catch(() => {})
  })
}

function aceptarSolicitud(solicitud: SolicitudIngreso): void {
  socket.emit('sala:admitir', { sesionId, socketId: solicitud.socketId })
  solicitudesPendientes.value = solicitudesPendientes.value.filter((s) => s.socketId !== solicitud.socketId)
}

function rechazarSolicitud(solicitud: SolicitudIngreso): void {
  socket.emit('sala:rechazar', { sesionId, socketId: solicitud.socketId })
  solicitudesPendientes.value = solicitudesPendientes.value.filter((s) => s.socketId !== solicitud.socketId)
}

// Al salir de la ruta, onBeforeUnmount se encarga de avisar al servidor, cerrar
// las conexiones y apagar cámara/micrófono.
function salirDeLaSala(): void {
  router.push({ name: 'panel' })
}

function detenerDispositivo(tipo: Dispositivo) {
  const flujo = flujos[tipo]

  if (flujo) {
    for (const entrada of participantes.values()) {
      const remitente = entrada.conexion.getSenders().find((s) => s.track && flujo.getTracks().includes(s.track))
      if (remitente) {
        entrada.conexion.removeTrack(remitente)
      }
    }
  }

  flujo?.getTracks().forEach((pista) => pista.stop())
  flujos[tipo] = null
  activos[tipo] = false
  if (tipo === 'video' && videoLocal.value) videoLocal.value.srcObject = null
}

async function alternarDispositivo(tipo: Dispositivo) {
  if (solicitando[tipo] || salaCerrada) return
  errores[tipo] = ''
  if (activos[tipo]) {
    detenerDispositivo(tipo)
    return
  }

  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    errores[tipo] =
      'Para usar cámara y micrófono, abre la sala en HTTPS o localhost con un navegador compatible.'
    return
  }

  solicitando[tipo] = true
  try {
    // Pedir cada dispositivo por separado permite usar uno aunque el otro no esté disponible.
    const flujo = await navigator.mediaDevices.getUserMedia({
      audio: tipo === 'audio',
      video: tipo === 'video',
    })
    // El permiso puede resolverse después de que el usuario abandone la sala.
    if (salaCerrada) {
      flujo.getTracks().forEach((pista) => pista.stop())
      return
    }
    flujos[tipo] = flujo
    flujo.getTracks().forEach((pista) => {
      pista.addEventListener('ended', () => {
        if (flujos[tipo] !== flujo) return
        detenerDispositivo(tipo)
        errores[tipo] =
          'El dispositivo se desconectó o dejó de estar disponible. Intenta activarlo de nuevo.'
      })
      for (const entrada of participantes.values()) {
        entrada.conexion.addTrack(pista, flujo)
      }
    })
    activos[tipo] = true
    if (tipo === 'video' && videoLocal.value) {
      videoLocal.value.srcObject = flujo
      await videoLocal.value.play()
    }
  } catch (error) {
    if (salaCerrada) return
    detenerDispositivo(tipo)
    const nombre = error instanceof Error ? error.name : ''
    const dispositivo = tipo === 'audio' ? 'el micrófono' : 'la cámara'
    if (nombre === 'NotAllowedError' || nombre === 'SecurityError') {
      errores[tipo] = `Permite el acceso a ${dispositivo} en tu navegador y vuelve a intentarlo.`
    } else if (nombre === 'NotFoundError') {
      errores[tipo] = `No se encontró ${dispositivo}. Conecta el dispositivo e inténtalo de nuevo.`
    } else if (nombre === 'NotReadableError' || nombre === 'AbortError') {
      errores[tipo] = `No se pudo abrir ${dispositivo}. Revisa si otra aplicación lo está usando.`
    } else {
      errores[tipo] = `No se pudo activar ${dispositivo}. Vuelve a intentarlo.`
    }
  } finally {
    solicitando[tipo] = false
  }
}

onMounted(async () => {
  if (!usuario) {
    return
  }

  try {
    sesion.value = await sesionServicio.obtenerSesion(sesionId)
  } catch {
    sesion.value = null
  }

  registrarEventosSocket()
  socket.connect()
  socket.emit('sala:unirse', { sesionId, usuario: { _id: usuario._id, nombre: usuario.nombre } })
})

onBeforeUnmount(() => {
  salaCerrada = true
  detenerDispositivo('audio')
  detenerDispositivo('video')
  socket.emit('sala:salir', { sesionId })
  for (const entrada of participantes.values()) {
    entrada.conexion.close()
  }
  participantes.clear()
  cerrarSocket()
})
</script>

<template>
  <div class="sala d-flex flex-column vh-100 bg-dark">
    <div class="px-3 py-2 bg-black bg-opacity-50 text-white d-flex align-items-center justify-content-between">
      <span class="text-truncate">{{ sesion?.titulo ?? 'Sala de videoconferencia' }}</span>
      <span class="badge text-bg-secondary">{{ listaParticipantes.length + 1 }} en la sala</span>
    </div>

    <!-- Panel de solicitudes pendientes (solo lo ve el anfitrión) -->
    <div v-if="solicitudesPendientes.length > 0" class="solicitudes-pendientes card shadow">
      <div class="card-body p-3">
        <h2 class="h6 mb-2">Personas esperando entrar</h2>
        <div v-for="solicitud in solicitudesPendientes" :key="solicitud.socketId" class="d-flex align-items-center justify-content-between gap-2 mb-2">
          <span class="text-truncate">{{ solicitud.usuario.nombre }}</span>
          <div class="d-flex gap-1">
            <button type="button" class="btn btn-sm btn-success" @click="aceptarSolicitud(solicitud)">Aceptar</button>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="rechazarSolicitud(solicitud)">Rechazar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sala de espera -->
    <div v-if="estadoConexion === 'esperando'" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-white text-center p-4">
      <div class="spinner-border text-light mb-3" role="status"></div>
      <p class="mb-3">Esperando la aprobación del anfitrión para entrar a la reunión...</p>
      <button type="button" class="btn btn-outline-light" @click="salirDeLaSala">Cancelar</button>
    </div>

    <!-- Rechazado o error -->
    <div v-else-if="estadoConexion === 'rechazado' || estadoConexion === 'error'" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center gap-3 p-4">
      <p class="alert alert-danger mb-0" role="alert">
        {{ estadoConexion === 'rechazado' ? 'El anfitrión no aceptó tu ingreso a la reunión.' : mensajeEstado || 'Ocurrió un error al conectarse a la sala.' }}
      </p>
      <button type="button" class="btn btn-primary" @click="salirDeLaSala">Volver al panel</button>
    </div>

    <!-- Reunión en curso -->
    <template v-else>
      <div class="flex-grow-1 d-flex flex-wrap align-content-center justify-content-center gap-3 p-4">
        <div class="cuadro-participante" :class="{ 'microfono-activo': activos.audio }">
          <video
            v-show="activos.video"
            ref="videoLocal"
            class="video-participante"
            autoplay
            muted
            playsinline
            aria-label="Vista previa de tu cámara"
          ></video>
          <div v-if="!activos.video" class="avatar-participante rounded-circle" role="img" aria-label="Silueta de una persona">
            <i class="bi bi-person-fill" aria-hidden="true"></i>
          </div>
          <span class="nombre-participante badge bg-dark bg-opacity-75">{{ usuario?.nombre }} (Tú)</span>
          <span class="indicador-microfono" :class="activos.audio ? 'text-success' : 'text-danger'">
            <i class="bi" :class="activos.audio ? 'bi-mic-fill' : 'bi-mic-mute-fill'"></i>
          </span>
        </div>

        <div v-for="entrada in listaParticipantes" :key="entrada.socketId" class="cuadro-participante">
          <video
            v-if="entrada.stream"
            :ref="(elemento) => vincularVideoRemoto(elemento as Element | null, entrada)"
            class="video-participante"
            autoplay
            playsinline
          ></video>
          <div v-else class="avatar-participante rounded-circle" role="img" aria-label="Silueta de una persona">
            <i class="bi bi-person-fill" aria-hidden="true"></i>
          </div>
          <span class="nombre-participante badge bg-dark bg-opacity-75">{{ entrada.usuario.nombre }}</span>
        </div>
      </div>

      <div class="px-4" aria-live="polite">
        <p v-if="solicitando.audio || solicitando.video" class="text-white text-center">
          Esperando acceso al dispositivo. Revisa la solicitud de permisos del navegador.
        </p>
        <p v-if="errores.audio" class="alert alert-warning" role="alert">{{ errores.audio }}</p>
        <p v-if="errores.video" class="alert alert-warning" role="alert">{{ errores.video }}</p>
      </div>

      <!-- Barra de controles -->
      <div class="barra-controles d-flex justify-content-center gap-3 py-4">
        <button
          type="button"
          class="boton-control rounded-circle border-0"
          :class="activos.audio ? 'btn btn-light' : 'btn btn-danger'"
          :title="activos.audio ? 'Desactivar micrófono' : 'Activar micrófono'"
          :aria-label="activos.audio ? 'Desactivar micrófono' : 'Activar micrófono'"
          :aria-pressed="activos.audio"
          :disabled="solicitando.audio"
          @click="alternarDispositivo('audio')"
        >
          <i class="bi fs-4" :class="activos.audio ? 'bi-mic-fill' : 'bi-mic-mute-fill'"></i>
        </button>
        <button
          type="button"
          class="boton-control rounded-circle border-0"
          :class="activos.video ? 'btn btn-light' : 'btn btn-danger'"
          :title="activos.video ? 'Desactivar cámara' : 'Activar cámara'"
          :aria-label="activos.video ? 'Desactivar cámara' : 'Activar cámara'"
          :aria-pressed="activos.video"
          :disabled="solicitando.video"
          @click="alternarDispositivo('video')"
        >
          <i class="bi fs-4" :class="activos.video ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'"></i>
        </button>
        <button
          type="button"
          class="boton-control rounded-circle border-0 btn btn-danger"
          title="Abandonar la reunión"
          aria-label="Abandonar la reunión"
          @click="salirDeLaSala"
        >
          <i class="bi fs-4 bi-telephone-x-fill"></i>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sala {
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

.solicitudes-pendientes {
  position: absolute;
  top: 3.5rem;
  right: 1rem;
  width: min(320px, 90vw);
  z-index: 10;
}

.cuadro-participante {
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #202124;
  border-radius: 1rem;
  border: 3px solid transparent;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* El borde indica micrófono encendido; no es un detector de voz. */
.cuadro-participante.microfono-activo {
  border-color: #1a73e8;
  box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.35);
}

.avatar-participante {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3c4043;
  color: #dadce0;
  font-size: 80px;
  line-height: 1;
}

.video-participante {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.cuadro-participante:first-child .video-participante {
  transform: scaleX(-1);
}

.nombre-participante {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  font-size: 0.9rem;
}

.indicador-microfono {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  font-size: 1.1rem;
}

.boton-control {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
