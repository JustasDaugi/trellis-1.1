<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageForm from '@/components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { login } from '@/stores/user'

const userForm = ref({
  email: '',
  password: '',
})

const error = ref('')

const router = useRouter()

async function submitLogin() {
  error.value = ''

  try {
    await login(userForm.value)

    const redirectTo = (router.currentRoute.value.query.redirect as string) ?? {
      name: 'MainView',
    }
    router.push(redirectTo)

  } catch (err: any) {
    error.value = 'Incorrect credentials. Please try again.'
  }
}
</script>

<template>
  <PageForm heading="Log in to your account" formLabel="Login" @submit="submitLogin">
    <template #default>
      <FwbInput
        label="Email"
        type="email"
        autocomplete="username"
        v-model="userForm.email"
        :required="true"
      />

      <FwbInput
        label="Password"
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        v-model="userForm.password"
        :required="true"
      />

      <FwbAlert v-if="error" data-testid="errorMessage" type="danger">
        {{ error }}
      </FwbAlert>

      <div class="grid">
        <FwbButton color="default" type="submit" size="xl">
          Log in
        </FwbButton>
      </div>

      <div class="mt-2 text-center">
        <RouterLink
          to="/reset-password"
          class="text-lg font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
        
          Forgot your password?
        </RouterLink>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Not a member?
        <RouterLink
          to="/signup"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </RouterLink>
        <br />
        or go
        <RouterLink to="/" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          back home
        </RouterLink>
      </FwbAlert>
    </template>
  </PageForm>
</template>
