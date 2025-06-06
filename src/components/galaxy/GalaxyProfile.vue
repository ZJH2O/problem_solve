<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'
import type { KnowledgeGalaxyDto } from '@/types/galaxy';

const props = defineProps<{
  galaxyId: string
}>()

const galaxyStore = useGalaxyStore()
const galaxy = ref<KnowledgeGalaxyDto | null>(null)
const isLoading = ref(true)
const animationComplete = ref(false)

// 获取星系数据
watchEffect(async () => {
  try {
    const data = await galaxyStore.getGalaxyInfo(props.galaxyId)
    galaxy.value = data
  } catch (error) {
    console.error('获取星系信息失败:', error)
  } finally {
    isLoading.value = false
  }
})

const planetCount = computed(()=>{
  return galaxyStore.currentGalaxy?.planets?.length || 0
})

// 页面加载动画控制
onMounted(() => {
  setTimeout(() => {
    animationComplete.value = true
  }, 500)
})

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知纪元';
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
</script>

<template>
  <div class="galaxy-profile-container cosmic-bg" :class="{ 'animation-complete': animationComplete }">
    <!-- 宇宙背景粒子 -->
    <div class="cosmic-particles"></div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="quantum-loader">
        <div class="quantum-sphere"></div>
        <p class="loading-text">曲率引擎启动中...</p>
      </div>
    </div>

    <div class="galaxy-card stardust-border" v-if="galaxy">
      <!-- 星系核心光效 -->
      <div class="galaxy-core-glow"></div>

      <div class="card-header">
        <h2 class="galaxy-name nebula-text">{{ galaxy.name }}</h2>
        <div class="tag-container">
          <span class="cosmic-tag">
            {{ galaxy.label || '未分类星域' }}
          </span>
          <span class="permission-tag" :class="galaxy.permission === 0 ? 'public' : 'private'">
            {{ galaxy.permission === 1 ? '公共星域' : '私有星域' }}
          </span>
        </div>
      </div>

      <!-- 星系信息 -->
      <div class="galaxy-info">
        <div class="meta-grid">
          <div class="info-cell">
            <span class="info-label">星域管理员</span>
            <span class="info-value hologram-text">{{ galaxy.userId || '未知文明' }}</span>
          </div>

          <div class="info-cell">
            <span class="info-label">星历纪元</span>
            <span class="info-value hologram-text">{{ formatDate(galaxy.createTime) }}</span>
          </div>

          <div class="info-cell full-width">
            <span class="info-label">附属行星</span>
            <div class="planets-grid">
              <span
                v-for="(planet, index) in galaxy.planets || []"
                :key="index"
                class="planet-badge"
              >
                {{ planet }}
              </span>
              <span v-if="!(galaxy.planets && galaxy.planets.length)" class="empty-planet">
                ⚠️ 未探测到行星
              </span>
            </div>
          </div>
        </div>

        <!-- 星系数据 -->
        <div class="cosmic-stats">
          <div class="stat-orb">
            <div class="stat-value">{{ planetCount}}</div>
            <div class="stat-label">行星数量</div>
          </div>
          <!-- <div class="stat-orb">
            <div class="stat-value">{{ galaxy.members || 0 }}</div>
            <div class="stat-label">探索者</div>
          </div>
          <div class="stat-orb">
            <div class="stat-value">{{ galaxy.visits || 0 }}</div>
            <div class="stat-label">访问量</div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="quantum-error">
      <div class="error-icon">🛸</div>
      <p class="error-text">曲率引擎故障！无法连接星域数据库</p>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 */
.galaxy-profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  color: #e0e0e0;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(100, 149, 237, 0.3);
  border-radius: 50%;
  border-top-color: #6495ED;
  animation: spin 1.5s linear infinite;
}

.loading-text {
  margin-top: 20px;
  color: #6495ED;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 2px;
}

/* 卡片样式 */
.galaxy-card {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(100, 149, 237, 0.3);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 0 30px rgba(100, 149, 237, 0.15);
  overflow: hidden;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
  backdrop-filter: blur(10px);
}

.galaxy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 40px rgba(100, 149, 237, 0.25);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.galaxy-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: #e0e0e0;
  letter-spacing: 2px;
  margin: 0;
  position: relative;
  text-shadow: 0 0 10px rgba(100, 149, 237, 0.5);
}

.tag-container {
  display: flex;
  justify-content: flex-end;
}

.tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 星系信息 */
.galaxy-info {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.meta-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #8892b0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-value {
  font-size: 18px;
  color: #e0e0e0;
  padding-left: 5px;
  position: relative;
}

.planets-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 5px;
}

.planet {
  padding: 4px 10px;
  background: rgba(100, 149, 237, 0.1);
  border: 1px solid rgba(100, 149, 237, 0.2);
  border-radius: 15px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.planet:hover {
  background: rgba(100, 149, 237, 0.2);
  transform: translateY(-1px);
}

.empty-planet {
  font-size: 14px;
  color: #8892b0;
}

/* 统计数据 */
.galaxy-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(100, 149, 237, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  border-color: rgba(100, 149, 237, 0.3);
  transform: translateY(-2px);
}

.stat-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  color: #6495ED;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #8892b0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  font-size: 48px;
  color: #ff4d4f;
  margin-bottom: 15px;
}

.error-text {
  font-size: 18px;
  color: #e0e0e0;
}

/* 装饰元素 */
.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(100, 149, 237, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(100, 149, 237, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 149, 237, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

/* 动画效果 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animation-complete .galaxy-card {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>
