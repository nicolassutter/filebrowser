<script setup lang="ts">
import path from 'path-browserify'
import IconCancel from '~icons/mdi/close'

const props = defineProps<{
  currentPath: string
  renamingItemNewName: string
  renamingItemSrc: string
}>()

const emit = defineEmits([
  'close',
  'update:renamingItemNewName',
  'update:renamingItemSrc',
  'renamed',
])

const uid = uuid()

const isNewNameValid = computed(() => {
  const validNameRegex = /^[a-zA-Z0-9_-\s.]+$/
  return (
    props.renamingItemNewName !== '' &&
    props.renamingItemNewName !== itemOldName.value &&
    validNameRegex.test(props.renamingItemNewName)
  )
})

const itemOldName = computed(() => {
  const parseResult = path.parse(props.renamingItemSrc)
  return `${parseResult.name}${parseResult.ext}`
})

const newNameFullPath = computed(() => {
  return path.join(props.currentPath, props.renamingItemNewName)
})

function closeRenamingModal() {
  emit('update:renamingItemNewName', '')
  emit('update:renamingItemSrc', '')
  emit('close')
}
</script>

<template>
  <div
    ref="renamingModal"
    class="modal modal-bottom sm:modal-middle visible opacity-100 pointer-events-auto"
    aria-modal="true"
    role="dialog"
    tabindex="-1"
    v-on:keyup.escape="() => closeRenamingModal()"
  >
    <form
      class="modal-box"
      v-on:submit.prevent="
        () => {
          $client.fs.copyOrMove
            .mutate({
              paths: [{ src: renamingItemSrc, dest: newNameFullPath }],
              action: 'move',
            })
            .then(() => {
              $emit('renamed')
              closeRenamingModal()
            })
        }
      "
    >
      <div class="relative">
        <button
          type="button"
          class="btn btn-circle absolute right-0 top-0"
          v-on:click="() => closeRenamingModal()"
        >
          <IconCancel
            aria-hidden="true"
            class=""
          />

          <span class="sr-only">Close</span>
        </button>

        <h1 class="font-bold text-lg">Rename item '{{ itemOldName }}'</h1>

        <label
          class="label mt-5"
          :for="`new-name-${renamingItemSrc}-${uid}`"
          >New name (do not forget to include the extension)</label
        >

        <input
          :id="`new-name-${renamingItemSrc}-${uid}`"
          :value="renamingItemNewName"
          type="text"
          class="input input-bordered w-full max-w-xs"
          required
          v-on:input="
            (e) => $emit('update:renamingItemNewName', (e.target as HTMLInputElement).value)
          "
        />

        <div class="modal-action">
          <button
            :disabled="!isNewNameValid"
            class="btn btn-primary"
            type="submit"
          >
            Rename
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
