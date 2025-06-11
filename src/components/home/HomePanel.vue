<template>
  <!-- 固定在左侧的小按钮 -->
  <div class="panel-toggle" @click="togglePanel">
    <div class="sci-fi-button">
      <span v-if="!isPanelVisible">📡</span>
      <span v-else>🚀</span>
    </div>
  </div>
  <transition name="slide">
    <div
      v-if="isPanelVisible"
      class="sci-fi-user-panel"
      :class="{ loggedIn: isLoggedIn }"
      ref="panel"
    >
    <!-- 未登录状态 -->
     <h2 class="comic-title">星际通行证</h2>
    <div v-if="!isLoggedIn" class="guest-welcome">
      <div class="pixel-spaceship">🛸</div>
      <p class="welcome-title">检测到未经认证的曲速波动！</p>
      <p class="subtext">请验证身份以访问星际机密数据库</p>
      <button @click="navigateToLogin" class="login-beam">启动身份验证光束</button>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="user-dashboard">
      <!-- 用户头像和基本信息 -->
      <div class="user-profile">
        <div class="avatar-wrapper">
          <img v-if="userBrief?.avatarUrl" :src="userBrief?.avatarUrl || '/default-avatar.png'" alt="宇航员头像">
          <div v-else class="cosmic-avatar">👽</div>
          <div class="online-indicator"></div>

        </div>
        <div class="user-meta">
          <h3 class="nickname">{{ userBrief?.nickname || '无名宇航员' }}</h3>
          <p class="user-id">ID: {{ userBrief?.userId || '未知' }}</p>
          <!-- <div class="galaxy-badge">第{{ (userBrief?.userId || 0) % 42 }}星区临时居民</div>
          <div class="knowledge-level">知识等级: {{ knowledgeLevel }}</div> -->
        </div>
      </div>

      <!-- 时间线信息 -->
      <div class="timeline">
        <div class="timeline-event">
          <span class="icon">🛸</span>
          <div class="event-details">
            <span class="event-title">加入星际联邦</span>
            <span class="event-time">{{ formattedCreateTime }}</span>
          </div>
        </div>
        <div class="timeline-event">
          <span class="icon">⏱️</span>
          <div class="event-details">
            <span class="event-title">上次时空跃迁</span>
            <span class="event-time">{{ formattedLastLogin }}</span>
          </div>
        </div>
      </div>

      <!-- 状态提示 -->
      <div class="status-hint" v-if="isInactive">
        ⚠️ 检测到{{ inactivityDays }}天未活动，曲速引擎已结冰，需要热咖啡解冻！
      </div>

      <!-- 科幻数据面板 -->
      <div class="sci-fi-data">
        <!-- <div class="data-item">
          <span class="label">已探索星球</span>
          <span class="value">{{ exploredPlanets }}</span>
        </div> -->
        <div class="data-item">
          <span class="label">通行状态</span>
          <span class="value" v-if="userBrief.status === 0">正常通行</span>
          <span class="not-value" v-else>被通缉</span>
        </div>
      </div>

    </div>

    <!-- 科幻特效元素 -->
    <div class="glow-effect"></div>
    <div class="data-stream">01010101 01110011 01100101 01110010 00100000 01001001 01100100</div>
  </div>
</transition>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { computed, ref } from 'vue'

const router = useRouter()
const userStore = useUserStore()

// 从store获取状态
const { isLoggedIn, userInfo: userBrief } = storeToRefs(userStore)


// 随机生成科幻数据
const exploredPlanets = computed(() => Math.floor((userBrief.value?.userId || 1) * 3.14));


// 时间格式化
const formattedCreateTime = computed(() => {
  if (!userBrief.value?.createTime) return '时间线未知区域'
  return formatCosmicTime(userBrief.value.createTime)
})

const formattedLastLogin = computed(() => {
  if (!userBrief.value?.lastLoginTime) return '尚未进行时空跳跃'
  return formatCosmicTime(userBrief.value.lastLoginTime)
})

