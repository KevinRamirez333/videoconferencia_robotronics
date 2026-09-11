<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'
import CrearUsuario from './crearUsuario.vue'
import CambiarContrasena from './cambiarContrasena.vue'

const usuarios = ref<Usuario[]>([])
const cargando = ref(false)
const errorCarga = ref('')

const mostrarModal = ref(false)
const usuarioEditando = ref<Usuario | null>(null)

const idCambiandoEstado = ref<string | null>(null)
const errorEstado = ref('')

const mostrarModalContrasena = ref(false)
const usuarioCambiandoContrasenaId = ref<string | null>(null)

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

const abrirModalCrear = () => {
  usuarioEditando.value = null
  mostrarModal.value = true
}

const abrirModalEditar = (usuario: Usuario) => {
  usuarioEditando.value = usuario
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const usuarioGuardado = (usuario: Usuario) => {
  const indice = usuarios.value.findIndex((elemento) => elemento._id === usuario._id)
  if (indice !== -1) {
    usuarios.value[indice] = usuario
  } else {
    usuarios.value.unshift(usuario)
  }
  cerrarModal()
}

const alternarEstadoUsuario = async (usuario: Usuario) => {
  idCambiandoEstado.value = usuario._id
  errorEstado.value = ''
  try {
    const usuarioActualizado = await usuarioServicio.cambiarEstadoUsuario(usuario._id, !usuario.activo)
    const indice = usuarios.value.findIndex((elemento) => elemento._id === usuarioActualizado._id)
    if (indice !== -1) {
      usuarios.value[indice] = usuarioActualizado
    }
  } catch (error) {
    errorEstado.value = obtenerMensajeError(error, 'No se pudo cambiar el estado del usuario.')
  } finally {
    idCambiandoEstado.value = null
  }
}

const abrirModalContrasena = (usuario: Usuario) => {
  usuarioCambiandoContrasenaId.value = usuario._id
  mostrarModalContrasena.value = true
}

const cerrarModalContrasena = () => {
  mostrarModalContrasena.value = false
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
  <div class="container-fluid px-4 px-lg-5 py-4">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        <h1 class="h3 mb-1">Gestión de Usuarios</h1>
        <p class="text-muted mb-0">
          Consulta el listado de usuarios registrados, edítalos y activa o desactiva sus cuentas.
        </p>
      </div>
      <button type="button" class="btn btn-primary btn-lg" @click="abrirModalCrear">
        <i class="bi bi-plus-lg me-1"></i>
        Nuevo usuario
      </button>
    </div>

    <div v-if="errorCarga" class="alert alert-danger" role="alert">
      {{ errorCarga }}
    </div>

    <div v-if="errorEstado" class="alert alert-danger" role="alert">
      {{ errorEstado }}
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
        <table class="table table-hover align-middle mb-0 tabla-usuarios">
          <thead class="table-light">
            <tr>
              <th scope="col" class="encabezado-tabla">Nombre</th>
              <th scope="col" class="encabezado-tabla">Correo</th>
              <th scope="col" class="encabezado-tabla">Fecha de creación</th>
              <th scope="col" class="encabezado-tabla">Estado</th>
              <th scope="col" class="encabezado-tabla text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="text-center text-muted py-5">
                <i class="bi bi-people fs-2 d-block mb-2"></i>
                No hay usuarios registrados.
              </td>
            </tr>
            <tr v-for="usuario in usuarios" :key="usuario._id">
              <td>{{ usuario.nombre }}</td>
              <td>{{ usuario.correo }}</td>
              <td>{{ formatearFecha(usuario.creadoEn) }}</td>
              <td>
                <span
                  class="badge rounded-pill"
                  :class="usuario.activo ? 'text-bg-success' : 'text-bg-secondary'"
                >
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click="abrirModalEditar(usuario)"
                  >
                    <i class="bi bi-pencil me-1"></i>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click="abrirModalContrasena(usuario)"
                  >
                    <i class="bi bi-key me-1"></i>
                    Cambiar contraseña
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    :class="usuario.activo ? 'btn-outline-danger' : 'btn-outline-success'"
                    :disabled="idCambiandoEstado === usuario._id"
                    @click="alternarEstadoUsuario(usuario)"
                  >
                    <span
                      v-if="idCambiandoEstado === usuario._id"
                      class="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></span>
                    {{ usuario.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <CrearUsuario :mostrar="mostrarModal" :usuario="usuarioEditando" @cerrar="cerrarModal" @guardado="usuarioGuardado" />

    <CambiarContrasena
      :mostrar="mostrarModalContrasena"
      :usuario-id="usuarioCambiandoContrasenaId"
      @cerrar="cerrarModalContrasena"
      @guardado="cerrarModalContrasena"
    />
  </div>
</template>

<style scoped>
.encabezado-tabla {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--bs-secondary-color);
}

.tabla-usuarios {
  font-size: 1.05rem;
}

.tabla-usuarios td,
.tabla-usuarios th {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
