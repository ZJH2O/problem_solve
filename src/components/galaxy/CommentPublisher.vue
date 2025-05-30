<script setup lang="ts">
import { ref } from 'vue'
import { useGalaxyCommentStore } from '@/stores/galaxyComment'

const props = defineProps<{
  galaxyId: number
  userId: number
}>()

const commentStore = useGalaxyCommentStore()
const newComment = ref({
  content: '',
  parentId: undefined as number | undefined
})

const submit = async () => {
  if (!newComment.value.content.trim()) return

  try {
    await commentStore.publishComment({
      galaxyId: props.galaxyId,
      userId: props.userId,
      content: newComment.value.content,
    })
    newComment.value.content = ''
  } catch (error) {
    console.error('发布评论失败:', error)
  }
}
</script>

<template>
  <div class="quantum-transmitter">
    <!-- 发射器状态指示 -->
    <div class="transmitter-status">
      <div class="energy-bar" :style="{ width: (newComment.content.length / 200 * 100) + '%' }"></div>
      <span class="frequency-indicator">📡 当前频段：#{galaxyId}</span>
    </div>

    <!-- 量子输入场 -->
    <div class="quantum-field">
      <div class="particle-effect"></div>
      <textarea
        v-model="newComment.content"
        class="hologram-input"
        placeholder="键入量子讯息..."
        maxlength="200"
      ></textarea>
      <div class="character-counter">
        {{ newComment.content.length }}/200 量子比特
      </div>
    </div>

    <!-- 发射按钮 -->
    <button
      @click="submit"
      class="plasma-launcher"
      :disabled="!newComment.content.trim()"
    >
      <span class="energy-core"></span>
      <span class="launch-text">发射量子讯息</span>
      <div class="trail-effect"></div>
    </button>

    <!-- 系统提示 -->
    <div class="system-alert" v-if="newComment.content.length >= 190">
      ⚠️ 能量过载警告！接近量子承载极限
    </div>
  </div>
</template>

<style scoped>
.quantum-transmitter {
  background: #0a192f;
  border: 1px solid #1d3d5c;
  border-radius: 8px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.transmitter-status {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #6c8ba5;
  font-size: 0.9em;
}

.energy-bar {
  height: 2px;
  background: linear-gradient(90deg, #4dabf7, #8a2be2);
  transition: width 0.3s ease;
}

.frequency-indicator {
  margin-left: 1rem;
  opacity: 0.8;
}

.quantum-field {
  position: relative;
  margin-bottom: 1.5rem;
  background: #0f2740;
  border-radius: 6px;
  overflow: hidden;
}

.hologram-input {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #c3e4fd;
  font-family: 'Courier New', monospace;
  resize: vertical;
  position: relative;
  z-index: 2;
}

.hologram-input:focus {
  outline: none;
  box-shadow: 0 0 10px #4dabf755;
}

.particle-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent 50%,
    #4dabf710 50%,
    #8a2be210 100%
  );
  background-size: 10px 10px;
  opacity: 0.3;
  pointer-events: none;
}

.character-counter {
  text-align: right;
  padding: 0.5rem;
  font-size: 0.8em;
  color: #6c8ba5;
}

.plasma-launcher {
  position: relative;
  background: linear-gradient(45deg, #4dabf7, #8a2be2);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  overflow: hidden;
  transition: 0.3s all ease;
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
  box-shadow: 0 0 20px #4dabf755;
}

.plasma-launcher:hover:not(:disabled) .trail-effect {
  transform: translateX(100%);
}

.system-alert {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #8a2be230;
  border-left: 3px solid #8a2be2;
  color: #c3e4fd;
  font-size: 0.85em;
  animation: alert-pulse 1.5s infinite;
}

@keyframes alert-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}
</style>
