<template>
<div v-if="props.visible" class="modal-overlay">
  <div class="modal-content">
    <button class="close-btn" @click="$emit('update:visible', false)">
        ×
      </button>
  <div class="stellar-container">
    <div class="manager-container">
      <h2 class="stellar-title">星系星球管理</h2>

      <!-- 星球搜索区域 -->
      <div class="search-section">
        <div class="form-group">
          <label class="stellar-label">搜索星球：</label>
          <div class="search-input-group">
            <input
              v-model="searchQuery"
              placeholder="输入星球名称或ID"
              class="stellar-input"
              @input="handleSearchInput"
            />
            <button @click="clearSearch" class="clear-button" v-if="searchQuery">
              <i class="icon-clear"></i>
            </button>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="search-results" v-if="filteredPlanets.length > 0">
          <div
            v-for="planet in filteredPlanets"
            :key="planet.planetId"
            class="result-item"
            @click="selectPlanet(planet)"
          >
            <div class="planet-info">
              <span class="planet-name">{{ planet.contentTitle }}</span>
              <span class="planet-id">{{ planet.planetId }}</span>
            </div>
            <div class="planet-stats">
              <span class="visitors">
                <i class="icon-user"></i> {{ planet.visitCount || 0 }}
              </span>
              <button class="add-btn cosmic-button" @click.stop="addPlanetToSelect(planet)">+</button>
            </div>
          </div>
        </div>

         <!-- 新增：未搜索时显示推荐星球 -->
         <div class="recommended-planets" v-if="!searchQuery && recommendedPlanets.length > 0">
          <h3 class="recommended-title">推荐星球</h3>
          <div
            v-for="planet in recommendedPlanets"
            :key="planet.planetId"
            class="result-item"
            @click="selectPlanet(planet)"
          >
            <div class="planet-info">
              <span class="planet-name">{{ planet.contentTitle }}</span>
              <span class="planet-id">{{ planet.planetId }}</span>
            </div>
            <div class="planet-stats">
              <span class="visitors">
                <i class="icon-user"></i> {{ planet.visitCount || 0 }}
              </span>
              <button class="add-btn cosmic-button" @click.stop="addPlanetToSelect(planet)">+</button>
            </div>
          </div>
        </div>


        <div class="no-results" v-if="searchQuery && filteredPlanets.length === 0">
          <i class="icon-planet"></i>
          <p>未找到匹配的星球</p>
        </div>
      </div>

       <!-- 操作区域 -->
       <div class="operation-section">
        <div class="form-group">
          <label class="stellar-label">已选择星球列表：</label>
          <!-- 修改：展示已选择的星球列表 -->
          <div v-if="selectedPlanets.length > 0" class="selected-planets-list">
            <div
              v-for="(planet, index) in selectedPlanets"
              :key="planet.planetId"
              class="selected-planet-item"
            >
              <div class="planet-info">
                <span class="planet-name">{{ planet.contentTitle }}</span>
                <span class="planet-id">{{ planet.planetId }}</span>
              </div>
              <button class="remove-btn cosmic-button" @click.stop="removeFromSelected(index)">-</button>
            </div>
          </div>
          <div v-else class="no-selection">尚未选择星球</div>
        </div>

        <div class="buttons" style="display: flex; justify-content: center">
          <button
            @click="addAllSelected"
            class="stellar-button"
            :disabled="selectedPlanets.length === 0"
          >
            批量添加 ({{ selectedPlanets.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  visible: boolean
}>()
const userStore = useUserStore()
const planetStore = usePlanetStore()
const galaxyStore = useGalaxyStore()
const searchQuery = ref('')
const selectedPlanet = ref<KnowledgePlanetDto | null>(null)
const selectedPlanets = ref<KnowledgePlanetDto[]>([]) // 存储批量选择的星球

// 新增：响应式变量跟踪星系中的星球ID
const galaxyPlanetIds = computed(() => {
  return new Set(galaxyStore.galaxyPlanets.map(p => p.planetId));
});
// 计算属性：过滤匹配的星球[2,4](@ref)
const filteredPlanets = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }

  const query = searchQuery.value.toLowerCase()
  return planetStore.planets.filter(planet => {
    // 排除已添加到星系的星球
    if (galaxyPlanetIds.value.has(planet.planetId)) {
      return false;
    }

    return (
      planet.planetId?.toLowerCase().includes(query) ||
      (planet.contentTitle && planet.contentTitle.toLowerCase().includes(query))
    )
  })
});

// 处理搜索输入[8](@ref)
const handleSearchInput = () => {

}
// 新增：推荐星球
const recommendedPlanets = computed(() => {
  if (!searchQuery.value && planetStore.planets.length > 0) {
    return planetStore.planets
      .filter(planet => !galaxyPlanetIds.value.has(planet.planetId))
      .slice(0, 4);
  }
  return [];
});

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  selectedPlanet.value = null
}

// 选择星球
const selectPlanet = (planet: KnowledgePlanetDto) => {
  selectedPlanet.value = planet
  if (!selectedPlanets.value.some(p => p.planetId === planet.planetId)) {
    selectedPlanets.value.push(planet);
  }
  searchQuery.value = '' // 清空搜索框
}


  // 修改：添加星球到已选择列表
const addPlanetToSelect = (planet: KnowledgePlanetDto) => {
  // 检查是否已存在
  if (!selectedPlanets.value.some(p => p.planetId === planet.planetId)) {
    selectedPlanets.value.push(planet);
  }
}

