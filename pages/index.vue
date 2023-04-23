<script lang="ts" setup>
import FullFileBrowser from '~/components/parts/FullFileBrowser.vue'

defineComponent({
  name: 'IndexPage',
})

const cols = ref([{ id: 1 }, { id: 2 }])
</script>

<template>
  <div
    class="grid"
    :style="{
      'grid-template-columns': `repeat(${cols.length}, 1fr)`,
    }"
  >
    <FullFileBrowser
      v-for="col in cols"
      :key="`col-${col.id}`"
      :browserId="`browser-${col.id}`"
    ></FullFileBrowser>
  </div>
</template>
