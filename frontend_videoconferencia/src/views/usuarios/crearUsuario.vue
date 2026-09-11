<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'

const props = defineProps<{
  mostrar: boolean
  usuario: Usuario | null
}>()

const emit = defineEmits<{
  (evento: 'cerrar'): void
  (evento: 'guardado', usuario: Usuario): void
}>()

const modoEdicion = ref(false)
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

watch(
  () => props.mostrar,
  (visible) => {
    if (!visible) {
      return
    }
    errorFormulario.value = ''
    modoEdicion.value = props.usuario !== null
    formulario.value = {
      nombre: props.usuario?.nombre ?? '',
      correo: props.usuario?.correo ?? '',
      contrasena: '',
    }
  },
)

const guardarUsuario = async () => {
  errorFormulario.value = ''
  guardando.value = true
  try {
    if (modoEdicion.value && props.usuario) {
      const usuarioActualizado = await usuarioServicio.actualizarUsuario(props.usuario._id, {
        nombre: formulario.value.nombre,
        correo: formulario.value.correo,
      })
      emit('guardado', usuarioActualizado)
    } else {
      const nuevoUsuario = await usuarioServicio.crearUsuario(formulario.value)
      emit('guardado', nuevoUsuario)
    }
  } catch (error) {
    errorFormulario.value = obtenerMensajeError(
      error,
      modoEdicion.value ? 'No se pudo actualizar el usuario.' : 'No se pudo crear el usuario.',
    )
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div v-if="mostrar" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="guardarUsuario">
          <div class="modal-header">
            <h2 class="modal-title h5">{{ modoEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="emit('cerrar')"></button>
          </div>
          <div class="modal-body">
            <div v-if="errorFormulario" class="alert alert-danger" role="alert">
              {{ errorFormulario }}
            </div>
            <div class="mb-3">
              <label for="campo-nombre" class="form-label">Nombre</label>
              <input id="campo-nombre" v-model="formulario.nombre" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label for="campo-correo" class="form-label">Correo</label>
              <input id="campo-correo" v-model="formulario.correo" type="email" class="form-control" required />
            </div>
            <div v-if="!modoEdicion" class="mb-3">
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
            <button type="button" class="btn btn-secondary" :disabled="guardando" @click="emit('cerrar')">
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
  <div v-if="mostrar" class="modal-backdrop fade show"></div>
</template>
