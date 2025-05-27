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
import PlanetDetail from '@/components/PlanetDetail.vue';

const route = useRoute();
const store = usePlanetStore();

// 获取星球数据
const planet = computed(() => {
  return store.getPlanetById(Number(route.params.id));
});

// 访问量统计
onMounted(() => {
  if (planet.value) {
    store.incrementVisitors(planet.value.id);
  }
});
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
