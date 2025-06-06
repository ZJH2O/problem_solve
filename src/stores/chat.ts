import { defineStore } from 'pinia'
import type { PrivateMessageDto, ChatSession, SendMessageRequest, ResponseMessage } from '@/types/chat'
import service from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 当前聊天的好友信息
    currentChat: null as ChatSession | null,
    // 消息列表（当前会话）
    messages: [] as PrivateMessageDto[],
    // 所有聊天会话列表
    sessions: [] as ChatSession[],
    // 加载状态
    isLoading: false,
    isSending: false,
    // 分页信息
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    // 未读消息总数
    totalUnreadCount: 0
  }),

  getters: {
    // 按时间排序的消息（最新的在底部）
    sortedMessages: (state) =>
      [...state.messages].sort((a, b) =>
        new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime()
      ),

    // 获取当前聊天对象的ID
    currentReceiverId: (state) =>
      state.currentChat?.friendUserId || null,

    // 过滤掉已撤回的消息
    visibleMessages: (state) =>
      state.sortedMessages.filter(msg => msg.status !== 2)
  },

  actions: {
    // 设置当前聊天会话
    setCurrentChat(session: ChatSession) {
      this.currentChat = session
      this.messages = []
      this.currentPage = 1
      this.hasMore = true

      // 加载聊天记录
      this.loadMessages()
    },

    // 加载聊天记录（使用新的API路径）
    async loadMessages(loadMore = false) {
      if (!this.currentChat || this.isLoading || (!loadMore && this.messages.length > 0)) {
        return
      }

      try {
        this.isLoading = true

        // 使用新的API路径格式
        const response = await service.get<ResponseMessage<PrivateMessageDto[]>>(
          `/message/history/${this.currentChat.friendUserId}`,
          {
            params: {
              page: loadMore ? this.currentPage + 1 : 1,
              size: this.pageSize
            }
          }
        )

        if (response.data.code === 200) {
          const newMessages = response.data.data || []

          if (loadMore) {
            // 加载更多：添加到顶部
            this.messages = [...newMessages.reverse(), ...this.messages]
            this.currentPage++
          } else {
            // 初始加载
            this.messages = newMessages.reverse()
          }

          this.hasMore = newMessages.length === this.pageSize

          // 标记消息为已读
          if (newMessages.some(msg => msg.senderId === this.currentChat?.friendUserId && msg.isRead === 0)) {
            this.markMessagesAsRead()
          }

          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('加载聊天记录失败')
        return false
      } finally {
        this.isLoading = false
      }
    },

    // 发送消息（使用新的参数结构）
    async sendMessage(content: string, messageType = 0, attachmentUrl?: string) {
      if (!this.currentChat || !content.trim() || this.isSending) {
        return
      }

      try {
        this.isSending = true

        const messageDto: PrivateMessageDto = {
          senderId: this.currentChat.senderUserId || 0, // 使用当前用户ID
          receiverId: this.currentChat.friendUserId,
          content: content.trim(),
          messageType,
          attachmentUrl
        }

        const response = await service.post<ResponseMessage<PrivateMessageDto>>(
          '/message/send',
          messageDto
        )

        if (response.data.code === 200) {
          const newMessage = response.data.data

          // 添加到消息列表
          this.messages.push(newMessage)

          // 更新会话列表中的最后一条消息
          const session = this.sessions.find(s => s.friendUserId === this.currentChat?.friendUserId)
          if (session) {
            session.lastMessage = content
            session.lastMessageTime = newMessage.createTime
          }

          return newMessage
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('发送失败：' + error.message)
        return null
      } finally {
        this.isSending = false
      }
    },

    // 撤回消息
    async recallMessage(messageId: number) {
      try {
        const response = await service.put<ResponseMessage<void>>(
          `/message/recall/${messageId}`
        )

        if (response.data.code === 200) {
          // 更新本地消息状态
          const message = this.messages.find(msg => msg.messageId === messageId)
          if (message) {
            message.status = 2  // 已撤回
            message.content = '该消息已撤回'
          }

          ElMessage.success('消息已撤回')
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error(error.message || '撤回失败')
        return false
      }
    },

    // 接收实时消息（WebSocket推送）
    receiveMessage(message: PrivateMessageDto) {
      // 如果是当前聊天窗口的消息，直接添加
      if (this.currentChat &&
          (message.senderId === this.currentChat.friendUserId ||
           message.receiverId === this.currentChat.friendUserId)) {
        this.messages.push(message)

        // 如果是接收到的消息，标记为已读
        if (message.senderId === this.currentChat.friendUserId) {
          this.markMessagesAsRead()
        }
      }

      // 更新会话列表
      this.updateSessionWithNewMessage(message)

      // 播放提示音
      this.playMessageSound()
    },

    // 标记消息为已读（使用新的API）
    async markMessagesAsRead() {
      if (!this.currentChat) return

      try {
        const response = await service.put<ResponseMessage<void>>(
          `/message/read/${this.currentChat.friendUserId}`
        )

        if (response.data.code === 200) {
          // 更新本地所有来自该发送者的未读消息
          this.messages.forEach(msg => {
            if (msg.senderId === this.currentChat?.friendUserId && msg.isRead === 0) {
              msg.isRead = 1
              msg.readTime = new Date().toISOString()
            }
          })

          // 更新会话未读数
          const session = this.sessions.find(s => s.friendUserId === this.currentChat?.friendUserId)
          if (session) {
            session.unreadCount = 0
          }
        }
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },

    // 获取未读消息总数
    async fetchUnreadCount() {
      try {
        const response = await service.get<ResponseMessage<number>>(
          '/message/unread/count'
        )

        if (response.data.code === 200) {
          this.totalUnreadCount = response.data.data
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        console.error('获取未读数量失败:', error)
        return false
      }
    },

    // 加载聊天会话列表（需要后端支持，这里模拟实现）
    async loadSessions() {
      try {
        // 这个接口可能需要后端新增，暂时使用好友列表构建
        const friendStore = useFriendStore()
        if (friendStore.friendList.length === 0) {
          await friendStore.fetchFriendList()
        }

        // 将好友列表转换为会话列表
        this.sessions = friendStore.friendList.map(friend => ({
          friendId: friend.friendId || 0,
          friendUserId: friend.friendUserId,
          friendName: friend.friendNickname || '未知用户',
          friendAvatar: friend.friendAvatar,
          lastMessage: '',
          lastMessageTime: friend.lastChatTime,
          unreadCount: friend.unreadCount || 0,
          isOnline: friend.isOnline
        }))

        return true
      } catch (error: any) {
        ElMessage.error('加载会话列表失败')
        return false
      }
    },

    // 更新会话列表（收到新消息时）
    updateSessionWithNewMessage(message: PrivateMessageDto) {
      const friendId = message.senderId === this.currentReceiverId
        ? message.receiverId
        : message.senderId

      let session = this.sessions.find(s => s.friendUserId === friendId)

      if (!session) {
        // 创建新会话
        session = {
          friendId: 0,
          friendUserId: friendId,
          friendName: message.senderName || '未知用户',
          friendAvatar: message.senderAvatar,
          lastMessage: message.content,
          lastMessageTime: message.createTime,
          unreadCount: message.senderId !== this.currentReceiverId ? 1 : 0
        }
        this.sessions.unshift(session)
      } else {
        // 更新现有会话
        session.lastMessage = message.content
        session.lastMessageTime = message.createTime

        // 如果不是当前聊天窗口，增加未读数
        if (message.senderId !== this.currentReceiverId &&
            (!this.currentChat || this.currentChat.friendUserId !== message.senderId)) {
          session.unreadCount++
        }

        // 将会话移到顶部
        const index = this.sessions.indexOf(session)
        if (index > 0) {
          this.sessions.splice(index, 1)
          this.sessions.unshift(session)
        }
      }
    },

    // 播放消息提示音
    playMessageSound() {
      try {
        const audio = new Audio('/message-sound.mp3')
        audio.volume = 0.3
        audio.play().catch(e => console.log('播放提示音失败:', e))
      } catch (error) {
        console.log('音频播放不可用')
      }
    },

    // 清空当前聊天
    clearCurrentChat() {
      this.currentChat = null
      this.messages = []
      this.currentPage = 1
      this.hasMore = true
    }
  }
})

// 确保导入了好友store
import { useFriendStore } from './friend'
