<script setup lang="ts">
import IconLogout from '~icons/mdi/logout'

const { status, signOut } = useAuth()
</script>

<template>
  <header class="header bg-base-200 flex items-center p-5">
    <AppLogo class="text-[#001923] shrink-0"></AppLogo>
  </header>

  <aside class="aside">
    <ul class="menu bg-base-100 w-56 p-2 rounded-box">
      <li v-if="status === 'authenticated' || status === 'loading'">
        <button
          :disabled="status === 'loading'"
          v-on:click="() => signOut()"
        >
          <IconLogout></IconLogout>
          Sign out
        </button>
      </li>
    </ul>
  </aside>
  <slot />
</template>
