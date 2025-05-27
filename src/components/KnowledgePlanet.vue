<template>
  <div class="planets-container">
    <div
      v-for="planet in planets"
      :key="planet.id"
      class="planet"
      :style="planetStyle(planet)"
      @click="navigateToPlanet(planet.id)"
      @mouseenter="showTooltip(planet, $event)"
      @mouseleave="hideTooltip"
    >
      {{ planet.name }}
    </div>

    <div
      v-if="activeTooltip"
      class="tooltip"
      :style="tooltipStyle"
    >
      <h3>{{ activeTooltip.name }}</h3>
      <p>{{ activeTooltip.description }}</p>
      <p>访问人数: {{ activeTooltip.visitors }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = usePlanetStore();

interface TooltipData {
  name: string;
  description: string;
  visitors: number;
  x: number;
  y: number;
}

interface Planet {
  id: number;
  name: string;
  description: string;
  visitors: number;
}
const activeTooltip = ref<TooltipData | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const planets = computed(() => store.planets);
const maxVisitors = computed(() => store.maxVisitors);
const minVisitors = computed(() => store.minVisitors);

const planetStyle = (planet: Planet) => {
  const sizeScale = (planet.visitors - minVisitors.value) / (maxVisitors.value - minVisitors.value);
  const colorScale = sizeScale * 120; // HSL色相值变化范围

  return {
    width: `${50 + sizeScale * 150}px`,
    height: `${50 + sizeScale * 150}px`,
    backgroundColor: `hsl(${colorScale}, 70%, 50%)`,
    cursor: 'pointer'
  };
};

const showTooltip = (planet: Planet, event: MouseEvent) => {
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

const navigateToPlanet = (id: number) => {
  router.push(`/planets/${id}`);
};
</script>

<style scoped>
.planets-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  position: relative;
}

.planet {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.planet:hover {
  transform: scale(1.1);
}

.tooltip {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  pointer-events: none;
  z-index: 100;
  max-width: 250px;
}

.tooltip h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.tooltip p {
  margin: 0.2rem 0;
  color: #666;
}
</style>
