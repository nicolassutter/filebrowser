<script setup lang="ts">
// import IconDirectory from '~icons/carbon/folder'

const props = withDefaults(
  defineProps<{
    /**
     * Used to generate the browser
     */
    dirs: {
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
    class="file-browsermax-h-[400px] overflow-y-auto p-1"
  >
    <ul class="">
      <li
        v-for="dir in dirs"
        :key="`dir-${dir.label}`"
        class="flex-row flex-nowrap items-center relative rounded-md hover:bg-slate-200 after:h-px after:bg-gray-300 after:block after:top-full after:absolute after:left-0 after:right-0"
      >
        <input
          v-if="selectable"
          type="checkbox"
          :disabled="selectable && dir.path === '..'"
          class="checkbox checkbox-accent grow-0 shrink-0 p-2 mr-2"
          :checked="selectedPaths.includes(dir.path)"
          v-on:change="() => handleCheck(dir.path)"
        />

        <button
          :disabled="dir.disabled"
          :aria-label="`${dir.label}, navigate`"
          class="w-full text-left p-2"
          v-on:click="
            () => {
              uncheckAll()
              $emit('navigate', dir.path)
            }
          "
        >
          <!-- <IconDirectory /> -->
          {{ dir.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
