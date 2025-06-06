<template>
  <div class="chat-view">
    <!-- 左侧会话列表 -->
    <div class="sessions-panel" :class="{ 'show-mobile': showSessionPanel }">
      <div class="panel-header">
        <h3>消息列表</h3>
        <span class="total-unread" v-if="chatStore.totalUnreadCount > 0">
          {{ chatStore.totalUnreadCount > 99 ? '99+' : chatStore.totalUnreadCount }}
        </span>
        <button class="mobile-close" @click="showSessionPanel = false">×</button>
      </div>

      <div class="sessions-list">
        <div
          v-for="session in chatStore.sessions"
          :key="session.friendUserId"
          @click="selectSession(session)"
          :class="[
            'session-item',
            { active: chatStore.currentChat?.friendUserId === session.friendUserId }
          ]"
        >
          <div class="avatar-wrapper">
            <img
              :src="session.friendAvatar || '/default-avatar.png'"
              :alt="session.friendName"
              class="user-avatar"
            >
            <span v-if="session.isOnline" class="online-dot"></span>
          </div>

          <div class="session-info">
            <div class="session-header">
              <span class="friend-name">{{ session.friendName }}</span>
              <span class="time">{{ formatTime(session.lastMessageTime) }}</span>
            </div>
            <div class="last-message">
              {{ session.lastMessage || '暂无消息' }}
            </div>
          </div>

          <span v-if="session.unreadCount > 0" class="unread-badge">
            {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
          </span>
        </div>

        <div v-if="chatStore.sessions.length === 0" class="empty-sessions">
          <p>暂无聊天记录</p>
        </div>
      </div>
    </div>

    <!-- 右侧聊天窗口 -->
    <div class="chat-panel">
      <template v-if="chatStore.currentChat">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <button class="mobile-menu" @click="showSessionPanel = true">☰</button>
          <div class="chat-user-info">
            <img
              :src="chatStore.currentChat.friendAvatar || '/default-avatar.png'"
              :alt="chatStore.currentChat.friendName"
              class="header-avatar"
            >
            <div class="header-text">
              <h3>{{ chatStore.currentChat.friendName }}</h3>
              <span class="status">
                {{ chatStore.currentChat.isOnline ? '在线' : '离线' }}
              </span>
            </div>
          </div>

          <div class="header-actions">
            <button class="action-btn" title="更多">
              <i class="icon">⋮</i>
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="chatStore.hasMore" class="load-more">
            <button @click="loadMore" :disabled="chatStore.isLoading">
              {{ chatStore.isLoading ? '加载中...' : '加载更多历史消息' }}
            </button>
          </div>

          <div class="messages-list">
            <div
              v-for="(message, index) in chatStore.visibleMessages"
              :key="message.messageId"
              :class="[
                'message-item',
                {
                  'own': message.senderId === currentUserId,
                  'show-time': shouldShowTime(index),
                  'recalled': message.status === 2
                }
              ]"
            >
              <!-- 时间分隔线 -->
              <div v-if="shouldShowTime(index)" class="time-divider">
                {{ formatMessageTime(message.createTime) }}
              </div>

              <!-- 消息内容 -->
              <div class="message-wrapper">
                <img
                  v-if="message.senderId !== currentUserId"
                  :src="message.senderAvatar || chatStore.currentChat.friendAvatar || '/default-avatar.png'"
                  class="message-avatar"
                >

                <div class="message-content">
                  <div class="message-bubble" @contextmenu.prevent="showMessageMenu($event, message)">
                    <!-- 根据消息类型显示不同内容 -->
                    <template v-if="message.status !== 2">
                      <template v-if="message.messageType === 0">
                        {{ message.content }}
                      </template>
                      <template v-else-if="message.messageType === 1">
                        <img :src="message.attachmentUrl" class="message-image" @click="previewImage(message.attachmentUrl)">
                      </template>
                      <template v-else-if="message.messageType === 2">
                        <div class="file-message">
                          <span class="file-icon">📎</span>
                          <a :href="message.attachmentUrl" target="_blank" class="file-link">{{ message.content }}</a>
                        </div>
                      </template>
                    </template>
                    <template v-else>
                      <span class="recalled-text">{{ message.content }}</span>
                    </template>
                  </div>
                  <div class="message-meta">
                    <span class="time">{{ formatTime(message.createTime, true) }}</span>
                    <span v-if="message.senderId === currentUserId && message.status !== 2" class="read-status">
                      {{ message.isRead ? '已读' : '未读' }}
                    </span>
                  </div>
                </div>

                <img
                  v-if="message.senderId === currentUserId"
                  :src="userStore.userInfo?.avatarUrl || '/default-avatar.png'"
                  class="message-avatar"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-toolbar">
            <button class="tool-btn" title="表情" @click="showEmojiPicker = !showEmojiPicker">😊</button>
            <button class="tool-btn" title="图片" @click="selectImage">📷</button>
            <button class="tool-btn" title="文件" @click="selectFile">📎</button>
          </div>

          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              @keydown.enter.prevent="handleEnterKey"
              placeholder="输入消息..."
              class="message-input"
              :disabled="chatStore.isSending"
            ></textarea>

            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || chatStore.isSending"
              class="send-btn"
            >
              {{ chatStore.isSending ? '发送中...' : '发送' }}
            </button>
          </div>

          <!-- 文件上传输入框（隐藏） -->
          <input type="file" ref="imageInput" accept="image/*" style="display: none" @change="handleImageSelect">
          <input type="file" ref="fileInput" style="display: none" @change="handleFileSelect">
        </div>
      </template>

      <!-- 未选择聊天 -->
      <div v-else class="no-chat-selected">
        <div class="empty-icon">💬</div>
        <h3>选择一个聊天开始对话</h3>
        <p>从左侧列表选择好友开始聊天</p>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="showContextMenu" class="context-menu" :style="contextMenuStyle">
      <div class="menu-item" @click="recallMessage" v-if="canRecall">撤回消息</div>
      <div class="menu-item" @click="copyMessage">复制消息</div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImageUrl" class="image-preview" @click="previewImageUrl = ''">
      <img :src="previewImageUrl" alt="预览图片">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useFriendStore } from '@/stores/friend'
