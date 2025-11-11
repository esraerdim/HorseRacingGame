<template>
  <GameView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import GameView from './views/GameView.vue'
import type { RootState } from './store'

const store = useStore<RootState>()

onMounted(() => {
  if (!store.state.horses.pool.length) {
    store.dispatch('horses/generatePool')
  }
})
</script>
