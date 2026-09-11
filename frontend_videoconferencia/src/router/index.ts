import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/login/login.vue'
import Panel from '@/views/panel/panel.vue'
import Sesiones from '@/views/sesiones/sesiones.vue'
import { obtenerUsuario } from '@/services/sesionUsuario'
import Sala from '../views/sala/sala.vue'
import Usuarios from '@/views/usuarios/usuarios.vue'
import Participantes from '@/views/participantes/participantes.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',

      name: 'login',
      component: Login,
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios,
    },

    {
      path: '/panel',
      name: 'panel',
      component: Panel,
      meta: { requiereAutenticacion: true },
    },
    {
      path: '/sesiones',
      name: 'sesiones',
      component: Sesiones,
      meta: { requiereAutenticacion: true },
    },
    {
      path: '/sala/:sesionId',
      name: 'sala',
      component: Sala,
      meta: { requiereAutenticacion: true },
    },
    {
      path: '/participantes',
      name: 'participantes',
      component: Participantes,
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
