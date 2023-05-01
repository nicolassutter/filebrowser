<script lang="ts" setup>
import './assets/app.css'

useHead({
  title: 'FileBrowser',
  bodyAttrs: {
    class: 'dark',
  },
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
})
</script>

<template>
  <div class="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <div id="dialog-root"></div>
  </div>
</template>
