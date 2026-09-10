import { createRouter, createWebHistory } from 'vue-router'

import Usuarios from '@/views/usuarios/usuarios.vue'
import Participantes from '@/views/participantes/participantes.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios,

    },

    {
      path: '/participantes',
      name: 'participantes',
      component: Participantes,

    },

  ],
})

export default router
