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
    <AppLogo class="text-[#001923]"></AppLogo>

    <AuthForm
      class="mt-10"
      :authType="'register'"
    ></AuthForm>
  </main>
</template>
