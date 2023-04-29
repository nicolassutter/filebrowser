<script setup lang="ts">
import IconDirectory from '~icons/mdi/folder'
import IconFile from '~icons/mdi/document'

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
     * An array containing the paths of checked directories
     * Works with v-model
     */
    selected?: string[]
    files: {
      type: 'file'
      label: string
      path: string
    }[]
  }>(),
  {
    selectable: false,
    selected: undefined,
  },
)
const emit = defineEmits(['navigate', 'update:selected'])

defineComponent({
  name: 'FileBrowser',
})

// The checked paths, used internally
const internalSelectedPaths = ref<string[]>([])

// If a `selected` prop is present, use it, otherwise use `internalSelectedPaths`
const selectedPaths = computed({
  get() {
    return props.selected ?? internalSelectedPaths.value
  },
  set(newValue: string[]) {
    emit('update:selected', newValue)
    internalSelectedPaths.value = newValue
  },
})

function handleCheck(path: string) {
  if (selectedPaths.value.includes(path)) {
    // Remove
    selectedPaths.value = selectedPaths.value.filter((item) => item !== path)
  } else {
    // Add
    selectedPaths.value.push(path)
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
</script>

<template>
  <div
    ref="container"
    class="file-browser max-h-screen overflow-y-auto"
  >
    <ul class="menu p-2">
      <li
        v-for="dirOrFile in [...dirs, ...files]"
        :key="`dir-${dirOrFile.label}`"
        class="flex-row flex-nowrap items-center relative rounded-md"
        :class="{
          disabled: 'disabled' in dirOrFile && dirOrFile.disabled,
        }"
      >
        <span
          v-if="selectable"
          class="p-0"
        >
          <input
            type="checkbox"
            :disabled="selectable && dirOrFile.label === '..'"
            class="checkbox checkbox-info grow-0 shrink-0"
            :checked="selectedPaths.includes(dirOrFile.path)"
            v-on:change="() => handleCheck(dirOrFile.path)"
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
                    'disabled' in dirOrFile && dirOrFile.disabled,
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
      </li>
    </ul>
  </div>
</template>
