<template>
<div v-if="visible" class="modal-overlay">
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
          <label class="stellar-label">已选星球：</label>
          <div class="selected-planet" v-if="selectedPlanet">
            {{ selectedPlanet.contentTitle }} ({{ selectedPlanet.planetId }})
          </div>
          <div v-else class="no-selection">尚未选择星球</div>
        </div>

        <div class="buttons">
          <button
            @click="addPlanet"
            class="stellar-button"
            :disabled="!selectedPlanet"
          >
            添加星球
          </button>
          <button
            @click="removePlanet"
            class="stellar-button remove"
            :disabled="!selectedPlanet"
          >
            移除星球
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

// 计算属性：过滤匹配的星球[2,4](@ref)
const filteredPlanets = computed(() => {
  if (!searchQuery.value.trim()) {
    return []
  }

  const query = searchQuery.value.toLowerCase()
  return planetStore.planets.filter(planet => {
    return (
      planet.planetId?.toLowerCase().includes(query) ||
      (planet.contentTitle && planet.contentTitle.toLowerCase().includes(query))
    )
  })
})

// 处理搜索输入[8](@ref)
const handleSearchInput = () => {
  // 这里可以添加防抖逻辑优化性能
  if (searchQuery.value && filteredPlanets.value.length === 1) {
    // 如果只有一个匹配项，自动选择
    selectPlanet(filteredPlanets.value[0])
  }
}
// 新增：推荐星球（前5个）
const recommendedPlanets = computed(() => {
  // 如果没有搜索查询，返回前5个星球
  if (!searchQuery.value && planetStore.planets.length > 0) {
    return planetStore.planets.slice(0, 4);
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
  searchQuery.value = '' // 清空搜索框
}

// 添加星球到星系
const addPlanet = async () => {
  if (!selectedPlanet.value) return

  try {
    await galaxyStore.addPlanetToGalaxy({
      galaxyId: galaxyStore.currentGalaxy?.galaxyId || '-1',
      planetId: selectedPlanet.value.planetId || '-1'
    })
    alert('添加成功！')
    selectedPlanet.value = null // 清空选择
  } catch (error) {
    alert(error instanceof Error ? error.message : '未知错误')
  }
}

// 从星系移除星球
const removePlanet = async () => {
  if (!selectedPlanet.value) return

  try {
    await galaxyStore.removePlanetFromGalaxy({
      galaxyId: galaxyStore.currentGalaxy?.galaxyId || '-1',
      planetId: selectedPlanet.value.planetId || '-1'
    })
    alert('移除成功！')
    selectedPlanet.value = null // 清空选择
  } catch (error) {
    alert(error instanceof Error ? error.message : '未知错误')
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

</style>
