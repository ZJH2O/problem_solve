<template>
  <div class="planets-container">
    <div
      v-for="planet in planets"
      :key="planet.planetId"
      class="planet"
      :style="planetStyle(planet)"
      @click="navigateToPlanet(planet.planetId??'-1')"
      @mouseenter="showTooltip(planet, $event)"
      @mouseleave="hideTooltip"
    >
      {{ planet.contentTitle }}
    </div>

    <div
      v-if="activeTooltip"
      class="tooltip"
      :style="tooltipStyle"
    >
      <h3>{{ activeTooltip.contentTitle }}</h3>
      <p>{{ activeTooltip.description }}</p>
      <p>访问人数: {{ activeTooltip.visitors }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import { useRouter } from 'vue-router';
import type{ KnowledgePlanetDto } from '@/types/planet';
const router = useRouter();
const store = usePlanetStore();

interface TooltipData {
  contentTitle: string;
  description: string;
  visitors: number;
  x: number;
  y: number;
}

const activeTooltip = ref<TooltipData | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const planets = computed(() => store.planets);
const maxVisitors = computed(() => store.maxVisitors);
const minVisitors = computed(() => store.minVisitors);

// 修改后的星球样式计算
const planetStyle = (planet: KnowledgePlanetDto) => {
  // 1. 设置基础大小（假设大小）
  const baseSize = 100; // 基础大小为100px

  // 2. 计算访问人数比例（0-1之间）
  const visitorRatio = maxVisitors.value === minVisitors.value
    ? 0.5 // 避免除以0的情况
    : (planet.visitors - minVisitors.value) / (maxVisitors.value - minVisitors.value);

  // 3. 在基础大小上根据访问人数增加尺寸（最大增加100px）
  const size = baseSize + visitorRatio * 100;

  // 4. 颜色计算（根据访问人数比例变化）
  const hue = visitorRatio * 120; // HSL色相值变化范围（0-120）

  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: `hsl(${hue}, 70%, 50%)`,
    cursor: 'pointer',
    fontSize: `${Math.max(12, 14 * visitorRatio)}px` // 文字大小也根据访问人数变化
  };
};

// 其余方法保持不变...
const showTooltip = (planet: KnowledgePlanetDto, event: MouseEvent) => {
  activeTooltip.value = {
    ...planet,
    x: event.clientX + 10,
    y: event.clientY + 10
  };
};

const hideTooltip = () => {
  activeTooltip.value = null;
};

const tooltipStyle = computed(() => ({
  left: `${activeTooltip.value?.x}px`,
  top: `${activeTooltip.value?.y}px`
}));

const navigateToPlanet = (id: string) => {
  router.push(`/planets/${id}`);
};

onMounted(async () => {
      await store.init();
});
</script>

<style scoped>
.planets-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  position: relative;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.planet {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.planet:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255,255,255,0.5);
  z-index: 10;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid #00eeff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 195, 255, 0.5);
  pointer-events: none;
  z-index: 100;
  max-width: 300px;
  color: #b6f9ff;
  backdrop-filter: blur(5px);
}

.tooltip h3 {
  margin: 0 0 0.5rem 0;
  color: #00eeff;
  border-bottom: 1px solid rgba(0, 238, 255, 0.3);
  padding-bottom: 0.5rem;
}

.tooltip p {
  margin: 0.5rem 0;
  line-height: 1.4;
}

.tooltip p:last-child {
  margin-top: 1rem;
  font-weight: bold;
  color: #ff6b6b;
}
</style>
