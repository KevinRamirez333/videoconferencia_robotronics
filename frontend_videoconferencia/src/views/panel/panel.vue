<template>
  <div class="pantalla-panel d-flex">
    <MenuLateral :usuario="usuario" @unirse-reunion="abrirModalUnirse" @cerrar-sesion="manejarCerrarSesion" />

    <div class="flex-grow-1 d-flex align-items-center justify-content-center p-4">
      <div class="text-center">
        <i class="bi bi-check-circle-fill fs-1 text-success"></i>
        <h1 class="h3 mt-3 mb-1">Bienvenido, {{ usuario?.nombre }}</h1>
        <p class="text-muted">Sesión iniciada como {{ usuario?.correo }}</p>
      </div>
    </div>

    <ModalUnirseReunion ref="modalUnirse" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Usuario } from '@/services/autenticacion.servicio'
import { eliminarUsuario, obtenerUsuario } from '@/services/sesionUsuario'
import MenuLateral from '@/components/menuLateral/menuLateral.vue'
import ModalUnirseReunion from '@/components/modalUnirseReunion/modalUnirseReunion.vue'

const router = useRouter()
const usuario = ref<Usuario | null>(null)
const modalUnirse = ref<InstanceType<typeof ModalUnirseReunion> | null>(null)

onMounted(() => {
  usuario.value = obtenerUsuario()
})

function abrirModalUnirse(): void {
  modalUnirse.value?.abrir()
}

function manejarCerrarSesion(): void {
  eliminarUsuario()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.pantalla-panel {
  min-height: 100vh;
}
</style>
