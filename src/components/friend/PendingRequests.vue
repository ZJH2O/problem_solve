<template>
  <div class="pending-requests-container">
    <div v-if="friendStore.pendingRequests.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>暂无好友请求</h3>
      <p>当有人想与你建立联系时，会在这里显示</p>
    </div>

    <div v-else class="requests-list">
      <div
        v-for="request in friendStore.pendingRequests"
        :key="request.friendId"
        class="request-card"
      >
        <!-- 用户信息 -->
        <div class="user-info">
          <img v-if="request.friendAvatar"
            :src="request.friendAvatar || '/default-avatar.png'"
            :alt="request.friendNickname"
            class="user-avatar"
          >
          <div v-else class="cosmic-avatar">👽</div>
          <div class="user-details">
            <h3 class="user-name">{{ request.friendNickname }}</h3>
            <p class="user-bio">{{ request.friendBio || '暂无简介' }}</p>
          </div>
        </div>

        <!-- 请求信息 -->
        <div class="request-info">
          <div class="info-item">
            <span class="label">来源：</span>
            <span class="value">{{ getSourceText(request.source) }}</span>
          </div>
          <div class="info-item" v-if="request.requestMessage">
            <span class="label">留言：</span>
            <span class="value">{{ request.requestMessage }}</span>
          </div>
          <div class="info-item">
            <span class="label">时间：</span>
            <span class="value">{{ formatDate(request.createTime) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button
            class="btn accept"
            @click="handleAccept(request)"
            :disabled="processing === request.friendId"
          >
            <span v-if="processing === request.friendId">处理中...</span>
            <span v-else>✓ 接受</span>
          </button>
          <button
            class="btn reject"
            @click="handleReject(request)"
            :disabled="processing === request.friendId"
          >
            <span>✗ 拒绝</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFriendStore } from '@/stores/friend'
import type { FriendDto } from '@/types/friend'
import { ElMessage } from 'element-plus'

const friendStore = useFriendStore()
const processing = ref<number | null>(null)

const getSourceText = (source: number) => {
  const sourceMap: Record<number, string> = {
    1: '搜索添加',
    2: '同星系成员',
    3: '评论互动'
  }
  return sourceMap[source] || '未知来源'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知时间'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handleAccept = async (request: FriendDto) => {
  if (!request.friendId) return

  try {
    processing.value = request.friendId
    await friendStore.acceptFriendRequest(request.friendId)
    ElMessage.success(`已接受 ${request.friendNickname} 的好友请求`)
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = null
  }
}

const handleReject = async (request: FriendDto) => {
  if (!request.friendId) return

  try {
    processing.value = request.friendId
    await friendStore.rejectFriendRequest(request.friendId)
    ElMessage.info('已拒绝好友请求')
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = null
  }
}
</script>

<style scoped>
.pending-requests-container {
  min-height: 400px;
}

/* 空状态样式复用 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #f0f0ff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #a0a0ff;
}

/* 请求列表 */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 请求卡片 */
.request-card {
  background: rgba(15, 20, 45, 0.8);
  border: 1px solid #4a4a8a;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.request-card:hover {
  border-color: #00b4d8;
  box-shadow: 0 5px 20px rgba(0, 180, 216, 0.2);
}

/* 用户信息 */
.user-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4a4a8a;
}

.user-details {
  flex: 1;
}

.user-name {
  color: #f0f0ff;
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.user-bio {
  color: #a0a0ff;
  font-size: 0.9rem;
}

/* 请求信息 */
.request-info {
  background: rgba(10, 15, 35, 0.5);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #90e0ef;
  margin-right: 0.5rem;
  min-width: 60px;
}

.value {
  color: #f0f0ff;
  flex: 1;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.accept {
  background: linear-gradient(to right, #00ff88, #00cc66);
  color: white;
}

.btn.reject {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
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
