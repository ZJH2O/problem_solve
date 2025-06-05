<template>
  <div class="planet-search-container">
    <!-- 搜索输入区域 -->
    <div class="search-input-group">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="输入星球名称..."
        class="search-input"
        @keyup.enter="searchPlanet"
      />
      <button class="search-btn" @click="searchPlanet">
        <i class="icon-search"></i> 定向飞行
      </button>
      <button class="random-btn" @click="randomAccessPlanet">
        <i class="icon-random"></i> 随机访问
      </button>
    </div>

    <!-- 热门星球展示 -->
    <div v-if="showHotPlanets" class="hot-planets-section">
      <h3 class="section-title">热门星球 <i class="icon-fire"></i></h3>
      <div class="hot-planets-grid">
        <div
          v-for="planet in hotPlanets"
          :key="planet.planetId"
          class="planet-card"
          @click="selectPlanet(planet)"
        >
          <!-- <div class="planet-avatar" :style="{ backgroundColor: planet.colorScheme }">
            {{ planet.contentTitle.charAt(0) }}
          </div> -->
          <div class="planet-info">
            <div class="planet-title">{{ planet.contentTitle }}</div>
            <div class="planet-stats">
              <span class="visitors">
                <i class="icon-user"></i> {{ planet.visitCount || 0 }}
              </span>
              <!-- <span class="brightness">
                <i class="icon-star"></i> {{ planet.brightness || 0 }}
              </span> -->
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 搜索结果展示 -->
    <div v-else class="search-results-section">
      <div v-if="searchResults.length > 0">
        <h3 class="section-title">搜索结果 ({{ searchResults.length }})</h3>
        <div class="results-list">
          <div
            v-for="planet in searchResults"
            :key="planet.planetId"
            class="result-item"
            @click="selectPlanet(planet)"
          >
            <div class="highlighted-title" v-html="highlightKeyword(planet.contentTitle, searchKeyword)"></div>
            <div class="result-description">{{ truncateDescription(planet.description) }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        <i class="icon-planet"></i>
        <p>未找到匹配的星球</p>
        <button class="back-btn" @click="showHotPlanets = true">
          返回热门星球
        </button>
      </div>
    </div>

    <div class="random-planet-section">
      <RandomPlanet :planet="planetStore.currentRandomPlanet" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import RandomPlanet from './RandomPlanet.vue';
import { onBeforeRouteUpdate } from 'vue-router';
const planetStore = usePlanetStore();
const searchKeyword = ref('');
const searchResults = ref<KnowledgePlanetDto[]>([]);
const showHotPlanets = ref(true);
// 获取热门星球（假设已实现）
const hotPlanets = computed(() => {
  // 按访问量排序取前6个
  return [...planetStore.planets]
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    .slice(0, 6);
});

// 组件挂载时加载星球数据
onMounted(async () => {
  await planetStore.init();
});

// 定向搜索星球
const searchPlanet = async () => {
  if (!searchKeyword.value.trim()) {
    showHotPlanets.value = true;
    return;
  }

  try {
    const results = await planetStore.searchPlanet(searchKeyword.value);
    searchResults.value = results;
    showHotPlanets.value = false;
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
    showHotPlanets.value = false;
  }
};

// 随机访问星球
const randomAccessPlanet = async () => {
  try {
    const planet = await planetStore.randomAccessPlanet();
    planetStore.currentRandomPlanet = { ...planet }
    // 这里可以触发星球选择事件或跳转
    return planet
  } catch (error) {
    console.error('随机访问失败:', error);
  }
};

// 关键词高亮显示（核心功能）
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text;

  const pattern = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(pattern, '<span class="highlight">$1</span>');
};

// 转义正则特殊字符
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 截断描述文本
const truncateDescription = (desc: string | undefined, maxLength = 80) => {
  if (!desc) return '';
  return desc.length > maxLength
    ? `${desc.substring(0, maxLength)}...`
    : desc;
};

// 选择星球处理
const selectPlanet = (planet: KnowledgePlanetDto) => {
  // 这里可以触发事件或路由跳转到星球详情页
  console.log('星球选择:', planet.contentTitle);
  // 示例：planetStore.VisitPlanet(planet.planetId);
};

// 添加组件激活处理
onActivated(async () => {
  await randomAccessPlanet();
});

// 在SearchPlanet组件中添加
onBeforeRouteUpdate(async () => {
  await randomAccessPlanet();
});
</script>

<style scoped>
.planet-search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.search-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #4a4e69;
  border-radius: 8px;
  background: #16213e;
  color: #e6e6e6;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #0f3460;
  outline: none;
}

.search-btn, .random-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn {
  background: #0f3460;
  color: #e6e6e6;
}

.search-btn:hover {
  background: #1a5089;
}

.random-btn {
  background: #4e1d6d;
  color: #e6e6e6;
}

.random-btn:hover {
  background: #6a2a8f;
}

.section-title {
  color: #e6e6e6;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hot-planets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
}

.planet-card {
  display: flex;
  padding: 12px;
  background: #16213e;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.planet-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.planet-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-right: 15px;
}

.planet-info {
  flex: 1;
}

.planet-title {
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 5px;
}

.planet-stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #a0a0a0;
}

.visitors, .brightness {
  display: flex;
  align-items: center;
  gap: 4px;
}

.results-list {
  background: #16213e;
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid #2d3746;
  cursor: pointer;
  transition: background 0.3s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: #1a2a4a;
}

.highlighted-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #e6e6e6;
}

.result-description {
  font-size: 14px;
  color: #a0a0a0;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #a0a0a0;
}

.no-results .icon-planet {
  font-size: 48px;
  margin-bottom: 15px;
  color: #4e1d6d;
}

.back-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #0f3460;
  color: #e6e6e6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #1a5089;
}

/* 关键词高亮样式 */
.highlight {
  background-color: rgba(255, 213, 0, 0.3);
  color: #ffd500;
  font-weight: bold;
  padding: 0 2px;
  border-radius: 3px;
}
</style>
