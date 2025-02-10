<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue'
import { isLoggedIn } from '@/stores/user'

const homePageImg = 'https://awsbucket012345.s3.eu-central-1.amazonaws.com/home_image.jpg'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="flex flex-col items-center">
        <div class="relative mb-6" style="width: 270px; height: 300px">
          <img :src="homePageImg" alt="Home Page" class="h-full w-full object-cover" />
          <div
            class="absolute inset-0"
            style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))"
          ></div>
        </div>
        <p class="mb-6 text-center italic">Collaborate anywhere, anytime</p>
        <div class="mb-40 mt-6 flex flex-col items-center gap-2">
          <FwbButton
            class="w-72 text-center"
            component="RouterLink"
            tag="router-link"
            href="/signup"
            size="xl"
          >
            Sign Up
          </FwbButton>
          <FwbButton
            class="w-72 text-center"
            component="RouterLink"
            tag="router-link"
            color="alternative"
            href="/login"
            size="xl"
          >
            Log In
          </FwbButton>
        </div>
      </div>
      <div class="mt-8 flex items-center justify-center">
        <div class="max-w-lg"></div>
      </div>
    </div>
  </div>
</template>
