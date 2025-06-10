<template>
  <div class="messages-view">
    <!-- 星际通讯站头部 -->
    <div class="cosmic-header">
      <div class="header-background">
        <div class="star-field"></div>
        <div class="nebula-effect"></div>
      </div>
      <div class="header-content">
        <h1 class="main-title">星际通讯站</h1>
        <p class="subtitle">接收来自宇宙各处的消息与通知</p>

        <!-- 统计数据 -->
        <div class="stats-row">
          <div class="stat-item" v-for="(count, type) in notificationStore.unreadCount.byType" :key="type">
            <span class="stat-icon">{{ typeInfo[type]?.icon }}</span>
            <span class="stat-value">{{ count }}</span>
            <span class="stat-label">{{ typeInfo[type]?.name }}</span>
          </div>
          <div class="stat-item total">
            <span class="stat-icon">📬</span>
            <span class="stat-value">{{ notificationStore.unreadCount.total }}</span>
            <span class="stat-label">总未读</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <!-- 筛选按钮 -->
      <div class="filter-buttons">
        <button
          @click="handleTypeClick(null)"
          :class="['filter-btn', { active: notificationStore.selectedType === null }]"
        >
          全部消息
        </button>
        <button
          v-for="type in notificationTypes"
          :key="type.value"
          @click="handleTypeClick(type.value)"
          :class="['filter-btn', { active: notificationStore.selectedType === type.value }]"
        >
          <span>{{ type.icon }}</span>
          {{ type.label }}
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          @click="notificationStore.toggleUnreadOnly()"
          :class="['action-btn', { active: notificationStore.showUnreadOnly }]"
        >
          <span>🔴</span>
          只看未读
        </button>
        <button
          @click="markAllAsRead"
          class="action-btn"
          :disabled="notificationStore.unreadCount.total === 0"
        >
          <span>✅</span>
          全部已读
        </button>
      </div>
    </div>

    <!-- 通知列表容器 -->
    <div class="notifications-container">
      <!-- 加载状态 -->
      <div v-if="notificationStore.isLoading && notificationStore.notifications.length === 0" class="loading-state">
        <div class="quantum-loader">
          <div class="loader-core"></div>
          <div class="loader-ring"></div>
        </div>
        <p>正在接收星际信号...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">🛸</div>
        <h3>暂无消息</h3>
        <p>{{ notificationStore.showUnreadOnly ? '没有未读消息' : '消息中心空空如也' }}</p>
      </div>

      <!-- 通知列表 -->
      <div v-else class="notifications-list">
        <TransitionGroup name="notification-list">
          <NotificationItem
            v-for="notification in filteredNotifications"
            :key="notification.notificationId"
            :notification="notification"
            @read="handleRead"
            @delete="handleDelete"
          />
        </TransitionGroup>
        <!-- 分页控件 -->
        <div class="pagination-controls">
          <button
            @click="prevPage"
            :disabled="notificationStore.currentPage === 1"
            class="page-btn"
          >
            上一页
          </button>

          <span class="page-info">
            第 {{ notificationStore.currentPage }} 页 / 共 {{ notificationStore.totalPages }} 页
          </span>

          <button
            @click="nextPage"
            :disabled="notificationStore.currentPage >= notificationStore.totalPages"
            class="page-btn"
          >
            下一页
          </button>
        </div>
        <!-- 加载更多 -->
        <div v-if="notificationStore.hasMore" class="load-more">
          <button
            @click="loadMore"
            class="load-more-btn"
            :disabled="notificationStore.isLoading"
          >
            <span v-if="notificationStore.isLoading">加载中...</span>
            <span v-else>探索更多消息</span>
          </button>
        </div>
      </div>
    </div>

    <!-- WebSocket连接状态 -->
    <div class="connection-status" :class="{ connected: wsConnected }">
      <span class="status-icon">{{ wsConnected ? '🟢' : '🔴' }}</span>
      <span class="status-text">{{ wsConnected ? '实时连接' : '离线模式' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import NotificationItem from '@/components/notification/NotificationItem.vue'
import webSocketService from '@/services/websocket'

import { useUserStore } from '@/stores/user'

const notificationStore = useNotificationStore()
const wsConnected = ref(false)
const userStore = useUserStore()
// 通知类型配置
const notificationTypes = [
  { value: 1, label: '星系评论回复', icon: '💬' },
  { value: 2, label: '星系评论点赞', icon: '👍' },
  { value: 3, label: '星系新评论', icon: '📝' },
  { value: 4, label: '星球评论回复', icon: '💬' },
  { value: 5, label: '星球评论点赞', icon: '👍' },
  { value: 6, label: '星球新评论', icon: '📝' },
  { value: 7, label: '系统通知', icon: '📢' },
  { value: 8, label: '星系管理员任命通知', icon: '📬' }
]

// 类型信息映射
const typeInfo = computed(() => {
  const info: Record<number, any> = {}
  for (let i = 1; i <= 8; i++) {
    info[i] = notificationStore.getTypeInfo(i)
  }
  return info
})

// 过滤后的通知
const filteredNotifications = computed(() => {
  let notifications = notificationStore.notifications

  if (notificationStore.showUnreadOnly) {
    notifications = notifications.filter(n => n.isRead === 0)
  }

  return notifications
})

// 处理已读
const handleRead = async (notification: any) => {
  if (notification.isRead === 0) {
    await notificationStore.markAsRead(notification.notificationId)
  }

  // 跳转到目标页面
  if (notification.jumpUrl) {
    window.location.href = notification.jumpUrl
  }
}

// 处理删除
const handleDelete = async (notification: any) => {
  try {

    await notificationStore.deleteNotification(notification.notificationId,userStore.userInfo.userId)
  } catch (error) {
    // 用户取消
  }
}

// 在handleTypeClick方法中，添加分页重置逻辑
const handleTypeClick = async (typeValue: number | null) => {
  try {
    // 设置当前选中的类型
    notificationStore.setFilterType(typeValue)

    // 重置到第一页
    notificationStore.resetPage()

    // 确保用户信息已初始化
    await userStore.init()

    if (!userStore.userInfo.userId) {
      throw new Error("用户信息未初始化，无法获取通知")
    }

    // 加载对应类型的通知
    await notificationStore.fetchNotifications({
      page: notificationStore.currentPage,
      size: notificationStore.pageSize,
      userId: userStore.userInfo.userId,
      type: typeValue
    })

  } catch (error) {
    console.error("加载通知失败:", error)
  }
}


// 分页导航方法
const prevPage = async () => {
  if (notificationStore.currentPage > 1) {
    notificationStore.setPage(notificationStore.currentPage - 1)
    await reloadNotifications()
  }
}

const nextPage = async () => {
  if (notificationStore.currentPage < notificationStore.totalPages) {
    notificationStore.setPage(notificationStore.currentPage + 1)
    await reloadNotifications()
  }
}

// 重新加载通知
const reloadNotifications = async () => {
  await userStore.init()
  if (!userStore.userInfo.userId) return

  await notificationStore.fetchNotifications({
    page: notificationStore.currentPage,
    size: notificationStore.pageSize,
    userId: userStore.userInfo.userId,
    type: notificationStore.selectedType
  })
}
// 全部标记为已读
const markAllAsRead = async () => {
  try {

    await notificationStore.markAllAsRead()
  } catch (error) {
    // 用户取消
  }
}

// 加载更多
const loadMore = () => {
  notificationStore.loadMore()
}

// 生命周期
onMounted(async () => {
  await userStore.init()
  // 确保userStore已初始化且包含userId
  if (!userStore.userInfo.userId) {
      throw new Error("用户信息未初始化，无法获取通知");
  }
  // 加载通知列表
  await notificationStore.fetchNotifications({
    page: 1,
    size: 30,
    userId:userStore.userInfo.userId
  })

  // 加载未读数量
  await notificationStore.fetchUnreadCount()

  // 连接WebSocket
  webSocketService.connect()

  // 检查连接状态
  const checkConnection = setInterval(() => {
    wsConnected.value = webSocketService.connected
  }, 1000)

  // 清理定时器
  onUnmounted(() => {
    clearInterval(checkConnection)
  })
})

onUnmounted(async() => {

  // 断开WebSocket连接
  webSocketService.disconnect()
})
</script>

<style scoped>
.messages-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  position: relative;
}

/* 宇宙主题头部 */
.cosmic-header {
  position: relative;
  margin-bottom: 2rem;
  border-radius: 20px;
  overflow: hidden;
  background: #0a0e2d;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.star-field {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, #ddd, transparent),
    radial-gradient(1px 1px at 50px 90px, #fff, transparent);
  background-size: 200px 200px;
  animation: drift 60s linear infinite;
}

@keyframes drift {
  from { transform: translate(-100px, -100px); }
  to { transform: translate(100px, 100px); }
}

.nebula-effect {
  position: absolute;
  width: 150%;
  height: 150%;
  background: radial-gradient(ellipse at center,
    rgba(138, 43, 226, 0.3) 0%,
    transparent 40%);
  animation: rotate 120s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 3rem 2rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(to right, #00b4d8, #90e0ef, #00b4d8);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.subtitle {
  color: #a0a0ff;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

/* 统计数据 */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 100px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
}

.stat-item.total {
  background: rgba(0, 180, 216, 0.2);
  border-color: #00b4d8;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00b4d8;
  font-family: 'Orbitron', monospace;
}

.stat-label {
  font-size: 0.9rem;
  color: #a0a0ff;
  margin-top: 0.3rem;
}

/* 控制面板 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
  background: rgba(10, 15, 40, 0.6);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #2a2a5a;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #4a4a8a;
  border-radius: 20px;
  color: #90e0ef;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.filter-btn:hover {
  background: rgba(0, 180, 216, 0.1);
  border-color: #00b4d8;
}

.filter-btn.active {
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #4a4a8a;
  border-radius: 8px;
  color: #90e0ef;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.active {
  background: rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* 通知容器 */
.notifications-container {
  background: rgba(10, 15, 40, 0.4);
  border-radius: 12px;
  padding: 2rem;
  min-height: 500px;
  border: 1px solid #2a2a5a;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.quantum-loader {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.loader-core {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #00b4d8;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px #00b4d8;
  animation: pulse 2s ease-in-out infinite;
}

.loader-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 180, 216, 0.3);
  border-radius: 50%;
  border-top-color: #00b4d8;
  animation: spin 1.5s linear infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.empty-state h3 {
  color: #f0f0ff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #a0a0ff;
}

/* 通知列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 列表动画 */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.5s ease;
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #4a00e0, #8e2de2);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.load-more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.load-more-btn:hover::before {
  left: 100%;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 连接状态 */
.connection-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(10, 15, 40, 0.9);
  border: 1px solid #4a4a8a;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  z-index: 100;
}

.connection-status.connected {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.status-icon {
  font-size: 0.8rem;
}

.status-text {
  color: #90e0ef;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .stats-row {
    gap: 1rem;
  }

  .stat-item {
    min-width: 80px;
    padding: 0.8rem;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-buttons,
  .action-buttons {
    justify-content: center;
  }

  .notifications-container {
    padding: 1rem;
  }
}

/* 分页控件样式 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.page-btn {
  padding: 8px 20px;
  background: rgba(0, 180, 216, 0.2);
  border: 1px solid #00b4d8;
  border-radius: 20px;
  color: #90e0ef;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 180, 216, 0.4);
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #90e0ef;
  font-size: 0.95rem;
  font-family: 'Orbitron', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    gap: 10px;
  }

  .page-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
