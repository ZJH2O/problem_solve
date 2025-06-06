import { defineStore } from 'pinia'
import type { MessageState, NotificationBrief, ResponseMessage } from '@/types/message'
import service from '@/utils/request'

export const useMessageStore = defineStore('messages', {
  state: (): MessageState => ({
    messages: [],
    unreadCount: {
      total: 0,
      byType: {}
    },
    loading: false,
    error: null
  }),
  getters: {
    currentMessages: (state): NotificationBrief[] => {
      return state.messages
    },
    currentUnreadCount: (state) => {
      return state.unreadCount
    }
  },
  actions: {
    async init() {
      try {
        await this.fetchMessages()
        await this.getUnreadCount()
        return true
      } catch (error) {
        console.log('初始化消息失败:', error)
        return false
      }
    },
    async fetchMessages(userId: number, type?: number, isRead?: number, page = 1, size = 20) {
      this.loading = true
      try {
        const res = await service.get<ResponseMessage<NotificationBrief[]>>('/notification/list', {
          params: {
            userId,
            type,
            isRead,
            page,
            size
          }
        })
        this.messages = res.data.data
        console.log('消息列表获取成功:', this.messages)
        return true
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async getUnreadCount(userId: number) {
      this.loading = true
      try {
        const res = await service.get<ResponseMessage<{ total: number; byType: Record<string, number> }>>('/notification/unread/count', {
          params: { userId }
        })
        this.unreadCount = res.data.data
        console.log('未读消息数量获取成功:', this.unreadCount)
        return true
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async markAsRead(notificationId: number, userId: number) {
      this.loading = true
      try {
        const res = await service.put<ResponseMessage>('/notification/read/' + notificationId, { userId })
        if (res.data.code === 200) {
          // 更新本地消息列表中的消息状态
          const index = this.messages.findIndex((msg) => msg.notificationId === notificationId)
          if (index !== -1) {
            this.messages[index].isRead = 1
          }
          // 更新未读消息数量
          await this.getUnreadCount(userId)
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async markAsReadBatch(userId: number, notificationIds: number[]) {
      this.loading = true
      try {
        const res = await service.put<ResponseMessage>('/notification/read/batch', {
          userId,
          notificationIds
        })
        if (res.data.code === 200) {
          // 更新本地消息列表中的消息状态
          this.messages = this.messages.map((msg) => {
            if (notificationIds.includes(msg.notificationId)) {
              msg.isRead = 1
            }
            return msg
          })
          // 更新未读消息数量
          await this.getUnreadCount(userId)
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async markAllAsRead(userId: number) {
      this.loading = true
      try {
        const res = await service.put<ResponseMessage>('/notification/read/all', { userId })
        if (res.data.code === 200) {
          // 更新本地消息列表中的消息状态
          this.messages.forEach((msg) => {
            msg.isRead = 1
          })
          // 更新未读消息数量
          await this.getUnreadCount(userId)
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async markTypeAsRead(userId: number, type: number) {
      this.loading = true
      try {
        if (type < 1 || type > 7) {
          throw new Error('无效的通知类型')
        }
        const res = await service.put<ResponseMessage>('/notification/read/type', { userId, type })
        if (res.data.code === 200) {
          // 更新本地消息列表中的消息状态
          this.messages = this.messages.map((msg) => {
            if (msg.type === type) {
              msg.isRead = 1
            }
            return msg
          })
          // 更新未读消息数量
          await this.getUnreadCount(userId)
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async deleteNotification(notificationId: number, userId: number) {
      this.loading = true
      try {
        const res = await service.delete<ResponseMessage>('/notification/delete/' + notificationId, {
          params: { userId }
        })
        if (res.data.code === 200) {
          // 从本地消息列表中移除该消息
          this.messages = this.messages.filter((msg) => msg.notificationId !== notificationId)
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async deleteNotificationBatch(userId: number, notificationIds: number[]) {
      this.loading = true
      try {
        const res = await service.delete<ResponseMessage>('/notification/batch', {
          data: {
            userId,
            notificationIds
          }
        })
        if (res.data.code === 200) {
          // 从本地消息列表中移除这些消息
          this.messages = this.messages.filter((msg) => !notificationIds.includes(msg.notificationId))
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async sendSystemNotification(receiverId: number | null, title: string, content: string) {
      this.loading = true
      try {
        const res = await service.post<ResponseMessage>('/notification/system', {
          receiverId,
          title,
          content
        })
        if (res.data.code === 200) {
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async cleanExpiredNotifications() {
      this.loading = true
      try {
        const res = await service.post<ResponseMessage>('/notification/clean')
        if (res.data.code === 200) {
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    clearError() {
      this.error = null
    }
  }
})