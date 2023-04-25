<script lang="ts" setup>
const { status, data, signIn, signOut, getSession } = useAuth()

// if (status.value === 'unauthenticated') {
//   await signIn()
// }
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
