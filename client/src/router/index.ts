import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { isLoggedIn } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'MainView',
      component: () => import('../views/MainView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/board/:id',
      name: 'Board',
      component: () => import('../views/BoardView.vue'),
    },
    {
      path: '/create-board',
      name: 'CreateBoard',
      component: () => import('../components/MainView/CreateBoard/CreateBoard.vue'),
    },
    {
      path: '/templates',
      name: 'TemplateView',
      component: () => import('../views/TemplateView.vue'),
    },
    {
      path: '/templates/board/:id',
      name: 'TemplateBoard',
      component: () => import('../views/TemplateBoardView.vue'),
    },
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (isLoggedIn.value) {
    if (to.name === 'Login' || to.name === 'Signup' || to.name === 'Home') {
      if (to.query.redirect) {
        next(to.query.redirect as string)
      } else {
        next({ name: 'MainView' })
      }
    } else {
      next()
    }
  } else {
    if (
      to.name === 'MainView' ||
      to.path.startsWith('/dashboard') ||
      to.name === 'Board' ||
      to.name === 'TemplateView' ||
      to.name === 'TemplateBoard'
    ) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

export default router
