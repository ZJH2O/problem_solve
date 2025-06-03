<template>
  <div class="home-planet-container">
    <!-- 最喜爱星球展示 -->
    <div
      v-if="favoritePlanet"
      class="favorite-planet"
      :style="planetStyle(favoritePlanet)"
      @click="navigateToPlanet(favoritePlanet)"
      @mouseenter="showTooltip(favoritePlanet, $event)"
      @mouseleave="hideTooltip"
    >
      <div class="planet-content">
        <div class="planet-title">{{ favoritePlanet.contentTitle }}</div>
        <div class="planet-badge">⭐ 最爱星球</div>
      </div>

      <div class="futurism-halo" :style="haloStyle"></div>
    </div>

    <!-- 无最爱星球提示 -->
    <div v-else class="no-favorite">
      <h3>您还未设置最爱星球</h3>
      <p>探索知识宇宙，找到属于您的专属星球</p>
      <button @click="navigateToDiscover">探索星球</button>
    </div>

    <!-- 星球信息提示 -->
    <div
      v-if="activeTooltip"
      class="tooltip"
      :style="tooltipStyle"
    >
      <h3>{{ activeTooltip.contentTitle }}</h3>
      <p>{{ activeTooltip.description }}</p>
      <p>访问人数: {{ activeTooltip.visitCount }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import { useRouter } from 'vue-router';
import type { KnowledgePlanetDto } from '@/types/planet';

const router = useRouter();
const store = usePlanetStore();

// 最喜爱星球数据
const favoritePlanet = ref<KnowledgePlanetDto | null>(null);
const activeTooltip = ref<{
  contentTitle: string;
  description: string;
  visitCount: number;
  x: number;
  y: number;
} | null>(null);

// 计算访客数量范围
const maxVisitors = computed(() => store.maxVisitors);
const minVisitors = computed(() => store.minVisitors);

// 星球样式计算
const planetStyle = (planet: KnowledgePlanetDto) => {
  const baseSize = 400; // 基础大小
  const visitorRatio = maxVisitors.value === minVisitors.value
    ? 0.5
    : (planet.visitCount - minVisitors.value) / (maxVisitors.value - minVisitors.value);

  const size = baseSize + visitorRatio * 100;
  const hue = visitorRatio * 120;
  planet.hue = hue;
  favoritePlanet.value = planet;

  const lightColor = `hsl(${hue}, 90%, 65%)`;
  const darkColor = `hsl(${hue}, 70%, 35%)`;
  const glowColor = `hsla(${hue}, 100%, 50%, 0.5)`;

  return {
    width: `${size}px`,
    height: `${size}px`,
    '--planet-light': lightColor,
    '--planet-dark': darkColor,
    '--planet-glow': glowColor,
    background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${darkColor})`,
    fontSize: `${Math.max(16, 18 * visitorRatio)}px`
  };
};

// 显示星球提示信息
const showTooltip = (planet: KnowledgePlanetDto, event: MouseEvent) => {
  activeTooltip.value = {
    contentTitle: planet.contentTitle,
    description: planet.description || '暂无描述',
    visitCount: planet.visitCount || 0,
    x: event.clientX + 15,
    y: event.clientY + 15
  };
};

// 隐藏提示信息
const hideTooltip = () => {
  activeTooltip.value = null;
};

// 提示框位置计算
const tooltipStyle = computed(() => ({
  left: `${activeTooltip.value?.x}px`,
  top: `${activeTooltip.value?.y}px`
}));

// 导航到星球详情页
const navigateToPlanet = (planet: KnowledgePlanetDto) => {
  store.currentPlanet = planet;
  router.push(`/planets/${planet.planetId}`);
};

// 导航到探索页面
const navigateToDiscover = () => {
  router.push('/kownledge');
};

// 加载最喜爱星球
const loadFavoritePlanet = async () => {
  try {
    const planet = await store.loadingFavorPlanet();
    if (planet) {
      favoritePlanet.value = planet;
    }
  } catch (error) {
    console.error('加载最爱星球失败:', error);
  }
};

onMounted(async () => {
  await store.init();
  await loadFavoritePlanet();
});


// 未来主义光环样式
// 修改后的光环样式计算
const haloStyle = computed(() => {
  if (!favoritePlanet.value) return {};

  const pulse = (Math.sin(Date.now() / 1000) * 0.5 + 0.5) * 20;
  const hue = favoritePlanet.value.hue || 180; // 从星球数据获取色相值

  // 基于星球主色生成渐变光环
  const primaryGlow = `hsla(${hue}, 100%, 70%, 0.7)`;
  const secondaryGlow = `hsla(${hue + 30}, 100%, 50%, 0.5)`;

  return {
    'box-shadow': `0 0 ${15 + pulse}px ${primaryGlow},
                   0 0 ${30 + pulse}px ${secondaryGlow}`
  };
});

</script>

<style scoped>
.home-planet-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
  position: relative;
}

.favorite-planet {
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
  box-sizing: border-box;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  position: relative;
  overflow: visible;
  box-shadow:
    0 0 30px var(--planet-glow),
    0 0 60px rgba(0, 195, 255, 0.5),
    inset 0 0 30px rgba(255, 255, 255, 0.3);
  cursor: pointer;
  animation: float 8s infinite ease-in-out;
  z-index: 1;
}

.planet-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  text-align: center;
}

.planet-title {
  font-size: 1.5em;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

.planet-badge {
  background: rgba(255, 215, 0, 0.3);
  border: 1px solid gold;
  border-radius: 20px;
  padding: 5px 15px;
  display: inline-block;
  font-size: 0.9em;
  backdrop-filter: blur(5px);
}

.favorite-planet::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 30%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(70deg);
  box-shadow: 0 0 25px var(--planet-glow);
  z-index: -1;
  opacity: 0.7;
}

.favorite-planet:hover {
  transform: scale(1.05);
  box-shadow:
    0 0 40px var(--planet-glow),
    0 0 80px rgba(0, 195, 255, 0.7),
    inset 0 0 40px rgba(255, 255, 255, 0.4);
  animation: none;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
}

.no-favorite {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  border: 1px solid #00eeff;
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.3);
  max-width: 500px;
  color: #b6f9ff;
}

.no-favorite h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #00eeff;
}

.no-favorite p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.no-favorite button {
  padding: 10px 25px;
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  border: none;
  border-radius: 30px;
  color: #0a0f2b;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 201, 255, 0.5);
}

.no-favorite button:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 25px rgba(0, 201, 255, 0.8);
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid #00eeff;
  padding: 1.2rem;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.7);
  pointer-events: none;
  z-index: 100;
  max-width: 300px;
  color: #b6f9ff;
  backdrop-filter: blur(8px);
}

.tooltip h3 {
  margin: 0 0 0.8rem 0;
  color: #00eeff;
  border-bottom: 1px solid rgba(0, 238, 255, 0.4);
  padding-bottom: 0.8rem;
  font-size: 1.3rem;
}

.tooltip p {
  margin: 0.8rem 0;
  line-height: 1.5;
  font-size: 1.1rem;
}

.tooltip p:last-child {
  margin-top: 1.2rem;
  font-weight: bold;
  color: #ff6b6b;
  font-size: 1.2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-planet-container {
    min-height: 300px;
    padding: 1rem;
  }

  .favorite-planet {
    width: 180px !important;
    height: 180px !important;
  }

  .planet-title {
    font-size: 1.2em;
  }

  .planet-badge {
    font-size: 0.8em;
    padding: 4px 12px;
  }

  .no-favorite {
    padding: 1.5rem;
  }

  .no-favorite h3 {
    font-size: 1.5rem;
  }

  .no-favorite p {
    font-size: 1rem;
  }
}

/* 未来主义光环 */
.futurism-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110%;
  height: 110%;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
  animation: pulse 3s infinite ease-in-out;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
}


</style>
