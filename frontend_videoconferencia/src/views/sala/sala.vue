<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'

// Datos del usuario local (mas adelante vendran del backend / login)
const nombreUsuario = ref('Yo')

type Dispositivo = 'audio' | 'video'
const activos = reactive({ audio: false, video: false })
const solicitando = reactive({ audio: false, video: false })
const errores = reactive({ audio: '', video: '' })
const videoLocal = ref<HTMLVideoElement | null>(null)
const flujos: Record<Dispositivo, MediaStream | null> = { audio: null, video: null }
let salaCerrada = false

function detenerDispositivo(tipo: Dispositivo) {
  flujos[tipo]?.getTracks().forEach((pista) => pista.stop())
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

onBeforeUnmount(() => {
  salaCerrada = true
  detenerDispositivo('audio')
  detenerDispositivo('video')
})
</script>

<template>
  <div class="sala d-flex flex-column vh-100 bg-dark">
    <!-- Zona de participantes -->
    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-4">
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
        <div
          v-if="!activos.video"
          class="avatar-participante rounded-circle"
          role="img"
          aria-label="Silueta de una persona"
        >
          <i class="bi bi-person-fill" aria-hidden="true"></i>
        </div>

        <!-- Nombre del participante -->
        <span class="nombre-participante badge bg-dark bg-opacity-75">
          {{ nombreUsuario }}
        </span>

        <!-- Indicador de microfono -->
        <span
          class="indicador-microfono"
          :class="activos.audio ? 'text-success' : 'text-danger'"
          :aria-label="activos.audio ? 'Micrófono activado' : 'Micrófono desactivado'"
        >
          <i class="bi" :class="activos.audio ? 'bi-mic-fill' : 'bi-mic-mute-fill'"></i>
        </span>
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
        <i
          class="bi fs-4"
          :class="activos.video ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'"
        ></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sala {
  position: fixed;
  inset: 0;
  overflow-y: auto;
}

.cuadro-participante {
  position: relative;
  width: 100%;
  max-width: 640px;
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
