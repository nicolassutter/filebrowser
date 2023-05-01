<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import IconDirectory from '~icons/mdi/folder'
import IconFile from '~icons/mdi/document'
import IconDotsVertical from '~icons/mdi/dots-vertical'
import IconRename from '~icons/mdi/rename'
import type { PathOption } from '~/types/utils'

const props = withDefaults(
  defineProps<{
    /**
     * Used to generate the browser
     */
    dirs: {
      type: 'directory'
      label: string
      path: string
      disabled?: boolean
    }[]
    /**
     * If `true`, checkboxes will be generated
     */
    selectable?: boolean
    /**
     * An array containing the checked items
     * Works with v-model
     */
    selected?: PathOption[]
    files: {
      type: 'file'
      label: string
      path: string
    }[]
    isSelectionDisabled?: boolean
    isNavigationDisabled?: boolean
  }>(),
  {
    selectable: false,
    selected: undefined,
    isSelectionDisabled: false,
    isNavigationDisabled: false,
  },
)

const emit = defineEmits(['navigate', 'update:selected', 'rename'])

const uid = uuid()

defineComponent({
  name: 'FileBrowser',
})

// The checked paths, used internally
const internalSelectedPaths = ref<PathOption[]>([])

function isItemChecked(path: string) {
  return !!selectedPaths.value.find(
    (selectedPath) => selectedPath.path === path,
  )
}

// If a `selected` prop is present, use it, otherwise use `internalSelectedPaths`
const selectedPaths = computed({
  get() {
    return props.selected ?? internalSelectedPaths.value
  },
  set(newValue: PathOption[]) {
    emit('update:selected', newValue)
    internalSelectedPaths.value = newValue
  },
})

function handleCheck(newItem: PathOption) {
  if (isItemChecked(newItem.path)) {
    // Remove
    selectedPaths.value = selectedPaths.value.filter(
      (item) => item.path !== newItem.path,
    )
  } else {
    // Add
    selectedPaths.value = [...selectedPaths.value, newItem]
  }
}

function uncheckAll() {
  selectedPaths.value = []
}

// Component wrapper
const container = ref<HTMLElement>()

// Computed value return the `dirs` prop
const dirs = computed(() => props.dirs)

/**
 * Scroll to top after every refresh
 */
watch(dirs, () => {
  if (container.value) {
    container.value.scrollTo({ top: 0 })
  }
})

const items = computed(() => [...props.dirs, ...props.files])

const openedMenus = ref<Record<string, boolean>>({})

function toggleMenu(path: string, value?: boolean) {
  if (value !== undefined) {
    openedMenus.value[path] = value
    return
  }

  openedMenus.value[path] = !openedMenus.value[path]
}
</script>

<template>
  <div
    ref="container"
    class="file-browser h-full overflow-y-auto flex flex-col items-start justify-start"
  >
    <ul class="menu p-2 flex-nowrap w-full">
      <li
        v-for="dirOrFile in items"
        :key="`dir-${dirOrFile.label}`"
        class="flex-row flex-nowrap items-center relative rounded-md"
        :class="{
          disabled:
            ('disabled' in dirOrFile && dirOrFile.disabled) ||
            isSelectionDisabled,
        }"
      >
        <span
          v-if="selectable"
          class="p-0 mr-2"
        >
          <label
            class="sr-only"
            :for="`checkbox-${uid}-${dirOrFile.path}`"
          >
            Select {{ dirOrFile.path }}
          </label>

          <input
            :id="`checkbox-${uid}-${dirOrFile.path}`"
            type="checkbox"
            :disabled="
              (selectable && dirOrFile.label === '..') || isSelectionDisabled
            "
            autocomplete="off"
            class="checkbox checkbox-info grow-0 shrink-0"
            :checked="isItemChecked(dirOrFile.path)"
            v-on:change="() => handleCheck(dirOrFile)"
          />
        </span>

        <component
          :is="dirOrFile.type === 'directory' ? 'button' : 'span'"
          class="w-full flex items-center text-left p-3"
          :class="{
            'active:bg-transparent text-current':
              dirOrFile.type !== 'directory',
          }"
          v-bind="
            dirOrFile.type === 'directory'
              ? {
                  disabled: Boolean(
                    ('disabled' in dirOrFile && dirOrFile.disabled) ||
                      isNavigationDisabled,
                  ),
                  title: `${dirOrFile.label}, navigate`,
                }
              : {}
          "
          v-on="
            dirOrFile.type === 'directory'
              ? {
                  click: () => {
                    uncheckAll()
                    $emit('navigate', dirOrFile.path)
                  },
                }
              : {}
          "
        >
          <IconDirectory
            v-if="dirOrFile.type === 'directory'"
            role="img"
            aria-label="Directory"
            class="text-info"
          />

          <IconFile
            v-if="dirOrFile.type === 'file'"
            role="img"
            aria-label="File"
          />

          {{ dirOrFile.label }}
        </component>

        <!-- Only if item is not disabled -->
        <OnClickOutside
          v-if="!('disabled' in dirOrFile && dirOrFile.disabled)"
          class="bg-transparent p-0 ml-2 relative"
          v-on:trigger="() => toggleMenu(dirOrFile.path, false)"
        >
          <button
            :aria-controls="`filebrowser-item-${dirOrFile.path}-options-menu-${uid}`"
            class="btn btn-circle btn-sm"
            :title="`Open options for item '${dirOrFile.path}'`"
            v-on:click="() => toggleMenu(dirOrFile.path)"
          >
            <IconDotsVertical aria-hidden="true"></IconDotsVertical>
          </button>

          <ul
            v-if="openedMenus[dirOrFile.path] === true"
            :id="`filebrowser-item-${dirOrFile.path}-options-menu-${uid}`"
            class="menu menu-compact bg-base-200 w-56 p-2 rounded-box absolute bottom-full -translate-y-2 right-0 shadow-lg"
            role="menu"
          >
            <li>
              <button
                v-on:click="
                  () => {
                    $emit('rename', dirOrFile)
                  }
                "
              >
                <IconRename></IconRename>
                Rename
              </button>
            </li>
          </ul>
        </OnClickOutside>
      </li>
    </ul>
  </div>
</template>
