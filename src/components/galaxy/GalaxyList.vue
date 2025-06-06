<template>
  <div class="galaxy-list-container">
    <div class="creator-bg" v-if="galaxyStore.showCreator">
      <GalaxyCreator @close="galaxyStore.showCreator = false" />
    </div>
    <!-- 头部区域 -->
    <div class="galaxy-header">
      <div class="title-container">
        <div class="starry-background"></div>
        <h1 class="main-title">知识星系导航</h1>
        <p class="subtitle">探索知识宇宙的无限可能</p>
      </div>

      <div class="controls">
        <div class="search-container">
          <el-icon><Search /></el-icon>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="搜索星系名称或描述..."
            class="search-input"
          />
        </div>

        <button class="add-galaxy-btn" @click="addGalaxy">
          <i class="fas fa-plus"></i>
          <span>创建新星系</span>
        </button>
      </div>
    </div>

    <!-- 星系列表 -->
    <div class="galaxy-grid">
      <div
        v-for="galaxy in filteredGalaxies"
        :key="galaxy.galaxyId"
        class="galaxy-card"
        :class="{'public': galaxy.permission === 1, 'private': galaxy.permission === 0}"
      >
        <div class="card-header">
          <div class="galaxy-icon">
          </div>
          <div class="title-container">
            <h3 class="galaxy-name">{{ galaxy.name }}</h3>
            <div class="permission-badge">
              {{ galaxy.permission === 1 ? '公开星系' : '私有星系' }}
            </div>
          </div>
        </div>

        <div class="galaxy-info">
          <p class="galaxy-label">{{ galaxy.label || '这个星系还没有描述...' }}</p>

          <div class="galaxy-meta">
            <div class="meta-item">
              <span>创建者: {{ galaxy.userId}}</span>
            </div>
            <div class="meta-item">
              <span>{{ galaxy.planets ? galaxy.planets.length : 0 }} 个知识星球</span>
            </div>
          </div>
        </div>

        <div class="galaxy-actions">
          <button class="action-btn explore" @click.stop="exploreGalaxy(galaxy)">
            探索星系
          </button>
          <button class="action-btn share" @click.stop="shareGalaxy(galaxy)">
            分享
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGalaxies.length === 0" class="empty-state">
      <i class="fas fa-stars"></i>
      <h3>未找到匹配的星系</h3>
      <p>尝试调整搜索条件或创建新的星系</p>
      <button class="create-btn" @click="addGalaxy">创建新星系</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGalaxyStore } from '@/stores/galaxy';
import type { KnowledgeGalaxyDto } from '@/types/galaxy';
import GalaxyCreator from './GalaxyCreator.vue';
import router from '@/router';
const galaxyStore = useGalaxyStore();
const searchTerm = ref('');

// 初始化星系数据
onMounted(async () => {
      await galaxyStore.init();
    });

    // 计算属性：过滤星系
    const filteredGalaxies = computed(() => {
      if (!searchTerm.value) return galaxyStore.galaxies;

      const term = searchTerm.value.toLowerCase();
      return galaxyStore.galaxies.filter(galaxy =>
        galaxy.name.toLowerCase().includes(term) ||
        (galaxy.label && galaxy.label.toLowerCase().includes(term))
      );
    });

    // 处理星系操作
    const exploreGalaxy = (galaxy: KnowledgeGalaxyDto) => {
      console.log('探索星系:', galaxy.name);
      galaxyStore.currentGalaxy = galaxy;
      router.push({
        name: 'GalaxyDetail', // 使用路由配置中的命名路由
        params: {
          galaxyId: galaxy.galaxyId // 传递星系ID作为动态参数
        }
      });
      // 这里可以导航到星系详情页
    };

    const shareGalaxy = (galaxy: KnowledgeGalaxyDto) => {
      console.log('分享星系:', galaxy.name);
      // 实现分享逻辑
    };

    const addGalaxy = () => {
      console.log('创建新星系');
      galaxyStore.showCreator = true;
    };



</script>

<style scoped>
.galaxy-list-container {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: -50px;
  padding: 0 auto;
  font-family: 'Space Grotesk', sans-serif;
}

.galaxy-header {
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 2rem;
  background: linear-gradient(
    15deg,            /* 倾斜光带 */
    #000000 0%,       /* 深空黑 */
    #333333 20%,      /* 宇宙灰 */
    #001F3F 45%,      /* 暗物质蓝 */
    #000000 80%       /* 深空黑 */
  );
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.title-container {
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
}



.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #00b4d8, #90e0ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 180, 216, 0.3);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a0a0ff;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.search-container {
  flex-grow: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #90e0ef;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: none;
  border-radius: 50px;
  background: rgba(10, 15, 40, 0.8);
  color: white;
  font-size: 1rem;
  border: 1px solid #4a4a8a;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 180, 216, 0.2);
}

.search-input:focus {
  outline: none;
  border-color: #00b4d8;
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.4);
}

.add-galaxy-btn {
  background: linear-gradient(to right, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.add-galaxy-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.5);
}

.galaxy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.galaxy-card {
  background: radial-gradient(
  ellipse at 30% 20%,
  rgba(15, 10, 60, 0.8) 0%,
  rgba(0, 0, 0, 1) 90%
);
  border-radius: 16px;
  overflow: hidden;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #2a2a5a;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.galaxy-card.public {
  border-top: 4px solid #00b4d8;
}

.galaxy-card.private {
  border-top: 4px solid #ff6b6b;
}

.galaxy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  gap: 1rem;
}

.galaxy-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #4a00e0, #8e2de2);
  color: white;
}

.title-container {
  flex: 1;
}

.galaxy-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #f0f0ff;
}

.permission-badge {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  margin-top: 0.3rem;
}

.galaxy-card.public .permission-badge {
  background: rgba(0, 180, 216, 0.2);
  color: #00b4d8;
}

.galaxy-card.private .permission-badge {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.galaxy-label {
  color: #a0a0ff;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  min-height: 4.5rem;
}

.galaxy-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #90e0ef;
  font-size: 0.9rem;
}

.meta-item i {
  color: #00b4d8;
  width: 20px;
  text-align: center;
}

.galaxy-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn.explore {
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
}

.action-btn.share {
  background: rgba(255, 255, 255, 0.1);
  color: #90e0ef;
  border: 1px solid #4a4a8a;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(10, 15, 40, 0.5);
  border-radius: 16px;
  margin-top: 2rem;
  border: 1px dashed #4a4a8a;
}

.empty-state i {
  font-size: 4rem;
  color: #4a4a8a;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #f0f0ff;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #a0a0ff;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.create-btn {
  background: linear-gradient(to right, #4a00e0, #8e2de2);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(138, 43, 226, 0.4);
}


</style>
