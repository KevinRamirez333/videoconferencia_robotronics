<template>
  <div class="pantalla-panel d-flex">
    <MenuLateral :usuario="usuario" @unirse-reunion="abrirModalUnirse" @cerrar-sesion="manejarCerrarSesion" />

    <div class="flex-grow-1">
      <RouterView />
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
