<template>
  <div class="friend-view">
    <!-- 顶部标题 -->
    <div class="stellar-header">
      <h1 class="main-title">社交宇宙</h1>
      <p class="subtitle">在星际航行中结识志同道合的探索者</p>
    </div>

    <!-- 功能标签页 -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 好友列表 -->
      <FriendList v-if="activeTab === 'friends'" />

      <!-- 待处理请求 -->
      <PendingRequests v-if="activeTab === 'pending'" />

      <!-- 添加好友 -->
      <AddFriend v-if="activeTab === 'add'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import FriendList from '@/components/friend/FriendList.vue'
import PendingRequests from '@/components/friend/PendingRequests.vue'
import AddFriend from '@/components/friend/AddFriend.vue'

const friendStore = useFriendStore()
const activeTab = ref('friends')

const tabs = computed(() => [
  { key: 'friends', label: '我的好友', icon: '👥' },
  { key: 'pending', label: '好友请求', icon: '📨', count: friendStore.pendingCount },
  { key: 'add', label: '添加好友', icon: '🔍' }
])

onMounted(async () => {
  // 初始化数据
  await Promise.all([
    friendStore.fetchFriendList(),
    friendStore.fetchPendingRequests()
  ])
})
</script>

<style scoped>
.friend-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 头部样式 */
.stellar-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0e2d 0%, #1a1f3a 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.stellar-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(to right, #00b4d8, #90e0ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.subtitle {
  color: #a0a0ff;
  font-size: 1.2rem;
  position: relative;
  z-index: 1;
}

/* 标签导航 */
.tab-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(10, 15, 40, 0.6);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #2a2a5a;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  color: #90e0ef;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button:hover {
  background: rgba(0, 180, 216, 0.1);
  border-color: #00b4d8;
}

.tab-button.active {
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-count {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ff6b6b;
  color: white;
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: bold;
}

/* 内容区域 */
.content-area {
  background: rgba(10, 15, 40, 0.4);
  border-radius: 12px;
  padding: 2rem;
  min-height: 500px;
  border: 1px solid #2a2a5a;
}
</style>
