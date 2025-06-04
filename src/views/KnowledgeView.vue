<template>
  <div>
    <KnowledgePlanet />
    <PlanetDataset />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import KnowledgePlanet from '@/components/planet/KnowledgePlanet.vue'
import PlanetDataset from '@/components/planet/PlanetDataset.vue'
const router = useRouter()
const userStore = useUserStore()


</script>

<style scoped lang="scss">



</style>
