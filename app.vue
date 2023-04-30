<script lang="ts" setup>
import './assets/app.css'
import IconLogout from '~icons/mdi/logout'

useHead({
  bodyAttrs: {
    class: 'dark',
  },
})

const { status, signOut } = useAuth()
</script>

<template>
  <div class="app">
    <header class="header bg-base-200"></header>

    <aside class="aside">
      <ul class="menu bg-base-100 w-56 p-2 rounded-box">
        <li>
          <button
            v-if="status === 'authenticated' || status === 'loading'"
            :disabled="status === 'loading'"
            v-on:click="() => signOut()"
          >
            <IconLogout></IconLogout>
            Sign out
          </button>
        </li>
      </ul>
    </aside>

    <NuxtPage />

    <div id="dialog-root"></div>
  </div>
</template>
