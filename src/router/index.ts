import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('@/views/service/index.vue'),
        },
        {
          path: 'servers',
          name: 'servers',
          component: () => import('@/views/asset/index.vue'),
        },
        {
          path: 'control',
          name: 'control',
          component: () => import('@/views/control/index.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    return { name: 'login' }
  } else if (to.name === 'login' && authStore.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
