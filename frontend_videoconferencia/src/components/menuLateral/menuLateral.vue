<script setup lang="ts">
import type { Usuario } from '@/services/autenticacion.servicio'

defineProps<{
  usuario: Usuario | null
}>()

const emit = defineEmits<{
  (evento: 'unirse-reunion'): void
  (evento: 'cerrar-sesion'): void
}>()
</script>

<template>
  <aside class="menu-lateral d-flex flex-column flex-shrink-0 p-3 text-white">
    <div class="d-flex align-items-center gap-2 mb-4">
      <i class="bi bi-camera-video-fill fs-4"></i>
      <span class="fs-5 fw-semibold">Robotronics</span>
    </div>

    <div class="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-secondary">
      <i class="bi bi-person-circle fs-2"></i>
      <div class="text-truncate">
        <div class="fw-semibold text-truncate">{{ usuario?.nombre }}</div>
        <div class="small text-white-50 text-truncate">{{ usuario?.correo }}</div>
      </div>
    </div>

    <ul class="nav nav-pills flex-column mb-auto gap-1">
      <li class="nav-item">
        <RouterLink to="/panel" class="nav-link text-white d-flex align-items-center gap-2">
          <i class="bi bi-house-door"></i>
          Inicio
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/sesiones" class="nav-link text-white d-flex align-items-center gap-2">
          <i class="bi bi-calendar-plus"></i>
          Planificar sesión
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/usuarios" class="nav-link text-white d-flex align-items-center gap-2">
          <i class="bi bi-people"></i>
          Usuarios
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/participantes" class="nav-link text-white d-flex align-items-center gap-2">
          <i class="bi bi-person-lines-fill"></i>
          Participantes
        </RouterLink>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="nav-link text-white d-flex align-items-center gap-2 w-100 text-start"
          @click="emit('unirse-reunion')"
        >
          <i class="bi bi-box-arrow-in-right"></i>
          Unirse a reunión
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="btn btn-outline-light d-flex align-items-center justify-content-center gap-2 mt-3"
      @click="emit('cerrar-sesion')"
    >
      <i class="bi bi-power"></i>
      Cerrar sesión
    </button>
  </aside>
</template>

<style scoped>
.menu-lateral {
  width: 260px;
  min-height: 100vh;
  background-color: #202124;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 0.375rem;
}
</style>
