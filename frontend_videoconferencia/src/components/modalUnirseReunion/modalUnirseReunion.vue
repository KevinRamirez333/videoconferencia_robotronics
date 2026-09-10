<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'
import { sesionServicio, idDelAnfitrion, nombreDelAnfitrion, type Sesion } from '@/services/sesion.servicio'
import { obtenerUsuario } from '@/services/sesionUsuario'

const router = useRouter()
const usuarioActual = obtenerUsuario()
const elementoModal = ref<HTMLDivElement | null>(null)
const sesionesActivas = ref<Sesion[]>([])
const cargando = ref(false)
const mensajeError = ref('')
let instanciaModal: Modal | null = null

onMounted(() => {
  if (elementoModal.value) {
    instanciaModal = new Modal(elementoModal.value)
  }
})

async function abrir(): Promise<void> {
  mensajeError.value = ''
  cargando.value = true
  instanciaModal?.show()

  try {
    const todas = await sesionServicio.listarSesiones()
    sesionesActivas.value = todas.filter((sesion) => sesion.estado === 'activa')
  } catch {
    mensajeError.value = 'No se pudieron cargar las reuniones activas'
  } finally {
    cargando.value = false
  }
}

function unirseASesion(sesion: Sesion): void {
  instanciaModal?.hide()
  router.push({ name: 'sala', params: { sesionId: sesion._id } })
}

function etiquetaAnfitrion(sesion: Sesion): string {
  if (idDelAnfitrion(sesion) === usuarioActual?._id) {
    return 'Creada por ti'
  }

  return `Creada por ${nombreDelAnfitrion(sesion) ?? 'otro usuario'}`
}

function formatearFecha(fechaIso?: string): string {
  if (!fechaIso) {
    return 'Sin fecha definida'
  }

  return new Date(fechaIso).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
}

defineExpose({ abrir })
</script>

<template>
  <div ref="elementoModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title h5">Unirse a una reunión</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <p v-if="cargando" class="text-muted mb-0">Cargando reuniones activas...</p>
          <p v-else-if="mensajeError" class="alert alert-danger py-2 mb-0">{{ mensajeError }}</p>
          <p v-else-if="sesionesActivas.length === 0" class="text-muted mb-0">
            No hay reuniones activas en este momento.
          </p>
          <ul v-else class="list-group list-group-flush">
            <li
              v-for="sesion in sesionesActivas"
              :key="sesion._id"
              class="list-group-item d-flex justify-content-between align-items-center px-0"
            >
              <div>
                <div class="fw-semibold">{{ sesion.titulo }}</div>
                <div class="text-muted small">{{ formatearFecha(sesion.inicioEn) }}</div>
                <div class="small" :class="idDelAnfitrion(sesion) === usuarioActual?._id ? 'text-primary' : 'text-muted'">
                  {{ etiquetaAnfitrion(sesion) }}
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-primary" @click="unirseASesion(sesion)">
                Unirse
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
