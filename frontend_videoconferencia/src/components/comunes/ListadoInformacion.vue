<script setup lang="ts">
export interface OpcionListado {
  id: string
  titulo: string
  subtitulo?: string
}

withDefaults(
  defineProps<{
    opciones: OpcionListado[]
    cargando?: boolean
    mensajeVacio?: string
  }>(),
  {
    cargando: false,
    mensajeVacio: 'No se encontraron resultados.',
  },
)

const emit = defineEmits<{
  (evento: 'seleccionar', id: string): void
}>()
</script>

<template>
  <div class="listado-informacion shadow-sm">
    <div v-if="cargando" class="d-flex justify-content-center py-3">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <ul v-else class="list-group list-group-flush">
      <li v-if="opciones.length === 0" class="list-group-item text-center text-muted py-3">
        {{ mensajeVacio }}
      </li>
      <li
        v-for="opcion in opciones"
        :key="opcion.id"
        class="list-group-item list-group-item-action"
        @mousedown.prevent="emit('seleccionar', opcion.id)"
      >
        <div class="fw-semibold">{{ opcion.titulo }}</div>
        <div v-if="opcion.subtitulo" class="text-muted small">{{ opcion.subtitulo }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.listado-informacion {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  max-height: 320px;
  overflow-y: auto;
  background-color: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  margin-top: 0.25rem;
}
</style>