import type { ChatSession, PrivateMessageDto } from '@/types/chat'
import { ElMessage } from 'element-plus'

const route = useRoute()
const chatStore = useChatStore()
const userStore = useUserStore()
const friendStore = useFriendStore()

const messagesContainer = ref<HTMLElement>()
const imageInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()
const inputMessage = ref('')
const currentUserId = computed(() => userStore.userInfo?.userId || -1)
const showSessionPanel = ref(false)
const showEmojiPicker = ref(false)
const previewImageUrl = ref('')

// 右键菜单相关
const showContextMenu = ref(false)
const contextMenuStyle = ref({})
const selectedMessage = ref<PrivateMessageDto | null>(null)

// 计算是否可以撤回（2分钟内）
const canRecall = computed(() => {
  if (!selectedMessage.value || selectedMessage.value.senderId !== currentUserId.value) {
    return false
  }

  const createTime = new Date(selectedMessage.value.createTime || 0).getTime()
  const now = Date.now()
  const twoMinutes = 2 * 60 * 1000

  return (now - createTime) < twoMinutes
})

// 选择会话
const selectSession = (session: ChatSession) => {
  chatStore.setCurrentChat(session)
  showSessionPanel.value = false
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || chatStore.isSending) {
    return
  }

  const content = inputMessage.value.trim()
  inputMessage.value = ''

  const message = await chatStore.sendMessage(content)
  if (message) {
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  }
}

// 处理回车键
const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    // Shift+Enter 换行
    return
  }
  // Enter 发送
  sendMessage()
}

// 选择图片
const selectImage = () => {
  imageInput.value?.click()
}

// 选择文件
const selectFile = () => {
  fileInput.value?.click()
}

// 处理图片选择
const handleImageSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 这里需要实现图片上传逻辑
  try {
    // 模拟上传，实际需要调用上传API
    const imageUrl = URL.createObjectURL(file)
    await chatStore.sendMessage(`[图片]`, 1, imageUrl)
    scrollToBottom()
  } catch (error) {
    ElMessage.error('发送图片失败')
  }

  // 清空选择
  target.value = ''
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 这里需要实现文件上传逻辑
  try {
    // 模拟上传，实际需要调用上传API
    const fileUrl = URL.createObjectURL(file)
    await chatStore.sendMessage(file.name, 2, fileUrl)
    scrollToBottom()
  } catch (error) {
    ElMessage.error('发送文件失败')
  }

  // 清空选择
  target.value = ''
}

