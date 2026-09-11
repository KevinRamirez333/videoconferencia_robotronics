<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { usuarioServicio, type Usuario } from '@/services/usuario.servicio'

const props = defineProps<{
  mostrar: boolean
  usuarioId: string | null
}>()

const emit = defineEmits<{
  (evento: 'cerrar'): void
  (evento: 'guardado', usuario: Usuario): void
}>()

const nuevaContrasena = ref('')
const guardando = ref(false)
const errorContrasena = ref('')

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
    nuevaContrasena.value = ''
    errorContrasena.value = ''
  },
)

const guardarContrasena = async () => {
  if (!props.usuarioId) {
    return
  }
  errorContrasena.value = ''
  guardando.value = true
  try {
    const usuarioActualizado = await usuarioServicio.cambiarContrasenaUsuario(props.usuarioId, nuevaContrasena.value)
    emit('guardado', usuarioActualizado)
  } catch (error) {
    errorContrasena.value = obtenerMensajeError(error, 'No se pudo cambiar la contraseña.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div v-if="mostrar" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="guardarContrasena">
          <div class="modal-header">
            <h2 class="modal-title h5">Cambiar contraseña</h2>
            <button type="button" class="btn-close" aria-label="Cerrar" @click="emit('cerrar')"></button>
          </div>
          <div class="modal-body">
            <div v-if="errorContrasena" class="alert alert-danger" role="alert">
              {{ errorContrasena }}
            </div>
            <div class="mb-3">
              <label for="campo-nueva-contrasena" class="form-label">Nueva contraseña</label>
              <input
                id="campo-nueva-contrasena"
                v-model="nuevaContrasena"
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
