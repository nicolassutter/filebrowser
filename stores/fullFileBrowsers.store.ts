import { defineStore } from 'pinia'
import path from 'path-browserify'
import type { PathOption } from '~/types/utils'

export const useFullFileBrowserStore = defineStore('fullFileBrowser', () => {
  const selectedItemsForAction = ref<PathOption[]>([])
  const currentlyPendingAction = ref<'copy' | 'move' | 'hard_link' | 'delete'>()
  const currentlyPendingSrc = ref<string>()
  const currentlyPendingFullFileBrowserId = ref<string>()

  const { $client } = useNuxtApp()

  function initImmediateAction(
    action: NonNullable<typeof currentlyPendingAction.value>,
    options: {
      paths: PathOption[]
    },
  ) {
    currentlyPendingAction.value = action
    selectedItemsForAction.value = options.paths
  }

  function initAction(
    action: NonNullable<typeof currentlyPendingAction.value>,
    options: {
      paths: PathOption[]
      src: string
      fullFileBrowserId: string
    },
  ) {
    currentlyPendingAction.value = action
    selectedItemsForAction.value = options.paths
    currentlyPendingSrc.value = options.src
    currentlyPendingFullFileBrowserId.value = options.fullFileBrowserId
    emitter.emit('resetAllChecked', currentlyPendingFullFileBrowserId.value)
  }

  async function startPendingAction(args: {
    fullFileBrowserId: string
    dest: string
  }) {
    switch (currentlyPendingAction.value) {
      case 'copy':
        await $client.fs.copyOrMove.mutate({
          paths: selectedItemsForAction.value.map((selectedItem) => {
            const isFile = selectedItem.type === 'file'
            const parsedItem = path.parse(selectedItem.path)

            return {
              dest: path.join(
                args.dest,
                isFile ? `${parsedItem.name}${parsedItem.ext}` : '',
              ),
              src: selectedItem.path,
            }
          }),
          action: 'copy',
        })
        break

      case 'move':
        await $client.fs.copyOrMove.mutate({
          paths: selectedItemsForAction.value.map((selectedItem) => {
            const isFile = selectedItem.type === 'file'
            const parsedItem = path.parse(selectedItem.path)

            return {
              dest: path.join(
                args.dest,
                isFile ? `${parsedItem.name}${parsedItem.ext}` : '',
              ),
              src: selectedItem.path,
            }
          }),
          action: 'move',
        })
        break

      case 'hard_link':
        await $client.fs.link.mutate({
          paths: selectedItemsForAction.value
            .filter((selectedItem) => selectedItem.type === 'file')
            .map((selectedItem) => {
              const parsedItem = path.parse(selectedItem.path)

              return {
                dest: path.join(
                  args.dest,
                  `${parsedItem.name}${parsedItem.ext}`,
                ),
                src: selectedItem.path,
              }
            }),
        })
        break

      case 'delete':
        await $client.fs.delete.mutate({
          paths: selectedItemsForAction.value.map((selectedItem) => {
            const isFile = selectedItem.type === 'file'
            const parsedItem = path.parse(selectedItem.path)

            return isFile
              ? path.join(args.dest, `${parsedItem.name}${parsedItem.ext}`)
              : selectedItem.path
          }),
        })
        break
    }

    resetPendingAction()
  }

  function resetPendingAction() {
    currentlyPendingAction.value = undefined
    selectedItemsForAction.value = []
    currentlyPendingSrc.value = undefined
    currentlyPendingFullFileBrowserId.value = undefined
  }

  return {
    selectedItemsForAction,
    currentlyPendingAction,
    initAction,
    initImmediateAction,
    startPendingAction,
    currentlyPendingSrc,
    currentlyPendingFullFileBrowserId,
    resetPendingAction,
  }
})