// 显示消息菜单
const showMessageMenu = (event: MouseEvent, message: PrivateMessageDto) => {
  event.preventDefault()
  selectedMessage.value = message

  // 设置菜单位置
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`
  }

  showContextMenu.value = true

  // 点击其他地方关闭菜单
  const closeMenu = () => {
    showContextMenu.value = false
    document.removeEventListener('click', closeMenu)
  }

  setTimeout(() => {
    document.addEventListener('click', closeMenu)
  }, 0)
}

// 撤回消息
const recallMessage = async () => {
  if (!selectedMessage.value || !selectedMessage.value.messageId) return

  const success = await chatStore.recallMessage(selectedMessage.value.messageId)
  if (success) {
    showContextMenu.value = false
  }
}

// 复制消息
const copyMessage = () => {
  if (selectedMessage.value?.content) {
    navigator.clipboard.writeText(selectedMessage.value.content)
    ElMessage.success('已复制到剪贴板')
  }
  showContextMenu.value = false
}

// 预览图片
const previewImage = (url?: string) => {
  if (url) {
    previewImageUrl.value = url
  }
}

// 加载更多历史消息
const loadMore = async () => {
  await chatStore.loadMessages(true)
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 判断是否显示时间
const shouldShowTime = (index: number) => {
  if (index === 0) return true

  const messages = chatStore.visibleMessages
  const currentMsg = messages[index]
  const prevMsg = messages[index - 1]

  if (!currentMsg.createTime || !prevMsg.createTime) return false

  const currentTime = new Date(currentMsg.createTime).getTime()
  const prevTime = new Date(prevMsg.createTime).getTime()

  // 如果间隔超过5分钟，显示时间
  return currentTime - prevTime > 5 * 60 * 1000
}

// 格式化时间
const formatTime = (time?: string, showSeconds = false) => {
  if (!time) return ''

  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return showSeconds
      ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 本周
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 更早
  return date.toLocaleDateString('zh-CN')
}

// 格式化消息时间（用于时间分隔线）
const formatMessageTime = (time?: string) => {
  if (!time) return ''

  const date = new Date(time)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 监听新消息，自动滚动到底部
watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 生命周期
onMounted(async () => {
  // 加载会话列表
  await chatStore.loadSessions()

  // 获取未读消息总数
  await chatStore.fetchUnreadCount()

  // 如果URL中有friendId参数，直接打开对应的聊天
  const friendId = route.query.friendId
  if (friendId) {
    // 先确保好友列表已加载
    if (friendStore.friendList.length === 0) {
      await friendStore.fetchFriendList()
    }

    // 查找对应的好友
    const friend = friendStore.friendList.find(f => f.friendUserId === Number(friendId))
    if (friend) {
      const session: ChatSession = {
        friendId: friend.friendId || 0,
        friendUserId: friend.friendUserId,
        friendName: friend.friendNickname || '未知用户',
        friendAvatar: friend.friendAvatar,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        isOnline: friend.isOnline
      }

      // 如果会话列表中没有，添加到列表
      const existingSession = chatStore.sessions.find(s => s.friendUserId === friend.friendUserId)
      if (!existingSession) {
        chatStore.sessions.unshift(session)
      }

      // 选中这个会话
      selectSession(existingSession || session)
    }
  }

  // 定期更新未读数
  const unreadInterval = setInterval(() => {
    chatStore.fetchUnreadCount()
  }, 30000) // 每30秒更新一次

  onUnmounted(async() => {
    clearInterval(unreadInterval)
    await userStore.init()
  })
})

onUnmounted(() => {
  // 清理
  chatStore.clearCurrentChat()
})
</script>

<style scoped>
/* 整体布局 */
.chat-view {
  display: flex;
  height: calc(100vh - 80px); /* 减去顶部导航栏高度 */
  background: #0a0e2d;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px;
  box-shadow: 0 0 40px rgba(0, 180, 216, 0.1);
}

/* 左侧会话列表 */
.sessions-panel {
  width: 320px;
  background: rgba(10, 15, 40, 0.8);
  border-right: 1px solid #2a2a5a;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a5a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.panel-header h3 {
  margin: 0;
  color: #f0f0ff;
  font-size: 1.2rem;
}

.total-unread {
  background: #ff6b6b;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}

.mobile-close {
  display: none;
  background: none;
  border: none;
  color: #f0f0ff;
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  background: none;
  border: none;
  color: #90e0ef;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 1rem;
}

/* 会话列表 */
.sessions-list {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.session-item:hover {
  background: rgba(0, 180, 216, 0.1);
}

.session-item.active {
  background: rgba(0, 180, 216, 0.2);
  border-left: 3px solid #00b4d8;
}

.avatar-wrapper {
  position: relative;
  margin-right: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #00ff88;
  border-radius: 50%;
  border: 2px solid #0a0e2d;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.friend-name {
  color: #f0f0ff;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  color: #6c757d;
  font-size: 0.85rem;
}

.last-message {
  color: #a0a0ff;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: #ff6b6b;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.empty-sessions {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

/* 右侧聊天窗口 */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 20, 45, 0.6);
}

/* 聊天头部 */
.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #2a2a5a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 15, 40, 0.8);
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.header-text h3 {
  margin: 0;
  color: #f0f0ff;
  font-size: 1.1rem;
}

.status {
  color: #6c757d;
  font-size: 0.85rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #90e0ef;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(0, 180, 216, 0.2);
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.load-more {
  text-align: center;
  margin-bottom: 1rem;
}

.load-more button {
  padding: 0.5rem 1rem;
  background: rgba(0, 180, 216, 0.2);
  border: 1px solid #00b4d8;
  border-radius: 20px;
  color: #00b4d8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more button:hover:not(:disabled) {
  background: rgba(0, 180, 216, 0.3);
}

.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  flex-direction: column;
}

.time-divider {
  text-align: center;
  color: #6c757d;
  font-size: 0.85rem;
  margin: 1rem 0;
  position: relative;
}

.time-divider::before,
.time-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 80px);
  height: 1px;
  background: #2a2a5a;
}

.time-divider::before {
  left: 0;
}

.time-divider::after {
  right: 0;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.message-item.own .message-wrapper {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.message-item.own .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 0.8rem 1.2rem;
  border-radius: 18px;
  word-wrap: break-word;
  line-height: 1.4;
  cursor: pointer;
}

.message-item:not(.own) .message-bubble {
  background: rgba(0, 180, 216, 0.2);
  color: #f0f0ff;
  border-bottom-left-radius: 4px;
}

.message-item.own .message-bubble {
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item.recalled .message-bubble {
  background: rgba(100, 100, 100, 0.2);
  color: #999;
  font-style: italic;
}

.recalled-text {
  opacity: 0.7;
}

/* 图片消息 */
.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

/* 文件消息 */
.file-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-icon {
  font-size: 1.2rem;
}

.file-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
}

.file-link:hover {
  border-bottom-style: solid;
}

.message-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
  padding: 0 0.5rem;
}

/* 输入区域 */
.input-area {
  border-top: 1px solid #2a2a5a;
  background: rgba(10, 15, 40, 0.8);
  padding: 1rem;
}

.input-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.tool-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.tool-btn:hover {
  background: rgba(0, 180, 216, 0.2);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(15, 20, 45, 0.8);
  border: 1px solid #2a2a5a;
  border-radius: 20px;
  color: #f0f0ff;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  line-height: 1.4;
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: #00b4d8;
}

.send-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 180, 216, 0.3);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 未选择聊天 */
.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-chat-selected h3 {
  color: #a0a0ff;
  margin-bottom: 0.5rem;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: rgba(10, 15, 40, 0.95);
  border: 1px solid #2a2a5a;
  border-radius: 8px;
  padding: 0.5rem;
  z-index: 1000;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.menu-item {
  padding: 0.5rem 1rem;
  color: #f0f0ff;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: rgba(0, 180, 216, 0.2);
}

/* 图片预览 */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.image-preview img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* 滚动条样式 */
.sessions-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.sessions-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.sessions-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 180, 216, 0.3);
  border-radius: 3px;
}

.sessions-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 180, 216, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-view {
    margin: 0;
    border-radius: 0;
    height: calc(100vh - 60px);
  }

  .sessions-panel {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    width: 280px;
  }

  .sessions-panel.show-mobile {
    transform: translateX(0);
  }

  .mobile-close {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .message-content {
    max-width: 80%;
  }
}

@media (max-width: 600px) {
  .sessions-panel {
    width: 100%;
  }
}
</style>
