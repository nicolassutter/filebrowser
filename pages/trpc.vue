<script setup lang="ts">
const { $client } = useNuxtApp()

const { data } = await $client.fs.get.useQuery({ path: '/' })
</script>

<template>
  <div>{{ data }}</div>
</template>
