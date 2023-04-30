<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
  layout: 'auth',
})
</script>

<template>
  <main
    role="main"
    class="main row-span-full col-span-full flex items-center justify-center"
    tabindex="-1"
  >
    <AuthForm :authType="'register'"></AuthForm>
  </main>
</template>
