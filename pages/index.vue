<script lang="ts" setup>
defineComponent({
  name: 'IndexPage',
})

const { $client } = useNuxtApp()

const currentPath = ref('/')

const {
  data: pathData,
  error: pathError,
  refresh: refreshPath,
} = await $client.fs.get.useQuery({
  get path() {
    return currentPath.value
  },
})
</script>

<template>
  <div>
    <pre v-if="!pathError">{{ JSON.stringify(pathData, null, 4) }}</pre>

    <button
      v-on:click="
        () => {
          currentPath = '/home'
          refreshPath()
        }
      "
    >
      test
    </button>
  </div>
</template>
