<template>
  <div class="pantalla-bienvenida d-flex align-items-center justify-content-center p-4">
    <div class="text-center">
      <i class="bi bi-check-circle-fill fs-1 text-success"></i>
      <h1 class="h3 mt-3 mb-1">Bienvenido, {{ usuario?.nombre }}</h1>
      <p class="text-muted">Sesión iniciada como {{ usuario?.correo }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Usuario } from '@/services/autenticacion.servicio'
import { obtenerUsuario } from '@/services/sesionUsuario'

const usuario = ref<Usuario | null>(null)

onMounted(() => {
  usuario.value = obtenerUsuario()
})
</script>

<style scoped>
.pantalla-bienvenida {
  min-height: 100vh;
}
</style>
