<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { participanteServicio } from '@/services/participante.servicio'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'
import { sesionServicio, type Sesion } from '@/services/sesion.servicio'
import ListadoInformacion from '@/components/comunes/ListadoInformacion.vue'

interface ParticipanteConUsuario {
  _id: string
  seUnioEn: string
  salioEn?: string
  usuario?: Usuario
}

const CANTIDAD_SUGERENCIAS = 5

const sesionIdConsulta = ref('')
const participantes = ref<ParticipanteConUsuario[]>([])
const cargando = ref(false)
const errorCarga = ref('')
const haBuscado = ref(false)

const usuarios = ref<Usuario[]>([])

const sesionesSugeridas = ref<Sesion[]>([])
const cargandoSugerencias = ref(false)
const mostrarSugerencias = ref(false)

let temporizadorSugerencias: ReturnType<typeof setTimeout> | undefined

const obtenerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
  if (axios.isAxiosError(error) && error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  return mensajePorDefecto
}

const cargarUsuarios = async () => {
  try {
    usuarios.value = await usuarioServicio.listarUsuarios()
  } catch {
    // Si falla, los nombres de anfitrión/participantes quedan como "Desconocido".
  }
}

const nombreUsuario = (usuarioId: string): string => {
  return usuarios.value.find((usuario) => usuario._id === usuarioId)?.nombre ?? 'Desconocido'
}

const formatearFechaHora = (fecha?: string): string => {
  if (!fecha) {
    return '—'
  }
  return new Date(fecha).toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const opcionesSugeridas = computed(() =>
  sesionesSugeridas.value.map((sesion) => ({
    id: sesion._id,
    titulo: `${sesion.titulo} - ${nombreUsuario(sesion.anfitrionId)}`,
    subtitulo: formatearFechaHora(sesion.creadoEn),
  })),
)

const cargarSesionesRecientes = async () => {
  cargandoSugerencias.value = true
  try {
    sesionesSugeridas.value = await sesionServicio.listarRecientes(CANTIDAD_SUGERENCIAS)
  } catch {
    sesionesSugeridas.value = []
  } finally {
    cargandoSugerencias.value = false
  }
}

const buscarSesionesSugeridas = async (texto: string) => {
  cargandoSugerencias.value = true
  try {
    sesionesSugeridas.value = await sesionServicio.buscarPorTexto(texto)
  } catch {
    sesionesSugeridas.value = []
  } finally {
    cargandoSugerencias.value = false
  }
}

const alEnfocarCampoSesion = () => {
  mostrarSugerencias.value = true
  if (!sesionIdConsulta.value.trim()) {
    cargarSesionesRecientes()
  }
}

const alEscribirCampoSesion = () => {
  mostrarSugerencias.value = true

  if (temporizadorSugerencias) {
    clearTimeout(temporizadorSugerencias)
  }

  const texto = sesionIdConsulta.value.trim()
  temporizadorSugerencias = setTimeout(() => {
    if (texto) {
      buscarSesionesSugeridas(texto)
    } else {
      cargarSesionesRecientes()
    }
  }, 300)
}

const ocultarSugerenciasConRetraso = () => {
  setTimeout(() => {
    mostrarSugerencias.value = false
  }, 150)
}

const buscarParticipantes = async () => {
  const sesionId = sesionIdConsulta.value.trim()
  if (!sesionId) {
    return
  }

  cargando.value = true
  errorCarga.value = ''
  haBuscado.value = true

  try {
    if (usuarios.value.length === 0) {
      await cargarUsuarios()
    }

    const listaParticipantes = await participanteServicio.listarParticipantes()
    const usuariosPorId = new Map(usuarios.value.map((usuario) => [usuario._id, usuario]))

    participantes.value = listaParticipantes
      .filter((participante) => participante.sesionId === sesionId)
      .map((participante) => ({
        _id: participante._id,
        seUnioEn: participante.seUnioEn,
        salioEn: participante.salioEn,
        usuario: usuariosPorId.get(participante.usuarioId),
      }))
  } catch (error) {
    errorCarga.value = obtenerMensajeError(error, 'No se pudo consultar los participantes.')
    participantes.value = []
  } finally {
    cargando.value = false
  }
}

const elegirSesionSugerida = (sesionId: string) => {
  sesionIdConsulta.value = sesionId
  mostrarSugerencias.value = false
  buscarParticipantes()
}

onMounted(cargarUsuarios)
</script>

<template>
  <div class="container-fluid px-4 px-lg-5 py-4">
    <div class="mb-4">
      <h1 class="h3 mb-1">Participantes</h1>
      <p class="text-muted mb-0">
        Consulta los usuarios que han participado en una sesión específica.
      </p>
    </div>

    <form class="row g-2 mb-4" @submit.prevent="buscarParticipantes">
      <div class="col-12 col-md-8 col-lg-5 position-relative">
        <label for="campo-sesion-id" class="form-label">ID de sesión</label>
        <input
          id="campo-sesion-id"
          v-model="sesionIdConsulta"
          type="text"
          class="form-control form-control-lg"
          placeholder="Haz clic para ver sugerencias o escribe un ID"
          autocomplete="off"
          required
          @focus="alEnfocarCampoSesion"
          @input="alEscribirCampoSesion"
          @blur="ocultarSugerenciasConRetraso"
        />
        <ListadoInformacion
          v-if="mostrarSugerencias"
          :opciones="opcionesSugeridas"
          :cargando="cargandoSugerencias"
          mensaje-vacio="No se encontraron sesiones."
          @seleccionar="elegirSesionSugerida"
        />
      </div>
    </form>

    <div v-if="errorCarga" class="alert alert-danger" role="alert">
      {{ errorCarga }}
    </div>

    <div v-if="!haBuscado && !errorCarga" class="alert alert-info" role="alert">
      Haz clic en el campo de ID de sesión para ver sugerencias, o escribe un ID y presiona Enter.
    </div>

    <div v-else-if="!errorCarga" class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">Participantes de la sesión</span>
        <span class="badge text-bg-secondary">{{ participantes.length }}</span>
      </div>

      <div v-if="cargando" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0 tabla-participantes">
          <thead class="table-light">
            <tr>
              <th scope="col" class="encabezado-tabla">Nombre</th>
              <th scope="col" class="encabezado-tabla">Correo</th>
              <th scope="col" class="encabezado-tabla">Se unió</th>
              <th scope="col" class="encabezado-tabla">Salió</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="participantes.length === 0">
              <td colspan="4" class="text-center text-muted py-5">
                <i class="bi bi-people fs-2 d-block mb-2"></i>
                No hay participantes registrados para esta sesión.
              </td>
            </tr>
            <tr v-for="participante in participantes" :key="participante._id">
              <td>{{ participante.usuario?.nombre ?? 'Usuario no encontrado' }}</td>
              <td>{{ participante.usuario?.correo ?? '—' }}</td>
              <td class="text-nowrap">{{ formatearFechaHora(participante.seUnioEn) }}</td>
              <td class="text-nowrap">{{ formatearFechaHora(participante.salioEn) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.encabezado-tabla {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--bs-secondary-color);
}

.tabla-participantes {
  font-size: 1.05rem;
}

.tabla-participantes td,
.tabla-participantes th {
  padding-top: 0.9rem;
  padding-bottom: 0.9rem;
}
</style>
