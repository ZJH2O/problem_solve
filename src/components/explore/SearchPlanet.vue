<template>
  <div class="planet-search-container">
    <!-- 宇宙背景元素 -->
    <div class="space-bg">
      <div class="star"></div>
      <div class="star small"></div>
      <div class="star medium"></div>
      <div class="nebula"></div>
    </div>

    <!-- 左右布局容器 -->
    <div class="layout-container">
      <!-- 左侧控制栏 - 飞船控制台风格 -->
      <div class="control-panel sci-fi-console">
        <div class="panel-header">
          <div class="console-light red"></div>
          <div class="console-light yellow"></div>
          <div class="console-light green"></div>
          <h3 class="panel-title">星图导航系统</h3>
        </div>

        <!-- 搜索输入区域 - 全息投影风格 -->
        <div class="search-input-group">
          <div class="hologram-effect">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="输入星球坐标..."
              class="search-input sci-fi-input"
              @keyup.enter="searchPlanet"
            />
          </div>
          <button class="search-btn sci-fi-btn primary" @click="searchPlanet">
            <i class="icon-target"></i> 定向跃迁
          </button>
          <button class="random-btn sci-fi-btn secondary" @click="randomAccessPlanet">
            <i class="icon-dice"></i> 随机漂流
          </button>
        </div>

        <!-- 热门星球展示 -->
        <div v-if="showHotPlanets" class="hot-planets-section">
          <h3 class="section-title">
            <i class="icon-flame"></i> 热门星域
            <span class="subtitle">(草台班子推荐)</span>
          </h3>
          <div class="hot-planets-grid">
            <div
              v-for="planet in planetStore.hotPlanets"
              :key="planet.planetId"
              class="planet-card hologram-card"
              @click="selectPlanet(planet)"
            >
              <div class="planet-avatar" :style="{ backgroundColor: getRandomPlanetColor() }">
                {{ planet.contentTitle.charAt(0) }}
              </div>
              <div class="planet-info">
                <div class="planet-title">{{ planet.contentTitle }}</div>
                <div class="planet-stats">
                  <span class="visitors">
                    <i class="icon-alien"></i> {{ planet.visitCount || 0 }} 星际访客
                  </span>
                </div>
              </div>
              <div class="planet-tag" v-if="planet.visitCount > 1000">热门</div>
            </div>
          </div>
        </div>

        <!-- 搜索结果展示 -->
        <div v-else class="search-results-section">
          <div v-if="searchResults.length > 0">
            <h3 class="section-title">
              发现 {{ searchResults.length }} 个匹配星域
              <span class="subtitle">(靠谱率: {{ calculateReliability() }}%)</span>
            </h3>
            <div class="results-list">
              <div
                v-for="planet in searchResults"
                :key="planet.planetId"
                class="result-item hologram-card"
                @click="selectPlanet(planet)"
              >
                <div class="highlighted-title" v-html="highlightKeyword(planet.contentTitle, searchKeyword)"></div>
                <div class="result-description">
                  {{ truncateDescription(planet.description) }}
                  <span class="reliability" :style="{ color: getReliabilityColor(planet) }">
                    {{ getReliabilityTag(planet) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-results">
            <i class="icon-blackhole"></i>
            <p>未找到匹配的星域，可能是虫洞干扰</p>
            <button class="back-btn sci-fi-btn" @click="showHotPlanets = true">
              <i class="icon-home"></i> 返回主星图
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧显示面板 - 全息投影台 -->
      <div class="display-panel hologram-display">
        <!-- 上部分：定向飞行结果 -->
        <div class="exact-planet-section">
          <h3 class="section-title">
            <i class="icon-crosshair"></i> 目标星域
            <span class="subtitle">(精确坐标定位)</span>
          </h3>
          <template v-if="planetStore.currentSelectPlanet">
            <ExactPlanet :planet="planetStore.currentSelectPlanet" />
          </template>
          <template v-else>
            <div class="no-data-tip">
              <i class="icon-ufo"></i>
              <p>尚未锁定目标<br>在左侧星图选择坐标</p>
              <div class="sci-fi-message">
                <span class="scanning">扫描中...</span>
                <div class="loading-bar">
                  <div class="progress"></div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 下部分：随机访问结果 -->
        <div class="random-planet-section">
          <h3 class="section-title">
            <i class="icon-question"></i> 随机星域
            <span class="subtitle">(量子不确定性探索)</span>
          </h3>
          <template v-if="planetStore.currentRandomPlanet">
            <RandomPlanet :planet="planetStore.currentRandomPlanet" />
          </template>
          <template v-else>
            <div class="no-data-tip">
              <i class="icon-dice"></i>
              <p>曲速引擎预热中<br>准备随机跃迁</p>
              <button class="refresh-btn sci-fi-btn accent" @click="randomAccessPlanet">
                <i class="icon-rocket"></i> 启动随机跃迁
              </button>
              <div class="fuel-indicator">
                <span>量子燃料: {{ userStore.currentFule }} 单位</span>
                <div class="fuel-bar">
                  <div class="fuel-level" :style="{ width: userStore.currentFule + '%' }"></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar">
      <div class="status-item">
        <i class="icon-satellite"></i> 已连接 {{ planetStore.planets.length }} 个知识星域
      </div>
      <div class="status-item">
        <i class="icon-time"></i> 星际时间: {{ getStardate() }}
      </div>
      <div class="status-item">
        <i class="icon-warning"></i> 可靠性指数: {{ calculateReliability() }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,  onMounted, onActivated } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import RandomPlanet from './RandomPlanet.vue';
import { onBeforeRouteUpdate } from 'vue-router';
import { useUserStore } from '@/stores/user';
import ExactPlanet from './ExactPlanet.vue';

const planetStore = usePlanetStore();
const searchKeyword = ref('');
const searchResults = ref<KnowledgePlanetDto[]>([]);
const showHotPlanets = ref(true);
const userStore = useUserStore();


// 新增方法：计算星域可靠性（幽默版）
const calculateReliability = () => {
  return Math.floor(Math.random() * 30) + 40; // 40-70% 可靠性
};

// 新增方法：获取星域可靠性标签
const getReliabilityTag = (planet: KnowledgePlanetDto) => {
  const tags = [
    "草台班子认证",
    "星际传说",
    "量子态知识",
    "不靠谱指数高",
    "三体人推荐",
    "薛定谔的真相"
  ];
  return tags[Math.floor(Math.random() * tags.length)];
};

// 新增方法：获取星域可靠性颜色
const getReliabilityColor = (planet: KnowledgePlanetDto) => {
  const colors = ["#ff6b6b", "#4ecdc4", "#ffd166", "#6a0572", "#118ab2"];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 新增方法：获取随机星球颜色
const getRandomPlanetColor = () => {
  const colors = ["#6C5B7B", "#C06C84", "#355C7D", "#F8B195", "#4ecdc4"];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 新增方法：获取星际日期
const getStardate = () => {
  const now = new Date();
  return `Stardate ${now.getFullYear()}.${now.getMonth() + 1}${now.getDate()}`;
};

// 组件挂载时加载星球数据
onMounted(async () => {
  await planetStore.init();
  await planetStore.loadingHotPlanets();
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
    if(userStore.currentFule > 0) userStore.currentFule -= 1
    const planet = await planetStore.randomAccessPlanet();
    planetStore.currentRandomPlanet = { ...planet }
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
  planetStore.currentSelectPlanet = planet
  console.log('星球选择:', planet.contentTitle);
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
/* 基础宇宙背景 */
.planet-search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
              inset 0 0 20px rgba(100, 100, 255, 0.2);
  margin-top: -50px;
  position: relative;
  overflow: hidden;
  font-family: 'Orbitron', 'Arial Rounded MT Bold', sans-serif;
  border: 1px solid rgba(100, 150, 255, 0.3);
}

/* 宇宙背景元素 */
.space-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 5s infinite;
}

.star.small {
  width: 1px;
  height: 1px;
}

.star.medium {
  width: 2px;
  height: 2px;
}

.nebula {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(106, 5, 114, 0.3) 0%, transparent 70%);
  top: 20%;
  right: 10%;
  border-radius: 50%;
  filter: blur(20px);
  animation: drift 30s infinite linear;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

@keyframes drift {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(100px, 50px) rotate(360deg); }
}

/* 左右布局容器 */
.layout-container {
  display: flex;
  gap: 30px;
  position: relative;
  z-index: 1;
}

/* 控制面板 - 飞船控制台风格 */
.control-panel {
  flex: 1;
  min-width: 0;
  background: rgba(10, 15, 35, 0.8);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.2),
              inset 0 0 10px rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(100, 150, 255, 0.4);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(100, 150, 255, 0.3);
}

.console-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.console-light.red { background: #ff6b6b; box-shadow: 0 0 8px #ff6b6b; }
.console-light.yellow { background: #ffd166; box-shadow: 0 0 8px #ffd166; }
.console-light.green { background: #06d6a0; box-shadow: 0 0 8px #06d6a0; }

.panel-title {
  color: #4ecdc4;
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(78, 205, 196, 0.7);
}

/* 科幻风格输入框和按钮 */
.sci-fi-input {
  background: rgba(0, 10, 30, 0.7) !important;
  border: 1px solid #4ecdc4 !important;
  color: #e6e6e6 !important;
  box-shadow: 0 0 10px rgba(78, 205, 196, 0.3) !important;
}

.hologram-effect {
  position: relative;
  flex: 1;
}

.hologram-effect::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(78, 205, 196, 0.1), transparent);
  pointer-events: none;
  animation: scan 3s infinite linear;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.sci-fi-btn {
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.sci-fi-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.sci-fi-btn:hover::before {
  transform: translateX(100%);
}

.sci-fi-btn.primary {
  background: linear-gradient(135deg, #118ab2, #06d6a0);
  color: #0a0a2a;
}

.sci-fi-btn.secondary {
  background: linear-gradient(135deg, #6a0572, #c06c84);
  color: #e6e6e6;
}

.sci-fi-btn.accent {
  background: linear-gradient(135deg, #ff6b6b, #ffd166);
  color: #0a0a2a;
}

/* 全息卡片效果 */
.hologram-card {
  background: rgba(20, 25, 50, 0.6);
  border: 1px solid rgba(100, 150, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.hologram-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #6a0572);
  opacity: 0.7;
}

.hologram-card:hover {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.4);
  transform: translateY(-5px);
}

/* 星球卡片样式 */
.planet-card {
  display: flex;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.planet-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-right: 15px;
  flex-shrink: 0;
}

.planet-info {
  flex: 1;
}

.planet-title {
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.planet-stats {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #a0a0a0;
}

.visitors {
  display: flex;
  align-items: center;
  gap: 6px;
}

.planet-tag {
  background: linear-gradient(135deg, #ff6b6b, #ffd166);
  color: #0a0a2a;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  align-self: flex-start;
}

/* 搜索结果样式 */
.results-list {
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  padding: 15px;
  border-bottom: 1px solid rgba(100, 150, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  background: rgba(30, 40, 80, 0.4);
}

.highlighted-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #4ecdc4;
  font-size: 1.1rem;
}

.result-description {
  font-size: 14px;
  color: #a0a0a0;
  display: flex;
  justify-content: space-between;
}

.reliability {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
}

/* 空状态提示 */
.no-results, .no-data-tip {
  text-align: center;
  padding: 40px 20px;
  color: #a0a0a0;
  border-radius: 8px;
  background: rgba(10, 15, 35, 0.6);
}

.no-results .icon-blackhole,
.no-data-tip .icon-ufo,
.no-data-tip .icon-dice {
  font-size: 64px;
  margin-bottom: 20px;
  color: #4ecdc4;
  display: block;
}

/* 状态指示器 */
.fuel-indicator {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
}

.fuel-bar {
  height: 10px;
  background: rgba(100, 100, 100, 0.3);
  border-radius: 5px;
  margin-top: 5px;
  overflow: hidden;
}

.fuel-level {
  height: 100%;
  background: linear-gradient(90deg, #06d6a0, #118ab2);
  border-radius: 5px;
  transition: width 0.5s;
}

.sci-fi-message {
  margin-top: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 8px;
}

.scanning {
  display: block;
  margin-bottom: 8px;
  color: #ffd166;
}

.loading-bar {
  height: 6px;
  background: rgba(100, 100, 100, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #ff6b6b, #ffd166);
  border-radius: 3px;
  animation: loading 2s infinite alternate;
}

@keyframes loading {
  0% { width: 30%; }
  100% { width: 70%; }
}

/* 右侧显示面板 */
.display-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 0;
}

.exact-planet-section,
.random-planet-section {
  flex: 1;
  background: rgba(10, 15, 35, 0.8);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.2),
              inset 0 0 10px rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(100, 150, 255, 0.4);
}

/* 底部状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  font-size: 14px;
  color: #a0a0a0;
  border: 1px solid rgba(100, 150, 255, 0.2);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 标题样式 */
.section-title {
  color: #4ecdc4;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
}

.subtitle {
  font-size: 0.9rem;
  color: #ffd166;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .layout-container {
    flex-direction: column;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
  }

  .planet-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .planet-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
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
  background: rgba(10, 20, 40, 0.8);
  color: #e6e6e6;
  font-size: 16px;
  transition: all 0.3s;
  font-family: inherit;
}

.search-input:focus {
  border-color: #0f9cf3;
  outline: none;
  box-shadow: 0 0 10px rgba(15, 156, 243, 0.5);
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
  font-family: inherit;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.search-btn::before,
.random-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.1) 50%);
  background-size: 400% 400%;
  transition: background-position 0.5s;
  z-index: -1;
}

.search-btn {
  background: linear-gradient(135deg, #0f3460, #1a5089);
  color: #e6e6e6;
}

.search-btn:hover {
  background: linear-gradient(135deg, #1a5089, #2a70c9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(15, 156, 243, 0.4);
}

.search-btn:hover::before {
  background-position: 100% 100%;
}

.random-btn {
  background: linear-gradient(135deg, #4e1d6d, #6a2a8f);
  color: #e6e6e6;
}

.random-btn:hover {
  background: linear-gradient(135deg, #6a2a8f, #8a3ab9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(170, 50, 220, 0.4);
}

.random-btn:hover::before {
  background-position: 100% 100%;
}
.back-btn, .refresh-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4e1d6d, #6a2a8f);
  color: #e6e6e6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.back-btn:hover, .refresh-btn:hover {
  background: linear-gradient(135deg, #6a2a8f, #8a3ab9);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(170, 50, 220, 0.4);
}
</style>
