<template>
  <div class="pantalla-panel d-flex align-items-center justify-content-center">
    <div class="text-center">
      <i class="bi bi-check-circle-fill fs-1 text-success"></i>
      <h1 class="h3 mt-3 mb-1">Bienvenido, {{ usuario?.nombre }}</h1>
      <p class="text-muted">Sesión iniciada como {{ usuario?.correo }}</p>
      <button type="button" class="btn btn-outline-danger mt-3" @click="manejarCerrarSesion">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Usuario } from '@/services/autenticacion.servicio'
import { eliminarUsuario, obtenerUsuario } from '@/services/sesionUsuario'

const router = useRouter()
const usuario = ref<Usuario | null>(null)

onMounted(() => {
  usuario.value = obtenerUsuario()
})

function manejarCerrarSesion(): void {
  eliminarUsuario()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.pantalla-panel {
  min-height: 100vh;
  padding: 1.5rem;
}
</style>
