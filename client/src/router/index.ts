import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { isLoggedIn } from '@/stores/user'

const routes = [
  {
    path: '/dashboard',
    name: 'MainView',
    component: () => import('../views/MainView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password',
    name: 'SendResetView',
    component: () => import('../views/SendResetView.vue'),
    meta: { guest: true },
  },
  {
    path: '/reset-password/confirm',
    name: 'ResetPasswordView',
    component: () => import('../views/ResetPasswordView.vue'),
    props: (route: RouteLocationNormalized) => ({ token: route.query.token }),
    meta: { guest: true },
  },
  {
    path: '/board/:id',
    name: 'Board',
    component: () => import('../views/BoardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-board',
    name: 'CreateBoard',
    component: () => import('../components/MainView/CreateBoard/CreateBoard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/templates',
    name: 'TemplateView',
    component: () => import('../views/TemplateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/templates/board/:id',
    name: 'TemplateBoard',
    component: () => import('../views/TemplateBoardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { guest: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guest && isLoggedIn.value) {
    if (to.query.redirect) {
      return next(to.query.redirect as string)
    } else {
      return next({ name: 'MainView' })
    }
  }

  next()
})

export default router
