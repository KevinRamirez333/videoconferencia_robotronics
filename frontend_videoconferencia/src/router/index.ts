import { createRouter, createWebHistory } from 'vue-router'

import Sala from '../views/sala/sala.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'sala' },
    },
    {
      path: '/sala',
      name: 'sala',
      component: Sala,
    },
  ],
})

export default router
