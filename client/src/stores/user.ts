import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import { computed, ref } from 'vue'

const authToken = ref<string | null>(getStoredAccessToken(localStorage))

export const authUserId = computed(() =>
  authToken.value ? getUserIdFromToken(authToken.value) : null
)

export const isLoggedIn = computed(() => !!authToken.value)

export async function login(userLogin: { email: string; password: string }) {
  const { accessToken } = await trpc.user.login.mutate(userLogin)
  authToken.value = accessToken
  storeAccessToken(localStorage, accessToken)
}

export function logout() {
  authToken.value = null
  clearStoredAccessToken(localStorage)
}

export const signup = trpc.user.signup.mutate

export async function sendResetLink(email: string) {
  return trpc.user.sendResetLink.mutate({ email })
}

export async function resetPassword(email: string, password: string, token: string) {
  return trpc.user.resetPassword.mutate({ email, password, token })
}
