<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const { signIn, status } = useAuth()

const credentials = reactive({
  password: '',
  email: '',
})

const authType = ref<'signIn' | 'register'>('signIn')
</script>

<template>
  <form
    v-on:submit.prevent="
      () => signIn('credentials', { ...credentials, authType })
    "
  >
    {{ status }}
    <label for="email">E-mail</label>

    <input
      id="email"
      v-model="credentials.email"
      type="email"
      class="border border-solid border-gray-200 rounded-md p-2"
    />

    <label for="password">Password</label>

    <input
      id="password"
      v-model="credentials.password"
      type="password"
      class="border border-solid border-gray-200 rounded-md p-2"
    />

    <button type="submit">Sign-in</button>
  </form>
</template>
