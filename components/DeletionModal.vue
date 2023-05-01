<script setup lang="ts">
import IconCancel from '~icons/mdi/close'
import IconDelete from '~icons/mdi/delete'

const emit = defineEmits(['close', 'delete'])

function closeDeletionModal() {
  emit('close')
}
</script>

<template>
  <div
    class="modal modal-bottom sm:modal-middle visible opacity-100 pointer-events-auto"
    aria-modal="true"
    role="dialog"
    tabindex="-1"
    v-on:keyup.escape="() => $emit('close')"
  >
    <div class="modal-box">
      <div class="relative">
        <button
          type="button"
          class="btn btn-circle absolute right-0 top-0"
          v-on:click="() => $emit('close')"
        >
          <IconCancel
            aria-hidden="true"
            class=""
          />

          <span class="sr-only">Close</span>
        </button>

        <h1 class="font-bold text-lg">Deleting item(s)</h1>

        <p class="mt-5">Are you sure ? This cannot be undone.</p>

        <div class="modal-action">
          <button
            class="btn btn-primary btn-error"
            type="submit"
            v-on:click="
              () => {
                closeDeletionModal()
                $emit('delete')
              }
            "
          >
            <IconDelete class="mr-2 h-4 w-4"></IconDelete>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
