<template>
  <div class="random-planet-container">
    <!-- 随机星球展示 -->
    <div
      v-if="randomPlanet"
      class="random-planet"
      :style="planetStyle(randomPlanet)"
      @click="selectPlanet(randomPlanet)"
      @mouseenter="showTooltip(randomPlanet, $event)"
      @mouseleave="hideTooltip"
    >
      <div class="planet-content">
        <div class="planet-title">{{ randomPlanet.contentTitle }}</div>
        <div class="planet-badge">✨ 随机星球</div>
      </div>

    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading">
      <div class="spinner"></div>
      正在探索随机星球...
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <i class="icon-error"></i>
      <p>星球探索失败: {{ error }}</p>
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
import { watch } from 'vue'


const router = useRouter();
const store = usePlanetStore();

const props = defineProps<{
  planet: KnowledgePlanetDto; // 父组件传递的星球列表
}>();

// 配置选项
const PLANET_CONFIG = {
  baseSize: 250,      // 基础大小（减小到250px）
  maxSize: 350,       // 最大尺寸限制（350px）
  sizeRange: 80,      // 尺寸变化范围（从80px减小）
  baseFontSize: 14,   // 基础字体大小
  maxFontSize: 18     // 最大字体大小
};

// 随机星球数据
const randomPlanet = computed(() => props.planet)
const loading = ref(false);
const error = ref<string | null>(null);
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
  // 计算访客比例（0-1之间）
  const visitorRatio = maxVisitors.value === minVisitors.value
    ? 0.5
    : (planet.visitCount - minVisitors.value) / (maxVisitors.value - minVisitors.value);

  // 计算尺寸，确保不超过最大值
  const calculatedSize = PLANET_CONFIG.baseSize + visitorRatio * PLANET_CONFIG.sizeRange;
  const size = Math.min(calculatedSize, PLANET_CONFIG.maxSize);

  // 计算颜色（基于访客比例）
  const hue = visitorRatio * 120;

  const lightColor = `hsl(${hue}, 90%, 65%)`;
  const darkColor = `hsl(${hue}, 70%, 35%)`;
  const glowColor = `hsla(${hue}, 100%, 50%, 0.5)`;

  // 计算字体大小，也要限制最大值
  const fontSize = Math.min(
    Math.max(PLANET_CONFIG.baseFontSize, PLANET_CONFIG.baseFontSize + 4 * visitorRatio),
    PLANET_CONFIG.maxFontSize
  );

  return {
    width: `${size}px`,
    height: `${size}px`,
    '--planet-light': lightColor,
    '--planet-dark': darkColor,
    '--planet-glow': glowColor,
    background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${darkColor})`,
    fontSize: `${fontSize}px`
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

// 选择星球处理
const selectPlanet = (planet: KnowledgePlanetDto) => {
  // 路由跳转到星球详情页
  router.push(`/planets/${planet.planetId}`);

  // 在store中设置当前星球
  store.currentPlanet = planet;

  // 调用访问星球的方法
  store.VisitPlanet(planet.planetId);
};

watch(() => props.planet, (newPlanet) => {
  // 当planet变化时的处理逻辑
  console.log('星球数据已更新', newPlanet)
}, { deep: true }) // 深度监听对象内部变化

</script>

<style scoped>
.random-planet-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
  position: relative;
}

.random-planet {
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

.random-planet::after {
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

.random-planet:hover {
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

.loading, .error {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  border: 1px solid #00eeff;
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.3);
  max-width: 500px;
  color: #b6f9ff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00eeff;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error .icon-error {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 15px;
}

.error p {
  margin-bottom: 15px;
}

.retry-btn {
  padding: 10px 20px;
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  border: none;
  border-radius: 30px;
  color: #0a0f2b;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 201, 255, 0.5);
}

.retry-btn:hover {
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
  .random-planet-container {
    min-height: 200px;
    padding: 1rem;
  }

  /* 移动端使用固定尺寸 */
  .random-planet {
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
}
</style>
