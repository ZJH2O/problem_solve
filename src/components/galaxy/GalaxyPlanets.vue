<template>
  <div class="knowledge-planet-view">
  <!-- 新增搜索栏 -->
   <div class="search-container">
     <div class="search-bar">
       <input
         type="text"
         v-model="searchQuery"
         placeholder="搜索星球..."
         @input="handleSearch"
         @keyup.enter="handleSearch"
       />
       <button class="search-button" @click="handleSearch">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
           <circle cx="11" cy="11" r="8" />
           <path d="M21 21l-4.35-4.35" />
         </svg>
       </button>
     </div>
   </div>
   <div class="planets-container" ref="planetsContainer">
    <svg ref="linesSvg" class="star-lines"></svg>
     <div
       v-for="planet in filteredPlanets"
       :key="planet.planetId"
       class="planet"
       :style="planetStyle(planet)"
       @click="navigateToPlanet(planet)"
       @mouseenter="showTooltip(planet, $event)"
       @mouseleave="hideTooltip"
     >
       {{ planet.contentTitle }}
     </div>

     <!-- 无结果提示 -->
     <div v-if="filteredPlanets.length === 0" class="no-results">
       <p>未找到匹配的星球</p>
       <button @click="resetSearch">显示全部星球</button>
     </div>

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
 </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import { useRouter } from 'vue-router';
import type{ KnowledgePlanetDto } from '@/types/planet';
import { useGalaxyStore } from '@/stores/galaxy';
const router = useRouter();
const store = usePlanetStore();
const galaxyStore = useGalaxyStore()
// 搜索相关状态
const searchQuery = ref('');
const filteredPlanets = computed(() => {
 if (!searchQuery.value.trim()) {
   return planets.value;
 }

 const query = searchQuery.value.toLowerCase();
 return planets.value.filter(planet =>
   planet.contentTitle.toLowerCase().includes(query) ||
   (planet.description && planet.description.toLowerCase().includes(query))
 );
});


interface TooltipData {
 contentTitle: string;
 description: string;
 visitCount: number;
 x: number;
 y: number;
}

// 搜索处理函数
const handleSearch = () => {
 // if (!searchQuery.value.trim()) {
 //   filteredPlanets.value = [...planets.value];
 //   return;
 // }

 // const query = searchQuery.value.toLowerCase();
 // filteredPlanets.value = planets.value.filter(planet =>
 //   planet.contentTitle.toLowerCase().includes(query) ||
 //   (planet.description && planet.description.toLowerCase().includes(query))
 // );
};

// 重置搜索
const resetSearch = () => {
 searchQuery.value = '';
 // filteredPlanets.value = [...planets.value];
};


const activeTooltip = ref<TooltipData | null>(null);
// const tooltipPosition = ref({ x: 0, y: 0 });

const planets = computed(() => galaxyStore.galaxyPlanets);
const maxVisitors = computed(() => store.maxVisitors);
const minVisitors = computed(() => store.minVisitors);

// 修改后的星球样式计算
const planetStyle = (planet: KnowledgePlanetDto) => {
 // 1. 设置基础大小（假设大小）
 const baseSize = 100; // 基础大小为100px

 // 2. 计算访问人数比例（0-1之间）
 const visitorRatio = maxVisitors.value === minVisitors.value
   ? 0.5 // 避免除以0的情况
   : (planet.visitCount - minVisitors.value) / (maxVisitors.value - minVisitors.value);

 // 3. 在基础大小上根据访问人数增加尺寸（最大增加100px）
 const size = baseSize + visitorRatio * 100;
 const position = planetPositions.value[planet.planetId] || { x: 0, y: 0 };
 // 4. 颜色计算（根据访问人数比例变化）
 const hue = visitorRatio * 120; // HSL色相值变化范围（0-120）

 const lightColor = `hsl(${hue}, 90%, 65%)`; // 亮部颜色
 const darkColor = `hsl(${hue}, 70%, 35%)`;  // 暗部颜色
 const glowColor = `hsla(${hue}, 100%, 50%, 0.5)`; // 光晕颜色
 return {
   width: `${size}px`,
   height: `${size}px`,
   '--planet-light': lightColor,      // 设置CSS变量
   '--planet-dark': darkColor,        // 设置CSS变量
   '--planet-glow': glowColor,        // 设置CSS变量
   position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)', // 确保星球中心在指定位置
   background: `radial-gradient(circle at 30% 30%, ${lightColor}, ${darkColor})`, // 动态渐变
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

const navigateToPlanet = (planet:KnowledgePlanetDto) => {
 store.currentPlanet = planet
 router.push(`/planets/${planet.planetId}`);
};

onMounted(async () => {
 await store.init();
 // filteredPlanets.value = [...planets.value];
 // 确保容器引用已设置
 planetsContainer.value = document.querySelector('.planets-container');
  linesSvg.value = document.querySelector('.star-lines');

  // 初始更新位置和绘制星链
  updatePlanetPositions();
  drawStarlinks();

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    // 重置位置
    planetPositions.value = {};
    updatePlanetPositions();

    // 使用nextTick确保DOM已更新
    nextTick(() => {
      drawStarlinks();
    });
  });
});

