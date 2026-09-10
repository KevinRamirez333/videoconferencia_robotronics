<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { participanteServicio } from '@/services/participante.servicio'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'

interface ParticipanteConUsuario {
  _id: string
  seUnioEn: string
  salioEn?: string
  usuario?: Usuario
}

const sesionIdConsulta = ref('')
const participantes = ref<ParticipanteConUsuario[]>([])
const cargando = ref(false)
const errorCarga = ref('')
const haBuscado = ref(false)

const obtenerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
  if (axios.isAxiosError(error) && error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  return mensajePorDefecto
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
    const [listaParticipantes, listaUsuarios] = await Promise.all([
      participanteServicio.listarParticipantes(),
      usuarioServicio.listarUsuarios(),
    ])

    const usuariosPorId = new Map(listaUsuarios.map((usuario) => [usuario._id, usuario]))

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
</script>

<template>
  <div class="container py-4">
    <div class="mb-4">
      <h1 class="h3 mb-1">Participantes</h1>
      <p class="text-muted mb-0">
        Consulta los usuarios que han participado en una sesión específica.
      </p>
    </div>

    <form class="row g-2 align-items-end mb-4" @submit.prevent="buscarParticipantes">
      <div class="col-12 col-sm-6 col-md-4">
        <label for="campo-sesion-id" class="form-label">ID de sesión</label>
        <input
          id="campo-sesion-id"
          v-model="sesionIdConsulta"
          type="text"
          class="form-control"
          placeholder="Ingresa el ID de la sesión"
          required
        />
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-primary" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1" role="status"></span>
          Buscar
        </button>
      </div>
    </form>

    <div v-if="errorCarga" class="alert alert-danger" role="alert">
      {{ errorCarga }}
    </div>

    <div v-if="!haBuscado && !errorCarga" class="alert alert-info" role="alert">
      Ingresa el ID de una sesión y presiona "Buscar" para ver sus participantes.
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
        <table class="table table-hover align-middle mb-0">
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
              <td>{{ formatearFechaHora(participante.seUnioEn) }}</td>
              <td>{{ formatearFechaHora(participante.salioEn) }}</td>
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
</style>
