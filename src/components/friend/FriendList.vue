<template>
  <div class="friend-list-container">
    <div v-if="friendStore.isLoading" class="loading-state">
      <div class="quantum-loader">
        <div class="loader-ring"></div>
        <p>正在连接社交网络...</p>
      </div>
    </div>

    <div v-else-if="friendStore.acceptedFriends.length === 0" class="empty-state">
      <div class="empty-icon">👽</div>
      <h3>还没有添加好友</h3>
      <p>开始探索宇宙，结识新的伙伴吧！</p>
    </div>

    <div v-else class="friends-grid">
      <div
        v-for="friend in friendStore.acceptedFriends"
        :key="friend.friendId"
        class="friend-card"
        :class="{ online: friend.isOnline }"
      >
        <!-- 头像区域 -->
        <div class="avatar-section">
          <img
            :src="friend.friendAvatar || '/default-avatar.png'"
            :alt="friend.friendNickname"
            class="friend-avatar"
          >
          <div class="online-indicator" v-if="friend.isOnline"></div>
        </div>

        <!-- 信息区域 -->
        <div class="info-section">
          <h3 class="friend-name">{{ friend.friendNickname }}</h3>
          <p class="friend-bio">{{ friend.friendBio || '这个人很神秘，什么都没留下...' }}</p>

          <div class="meta-info">
            <span class="meta-item">
              <i class="icon">💬</i>
              {{ friend.unreadCount || 0 }} 条未读
            </span>
            <span class="meta-item" v-if="friend.lastChatTime">
              <i class="icon">🕒</i>
              {{ formatTime(friend.lastChatTime) }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="action-btn chat" @click="startChat(friend)">
            <span>💬</span>
            聊天
          </button>
          <button class="action-btn delete" @click="removeFriend(friend)">
            <span>❌</span>
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFriendStore } from '@/stores/friend'
import type { FriendDto } from '@/types/friend'
import { ElMessageBox, ElMessage } from 'element-plus'

const friendStore = useFriendStore()

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()

}

const startChat = (friend: FriendDto) => {
  // TODO: 导航到聊天页面
  console.log('开始聊天:', friend.friendNickname)
}

const removeFriend = async (friend: FriendDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除好友 ${friend.friendNickname} 吗？`,
      '删除好友',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await friendStore.deleteFriend(friend.friendUserId)
    ElMessage.success('已删除好友')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.friend-list-container {
  min-height: 400px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.quantum-loader {
  text-align: center;
}

.loader-ring {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(0, 180, 216, 0.3);
  border-radius: 50%;
  border-top-color: #00b4d8;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
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
}

.empty-state h3 {
  color: #f0f0ff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #a0a0ff;
}

/* 好友网格 */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* 好友卡片 */
.friend-card {
  background: rgba(15, 20, 45, 0.8);
  border: 1px solid #2a2a5a;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 180, 216, 0.2);
  border-color: #00b4d8;
}

.friend-card.online {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
}

/* 头像区域 */
.avatar-section {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.friend-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #2a2a5a;
}

.online-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background: #00ff88;
  border-radius: 50%;
  border: 3px solid #0a0e2d;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
}

/* 信息区域 */
.info-section {
  text-align: center;
  flex: 1;
}

.friend-name {
  color: #f0f0ff;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.friend-bio {
  color: #a0a0ff;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.meta-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #90e0ef;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn.chat {
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
}

.action-btn.delete {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
</style>
