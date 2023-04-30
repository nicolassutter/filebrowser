<script lang="ts" setup>
import path from 'path-browserify'
import FileBrowser from '~/components/FileBrowser.vue'
import IconDotsVertical from '~icons/mdi/dots-vertical'
import IconCopy from '~icons/mdi/content-copy'
import IconPaste from '~icons/mdi/content-paste'
import IconMove from '~icons/mdi/folder-move'
import IconHardLink from '~icons/mdi/vector-link'
import IconCancel from '~icons/mdi/close'
import IconDelete from '~icons/mdi/delete'
import IconCheckbox from '~icons/mdi/checkbox-outline'
import IconCheckboxEmpty from '~icons/mdi/checkbox-blank-outline'
import IconArrowLeftTop from '~icons/mdi/arrow-u-left-top'
import { useFullFileBrowserStore } from '~/stores/fullFileBrowsers.store'
import type { PathOption } from '~/types/utils'

const props = defineProps<{
  browserId: string
}>()

const uid = uuid()

const options = ref<HTMLElement>()

/**
 * Close the options if we click outside
 */
onClickOutside(options, () => {
  isOptionsMenuOpen.value = false
})

const { $client } = useNuxtApp()

const currentPath = ref('/')

const selectedItems = ref<PathOption[]>([])

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
const currentlyPendingFullFileBrowserPending = computed(
  () => fullFileBrowserStore.currentlyPendingFullFileBrowserId === uid,
)

const hasOnlySelectedFiles = computed(() => {
  return selectedItems.value.every(
    (selectedItem) => selectedItem.type === 'file',
  )
})

emitter.on('resetAllChecked', (fullFileBrowserId) => {
  if (fullFileBrowserId !== uid) {
    selectedItems.value = []
  }
})

emitter.on('refresh-full-filebrowser', (fullFileBrowserId) => {
  if (fullFileBrowserId === uid) {
    refresh()
  }
})

function startPendingAction() {
  const action = fullFileBrowserStore.currentlyPendingAction
  const pendingFullFileBrowserId =
    fullFileBrowserStore.currentlyPendingFullFileBrowserId

  fullFileBrowserStore
    .startPendingAction({
      dest: currentPath.value,
      fullFileBrowserId: uid,
    })
    .finally(() => {
      refresh()

      if (action === 'move' && pendingFullFileBrowserId) {
        emitter.emit('refresh-full-filebrowser', pendingFullFileBrowserId)
      }
    })
}

function checkAll() {
  const directoriesToCheck =
    pathData.value?.directories.map((dir) => {
      return {
        type: 'directory',
        path: path.join(currentPath.value, dir),
      } as const
    }) ?? []

  const filesToCheck =
    pathData.value?.files.map((dir) => {
      return {
        type: 'file',
        path: path.join(currentPath.value, dir),
      } as const
    }) ?? []

  selectedItems.value = [...directoriesToCheck, ...filesToCheck]
}

function uncheckAll() {
  selectedItems.value = []
}

function handleNavigate(newPath: string) {
  currentPath.value = newPath
  refresh()
}

const pathParts = computed(() => {
  const parts = (pathData.value?.fullPath.split('/') ?? []).filter(
    (part) => part !== '',
  )

  let currentComputedPath = '/'

  return parts.map((part) => {
    const partPath = path.join(currentComputedPath, part)
    currentComputedPath = partPath

    return {
      partName: part,
      partPath,
    }
  })
})
</script>

