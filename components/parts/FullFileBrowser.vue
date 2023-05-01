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
import IconFolderPlus from '~icons/mdi/folder-plus'
import { useFullFileBrowserStore } from '~/stores/fullFileBrowsers.store'
import type { ComponentProps, PathOption } from '~/types/utils'

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
const isDirectoryModalOpened = ref(false)

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

const directoryModal = ref<HTMLElement>()

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

const newDirName = ref('')

const isNewDirNameValid = computed(() => {
  const validDirRegex = /^[a-zA-Z0-9_-\s]+$/
  return newDirName.value !== '' && validDirRegex.test(newDirName.value)
})

const dirs = computed<ComponentProps<'FileBrowser'>['dirs']>(() => {
  return [
    {
      type: 'directory',
      label: '..',
      path: path.join(currentPath.value, '..'),
      disabled: currentPath.value === '/',
    },
    ...(pathData.value?.directories.map((dir) => {
      return {
        type: 'directory',
        label: dir,
        path: path.join(currentPath.value, dir),
        disabled: false,
      } satisfies ComponentProps<'FileBrowser'>['dirs'][number]
    }) ?? []),
  ]
})

const files = computed(() => {
  return (
    pathData.value?.files.map((file) => {
      return {
        type: 'file',
        label: file,
        path: path.join(currentPath.value, file),
      } satisfies ComponentProps<'FileBrowser'>['files'][number]
    }) ?? []
  )
})

const renamingModalState = useRenamingModal()
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

      <div class="p-2 flex gap-2">
        <button
          class="btn btn-sm"
          v-on:click="
            () => {
              isDirectoryModalOpened = true
              nextTick(() => directoryModal?.focus())
            }
          "
        >
          <IconFolderPlus class="mr-2"></IconFolderPlus>
          Create directory
        </button>
      </div>

      <FileBrowser
        v-model:selected="selectedItems"
        selectable
        :isSelectionDisabled="currentlyPendingFullFileBrowserPending"
        :isNavigationDisabled="currentlyPendingFullFileBrowserPending"
        :dirs="dirs"
        :files="files"
        v-on:navigate="handleNavigate"
        v-on:rename="renamingModalState.handleRename"
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

    <ClientOnly>
      <Teleport to="#dialog-root">
        <RenamingModal
          v-if="renamingModalState.isRenamingModalOpened"
          v-model:renamingItemSrc="renamingModalState.renamingItemSrc"
          v-model:renamingItemNewName="renamingModalState.renamingItemNewName"
          :currentPath="currentPath"
          v-on:renamed="() => refresh()"
          v-on:close="() => (renamingModalState.isRenamingModalOpened = false)"
        ></RenamingModal>
      </Teleport>
    </ClientOnly>

    <ClientOnly>
      <Teleport to="#dialog-root">
        <div
          v-if="isDirectoryModalOpened"
          ref="directoryModal"
          class="modal modal-bottom sm:modal-middle"
          :class="{
            'visible opacity-100 pointer-events-auto': isDirectoryModalOpened,
          }"
          aria-modal="true"
          role="dialog"
          tabindex="-1"
          v-on:keyup.escape="
            () => {
              newDirName = ''
              isDirectoryModalOpened = false
            }
          "
        >
          <form
            class="modal-box"
            v-on:submit.prevent="
              () => {
                $client.fs.createDir
                  .mutate({
                    path: path.join(currentPath, newDirName),
                  })
                  .then(() => {
                    newDirName = ''
                    isDirectoryModalOpened = false
                    refresh()
                  })
              }
            "
          >
            <div class="relative">
              <button
                type="button"
                class="btn btn-circle absolute right-0 top-0"
                v-on:click="
                  () => {
                    newDirName = ''
                    isDirectoryModalOpened = false
                  }
                "
              >
                <IconCancel
                  aria-hidden="true"
                  class=""
                />

                <span class="sr-only">Close</span>
              </button>

              <h1 class="font-bold text-lg">Create a new directory</h1>

              <label
                class="label mt-5"
                :for="`new-directory-input-${uid}`"
                >Directory name</label
              >

              <input
                :id="`new-directory-input-${uid}`"
                v-model="newDirName"
                type="text"
                class="input input-bordered w-full max-w-xs"
                required
              />

              <div class="modal-action">
                <button
                  :disabled="!isNewDirNameValid"
                  class="btn btn-primary"
                  type="submit"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>
