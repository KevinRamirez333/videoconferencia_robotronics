import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/login.vue'
import Panel from '@/views/panel/panel.vue'
import { obtenerUsuario } from '@/services/sesionUsuario'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/panel',
      name: 'panel',
      component: Panel,
      meta: { requiereAutenticacion: true },
    },
  ],
})

router.beforeEach((destino) => {
  const haySesionIniciada = obtenerUsuario() !== null

  if (destino.meta.requiereAutenticacion && !haySesionIniciada) {
    return { name: 'login' }
  }

  if (destino.name === 'login' && haySesionIniciada) {
    return { name: 'panel' }
  }
})

export default router
