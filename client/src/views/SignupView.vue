<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageForm from '@/components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { signup, login } from '@/stores/user'
import { DEFAULT_SERVER_ERROR } from '@/consts'
import AlertError from '@/components/AlertError.vue'
import PasswordCheck from '@/components/PasswordCheck.vue'

const router = useRouter()

const userForm = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
})

const hasSucceeded = ref(false)
const errorMessage = ref('')
const showPasswordCheck = ref(false)

async function submitSignup() {
  try {
    await signup(userForm.value)
    errorMessage.value = ''

    await login({ email: userForm.value.email, password: userForm.value.password })

    const redirectTo = (router.currentRoute.value.query.redirect as string) ?? { name: 'MainView' }
    router.push(redirectTo)

    hasSucceeded.value = true
  } catch (err: any) {
    errorMessage.value = err instanceof Error ? err.message : DEFAULT_SERVER_ERROR
  }
}

const handlePasswordFocus = () => {
  showPasswordCheck.value = true
}
const handlePasswordBlur = () => {
  if (!userForm.value.password) {
    showPasswordCheck.value = false
  }
}
</script>

<template>
  <PageForm heading="Sign up for an account" formLabel="Signup" @submit="submitSignup">
    <template #default>
      <FwbInput
        data-testid="firstName"
        label="First Name"
        type="text"
        v-model="userForm.firstName"
        :required="true"
      />

      <FwbInput
        data-testid="lastName"
        label="Last Name"
        type="text"
        v-model="userForm.lastName"
        :required="true"
      />

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
        @focus="handlePasswordFocus"
        @blur="handlePasswordBlur"
      />

      <PasswordCheck v-if="showPasswordCheck" :password="userForm.password" />

      <FwbAlert v-if="hasSucceeded" data-testid="successMessage" type="success">
        You have successfully signed up and are now logged in!
      </FwbAlert>

      <AlertError :message="errorMessage">
        {{ errorMessage }}
      </AlertError>

      <div class="grid">
        <FwbButton color="default" type="submit" size="xl">Sign up</FwbButton>
      </div>
    </template>

    <template #footer>
      <FwbAlert class="bg-transparent text-center">
        Already a member?
        <RouterLink
          to="/login"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Log in
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
