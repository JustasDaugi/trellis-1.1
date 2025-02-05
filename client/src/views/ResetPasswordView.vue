<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import PageForm from '@/components/PageForm.vue'
import { FwbAlert, FwbButton, FwbInput } from 'flowbite-vue'
import { resetPassword } from '@/stores/user'
import useErrorMessage from '@/composables/useErrorMessage'
import PasswordCheck from '@/components/PasswordCheck.vue'

const route = useRoute()

const passwordForm = ref({
  newPassword: '',
  confirmNewPassword: '',
})

const resetToken = computed(() => route.query.token as string | undefined)
const email = computed(() => route.query.email as string | undefined)

const successMessage = ref<string | null>(null)

const [submitResetPassword, errorMessage] = useErrorMessage(async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    throw new Error('Passwords do not match')
  }

  if (!resetToken.value || !email.value) {
    throw new Error('Invalid or missing reset token')
  }

  await resetPassword(email.value, passwordForm.value.newPassword, resetToken.value)

  successMessage.value = 'Your password has been successfully updated. You can now log in.'
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmNewPassword = ''
})
</script>

<template>
  <PageForm heading="Reset Your Password" formLabel="Reset Password" @submit="submitResetPassword">
    <template #default>
      <FwbInput
        label="New Password"
        id="new-password"
        name="new-password"
        type="password"
        v-model="passwordForm.newPassword"
        :required="true"
      />

      <PasswordCheck :password="passwordForm.newPassword" />

      <FwbInput
        label="Confirm New Password"
        id="confirm-new-password"
        name="confirm-new-password"
        type="password"
        v-model="passwordForm.confirmNewPassword"
        :required="true"
      />

      <FwbAlert v-if="errorMessage" data-testid="errorMessage" type="danger">
        {{ errorMessage }}
      </FwbAlert>

      <FwbAlert v-if="successMessage" type="success">
        {{ successMessage }}
      </FwbAlert>

      <div class="grid">
        <FwbButton color="default" type="submit" size="xl"> Reset Password </FwbButton>
      </div>

      <div class="mt-2 text-center">
        <RouterLink
          to="/login"
          class="text-lg font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Go to login page
        </RouterLink>
      </div>
    </template>
  </PageForm>
</template>
