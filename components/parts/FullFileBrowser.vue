<script lang="ts" setup>
import path from 'path-browserify'
import FileBrowser from '~/components/FileBrowser.vue'

const props = defineProps<{
  browserId: string
}>()

const { $client } = useNuxtApp()

const currentPath = ref('/')

const {
  data: pathData,
  error: pathError,
  refresh: refreshPath,
  pending: pathPending,
} = await useAsyncData(props.browserId, () =>
  $client.fs.get.query({
    get path() {
      return currentPath.value
    },
  }),
)
</script>

<template>
  <div>
    <FileBrowser
      v-if="!pathPending && !pathError"
      :dirs="[
        {
          label: '..',
          path: '..',
          disabled: currentPath === '/',
        },
        ...(pathData?.directories.map((dir) => {
          return {
            label: dir,
            path: dir,
            disabled: false,
          }
        }) ?? []),
      ]"
      v-on:navigate="
        (newSubPath) => {
          currentPath = path.join(currentPath, newSubPath)
          refreshPath()
        }
      "
    >
    </FileBrowser>

    <template v-if="pathPending && !pathError">
      <p>Loading...</p>
    </template>

    <template v-if="!pathPending && pathError">
      <p>An error occured: {{ pathError.message }}</p>

      <button
        v-on:click="
          () => {
            currentPath = path.join(currentPath, '..')
            refreshPath()
          }
        "
      >
        Go back
      </button>
    </template>
  </div>
</template>
