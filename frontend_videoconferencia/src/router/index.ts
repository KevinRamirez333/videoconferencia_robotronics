import { createRouter, createWebHistory } from 'vue-router'

import Usuarios from '@/views/usuarios/usuarios.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios,

    },
   
  ],
})

export default router
