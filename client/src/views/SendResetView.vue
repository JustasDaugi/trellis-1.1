<script lang="ts" setup>
import { ref } from 'vue'
import PageForm from '@/components/PageForm.vue'
import { FwbInput, FwbButton, FwbAlert } from 'flowbite-vue'
import { sendResetLink } from '@/stores/user'
import useErrorMessage from '@/composables/useErrorMessage'

const email = ref('')
const successMessage = ref<string | null>(null)

const [submitReset, errorMessage] = useErrorMessage(async () => {
  successMessage.value = null
  await sendResetLink(email.value)
  successMessage.value = 'A password reset link has been sent to your email.'
})
</script>

<template>
  <PageForm heading="" formLabel="Reset Password">
    <template #heading> </template>

    <template #default>
      <p class="mx-auto mb-4 max-w-sm text-center">
        Please enter your Gmail address to send the password reset link.
      </p>

      <FwbInput type="email" autocomplete="username" v-model="email" :required="true" />

      <FwbAlert v-if="errorMessage" type="danger">
        {{ errorMessage }}
      </FwbAlert>

      <FwbAlert v-if="successMessage" type="success">
        {{ successMessage }}
      </FwbAlert>

      <div class="mt-4 flex justify-center">
        <FwbButton color="default" @click="submitReset"> Send </FwbButton>
      </div>
    </template>
  </PageForm>
</template>