// 星球元素引用
const planetsContainer = ref<HTMLElement | null>(null);
const linesSvg = ref<SVGSVGElement | null>(null);
const planetElements = ref<HTMLElement[]>([]);

// 设置星球引用
const setPlanetRef = (el: HTMLElement) => {
  if (el) {
    planetElements.value.push(el);
  }
};
// 星球位置数据
const planetPositions = ref<Record<string, { x: number; y: number }>>({});

// 生成随机位置
const generateRandomPosition = () => {
  if (!planetsContainer.value) return { x: 0, y: 0 };

  const containerRect = planetsContainer.value.getBoundingClientRect();
  const margin = 80; // 距离边缘的最小边距

  return {
    x: margin + Math.random() * (containerRect.width - 3 * margin),
    y: margin + Math.random() * (containerRect.height - 3 * margin)
  };
};

// 更新星球位置
const updatePlanetPositions = () => {
  filteredPlanets.value.forEach(planet => {
    if (!planetPositions.value[planet.planetId]) {
      planetPositions.value[planet.planetId] = generateRandomPosition();
    }
  });
};

// 绘制星链
const drawStarlinks = () => {
  if (!linesSvg.value || !planetsContainer.value) return;

  // 清空之前的连线
  linesSvg.value.innerHTML = '';

  const containerRect = planetsContainer.value.getBoundingClientRect();

  // 创建SVG元素
  const svgNS = 'http://www.w3.org/2000/svg';
  const linksGroup = document.createElementNS(svgNS, 'g');

  // 连接每个星球到最近的3个星球
  filteredPlanets.value.forEach((planetA, indexA) => {
    const positionA = planetPositions.value[planetA.planetId];
    if (!positionA) return;

    // 找到最近的3个星球
    const distances = filteredPlanets.value
      .map((planetB, indexB) => {
        if (indexA === indexB) return null;
        const positionB = planetPositions.value[planetB.planetId];
        if (!positionB) return null;

        const dx = positionB.x - positionA.x;
        const dy = positionB.y - positionA.y;
        return {
          planet: planetB,
          distance: Math.sqrt(dx * dx + dy * dy),
          position: positionB
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 2); // 只连接最近的3个

    // 绘制连线
    distances.forEach(neighbor => {
      if (!neighbor) return;

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', positionA.x.toString());
      line.setAttribute('y1', positionA.y.toString());
      line.setAttribute('x2', neighbor.position.x.toString());
      line.setAttribute('y2', neighbor.position.y.toString());
      line.setAttribute('stroke', 'rgba(0, 238, 255, 0.3)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4,2'); // 虚线效果
      line.setAttribute('class', 'starlink');

      linksGroup.appendChild(line);
    });
  });

  linesSvg.value.appendChild(linksGroup);
};

// 监听星球列表变化
watch(filteredPlanets, (newVal, oldVal) => {
  // 如果星球数量变化，重新生成位置和星链
  if (newVal.length !== oldVal.length) {
    planetPositions.value = {};
    updatePlanetPositions();

    nextTick(() => {
      drawStarlinks();
    });
  }
});
</script>

<style scoped>

.knowledge-planet-view {
 display: flex;
 flex-direction: column;
 min-height: 100vh;
 margin-top: -50px;
}
/* 搜索栏样式 */
.search-container {
 display: flex;
 justify-content: center;
 margin-bottom: 2rem;
 padding: 1rem;
}

.search-bar {
 display: flex;
 position: relative;
 width: 100%;
 max-width: 600px;
 background: rgba(0, 0, 0, 0.7);
 border-radius: 30px;
 border: 1px solid #00eeff;
 box-shadow: 0 0 15px rgba(0, 195, 255, 0.3);
 overflow: hidden;
}

.search-bar input {
 flex: 1;
 padding: 12px 20px;
 background: transparent;
 border: none;
 color: #b6f9ff;
 font-size: 16px;
 outline: none;
}

.search-bar input::placeholder {
 color: rgba(182, 249, 255, 0.6);
}

.search-button {
 background: rgba(0, 238, 255, 0.2);
 border: none;
 padding: 0 20px;
 cursor: pointer;
 transition: background 0.3s ease;
}

.search-button:hover {
 background: rgba(0, 238, 255, 0.4);
}

.search-button svg {
 width: 24px;
 height: 24px;
 stroke: #00eeff;
}

/* 无结果提示 */
.no-results {
 text-align: center;
 color: #b6f9ff;
 padding: 2rem;
}

.no-results button {
 margin-top: 1rem;
 padding: 8px 16px;
 background: rgba(0, 238, 255, 0.2);
 border: 1px solid #00eeff;
 color: #b6f9ff;
 border-radius: 4px;
 cursor: pointer;
 transition: background 0.3s;
}

.no-results button:hover {
 background: rgba(0, 238, 255, 0.4);
}

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
 position: relative; /* 为星环效果定位 */
 overflow: visible; /* 允许光晕溢出 */
  /* 使用CSS变量实现动态光晕效果 */
  box-shadow:
   0 0 20px var(--planet-glow),
   0 0 40px rgba(0, 195, 255, 0.3),
   inset 0 0 20px rgba(255, 255, 255, 0.2); /* 多层光晕效果[1](@ref) */
 z-index: 1;
 animation: float 8s infinite ease-in-out; /* 浮动动画 */
}


.planet::after {
 content: '';
 position: absolute;
 top: 50%;
 left: 50%;
 width: 150%;
 height: 30%;
 border: 3px solid rgba(255, 255, 255, 0.3);
 border-radius: 50%;
 transform: translate(-50%, -50%) rotateX(70deg);
 box-shadow: 0 0 15px var(--planet-glow); /* 使用动态光晕颜色 */
 z-index: -1;
 opacity: 0.7;
}
.planet:hover {
 box-shadow:
   0 0 30px var(--planet-glow),
   0 0 60px rgba(0, 195, 255, 0.5),
   inset 0 0 30px rgba(255, 255, 255, 0.3);
 z-index: 20;
 animation: none;
}

.planet > span {
 position: relative;
 z-index: 2; /* 确保文字在星环上方 */
 text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
 padding: 10px;
}

/* 浮动动画 */
@keyframes float {
 0%, 100% { transform: translateY(0) rotate(0deg); }
 50% { transform: translateY(-10px) rotate(2deg); }
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


/* 响应式布局 */
@media (max-width: 768px) {
 .search-bar {
   max-width: 100%;
 }

 .planets-container {
   padding: 1rem;
   gap: 1.5rem;
 }

 .planet {
   width: 80px !important;
   height: 80px !important;
   font-size: 12px !important;
 }
}
/* 新增星链样式 */
.star-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 防止SVG阻挡星球点击 */
  z-index: 0; /* 确保在星球下方 */
}

/* 调整星球容器 */
.planets-container {
  position: relative; /* 为绝对定位的星球提供参考 */
  display: block; /* 取消flex布局 */
  min-height: 70vh;
  width: 100%;
  overflow: hidden; /* 防止星球超出容器 */
}

/* 调整星球样式 */
.planet {
  position: absolute;
  transform: translate(-50%, -50%); /* 中心定位 */
  z-index: 1;
  /* 移除原有的浮动动画，以免与位置冲突 */
  /* animation: float 8s infinite ease-in-out; */
}

/* 如果需要保留浮动效果，可以添加微妙的浮动动画 */
@keyframes subtle-float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-7px); }
}

.planet {
  animation: subtle-float 6s infinite ease-in-out;
}



/* 响应式调整 */
@media (max-width: 768px) {
  .planet {
    width: 80px !important;
    height: 80px !important;
    font-size: 12px !important;
  }
}
</style>
