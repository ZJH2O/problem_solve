import { defineStore } from 'pinia'
import type { FriendDto, UserSearchResult, ResponseMessage } from '@/types/friend'
import service from '@/utils/request'

export const useFriendStore = defineStore('friend', {
  state: () => ({
    friendList: [] as FriendDto[],
    pendingRequests: [] as FriendDto[],
    searchResults: [] as UserSearchResult[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    // 获取已接受的好友
    acceptedFriends: (state) =>
      state.friendList.filter(friend => friend.status === 1),

    // 获取待处理请求数量
    pendingCount: (state) =>
      state.pendingRequests.length,

    // 获取在线好友
    onlineFriends: (state) =>
      state.friendList.filter(friend => friend.isOnline)
  },

  actions: {
    // 发送好友请求
    async sendFriendRequest(data: {
      friendUserId: number
      source: number
      sourceId?: string
      requestMessage?: string
    }) {
      try {
        this.isLoading = true
        const response = await service.post<ResponseMessage<void>>(
          '/friend/request',
          data
        )

        if (response.data.code === 200) {
          return { success: true, message: '好友请求已发送' }
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '发送请求失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 接受好友请求
    async acceptFriendRequest(friendId: number) {
      try {
        const response = await service.put<ResponseMessage<void>>(
          `/friend/accept/${friendId}`
        )

        if (response.data.code === 200) {
          // 更新本地状态
          const request = this.pendingRequests.find(r => r.friendId === friendId)
          if (request) {
            request.status = 1
            request.statusDesc = '已接受'
            // 从待处理列表移到好友列表
            this.pendingRequests = this.pendingRequests.filter(r => r.friendId !== friendId)
            this.friendList.push(request)
          }
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '接受请求失败'
        throw error
      }
    },

    // 拒绝好友请求
    async rejectFriendRequest(friendId: number) {
      try {
        const response = await service.put<ResponseMessage<void>>(
          `/friend/reject/${friendId}`
        )

        if (response.data.code === 200) {
          // 从待处理列表移除
          this.pendingRequests = this.pendingRequests.filter(r => r.friendId !== friendId)
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '拒绝请求失败'
        throw error
      }
    },

    // 获取好友列表
    async fetchFriendList() {
      try {
        this.isLoading = true
        const response = await service.get<ResponseMessage<FriendDto[]>>(
          '/friend/list'
        )

        if (response.data.code === 200) {
          this.friendList = response.data.data || []
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '获取好友列表失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取待处理的好友请求
    async fetchPendingRequests() {
      try {
        const response = await service.get<ResponseMessage<FriendDto[]>>(
          '/friend/pending'
        )

        if (response.data.code === 200) {
          this.pendingRequests = response.data.data || []
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '获取待处理请求失败'
        throw error
      }
    },

    // 删除好友
    async deleteFriend(friendUserId: number) {
      try {
        const response = await service.delete<ResponseMessage<void>>(
          `/friend/delete/${friendUserId}`
        )

        if (response.data.code === 200) {
          // 从好友列表移除
          this.friendList = this.friendList.filter(f => f.friendUserId !== friendUserId)
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '删除好友失败'
        throw error
      }
    },

    // 搜索用户
    async searchUsers(keyword: string) {
      try {
        this.isLoading = true
        const response = await service.get<ResponseMessage<UserSearchResult[]>>(
          '/friend/search',
          { params: { keyword } }
        )

        if (response.data.code === 200) {
          this.searchResults = response.data.data || []
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '搜索失败'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取同星系成员
    async getGalaxyMembers(galaxyId: number) {
      try {
        const response = await service.get<ResponseMessage<UserSearchResult[]>>(
          `/friend/galaxy/${galaxyId}/members`
        )

        if (response.data.code === 200) {
          this.searchResults = response.data.data || []
          return true
        }
        throw new Error(response.data.message)
      } catch (error: any) {
        this.error = error.message || '获取星系成员失败'
        throw error
      }
    },

    // 清空搜索结果
    clearSearchResults() {
      this.searchResults = []
    },

    // 清空错误信息
    clearError() {
      this.error = null
    }
  }
})
