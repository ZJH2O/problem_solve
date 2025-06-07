<!-- views/PlanetDetailView.vue -->
<template>
  <div class="detail-view">
    <PlanetDetail
      v-if="planet"
      :planet="planet"
    />
    <div v-else class="loading">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePlanetStore } from '@/stores/planetStore';
import PlanetDetail from '@/components/planet/PlanetDetail.vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const store = usePlanetStore();
const userStore = useUserStore();
// 获取星球数据
const planet = computed(() => {
  console.log(store.currentPlanet)
  return store.currentPlanet
});

onMounted(async() => {
  // 从路由参数获取星球ID
  const planetId = route.params.id as string;
  if (planetId) {
    await fetchPlanet(planetId);
  }
  console.log(store.currentPlanet)
});

async function fetchPlanet(planetId: string) {
  try {
    await store.VisitPlanet(planetId);
    await userStore.init()
    // console.log('当前用户:', userStore.userInfo)
  } catch (error) {
    throw new Error(`${error}`)
  }
}
</script>

<style scoped>
.detail-view {
  background: white;
  min-height: 100vh;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