// 计算不活跃状态
const isInactive = computed(() => {
  if (!userBrief.value?.lastLoginTime) return false
  const lastLogin = new Date(userBrief.value.lastLoginTime).getTime()
  return Date.now() - lastLogin > 3 * 24 * 60 * 60 * 1000 // 3天未登录
})

const inactivityDays = computed(() => {
  if (!userBrief.value?.lastLoginTime) return 0
  const lastLogin = new Date(userBrief.value.lastLoginTime).getTime()
  return Math.floor((Date.now() - lastLogin) / (24 * 60 * 60 * 1000))
})

// 导航方法
const navigateToLogin = () => router.push('/login')


// 幽默科幻风格的时间格式化
const formatCosmicTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return '就在今天，地球标准时'
  if (diffDays === 1) return '昨天，地球标准时'
  if (diffDays < 7) return `${diffDays}个地球公转日前`

  return `星历${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
}

// 控制面板显示状态的响应式变量
const isPanelVisible = ref(false)
const panel = ref<HTMLElement | null>(null)

// 切换面板显示状态
const togglePanel = () => {
  isPanelVisible.value = !isPanelVisible.value
}


</script>

<style scoped>
.sci-fi-user-panel {
  position: fixed;
  top: 25%;
  left: 3%;
  width: 300px;
  background: rgba(10, 15, 30, 0.132);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  padding: 20px;
  box-shadow:
    0 0 25px rgba(0, 150, 255, 0.4),
    inset 0 0 15px rgba(100, 200, 255, 0.3);
  font-family: 'Courier New', monospace, 'Orbitron', sans-serif;
  z-index: 1000;
  overflow: hidden;
  transform: perspective(800px) rotateY(-2deg);

}

.guest-welcome {
  text-align: center;
  padding: 20px 0;
  position: relative;
}

.welcome-title {
  font-size: 1.2em;
  color: #ff7b00;
  text-shadow: 0 0 8px rgba(255, 123, 0, 0.6);
  margin-bottom: 10px;
}

.pixel-spaceship {
  font-size: 48px;
  margin-bottom: 15px;
  animation: float 3s infinite ease-in-out;
  filter: drop-shadow(0 0 8px rgba(0, 238, 255, 0.8));
}

.guest-welcome p {
  margin: 10px 0;
  color: #b6f9ff;
  line-height: 1.5;
}

.subtext {
  font-size: 0.9em;
  opacity: 0.8;
  font-style: italic;
}

.login-beam {
  background: linear-gradient(45deg, #6a11cb, #2575fc);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px 20px;
  margin-top: 20px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  transition: all 0.3s;
  letter-spacing: 1px;
  text-transform: uppercase;
  box-shadow: 0 0 15px rgba(37, 117, 252, 0.5);
}

.login-beam:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 20px rgba(37, 117, 252, 0.8),
    0 0 30px rgba(106, 17, 203, 0.6);
  background: linear-gradient(45deg, #2575fc, #6a11cb);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  margin-right: 15px;
}

.avatar-wrapper img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #00eeff;
  object-fit: cover;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.4);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background-color: #00ff7f;
  border-radius: 50%;
  border: 2px solid #0a1929;
  box-shadow: 0 0 8px rgba(0, 255, 127, 0.8);
  animation: pulse 2s infinite;
}

.user-status {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: rgba(106, 17, 203, 0.7);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7em;
  color: #00eeff;
}

.user-meta {
  text-align: left;
}

.nickname {
  margin: 0;
  color: #00eeff;
  font-size: 1.4em;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
  letter-spacing: 1px;
  font-weight: bold;
}

.user-id {
  margin: 5px 0;
  font-size: 0.85em;
  color: #9dacff;
  font-family: 'Courier New', monospace;
}

.galaxy-badge {
  background: rgba(106, 17, 203, 0.4);
  padding: 5px 10px;
  border-radius: 15px;
  color:#ffffff;
  font-size: 0.85em;
  display: inline-block;
  margin-top: 8px;
  border: 1px dashed rgba(0, 230, 255, 0.5);
}

.knowledge-level {
  margin-top: 8px;
  font-size: 0.9em;
  color: #ffffff;
}

.timeline {
  border-left: 2px dashed rgba(0, 195, 255, 0.4);
  padding-left: 20px;
  margin-left: 35px;
  margin-bottom: 25px;
}

.timeline-event {
  display: flex;
  margin-bottom: 18px;
  align-items: flex-start;
}

.timeline-event .icon {
  font-size: 1.4em;
  margin-right: 15px;
  margin-top: 3px;
  filter: drop-shadow(0 0 5px rgba(0, 238, 255, 0.7));
}

.event-details {
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 1em;
  color: #9dacff;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.event-time {
  font-size: 0.9em;
  color: #00eeff;
  margin-top: 5px;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 5px rgba(0, 238, 255, 0.5);
}

.status-hint {
  background: rgba(255, 165, 0, 0.25);
  border-left: 3px solid #ffa500;
  padding: 12px 15px;
  border-radius: 10px;
  font-size: 0.9em;
  margin-bottom: 20px;
  color: #ffd700;
  font-style: italic;
  line-height: 1.4;
  box-shadow: inset 0 0 10px rgba(255, 165, 0, 0.3);
}

.sci-fi-data {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 25px;
  background: rgba(20, 30, 60, 0.4);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(0, 195, 255, 0.3);
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 195, 255, 0.2);
}

.data-item:last-child {
  border-bottom: none;
}

.data-item .label {
  font-size: 0.9em;
  color: #9dacff;
}

.data-item .value {
  font-size: 1.2em;
  font-weight: bold;
  color: #00ffaa;

}


.data-item .not-value {
  font-size: 1.2em;
  font-weight: bold;
  color: #f0492bd0;

}

.data-item .small {
  font-size: 0.7em;
  color: #ff7b00;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.warp-button {
  background: linear-gradient(45deg, rgba(37, 117, 252, 0.4), rgba(106, 17, 203, 0.4));
  border: 1px solid rgba(0, 230, 255, 0.8);
  border-radius: 10px;
  color: #00eeff;
  padding: 12px 25px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.4);
}

.warp-button:hover {
  background: linear-gradient(45deg, rgba(37, 117, 252, 0.6), rgba(106, 17, 203, 0.6));
  transform: translateY(-3px);
  box-shadow:
    0 0 20px rgba(37, 117, 252, 0.7),
    0 0 30px rgba(106, 17, 203, 0.5);
  color: #ffffff;
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  border-radius: 12px;
  box-shadow: inset 0 0 40px rgba(0, 100, 255, 0.3);
  pointer-events: none;
  z-index: -1;
}

.data-stream {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.7em;
  color: rgba(0, 230, 255, 0.4);
  font-family: 'Courier New', monospace;
  animation: stream 15s linear infinite;
  white-space: nowrap;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes pulse {
  0% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(0.9); }
}

@keyframes stream {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.comic-title{
  color: #ffffff;
  font-family: none;
  align-items: center;
  text-align: center;
}
/* 固定在左侧的小按钮样式 */
.panel-toggle {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 999;
  padding: 10px 3px;
  cursor: pointer;
}

.sci-fi-button {
  width: 40px;
  height: 40px;
  background: rgba(10, 15, 30, 0.85);
  border: 1px solid rgba(0, 195, 255, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.4);
  transition: all 0.3s ease;
  transform: translateX(-10px);
}

.sci-fi-button:hover {
  transform: translateX(0);
  background: rgba(37, 117, 252, 0.6);
  box-shadow:
    0 0 20px rgba(37, 117, 252, 0.8),
    0 0 30px rgba(106, 17, 203, 0.5);
}

/* 面板滑动动画 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-enter-to, .slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.cosmic-avatar {
  width: 60px;
  height: 60px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-right: 12px;
  border: #00eeff 2px solid;
}

</style>
