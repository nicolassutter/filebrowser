<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})
</script>

<template>
  <AuthForm :authType="'signIn'"></AuthForm>
</template>