<template>
  <div class="full-file-browser relative flex flex-col">
    <template v-if="!pathPending && !pathError">
      <!-- Display current path -->
      <div class="p-4 overflow-x-auto w-full">
        <span class="sr-only">Current path: </span>

        <span class="path flex items-center whitespace-nowrap">
          <div
            class="shrink-0 select-none"
            aria-hidden="true"
          >
            /
          </div>

          <template
            v-for="(pathPart, index) in pathParts"
            :key="pathPart.partPath"
          >
            <button
              class="btn btn-sm btn-ghost text explorer-path-btn block w-max mx-2"
              :title="`Navigate to ${pathPart.partPath}`"
              :disabled="index === pathParts.length - 1"
              v-on:click="() => handleNavigate(pathPart.partPath)"
            >
              {{ pathPart.partName }}
            </button>

            <div
              class="shrink-0 select-none"
              aria-hidden="true"
            >
              /
            </div>
          </template>
        </span>
      </div>

      <!-- Check all and uncheck all -->
      <div class="p-2 flex gap-2">
        <button
          class="btn btn-sm"
          v-on:click="() => checkAll()"
        >
          <IconCheckbox class="mr-2"></IconCheckbox>
          Check All
        </button>
        <button
          class="btn btn-sm"
          v-on:click="() => uncheckAll()"
        >
          <IconCheckboxEmpty class="mr-2"></IconCheckboxEmpty>
          Uncheck All
        </button>
      </div>

      <FileBrowser
        v-model:selected="selectedItems"
        selectable
        :isSelectionDisabled="currentlyPendingFullFileBrowserPending"
        :isNavigationDisabled="currentlyPendingFullFileBrowserPending"
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
              path: path.join(currentPath, file),
            }
          }) ?? []
        "
        v-on:navigate="handleNavigate"
      >
      </FileBrowser>
    </template>

    <template v-if="pathPending && !pathError">
      <p>Loading...</p>
    </template>

    <div
      v-if="!pathPending && pathError"
      class="p-2"
    >
      <p>An error occured: {{ pathError.message }}</p>

      <button
        class="btn w-max mt-5"
        v-on:click="
          () => {
            currentPath = path.join(currentPath, '..')
            refresh()
          }
        "
      >
        <IconArrowLeftTop class="mr-2"></IconArrowLeftTop>
        Go back
      </button>
    </div>

    <div
      ref="options"
      class="options absolute right-4 bottom-4"
    >
      <button
        v-if="selectedItems.length > 0"
        class="btn btn-circle"
        aria-haspopup="true"
        :aria-expanded="isOptionsMenuOpen"
        :aria-controls="`full-filebrowser-options-menu-${uid}`"
        v-on:click="() => (isOptionsMenuOpen = !isOptionsMenuOpen)"
      >
        <IconDotsVertical class="h-6 w-6"></IconDotsVertical>
      </button>

      <ul
        v-if="isOptionsMenuOpen"
        :id="`full-filebrowser-options-menu-${uid}`"
        class="menu bg-base-200 w-56 p-2 rounded-box absolute bottom-full -translate-y-2 right-0 shadow-lg"
        role="menu"
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

                isOptionsMenuOpen = false
              }
            "
          >
            <IconCopy></IconCopy>
            Copy
          </button>
        </li>
        <li>
          <button
            v-on:click="
              () => {
                fullFileBrowserStore.initAction('move', {
                  paths: selectedItems,
                  src: currentPath,
                  fullFileBrowserId: uid,
                })

                isOptionsMenuOpen = false
              }
            "
          >
            <IconMove></IconMove>
            Move
          </button>
        </li>

        <!-- Hard linking is only possible on files, so if directories are selected, the button is disabled -->
        <li :class="{ disabled: !hasOnlySelectedFiles }">
          <button
            :disabled="!hasOnlySelectedFiles"
            v-on:click="
              () => {
                fullFileBrowserStore.initAction('hard_link', {
                  paths: selectedItems,
                  src: currentPath,
                  fullFileBrowserId: uid,
                })

                isOptionsMenuOpen = false
              }
            "
          >
            <IconHardLink></IconHardLink>
            Hard Link
          </button>
        </li>
        <li>
          <button
            v-on:click="
              () => {
                fullFileBrowserStore.initImmediateAction('delete', {
                  paths: selectedItems,
                })

                isOptionsMenuOpen = false

                fullFileBrowserStore
                  .startPendingAction({
                    dest: currentPath,
                    fullFileBrowserId: uid,
                  })
                  .finally(() => {
                    uncheckAll()
                    refresh()
                  })
              }
            "
          >
            <IconDelete></IconDelete>
            Delete
          </button>
        </li>
      </ul>
    </div>

    <div
      v-if="
        fullFileBrowserStore.selectedItemsForAction.length > 0 &&
        fullFileBrowserStore.currentlyPendingFullFileBrowserId !== uid &&
        fullFileBrowserStore.currentlyPendingAction !== 'delete'
      "
      class="absolute right-4 bottom-4"
    >
      <button
        class="btn btn-circle"
        v-on:click="() => startPendingAction()"
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

    <!-- Cancel zone -->
    <div
      v-if="currentlyPendingFullFileBrowserPending"
      class="absolute right-4 bottom-4"
    >
      <button
        class="btn btn-circle"
        v-on:click="() => fullFileBrowserStore.resetPendingAction()"
      >
        <IconCancel class="h-6 w-6"></IconCancel>
      </button>
    </div>
  </div>
</template>
