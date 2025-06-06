<template>
  <div class="stellar-container">
    <div class="stellar-glow"></div>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'
import { usePlanetStore } from '@/stores/planetStore';

const props = defineProps<{
  galaxyId: string
}>()

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
      planet.planetId.toLowerCase().includes(query) ||
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
      galaxyId: props.galaxyId,
      planetId: selectedPlanet.value.planetId
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
      galaxyId: props.galaxyId,
      planetId: selectedPlanet.value.planetId
    })
    alert('移除成功！')
    selectedPlanet.value = null // 清空选择
  } catch (error) {
    alert(error instanceof Error ? error.message : '未知错误')
  }
}
</script>

<style scoped>
/* 原有样式保持不变... */

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
</style>
