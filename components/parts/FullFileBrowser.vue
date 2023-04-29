<script lang="ts" setup>
import path from 'path-browserify'
import FileBrowser from '~/components/FileBrowser.vue'
import IconDotsVertical from '~icons/mdi/dots-vertical'
import IconCopy from '~icons/mdi/content-copy'
import IconPaste from '~icons/mdi/content-paste'
import IconMove from '~icons/mdi/folder-move'
import IconHardLink from '~icons/mdi/vector-link'
import { useFullFileBrowserStore } from '~/stores/fullFileBrowsers.store'

const props = defineProps<{
  browserId: string
}>()

const uid = uuid()

const { $client } = useNuxtApp()

const currentPath = ref('/')

const selectedItems = ref<string[]>([])

const isOptionsMenuOpen = ref(false)

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

function refresh() {
  selectedItems.value = []
  refreshPath()
}

const fullFileBrowserStore = useFullFileBrowserStore()
</script>

<template>
  <div class="full-file-browser relative">
    <template v-if="!pathPending && !pathError">
      <span class="p-4">
        <span class="sr-only">Current path: </span>
        {{ pathData?.fullPath }}
      </span>

      <FileBrowser
        v-model:selected="selectedItems"
        selectable
        :dirs="[
          {
            type: 'directory',
            label: '..',
            path: path.join(currentPath, '..'),
            disabled: currentPath === '/',
          },
          ...(pathData?.directories.map((dir) => {
            return {
              type: 'directory',
              label: dir,
              path: path.join(currentPath, dir),
              disabled: false,
            } as const
          }) ?? []),
        ]"
        :files="
          pathData?.files.map((file) => {
            return {
              type: 'file',
              label: file,
              path: file,
            }
          }) ?? []
        "
        v-on:navigate="
          (newSubPath) => {
            currentPath = newSubPath
            refresh()
          }
        "
      >
      </FileBrowser>
    </template>

    <template v-if="pathPending && !pathError">
      <p>Loading...</p>
    </template>

    <template v-if="!pathPending && pathError">
      <p>An error occured: {{ pathError.message }}</p>

      <button
        v-on:click="
          () => {
            currentPath = path.join(currentPath, '..')
            refresh()
          }
        "
      >
        Go back
      </button>
    </template>

    <div class="absolute right-4 bottom-4">
      <button
        v-if="selectedItems.length > 0"
        class="btn btn-circle"
        v-on:click="() => (isOptionsMenuOpen = !isOptionsMenuOpen)"
      >
        <IconDotsVertical class="h-6 w-6"></IconDotsVertical>
      </button>

      <ul
        v-if="isOptionsMenuOpen"
        class="menu bg-base-200 w-56 p-2 rounded-box absolute bottom-full -translate-y-2 right-0 shadow-lg"
      >
        <li>
          <button
            v-on:click="
              () => {
                fullFileBrowserStore.initAction('copy', {
                  paths: selectedItems,
                  src: currentPath,
                  fullFileBrowserId: uid,
                })
              }
            "
          >
            <IconCopy></IconCopy>
            Copy
          </button>
        </li>
        <li>
          <button>
            <IconMove></IconMove>
            Move
          </button>
        </li>
        <li>
          <button>
            <IconHardLink></IconHardLink>
            Hard Link
          </button>
        </li>
      </ul>
    </div>

    <div
      v-if="
        fullFileBrowserStore.selectedItemsForAction.length > 0 &&
        fullFileBrowserStore.currentlyPendingFullFileBrowserId !== uid
      "
      class="absolute right-4 bottom-4"
    >
      <button
        class="btn btn-circle"
        v-on:click="() => fullFileBrowserStore.startPendingAction()"
      >
        <IconPaste
          v-if="
            fullFileBrowserStore.currentlyPendingAction === 'copy' ||
            fullFileBrowserStore.currentlyPendingAction === 'move'
          "
          class="h-6 w-6"
        ></IconPaste>

        <IconHardLink
          v-if="fullFileBrowserStore.currentlyPendingAction === 'hard_link'"
          class="h-6 w-6"
        ></IconHardLink>
      </button>
    </div>
  </div>
</template>
