<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { isLoggedIn, logout } from '@/stores/user'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = computed(() => [
  ...(isLoggedIn.value
    ? []
    : [
      ]),
])

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="isLoggedIn" @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
