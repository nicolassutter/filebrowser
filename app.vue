<script lang="ts" setup>
import './assets/app.css'

useHead({
  bodyAttrs: {
    class: 'dark',
  },
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
