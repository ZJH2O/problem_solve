<template>
  <div>
    <GalaxyControl />
    <GalaxyPlanets />
  </div>
</template>

<script setup lang="ts">
import GalaxyControl from '@/components/galaxy/GalaxyControl.vue';
import GalaxyPlanets from '@/components/galaxy/GalaxyPlanets.vue';
import { useGalaxyStore } from '@/stores/galaxy';
import { usePlanetStore } from '@/stores/planetStore';
import { useUserStore } from '@/stores/user';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute()
const userStore = useUserStore()
const planetStore = usePlanetStore()
const galaxyStore = useGalaxyStore()
onMounted(async () => {
  try {
    const galaxyId = route.params.galaxyId as string
    await userStore.init()
    await planetStore.init()
    await galaxyStore.initPlanets(galaxyId)
    await galaxyStore.initGalaxyInfo(galaxyId)
    console.log('当前用户:', userStore.userInfo)
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})

</script>

<style scoped lang="scss">



</style>
