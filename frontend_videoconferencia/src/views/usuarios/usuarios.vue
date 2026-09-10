<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'

const usuarios = ref<Usuario[]>([])
const cargando = ref(false)
const errorCarga = ref('')

const mostrarModal = ref(false)
const guardando = ref(false)
const errorFormulario = ref('')
const formulario = ref({
  nombre: '',
  correo: '',
  contrasena: '',
})

const obtenerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
  if (axios.isAxiosError(error) && error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  return mensajePorDefecto
}

const cargarUsuarios = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    usuarios.value = await usuarioServicio.listarUsuarios()
  } catch (error) {
    errorCarga.value = obtenerMensajeError(error, 'No se pudo cargar la lista de usuarios.')
  } finally {
    cargando.value = false
  }
}

const limpiarFormulario = () => {
  formulario.value = { nombre: '', correo: '', contrasena: '' }
  errorFormulario.value = ''
}

const abrirModal = () => {
  limpiarFormulario()
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const registrarUsuario = async () => {
  errorFormulario.value = ''
  guardando.value = true
  try {
    const nuevoUsuario = await usuarioServicio.crearUsuario(formulario.value)
    usuarios.value.unshift(nuevoUsuario)
    cerrarModal()
  } catch (error) {
    errorFormulario.value = obtenerMensajeError(error, 'No se pudo crear el usuario.')
  } finally {
    guardando.value = false
  }
}

const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(cargarUsuarios)
</script>

<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Gestión de Usuarios</h1>
        <p class="text-muted mb-0">
          Consulta el listado de usuarios registrados y registra nuevas cuentas en la plataforma.
        </p>
      </div>
      <button type="button" class="btn btn-primary" @click="abrirModal">
        <i class="bi bi-plus-lg me-1"></i>
        Nuevo usuario
      </button>
    </div>

    <div v-if="errorCarga" class="alert alert-danger" role="alert">
      {{ errorCarga }}
    </div>

    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span class="fw-semibold">Usuarios registrados</span>
        <span class="badge text-bg-secondary">{{ usuarios.length }}</span>
      </div>

      <div v-if="cargando" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>

      <div v-else-if="!errorCarga" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="encabezado-tabla">Nombre</th>
              <th scope="col" class="encabezado-tabla">Correo</th>
              <th scope="col" class="encabezado-tabla">Fecha de creación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usuarios.length === 0">
              <td colspan="3" class="text-center text-muted py-5">
                <i class="bi bi-people fs-2 d-block mb-2"></i>
                No hay usuarios registrados.
              </td>
            </tr>
            <tr v-for="usuario in usuarios" :key="usuario._id">
              <td>{{ usuario.nombre }}</td>
              <td>{{ usuario.correo }}</td>
              <td>{{ formatearFecha(usuario.creadoEn) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="registrarUsuario">
            <div class="modal-header">
              <h2 class="modal-title h5">Nuevo usuario</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="errorFormulario" class="alert alert-danger" role="alert">
                {{ errorFormulario }}
              </div>
              <div class="mb-3">
                <label for="campo-nombre" class="form-label">Nombre</label>
                <input
                  id="campo-nombre"
                  v-model="formulario.nombre"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="campo-correo" class="form-label">Correo</label>
                <input
                  id="campo-correo"
                  v-model="formulario.correo"
                  type="email"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="campo-contrasena" class="form-label">Contraseña</label>
                <input
                  id="campo-contrasena"
                  v-model="formulario.contrasena"
                  type="password"
                  class="form-control"
                  minlength="6"
                  required
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" :disabled="guardando" @click="cerrarModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="guardando">
                <span v-if="guardando" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div v-if="mostrarModal" class="modal-backdrop fade show"></div>
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
