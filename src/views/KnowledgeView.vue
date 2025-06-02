<template>
  <div>
    <KnowledgePlanet />
    <PlanetDataset />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import KnowledgePlanet from '@/components/KnowledgePlanet.vue'
import PlanetDataset from '@/components/PlanetDataset.vue'
const router = useRouter()
const userStore = useUserStore()


</script>

<style scoped lang="scss">



</style>
