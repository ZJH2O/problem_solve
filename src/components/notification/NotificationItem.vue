<template>
  <div
    class="notification-item"
    :class="{
      unread: notification.isRead === 0,
      [`type-${notification.type}`]: true
    }"
    @click="handleClick"
  >
    <!-- 类型图标 -->
    <div class="type-icon" :style="{ backgroundColor: typeInfo.color }">
      <span>{{ typeInfo.icon }}</span>
    </div>

    <!-- 通知内容 -->
    <div class="notification-content">
      <!-- 头部信息 -->
      <div class="notification-header">
        <div class="sender-info" v-if="notification.senderName">
          <img
            v-if="notification.senderAvatar"
            :src="notification.senderAvatar"
            :alt="notification.senderName"
            class="sender-avatar"
          >
          <span class="sender-name">{{ notification.senderName }}</span>
        </div>
        <span class="time-ago">{{ notification.createTimeAgo || formatTimeAgo(notification.createTime) }}</span>
      </div>

      <!-- 标题 -->
      <h4 class="notification-title">{{ notification.title }}</h4>

      <!-- 内容预览 -->
      <p v-if="notification.content" class="notification-text">
        {{ notification.content }}
      </p>

      <!-- 目标信息 -->
      <div v-if="notification.targetTitle" class="target-info">
        <span class="target-label">相关内容：</span>
        <span class="target-title">{{ notification.targetTitle }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="notification-actions">
      <button
        v-if="notification.isRead === 0"
        @click.stop="markAsRead"
        class="action-btn read-btn"
        title="标记为已读"
      >
        <span>✓</span>
      </button>
      <button
        @click.stop="deleteNotification"
        class="action-btn delete-btn"
        title="删除"
      >
        <span>×</span>
      </button>
    </div>

    <!-- 未读标记 -->
    <div v-if="notification.isRead === 0" class="unread-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NotificationDto } from '@/types/notification'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps<{
  notification: NotificationDto
}>()

const emit = defineEmits<{
  read: [notification: NotificationDto]
  delete: [notification: NotificationDto]
}>()

const notificationStore = useNotificationStore()

// 获取类型信息
const typeInfo = computed(() =>
  notificationStore.getTypeInfo(props.notification.type)
)

// 格式化时间
const formatTimeAgo = (time?: string) => {
  if (!time) return ''

  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString()
}

// 处理点击
const handleClick = () => {
  emit('read', props.notification)
}

// 标记为已读
const markAsRead = () => {
  if (props.notification.isRead === 0) {
    notificationStore.markAsRead(props.notification.notificationId)
  }
}

// 删除通知
const deleteNotification = () => {
  emit('delete', props.notification)
}
</script>

<style scoped>
.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1.2rem;
  background: rgba(15, 20, 45, 0.6);
  border: 1px solid #2a2a5a;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.notification-item:hover {
  background: rgba(15, 20, 45, 0.8);
  transform: translateX(5px);
  border-color: #4a4a8a;
}

.notification-item.unread {
  background: rgba(0, 180, 216, 0.05);
  border-color: rgba(0, 180, 216, 0.3);
}

/* 类型图标 */
.type-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(100, 200, 250, 0.2);
  position: relative;
}

.notification-item.unread .type-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  opacity: 0.5;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* 通知内容 */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sender-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.sender-name {
  color: #90e0ef;
  font-size: 0.9rem;
  font-weight: 500;
}

.time-ago {
  color: #6c757d;
  font-size: 0.85rem;
}

.notification-title {
  color: #f0f0ff;
  font-size: 1rem;
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.notification-text {
  color: #a0a0ff;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.target-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.target-label {
  color: #90e0ef;
}

.target-title {
  color: #a0a0ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 操作按钮 */
.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.read-btn {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.read-btn:hover {
  background: rgba(0, 255, 136, 0.3);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.3);
  transform: scale(1.1);
}

/* 未读标记 */
.unread-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #00b4d8, #0077b6);
  box-shadow: 0 0 10px rgba(0, 180, 216, 0.5);
}

/* 类型特定样式 */
.notification-item.type-1 .type-icon,
.notification-item.type-4 .type-icon {
  background: rgba(0, 180, 216, 0.2);
}

.notification-item.type-2 .type-icon,
.notification-item.type-5 .type-icon {
  background: rgba(255, 107, 107, 0.2);
}

.notification-item.type-3 .type-icon,
.notification-item.type-6 .type-icon {
  background: rgba(78, 205, 196, 0.2);
}

.notification-item.type-7 .type-icon {
  background: rgba(157, 78, 221, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-item {
    padding: 1rem;
  }

  .type-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .notification-actions {
    opacity: 1;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
}
</style>
