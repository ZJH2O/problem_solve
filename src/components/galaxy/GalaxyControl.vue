<template>
  <div class="dataset-container">
    <!-- 触发按钮 -->
    <button
      class="control-button"
      :class="{ active: showMenu }"
      @click="toggleMenu"
    >
      🪐 数据控制
    </button>

    <!-- 右侧控制菜单 -->
    <transition name="slide">
      <div v-if="showMenu" class="control-panel">
        <div class="panel-header">
          <h3>星球数据集控制</h3>
          <button class="close-btn" @click="showMenu = false">×</button>
        </div>

        <div class="data-operations">
          <button class="operation-btn" @click="showAddDialog = true">
            ➕ 添加新星球
          </button>
          <button class="operation-btn" @click="exportData">
            📤 导出数据
          </button>
          <label class="operation-btn">
            📥 导入数据
            <input
              type="file"
              hidden
              @change="handleFileImport"
            >
          </label>
        </div>
        <div class="scroll-container">
        <div class="planet-list">
          <div
            v-for="planet in planets"
            :key="planet.planetId"
            class="planet-item"
          >
            <div class="planet-info">
              <span class="name">{{ planet.contentTitle }}</span>
              <!-- <span class="visitors">👥 {{ planet. }}</span> -->
            </div>
            <div class="planet-actions">
              <button
                class="action-btn delete"
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
    <div class="AddDetail">

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import AddDetail from '@/components/planet/AddDetail.vue';
import { useUserStore } from '@/stores/user';
import type { KnowledgePlanetDto } from '@/types/planet';
import { useGalaxyStore } from '@/stores/galaxy';
const store = usePlanetStore();
const galaxyStore = useGalaxyStore()
const showMenu = ref(false);
const showAddDialog = ref(false);
const userStore = useUserStore()
const planets = computed(() => galaxyStore.galaxyPlanets);
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


const deletePlanet = (planetId:string) => {
  if (confirm('确定要删除这个星球吗？')) {
    store.deletePlanet(planetId);
  }
};

const exportData = () => {
  const dataStr = JSON.stringify(planets.value);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'planets-data.json';
  a.click();
  URL.revokeObjectURL(url);
};

const handleFileImport = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) {
    try {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const data: KnowledgePlanetDto[] = JSON.parse(result);
          store.planets = data;
        }
      };
      reader.readAsText(file);
    } catch (error) {
      alert('文件导入失败，请检查文件格式');
      console.error('File import error:', error);
    }
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

</style>
