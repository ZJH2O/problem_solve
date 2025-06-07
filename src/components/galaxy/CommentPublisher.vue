<template>
  <div class="quantum-transmitter cosmic-bg">
    <!-- 粒子背景 -->


    <!-- 发射器状态 -->
    <div class="transmitter-status">
      <div class="energy-bar" :style="{ width: (newComment.content.length / 200 * 100) + '%' }"></div>
      <span class="frequency-indicator">📡 星际频段：#{{ galaxyId }}</span>
    </div>

    <!-- 量子输入场 -->
    <div class="quantum-field">
      <div class="hologram-grid"></div>
      <textarea
        v-model="newComment.content"
        class="hologram-input"
        placeholder="输入你的星际观察..."
        maxlength="200"
      ></textarea>
      <div class="character-counter">
        {{ newComment.content.length }}/200 量子比特
      </div>
    </div>

    <!-- 发射按钮 -->
    <button
      @click="submitComment"
      class="plasma-launcher"
      :disabled="!newComment.content.trim() || submitting"
    >
      <span class="energy-core"></span>
      <span class="launch-text">
        <span v-if="submitting">🛸 传送中...</span>
        <span v-else>发射到星域网络</span>
      </span>
      <div class="trail-effect"></div>
    </button>

    <!-- 系统提示 -->
    <div class="system-alert" v-if="newComment.content.length >= 190">
      ⚠️ 能量过载！接近量子承载极限
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="quantum-error">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGalaxyCommentStore } from '@/stores/galaxyComment'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  galaxyId: string
  userId: number
}>()

const commentStore = useGalaxyCommentStore()
const newComment = ref({
  content: '',
  parentId: undefined as number | undefined
})
const submitting = ref(false)
const errorMessage = ref('')

// 提交评论
const submitComment = async () => {
  if (!newComment.value.content.trim()) return

  submitting.value = true
  errorMessage.value = ''

  try {
    // 调用store发布评论
    await commentStore.publishComment({
      galaxyId: props.galaxyId,
      userId: props.userId,
      content: newComment.value.content,
      parentId: newComment.value.parentId
    })

    // 清空输入
    newComment.value.content = ''



  } catch (error: any) {
    console.error('量子传送失败:', error)
    errorMessage.value = `星际传输中断: ${error.message || '未知错误'}`
  } finally {
    submitting.value = false
  }
}

// 暴露方法供父组件设置回复
const setReplyTarget = (parentId: number) => {
  newComment.value.parentId = parentId
  ElMessage.info({
    message: '已锁定回复目标，开始输入回复内容',
    customClass: 'cosmic-message'
  })
}

defineExpose({ setReplyTarget })


</script>

<style scoped>
/* 宇宙背景 */
.quantum-transmitter {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f9e 100%);

  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.15);
}

/* 粒子背景 */
.cosmic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 9px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 5px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 10px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  opacity: 0.6;
  z-index: 0;
}

.transmitter-status {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #6c8ba5;
  font-size: 0.9em;
  position: relative;
  z-index: 2;
}

.energy-bar {
  height: 3px;
  background: linear-gradient(90deg, #4fc3f7, #7e57c2);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.frequency-indicator {
  margin-left: 1rem;
  opacity: 0.8;
}

.quantum-field {
  position: relative;
  margin-bottom: 1.5rem;
  background: rgba(10, 25, 47, 0.557);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 2;
}

.hologram-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(79, 195, 247, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 195, 247, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}

.hologram-input {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #e0f7fa;
  font-family: 'Courier New', monospace;
  resize: vertical;
  position: relative;
  z-index: 2;
  font-size: 1rem;
}

.hologram-input:focus {
  outline: none;
  box-shadow: 0 0 15px rgba(79, 195, 247, 0.4);
}

.character-counter {
  text-align: right;
  padding: 0.5rem;
  font-size: 0.8em;
  color: #6c8ba5;
}

.plasma-launcher {
  position: relative;
  background: linear-gradient(45deg, #7e57c2, #29b6f6);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  overflow: hidden;
  transition: 0.3s all ease;
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
  font-size: 1rem;
  z-index: 2;
}

.plasma-launcher:disabled {
  opacity: 0.5;
  filter: grayscale(0.8);
  cursor: not-allowed;
}

.energy-core {
  display: block;
  position: absolute;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.6;
  left: 20%;
  transition: 0.3s ease;
}

.launch-text {
  position: relative;
  z-index: 2;
}

.trail-effect {
  position: absolute;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #ffffff30 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  transition: 0.4s ease;
}

.plasma-launcher:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(79, 195, 247, 0.5);
}

.plasma-launcher:hover:not(:disabled) .trail-effect {
  transform: translateX(100%);
}

.system-alert {
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(239, 83, 80, 0.2);
  border-left: 3px solid #ef5350;
  color: #ffcdd2;
  border-radius: 4px;
  animation: alert-pulse 1.5s infinite;
}

@keyframes alert-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.quantum-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
  padding: 0.8rem;
  background: rgba(239, 83, 80, 0.15);
  border: 1px solid rgba(239, 83, 80, 0.3);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.2rem;
  color: #ef5350;
}

.error-text {
  color: #ffcdd2;
  font-size: 0.9rem;
}
</style>

<style>
/* 全局消息样式 */
.cosmic-message {
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  color: #e0f7fa !important;
  backdrop-filter: blur(10px);
}
</style>
