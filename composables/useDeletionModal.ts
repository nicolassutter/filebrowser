export const useDeletionModal = useReusableState(() => {
  const isDeletionModalOpened = ref(false)
  const deletingItemSrc = ref('')

  function closeDeletionModal() {
    deletingItemSrc.value = ''
    isDeletionModalOpened.value = false
  }

  return {
    isDeletionModalOpened,
    deletingItemSrc,
    closeDeletionModal,
  }
})