// 新增：从已选择列表中移除星球
const removeFromSelected = (index: number) => {
  selectedPlanets.value.splice(index, 1);
}
// 批量添加所有已选星球
const addAllSelected = async () => {
  if (selectedPlanets.value.length === 0) return;

  try {
    // 使用Promise.all并行添加所有星球
    await Promise.all(selectedPlanets.value.map(planet =>
      galaxyStore.addPlanetToGalaxy({
        galaxyId: galaxyStore.currentGalaxy?.galaxyId || '-1',
        planetId: planet.planetId || '-1'
      })
    ));

    alert(`成功添加 ${selectedPlanets.value.length} 个星球！`);
    selectedPlanets.value = []; // 清空批量选择列表
  } catch (error) {
    console.error('批量添加失败:', error);
    alert('部分星球添加失败，请重试');
  }
}

onMounted( () =>{
  console.log("当前用户",userStore.userInfo)
  console.log("当前星系",galaxyStore.currentGalaxy)
  console.log("当前星球列表",galaxyStore.galaxyPlanets  )
  console.log("用户星球列表",planetStore.planets)
})
</script>

<style scoped>
/* 原有样式保持不变... */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  color:#00eeff;
  background: linear-gradient(145deg, #0a1a2a, #0c2342);
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #00eeff;
  box-shadow: 0 0 30px rgba(0, 195, 255, 0.5);
  transform: scale(0.8) rotateX(10deg);
  animation: modalEntrance 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}
@keyframes modalEntrance {
  to { transform: scale(1) rotateX(0); }
}
/* 新增搜索区域样式 */
.search-section {
  margin-bottom: 2rem;
  background: rgba(20, 25, 50, 0.6);
  border-radius: 8px;
  padding: 1.2rem;
  border: 1px solid rgba(100, 150, 255, 0.3);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-button {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #7d9bff;
  cursor: pointer;
  font-size: 1.2rem;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 15px;
  border-radius: 6px;
  background: rgba(15, 20, 40, 0.8);
  border: 1px solid #3d67ff;
}

.result-item {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(100, 150, 255, 0.1);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.result-item:hover {
  background: rgba(61, 103, 255, 0.2);
}

.planet-info {
  display: flex;
  flex-direction: column;
}

.planet-name {
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 5px;
}

.planet-id {
  font-size: 0.8rem;
  color: #7d9bff;
}

.planet-stats {
  font-size: 0.9rem;
  color: #a0a0a0;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #a0a0a0;
}

.no-results .icon-planet {
  font-size: 36px;
  margin-bottom: 10px;
  color: #4e1d6d;
  display: block;
}

.operation-section {
  padding: 1.2rem;
  background: rgba(20, 25, 50, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(100, 150, 255, 0.3);
}

.selected-planet {
  padding: 12px;
  background: rgba(25, 30, 70, 0.6);
  border-radius: 6px;
  border: 1px solid #3d67ff;
  color: #00f7ff;
  font-weight: 500;
}

.no-selection {
  padding: 12px;
  color: #7d9bff;
  font-style: italic;
}

/* 禁用按钮样式 */
.stellar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.stellar-button:disabled:hover {
  box-shadow: none;
  transform: none;
}

/* 添加关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #00eeff;
  border-radius: 50%;
  color: #00eeff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
}
/* 添加按钮样式 */
.add-btn {
  background: rgba(0, 201, 255, 0.2);
  color: #00eeff;
  border: 1px solid #00eeff;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover {
  background: rgba(0, 201, 255, 0.4);
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

/* 移除按钮样式 */
.remove-btn {
  background: rgba(255, 50, 50, 0.2);
  color: #ff5555;
  border: 1px solid #ff5555;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: rgba(255, 50, 50, 0.4);
  box-shadow: 0 0 10px rgba(255, 85, 85, 0.5);
}

/* 调整已选择区域的布局 */
.selected-planet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(25, 30, 70, 0.6);
  border-radius: 6px;
  border: 1px solid #3d67ff;
  color: #00f7ff;
  font-weight: 500;
}

/* 批量添加按钮样式 */
.stellar-button {
  margin-top: 10px;
  background: rgba(0, 201, 255, 0.2);
  color: #e0f7fa;
  border: 1px solid #00eeff;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.stellar-button:hover {
  background: rgba(0, 201, 255, 0.4);
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

/* 批量选择指示器 */
.selected-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ffcc00;
  color: #0a0f2b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

/* 调整星球信息区域的布局 */
.planet-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  cursor: pointer;
}

.planet-stats {
  display: flex;
  align-items: center;
}

/* 添加已选择星球列表样式 */
.selected-planets-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 6px;
  padding: 10px;
  background: rgba(20, 25, 50, 0.4);
}

.selected-planet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(25, 30, 70, 0.6);
  border-radius: 6px;
  border: 1px solid #3d67ff;
  color: #00f7ff;
  font-weight: 500;
}

.selected-planet-item .planet-info {
  display: flex;
  flex-direction: column;
}

.selected-planet-item .planet-name {
  font-weight: 600;
  color: #e6e6e6;
  margin-bottom: 2px;
}

.selected-planet-item .planet-id {
  font-size: 0.7rem;
  color: #7d9bff;
}

/* 优化搜索区域样式 */
.search-section {
  margin-bottom: 2rem;
  background: radial-gradient(circle at top, #1a2a4a, #0c1a3a);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(100, 150, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.stellar-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  background: rgba(15, 20, 40, 0.7);
  border: 1px solid #3d67ff;
  border-radius: 30px;
  color: #e0f7fa;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.stellar-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.5);
}
</style>
