<script lang="ts" setup>
import { computed, defineProps } from 'vue'

const props = defineProps<{ password: string }>()

const passwordChecks = computed(() => {
  return {
    length: props.password.length >= 8,
    maxLength: props.password.length <= 64,
    uppercase: /[A-Z]/.test(props.password),
    lowercase: /[a-z]/.test(props.password),
    number: /[0-9]/.test(props.password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(props.password),
    noSpaces: !/\s/.test(props.password),
  }
})

const passwordStrength = computed(() => {
  return Object.values(passwordChecks.value).filter(Boolean).length
})
</script>

<template>
  <div class="mt-2">
    <div class="h-2 w-full overflow-hidden rounded bg-gray-200">
      <div
        class="h-full transition-all duration-300"
        :class="[
          passwordStrength >= 6
            ? 'w-full bg-green-500'
            : passwordStrength >= 4
              ? 'w-4/6 bg-yellow-400'
              : 'w-2/6 bg-red-500',
        ]"
      ></div>
    </div>

    <ul class="mt-3 space-y-1 text-sm">
      <li
        class="flex items-center"
        :class="{ 'text-green-600': passwordChecks.length, 'text-red-600': !passwordChecks.length }"
      >
        <span class="mr-2 flex h-4 w-4 items-center justify-center">
          <svg
            v-if="passwordChecks.length"
            class="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 9l4-4m0 0l-4-4m4 4H6m4 4l4 4m-4-4H6m4 4l-4 4m4-4h4m-4-4l-4-4"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        At least 8 characters long
      </li>

      <li
        class="flex items-center"
        :class="{
          'text-green-600': passwordChecks.maxLength,
          'text-red-600': !passwordChecks.maxLength,
        }"
      >
        <span class="mr-2 flex h-4 w-4 items-center justify-center">
          <svg
            v-if="passwordChecks.maxLength"
            class="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 9l4-4m0 0l-4-4m4 4H6m4 4l4 4m-4-4H6m4 4l-4 4m4-4h4m-4-4l-4-4"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        No more than 64 characters
      </li>

      <li
        class="flex items-center"
        :class="{
          'text-green-600': passwordChecks.uppercase,
          'text-red-600': !passwordChecks.uppercase,
        }"
      >
        <span class="mr-2 flex h-4 w-4 items-center justify-center">
          <svg
            v-if="passwordChecks.uppercase"
            class="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 9l4-4m0 0l-4-4m4 4H6m4 4l4 4m-4-4H6m4 4l-4 4m4-4h4m-4-4l-4-4"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        At least one uppercase letter
      </li>

      <li
        class="flex items-center"
        :class="{
          'text-green-600': passwordChecks.specialChar,
          'text-red-600': !passwordChecks.specialChar,
        }"
      >
        <span class="mr-2 flex h-4 w-4 items-center justify-center">
          <svg
            v-if="passwordChecks.specialChar"
            class="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 9l4-4m0 0l-4-4m4 4H6m4 4l4 4m-4-4H6m4 4l-4 4m4-4h4m-4-4l-4-4"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        At least one special character
      </li>

      <li
        class="flex items-center"
        :class="{
          'text-green-600': passwordChecks.noSpaces,
          'text-red-600': !passwordChecks.noSpaces,
        }"
      >
        <span class="mr-2 flex h-4 w-4 items-center justify-center">
          <svg
            v-if="passwordChecks.noSpaces"
            class="h-4 w-4 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 111.414-1.414L8.414 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 9l4-4m0 0l-4-4m4 4H6m4 4l4 4m-4-4H6m4 4l-4 4m4-4h4m-4-4l-4-4"
              clip-rule="evenodd"
            />
          </svg>
        </span>
        No spaces allowed
      </li>
    </ul>
  </div>
</template>
