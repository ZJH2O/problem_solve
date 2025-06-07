import { defineStore } from 'pinia'
import type {
  GalaxyAdministrator,
  AppointAdminRequest,
  RevokeAdminRequest,
  PaginationParams,
  AdminListResponse,
  ResponseMessage
} from '@/types/galaxyAdmin'
import service from '@/utils/request'
import { useUserStore } from '@/stores/user'

export const useGalaxyAdminStore = defineStore('galaxyAdmin', {
  state: () => ({
    // 当前星系管理员列表
    currentAdmins: [] as GalaxyAdministrator[],

    // 用户管理的星系ID列表
    managedGalaxies: [] as string[],

    // 分页信息
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },

    // 加载状态
    loading: false,
    error: null as string | null
  }),

  actions: {
    /**
     * 任命星系管理员
     * @param params 任命参数 { galaxyId, userId }
     */
    async appointAdmin(params: AppointAdminRequest) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const currentUserId = userStore.userInfo?.userId

        if (!currentUserId) {
          throw new Error('用户未登录')
        }

        const response = await service.post<ResponseMessage>(
          '/galaxy/admin/appoint',
          {
            ...params,
            // 添加当前用户ID用于权限验证
            currentUserId
          }
        )

        if (response.data.code === 200) {
          // 更新本地状态
          this.refreshAdminList(params.galaxyId)
          return true
        }
        throw new Error(response.data.message || '任命失败')
      } catch (error: any) {
        this.error = error.message || '任命管理员时发生错误'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 撤销星系管理员
     * @param params 撤销参数 { galaxyId, userId }
     */
    async revokeAdmin(params: RevokeAdminRequest) {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const currentUserId = userStore.userInfo?.userId

        if (!currentUserId) {
          throw new Error('用户未登录')
        }

        const response = await service.delete<ResponseMessage>(
          '/galaxy/admin/revoke',
          {
            data: {
              ...params,
              currentUserId
            }
          }
        )

        if (response.data.code === 200) {
          // 更新本地状态
          this.refreshAdminList(params.galaxyId)
          return true
        }
        throw new Error(response.data.message || '撤销失败')
      } catch (error: any) {
        this.error = error.message || '撤销管理员时发生错误'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取星系管理员列表
     * @param galaxyId 星系ID
     * @param params 分页参数
     */
    async fetchAdminList(galaxyId:string, params?: PaginationParams) {
      this.loading = true
      this.error = null

      try {
        const page = params?.page || 1
        const size = params?.size || this.pagination.pageSize

        const response = await service.get<ResponseMessage<AdminListResponse>>(
          `/galaxy/admin/list/${galaxyId}`,
          {
            params: { page, size }
          }
        )

        if (response.data.code === 200 && response.data.data) {
          this.currentAdmins = response.data.data.admins
          this.pagination = {
            current: page,
            pageSize: size,
            total: response.data.data.total
          }
          return this.currentAdmins
        }
        throw new Error(response.data.message || '获取管理员列表失败')
      } catch (error: any) {
        this.error = error.message || '获取管理员列表时发生错误'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新当前星系管理员列表
     * @param galaxyId 星系ID
     */
    async refreshAdminList(galaxyId:string) {
      return this.fetchAdminList(galaxyId, {
        page: this.pagination.current,
        size: this.pagination.pageSize
      })
    },

    /**
     * 获取用户管理的星系列表
     */
    async fetchManagedGalaxies() {
      this.loading = true
      this.error = null

      try {
        const userStore = useUserStore()
        const currentUserId = userStore.userInfo?.userId

        if (!currentUserId) {
          throw new Error('用户未登录')
        }

        const response = await service.get<ResponseMessage<string[]>>(
          '/galaxy/admin/managed'
        )

        if (response.data.code === 200 && response.data.data) {
          this.managedGalaxies = response.data.data
          return this.managedGalaxies
        }
        throw new Error(response.data.message || '获取管理星系失败')
      } catch (error: any) {
        this.error = error.message || '获取管理星系时发生错误'
        throw error
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    /**
     * 当前星系是否由当前用户管理
     */
    isCurrentUserAdmin: (state) => (galaxyId: string) => {
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo?.userId

      if (!currentUserId) return false

      return state.currentAdmins.some(
        admin => admin.galaxyId === galaxyId && admin.userId === currentUserId
      )
    },

    /**
     * 格式化管理员列表（添加用户信息）
     */
    formattedAdmins(state) {

      return state.currentAdmins.map(admin => {
        return {
          ...admin,
        }
      })
    }
  }
})
