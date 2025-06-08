import { defineStore } from 'pinia'
import type { NotificationDto, UnreadCount, ResponseMessage } from '@/types/notification'
import service from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as NotificationDto[],
    unreadCount: {
      total: 0,
      byType: {} as Record<number, number>
    } as UnreadCount,
    isLoading: false,
    error: null as string | null,
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    selectedType: null as number | null,
    showUnreadOnly: false
  }),

  getters: {
    // 获取未读通知
    unreadNotifications: (state) =>
      state.notifications.filter(n => n.isRead === 0),

    // 获取已读通知
    readNotifications: (state) =>
      state.notifications.filter(n => n.isRead === 1),

    // 按类型分组的通知
    notificationsByType: (state) => {
      const grouped: Record<number, NotificationDto[]> = {}
      state.notifications.forEach(notification => {
        if (!grouped[notification.type]) {
          grouped[notification.type] = []
        }
        grouped[notification.type].push(notification)
      })
      return grouped
    },

    // 获取通知类型的图标和颜色
    getTypeInfo: () => (type: number) => {
      const typeMap = {
        1: { icon: '💬', color: '#00b4d8', name: '评论回复' },
        2: { icon: '👍', color: '#ff6b6b', name: '评论点赞' },
        3: { icon: '📝', color: '#4ecdc4', name: '新评论' },
        4: { icon: '💬', color: '#00b4d8', name: '评论回复' },
        5: { icon: '👍', color: '#ff6b6b', name: '评论点赞' },
        6: { icon: '📝', color: '#4ecdc4', name: '新评论' },
        7: { icon: '📢', color: '#9d4edd', name: '系统通知' }
      }
      return typeMap[type] || { icon: '📌', color: '#666', name: '其他' }
    }
  },

  actions: {
    // 获取通知列表
    async fetchNotifications(params?: {
      type?: number
      isRead?: number
      page?: number
      size?: number
    }) {
      try {
        this.isLoading = true

        const response = await service.get<ResponseMessage<NotificationDto[]>>(
          '/notification/list',
          {
            params: {
              type: params?.type || this.selectedType,
              isRead: params?.isRead,
              page: params?.page || this.currentPage,
              size: params?.size || this.pageSize
            }
          }
        )

        if (response.data.code === 200) {
          const newNotifications = response.data.data || []

          if (params?.page === 1) {
            // 第一页，替换数据
            this.notifications = newNotifications
          } else {
            // 追加数据
            this.notifications.push(...newNotifications)
          }

          // 判断是否还有更多
          this.hasMore = newNotifications.length === this.pageSize
          this.currentPage = params?.page || this.currentPage

          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '获取通知失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取未读数量
    async fetchUnreadCount() {
      try {
        const response = await service.get<ResponseMessage<UnreadCount>>(
          '/notification/unread/count'
        )

        if (response.data.code === 200) {
          this.unreadCount = response.data.data
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        console.error('获取未读数量失败:', error)
        return false
      }
    },

    // 标记为已读
    async markAsRead(notificationId: number) {
      try {
        const response = await service.put<ResponseMessage<void>>(
          `/notification/read/${notificationId}`
        )

        if (response.data.code === 200) {
          // 更新本地状态
          const notification = this.notifications.find(n => n.notificationId === notificationId)
          if (notification) {
            notification.isRead = 1
            notification.readTime = new Date().toISOString()

            // 更新未读数量
            if (this.unreadCount.total > 0) {
              this.unreadCount.total--
              if (this.unreadCount.byType[notification.type] > 0) {
                this.unreadCount.byType[notification.type]--
              }
            }
          }
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('标记失败')
        return false
      }
    },

    // 批量标记为已读
    async markAsReadBatch(notificationIds: number[]) {
      try {
        const response = await service.put<ResponseMessage<string>>(
          '/notification/read/batch',
          { notificationIds }
        )

        if (response.data.code === 200) {
          // 更新本地状态
          notificationIds.forEach(id => {
            const notification = this.notifications.find(n => n.notificationId === id)
            if (notification) {
              notification.isRead = 1
              notification.readTime = new Date().toISOString()
            }
          })

          // 重新获取未读数量
          await this.fetchUnreadCount()

          ElMessage.success(response.data.data)
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('批量标记失败')
        return false
      }
    },

    // 标记全部为已读
    async markAllAsRead() {
      try {
        const response = await service.put<ResponseMessage<string>>(
          '/notification/read/all'
        )

        if (response.data.code === 200) {
          // 更新本地所有通知状态
          this.notifications.forEach(notification => {
            if (notification.isRead === 0) {
              notification.isRead = 1
              notification.readTime = new Date().toISOString()
            }
          })

          // 清空未读数量
          this.unreadCount = {
            total: 0,
            byType: {}
          }

          ElMessage.success(response.data.data)
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('全部标记失败')
        return false
      }
    },

    // 删除通知
    async deleteNotification(notificationId: number) {
      try {
        const response = await service.delete<ResponseMessage<void>>(
          `/notification/delete/${notificationId}`
        )

        if (response.data.code === 200) {
          // 从列表中移除
          this.notifications = this.notifications.filter(
            n => n.notificationId !== notificationId
          )

          ElMessage.success('删除成功')
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('删除失败')
        return false
      }
    },

    // 批量删除通知
    async deleteNotificationBatch(notificationIds: number[]) {
      try {
        const response = await service.delete<ResponseMessage<string>>(
          '/notification/batch',
          { data: { notificationIds } }
        )

        if (response.data.code === 200) {
          // 从列表中移除
          this.notifications = this.notifications.filter(
            n => !notificationIds.includes(n.notificationId)
          )

          ElMessage.success(response.data.data)
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        ElMessage.error('批量删除失败')
        return false
      }
    },

    // 添加实时通知
    addRealtimeNotification(notification: NotificationDto) {
      // 添加到列表顶部
      this.notifications.unshift(notification)

      // 更新未读数量
      if (notification.isRead === 0) {
        this.unreadCount.total++
        if (!this.unreadCount.byType[notification.type]) {
          this.unreadCount.byType[notification.type] = 0
        }
        this.unreadCount.byType[notification.type]++
      }

      // 显示提示
      ElMessage({
        message: notification.title,
        type: 'info',
        duration: 5000,
        showClose: true
      })
    },

    // 设置筛选类型
    setFilterType(type: number | null) {
      this.selectedType = type
      this.currentPage = 1
      this.notifications = []
      this.fetchNotifications({ page: 1 })
    },

    // 切换只显示未读
    toggleUnreadOnly() {
      this.showUnreadOnly = !this.showUnreadOnly
      this.currentPage = 1
      this.notifications = []
      this.fetchNotifications({
        page: 1,
        isRead: this.showUnreadOnly ? 0 : undefined
      })
    },

    // 加载更多
    async loadMore() {
      if (!this.hasMore || this.isLoading) return

      await this.fetchNotifications({
        page: this.currentPage + 1
      })
    },


    async sendMessage(){
      try{

      }catch(error){
        throw new Error(`信息发送失败:${error}`)
      }
    },
  }
})
