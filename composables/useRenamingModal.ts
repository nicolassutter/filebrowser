import path from 'path-browserify'
import type { PathOption } from '~/types/utils'

export const useRenamingModal = useReusableState(() => {
  const isRenamingModalOpened = ref(false)
  const renamingItemNewName = ref('')
  const renamingItemSrc = ref('')

  function handleRename(e: Record<string, unknown> & PathOption) {
    const parseResult = path.parse(e.path)

    // Precomplete the field with the old name
    renamingItemNewName.value = `${parseResult.name}${parseResult.ext}`
    renamingItemSrc.value = e.path
    isRenamingModalOpened.value = true
  }

  return {
    isRenamingModalOpened,
    renamingItemNewName,
    renamingItemSrc,
    handleRename,
  }
})
