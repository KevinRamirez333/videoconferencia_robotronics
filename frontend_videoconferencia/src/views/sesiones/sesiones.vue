<template>
  <div class="pantalla-sesiones py-4 py-md-5">
    <div class="container" style="max-width: 720px">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Planificar sesión</h1>
        <RouterLink to="/panel" class="btn btn-link">Volver al panel</RouterLink>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-body p-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="h5 mb-0">{{ sesionEditandoId ? 'Editar sesión' : 'Nueva sesión' }}</h2>
            <button
              v-if="sesionEditandoId"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="cancelarEdicion"
            >
              Cancelar edición
            </button>
          </div>

          <div v-if="mensajeExito" class="alert alert-success py-2" role="alert">
            {{ mensajeExito }}
          </div>
          <div v-if="mensajeError" class="alert alert-danger py-2" role="alert">
            {{ mensajeError }}
          </div>

          <form novalidate @submit.prevent="manejarGuardarSesion">
            <div class="mb-3">
              <label for="titulo" class="form-label">Título de la sesión</label>
              <input
                id="titulo"
                v-model.trim="titulo"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errores.titulo }"
                placeholder="Ej. Reunión de avance del proyecto"
              />
              <div class="invalid-feedback">{{ errores.titulo }}</div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="fecha" class="form-label">Fecha</label>
                <input
                  id="fecha"
                  v-model="fecha"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': errores.fecha }"
                />
                <div class="invalid-feedback">{{ errores.fecha }}</div>
              </div>

              <div class="col-md-3 mb-3">
                <label for="horaInicio" class="form-label">Hora de inicio</label>
                <input
                  id="horaInicio"
                  v-model="horaInicio"
                  type="time"
                  class="form-control"
                  :class="{ 'is-invalid': errores.horaInicio }"
                />
                <div class="invalid-feedback">{{ errores.horaInicio }}</div>
              </div>

              <div class="col-md-3 mb-3">
                <label for="horaFin" class="form-label">Hora de fin (opcional)</label>
                <input
                  id="horaFin"
                  v-model="horaFin"
                  type="time"
                  class="form-control"
                  :class="{ 'is-invalid': errores.horaFin }"
                />
                <div class="invalid-feedback">{{ errores.horaFin }}</div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2" :disabled="cargando">
              <span v-if="cargando" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
              {{ textoBotonGuardar }}
            </button>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="h5 mb-3">Sesiones planificadas</h2>

          <p v-if="cargandoLista" class="text-muted mb-0">Cargando sesiones...</p>
          <p v-else-if="sesiones.length === 0" class="text-muted mb-0">
            Todavía no has programado ninguna sesión.
          </p>
          <ul v-else class="list-group list-group-flush">
            <li
              v-for="sesion in sesiones"
              :key="sesion._id"
              class="list-group-item d-flex justify-content-between align-items-start px-0"
            >
              <div>
                <div class="fw-semibold">{{ sesion.titulo }}</div>
                <div class="text-muted small">{{ formatearFecha(sesion.inicioEn) }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge text-bg-secondary text-capitalize">{{ sesion.estado }}</span>
                <button type="button" class="btn btn-sm btn-outline-primary" @click="iniciarEdicion(sesion)">
                  Editar
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { isAxiosError } from 'axios'
import { sesionServicio, type Sesion } from '@/services/sesion.servicio'
import { obtenerUsuario } from '@/services/sesionUsuario'

const usuarioActual = obtenerUsuario()

const titulo = ref('')
const fecha = ref('')
const horaInicio = ref('')
const horaFin = ref('')

const cargando = ref(false)
const cargandoLista = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')
const sesiones = ref<Sesion[]>([])
const sesionEditandoId = ref<string | null>(null)

const textoBotonGuardar = computed(() => {
  if (cargando.value) {
    return sesionEditandoId.value ? 'Guardando...' : 'Programando...'
  }

  return sesionEditandoId.value ? 'Guardar cambios' : 'Programar sesión'
})

const errores = reactive({
  titulo: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
})

function validarFormulario(): boolean {
  errores.titulo = ''
  errores.fecha = ''
  errores.horaInicio = ''
  errores.horaFin = ''

  if (!titulo.value) {
    errores.titulo = 'El título es obligatorio'
  }

  if (!fecha.value) {
    errores.fecha = 'La fecha es obligatoria'
  }

  if (!horaInicio.value) {
    errores.horaInicio = 'La hora de inicio es obligatoria'
  }

  if (horaFin.value && horaInicio.value && horaFin.value <= horaInicio.value) {
    errores.horaFin = 'La hora de fin debe ser posterior a la de inicio'
  }

  return !errores.titulo && !errores.fecha && !errores.horaInicio && !errores.horaFin
}

async function cargarSesiones(): Promise<void> {
  cargandoLista.value = true

  try {
    const todasLasSesiones = await sesionServicio.listarSesiones()
    sesiones.value = todasLasSesiones
      .filter((sesion) => sesion.anfitrionId === usuarioActual?._id)
      .sort((a, b) => new Date(a.inicioEn ?? 0).getTime() - new Date(b.inicioEn ?? 0).getTime())
  } catch {
    sesiones.value = []
  } finally {
    cargandoLista.value = false
  }
}

function limpiarFormulario(): void {
  titulo.value = ''
  fecha.value = ''
  horaInicio.value = ''
  horaFin.value = ''
  sesionEditandoId.value = null
}

function iniciarEdicion(sesion: Sesion): void {
  mensajeError.value = ''
  mensajeExito.value = ''

  sesionEditandoId.value = sesion._id
  titulo.value = sesion.titulo
  fecha.value = sesion.inicioEn ? aInputFecha(sesion.inicioEn) : ''
  horaInicio.value = sesion.inicioEn ? aInputHora(sesion.inicioEn) : ''
  horaFin.value = sesion.finEn ? aInputHora(sesion.finEn) : ''
}

function cancelarEdicion(): void {
  limpiarFormulario()
  mensajeError.value = ''
  mensajeExito.value = ''
}

async function manejarGuardarSesion(): Promise<void> {
  mensajeError.value = ''
  mensajeExito.value = ''

  if (!validarFormulario() || !usuarioActual) {
    return
  }

  cargando.value = true

  const datosSesion = {
    titulo: titulo.value,
    inicioEn: new Date(`${fecha.value}T${horaInicio.value}`).toISOString(),
    finEn: horaFin.value ? new Date(`${fecha.value}T${horaFin.value}`).toISOString() : undefined,
  }

  try {
    if (sesionEditandoId.value) {
      await sesionServicio.actualizarSesion(sesionEditandoId.value, datosSesion)
      mensajeExito.value = 'Sesión actualizada correctamente'
    } else {
      await sesionServicio.programarSesion({ ...datosSesion, anfitrionId: usuarioActual._id })
      mensajeExito.value = 'Sesión programada correctamente'
    }

    limpiarFormulario()
    await cargarSesiones()
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      mensajeError.value = error.response.data?.mensaje ?? 'No se pudo guardar la sesión'
    } else {
      mensajeError.value = 'No se pudo conectar con el servidor'
    }
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fechaIso?: string): string {
  if (!fechaIso) {
    return 'Sin fecha definida'
  }

  return new Date(fechaIso).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function aInputFecha(fechaIso: string): string {
  const fechaObjeto = new Date(fechaIso)
  const anio = fechaObjeto.getFullYear()
  const mes = String(fechaObjeto.getMonth() + 1).padStart(2, '0')
  const dia = String(fechaObjeto.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function aInputHora(fechaIso: string): string {
  const fechaObjeto = new Date(fechaIso)
  const horas = String(fechaObjeto.getHours()).padStart(2, '0')
  const minutos = String(fechaObjeto.getMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

onMounted(cargarSesiones)
</script>

<style scoped>
.pantalla-sesiones {
  min-height: 100vh;
}
</style>
