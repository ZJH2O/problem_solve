<!-- src/components/StellarAlert.vue -->
<template>
  <transition name="stellar-fade">
    <div v-if="show" class="stellar-alert" :class="[typeClass, { 'has-close': closable }]">
      <div class="alert-glow"></div>
      <div class="alert-content">
        <span class="alert-message">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<{
  type?: 'error' | 'warning' | 'success'
  duration?: number
  closable?: boolean
}>(), {
  type: 'error',
  duration: 4000,
  closable: true
})

const userStore = useUserStore()
const show = ref(false)
let timeoutId: number | null = null

const message = computed(() => userStore.error)
const typeClass = computed(() => `alert-${props.type}`)


watch(() => userStore.error, (newVal) => {
  if (newVal) {
    show.value = true
    startTimer()
  }
})

const startTimer = () => {
  if (timeoutId) clearTimeout(timeoutId)
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const close = () => {
  show.value = false
  userStore.clearError()
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}
</script>

<style scoped>
.stellar-alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
  padding: 15px 25px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  box-shadow: 0 0 25px rgba(0, 247, 255, 0.2);
  border: 1px solid;
}

.alert-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg,
    rgba(255, 50, 50, 0.1) 0%,
    rgba(255, 50, 50, 0.05) 100%
  );
  filter: blur(15px);
  z-index: -1;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-icon {
  font-size: 1.2em;
  min-width: 24px;
  text-align: center;
}

.alert-message {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.5px;
}

.alert-close {
  cursor: pointer;
  margin-left: auto;
  padding-left: 15px;
  transition: all 0.3s ease;
}

/* 不同类型样式 */
.alert-error {
  background: rgba(173, 31, 71, 0.15);
  border-color: #ff3860;
  color: #ff3860;
}

.alert-warning {
  background: rgba(255, 168, 0, 0.15);
  border-color: #ffdd57;
  color: #ffdd57;
}

.alert-success {
  background: rgba(35, 209, 96, 0.15);
  border-color: #00f7ff;
  color: #00f7ff;
}

/* 动画 */
.stellar-fade-enter-active,
.stellar-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.stellar-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -30px);
}

.stellar-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
