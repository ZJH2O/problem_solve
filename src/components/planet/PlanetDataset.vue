<template>
  <div class="dataset-container">
    <!-- 触发按钮 -->
    <button
      class="control-button cosmic-btn"
      :class="{ active: showMenu }"
      @click="toggleMenu"
    >
      🪐 数据控制
    </button>

    <!-- 右侧控制菜单 -->
    <transition name="slide">
      <div v-if="showMenu" class="control-panel sci-fi-panel">
        <div class="panel-header">
          <h3>星球数据集控制</h3>
          <button class="close-btn cosmic-icon" @click="showMenu = false">×</button>
        </div>

        <div class="data-operations">
          <button class="operation-btn cosmic-btn" @click="showAddDialog = true">
            ➕ 添加新星球
          </button>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
          <div class="search-container">
            <input
              v-model="searchQuery"
              class="cosmic-search"
              placeholder="搜索星球名称或ID..."
              @input="handleSearch"
            />
            <button class="search-btn cosmic-icon">
              <i class="icon-search">🔍</i>
            </button>
          </div>
        </div>

        <div class="scroll-container">
          <div class="planet-list">
            <div
              v-for="planet in filteredPlanets"
              :key="planet.planetId"
              class="planet-item cosmic-card"
            >
              <div class="planet-info">
                <span class="name cosmic-text">{{ planet.contentTitle }}</span>
                <span class="planet-id cosmic-subtext">{{ planet.planetId }}</span>
              </div>
              <div class="planet-actions">
                <button
                  class="action-btn delete cosmic-btn"
                  @click="deletePlanet(planet.planetId)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
  <div>
      <AddDetail
        v-if="showAddDialog"
        @submit="handleAddSubmit"
        @cancel="showAddDialog = false"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import AddDetail from '@/components/planet/AddDetail.vue';
import { useUserStore } from '@/stores/user';

const store = usePlanetStore();
const showMenu = ref(false);
const showAddDialog = ref(false);
const userStore = useUserStore()

const searchQuery = ref(''); // 搜索关键字
onMounted(() => {
  userStore.init()
  // ✅ 在组件上下文中验证 Store 可用性
  console.log('[Debug] Store methods:', {
    addPlanet: store.createPlanet,
    deletePlanet: store.deletePlanet
  });
});
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleSearch = () => {
  // 可以添加防抖或节流优化
};

// 计算属性：过滤后的星球列表
const filteredPlanets = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.planets;
  }

  const query = searchQuery.value.toLowerCase();
  return store.planets.filter(planet => {
    return (
      (planet.contentTitle && planet.contentTitle.toLowerCase().includes(query)) ||
      (planet.planetId && planet.planetId.toLowerCase().includes(query))
    );
  });
});

const handleAddSubmit = async(data: {
  contentTitle: string;
  description: string;
  themeId: number
}) => {
  if(!userStore.userInfo?.userId){
    alert("请先登录")
  }
  userStore.currentFule += 3
  await store.createPlanet({
    ...data,
    userId: userStore.userInfo?.userId??-1,
  });

  showAddDialog.value = false;
};

const deletePlanet = (planetId:string) => {
  if (confirm('确定要删除这个星球吗？')) {
    store.deletePlanet(planetId);
  }
};

</script>

<style scoped>
.dataset-container {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
}

.control-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 12px 24px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 25px 0 0 25px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.control-button:hover {
  background: #34495e;
  right: 5px;
}

.control-button.active {
  background: #3498db;
}

.control-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 320px;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden; /* 新增 */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.data-operations {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.operation-btn {
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.operation-btn:hover {
  background: #e9ecef;
}

.planet-list {
  flex: 1;
  overflow-y: scroll;
  padding-right: 10px;
  min-height: 0; /* 关键修复 */
}

.planet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.planet-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 500;
  color: #333;
}

.visitors {
  font-size: 0.9em;
  color: #666;
}

.action-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.delete {
  background: #ff4757;
  color: white;
}

.delete:hover {
  background: #ff6b81;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
/* ==== 宇宙主题搜索栏样式 ==== */
.search-bar {
  padding: 15px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.2);
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

.cosmic-search {
  flex: 1;
  padding: 12px 45px 12px 15px;
  background: rgba(20, 25, 50, 0.6);
  border: 1px solid #3d67ff;
  border-radius: 30px;
  color: #e0f7fa;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(61, 103, 255, 0.3);
}

.cosmic-search:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.5);
}

.search-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #00eeff;
  cursor: pointer;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.1);
  color: #00c9ff;
}

/* ==== 宇宙主题优化 ==== */
.sci-fi-panel {
  background: linear-gradient(145deg, #0c1a3a, #0a1a2a);
  border: 1px solid #00eeff;
  box-shadow: 0 0 30px rgba(0, 195, 255, 0.5);
  color: #e0f7fa;
}

.cosmic-title {
  color: #00eeff;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
}

.cosmic-icon {
  color: #00eeff;
  transition: all 0.3s ease;
}

.cosmic-icon:hover {
  color: #ff00cc;
  transform: scale(1.1);
}

.cosmic-btn {
  background: rgba(25, 30, 70, 0.6);
  border: 1px solid #3d67ff;
  color: #e0f7fa;
  transition: all 0.3s ease;
}

.cosmic-btn:hover {
  background: rgba(61, 103, 255, 0.3);
  box-shadow: 0 5px 15px rgba(61, 103, 255, 0.5);
}

.control-button.cosmic-btn {
  background: linear-gradient(45deg, #1a2a4a, #0c1a3a);
}

.control-button.cosmic-btn:hover {
  background: linear-gradient(45deg, #2a3a6a, #1c2a5a);
}

.cosmic-card {
  background: rgba(25, 30, 70, 0.4);
  border: 1px solid rgba(100, 150, 255, 0.3);
  transition: all 0.3s ease;
}

.cosmic-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(61, 103, 255, 0.3);
  border-color: #00eeff;
}

.cosmic-text {
  color: #e0f7fa;
  font-weight: 500;
}

.cosmic-subtext {
  color: #7d9bff;
  font-size: 0.85rem;
}

/* 删除按钮特殊样式 */
.action-btn.delete {
  background: linear-gradient(45deg, #ff5555, #ff00cc);
}

.action-btn.delete:hover {
  background: linear-gradient(45deg, #ff7777, #ff22dd);
}

/* 添加新星球按钮 */
.operation-btn {
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  color: #0a0f2b;
}
</style>
