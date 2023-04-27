<script setup lang="ts">
defineProps<{
  authType: 'signIn' | 'register'
}>()

const { signIn } = useAuth()
const route = useRoute()

const authError = computed(() => route.query.error)

const credentials = reactive({
  password: '',
  email: '',
})
</script>

<template>
  <p v-if="authError === 'CredentialsSignin'">Bad credentials provided</p>

  <form
    v-on:submit.prevent="
      () =>
        signIn('credentials', { ...credentials, authType, callbackUrl: '/' })
    "
  >
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

    <button type="submit">
      <template v-if="authType === 'signIn'">Sign-in</template>
      <template v-if="authType === 'register'">Register</template>
    </button>
  </form>
</template>
