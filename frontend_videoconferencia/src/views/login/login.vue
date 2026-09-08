<template>
  <div class="pantalla-login d-flex align-items-center justify-content-center">
    <div class="card login-tarjeta shadow-sm">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <i class="bi bi-camera-video-fill fs-1 text-primary"></i>
          <h1 class="h4 mt-2 mb-1">Videoconferencia Robotronics</h1>
          <p class="text-muted mb-0">Inicia sesión para continuar</p>
        </div>

        <div v-if="mensajeError" class="alert alert-danger py-2" role="alert">
          {{ mensajeError }}
        </div>

        <form novalidate @submit.prevent="manejarInicioSesion">
          <div class="form-floating mb-3">
            <input
              id="correo"
              v-model.trim="correo"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errores.correo }"
              placeholder="nombre@ejemplo.com"
              autocomplete="username"
            />
            <label for="correo">Correo electrónico</label>
            <div class="invalid-feedback">{{ errores.correo }}</div>
          </div>

          <div class="form-floating mb-3">
            <input
              id="contrasena"
              v-model="contrasena"
              :type="mostrarContrasena ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errores.contrasena }"
              placeholder="Contraseña"
              autocomplete="current-password"
            />
            <label for="contrasena">Contraseña</label>
            <div class="invalid-feedback">{{ errores.contrasena }}</div>
          </div>

          <div class="form-check mb-4">
            <input id="mostrarContrasena" v-model="mostrarContrasena" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="mostrarContrasena">Mostrar contraseña</label>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import { autenticacionServicio } from '@/services/autenticacion.servicio'
import { guardarUsuario } from '@/services/sesionUsuario'

const router = useRouter()

const correo = ref('')
const contrasena = ref('')
const mostrarContrasena = ref(false)
const cargando = ref(false)
const mensajeError = ref('')

const errores = reactive({
  correo: '',
  contrasena: '',
})

function validarFormulario(): boolean {
  errores.correo = ''
  errores.contrasena = ''

  if (!correo.value) {
    errores.correo = 'El correo es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value)) {
    errores.correo = 'Ingresa un correo válido'
  }

  if (!contrasena.value) {
    errores.contrasena = 'La contraseña es obligatoria'
  }

  return !errores.correo && !errores.contrasena
}

async function manejarInicioSesion(): Promise<void> {
  mensajeError.value = ''

  if (!validarFormulario()) {
    return
  }

  cargando.value = true

  try {
    const usuario = await autenticacionServicio.iniciarSesion({
      correo: correo.value,
      contrasena: contrasena.value,
    })

    guardarUsuario(usuario)
    router.push({ name: 'panel' })
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      mensajeError.value = error.response.data?.mensaje ?? 'No se pudo iniciar sesión'
    } else {
      mensajeError.value = 'No se pudo conectar con el servidor'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.pantalla-login {
  min-height: 100vh;
  padding: 1.5rem;
}

.login-tarjeta {
  width: 100%;
  max-width: 420px;
  border: none;
  border-radius: 1rem;
}
</style>
