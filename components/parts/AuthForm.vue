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
    class="bg-base-200 rounded-lg p-5 w-full max-w-sm"
    v-on:submit.prevent="
      () =>
        signIn('credentials', { ...credentials, authType, callbackUrl: '/' })
    "
  >
    <label
      class="label"
      for="email"
      >E-mail</label
    >

    <input
      id="email"
      v-model="credentials.email"
      type="email"
      class="input input-bordered w-full"
      autocomplete="email"
    />

    <label
      class="label"
      for="password"
      >Password</label
    >

    <input
      id="password"
      v-model="credentials.password"
      type="password"
      class="input input-bordered w-full"
    />

    <button
      class="btn btn-primary flex mt-5"
      type="submit"
    >
      <template v-if="authType === 'signIn'">Sign in ✨</template>
      <template v-if="authType === 'register'">Register ✨</template>
    </button>
  </form>
</template>
