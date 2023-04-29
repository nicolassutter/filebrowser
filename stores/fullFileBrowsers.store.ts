import { defineStore } from 'pinia'

export const useFullFileBrowserStore = defineStore('fullFileBrowser', () => {
  const selectedItemsForAction = ref<string[]>([])
  const currentlyPendingAction = ref<'copy' | 'move' | 'hard_link'>()
  const currentlyPendingSrc = ref<string>()
  const currentlyPendingFullFileBrowserId = ref<string>()

  function initAction(
    action: NonNullable<typeof currentlyPendingAction.value>,
    options: {
      paths: string[]
      src: string
      fullFileBrowserId: string
    },
  ) {
    currentlyPendingAction.value = action
    selectedItemsForAction.value = options.paths
    currentlyPendingSrc.value = options.src
    currentlyPendingFullFileBrowserId.value = options.fullFileBrowserId
  }

  function startPendingAction() {}

  return {
    selectedItemsForAction,
    currentlyPendingAction,
    initAction,
    startPendingAction,
    currentlyPendingSrc,
    currentlyPendingFullFileBrowserId,
  }
})
