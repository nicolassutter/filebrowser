<script lang="ts" setup>
import FullFileBrowser from '~/components/parts/FullFileBrowser.vue'

defineComponent({
  name: 'IndexPage',
})

const cols = ref([{ id: 1 }, { id: 2 }])

const { status, signOut } = useAuth()
</script>

<template>
  <main
    tabindex="-1"
    role="main"
    class="main"
  >
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
        class="last:border-r-0 border-r border-slate-500 border-solid"
      ></FullFileBrowser>
    </div>

    <button
      v-if="status === 'authenticated' || status === 'loading'"
      :disabled="status === 'loading'"
      v-on:click="() => signOut()"
    >
      Sign-out
    </button>
  </main>
</template>
