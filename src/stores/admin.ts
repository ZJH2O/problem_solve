import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SystemAdmin } from '@/types'
import apiClient from '@/utils/axios' // 使用新的 Axios 实例
import { useUserStore } from './user'


export const useAdminStore = defineStore('admin', () => {
  const userStore = useUserStore()

  // 管理员列表
  const admins = ref<SystemAdmin[]>([])

  // 当前用户的管理员状态
  const isAdmin = ref(false)

  // 错误信息
  const error = ref<string | null>(null)

  // 加载状态
  const isLoading = ref(false)

  // 检查当前用户是否为管理员
  const checkAdminStatus = async () => {
    if (!userStore.isLoggedIn) return false

    isLoading.value = true
    try {
      const response = await apiClient.get(`/admin/is-admin/${userStore.userId}`)
      isAdmin.value = response
      return response
    } catch (err) {
      error.value = '无法验证管理员状态: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 获取所有管理员
  const fetchAdmins = async () => {
    if (!isAdmin.value) {
      error.value = '无权限访问管理员列表'
      return
    }

    isLoading.value = true
    try {
      const response = await apiClient.get('/admin/list')
      admins.value = response
      error.value = null
    } catch (err) {
      error.value = '获取管理员列表失败: ' + (err as Error).message
      admins.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 添加管理员
  const addAdmin = async (userId: number, permissions: string) => {
    if (!isAdmin.value) {
      error.value = '无权限添加管理员'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.post('/admin/add', {
        userId,
        permissions,
        operatorId: userStore.userId
      })
      await fetchAdmins() // 刷新列表
      error.value = null
      return true
    } catch (err) {
      error.value = '添加管理员失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 更新管理员状态
  const updateAdminStatus = async (adminId: number, status: number) => {
    if (!isAdmin.value) {
      error.value = '无权限修改管理员状态'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.put(`/admin/status/${adminId}`, { status })
      await fetchAdmins() // 刷新列表
      error.value = null
      return true
    } catch (err) {
      error.value = '更新管理员状态失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 封禁用户
  const banUser = async (userId: number, reason: string, duration: number) => {
    if (!isAdmin.value) {
      error.value = '无权限执行封禁操作'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.post('/admin/ban', {
        userId,
        adminId: userStore.userId,
        reason,
        duration
      })
      error.value = null
      return true
    } catch (err) {
      error.value = '封禁用户失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 解封用户
  const unbanUser = async (userId: number) => {
    if (!isAdmin.value) {
      error.value = '无权限执行解封操作'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.post('/admin/unban', {
        userId,
        adminId: userStore.userId
      })
      error.value = null
      return true
    } catch (err) {
      error.value = '解封用户失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 删除星系评论
  const deleteGalaxyComment = async (commentId: number, reason: string) => {
    if (!isAdmin.value) {
      error.value = '无权限删除评论'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.delete(`/admin/comment/galaxy/${commentId}`, {
        data: {
          adminId: userStore.userId,
          reason
        }
      })
      error.value = null
      return true
    } catch (err) {
      error.value = '删除星系评论失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 删除星球评论
  const deletePlanetComment = async (commentId: number, reason: string) => {
    if (!isAdmin.value) {
      error.value = '无权限删除评论'
      return false
    }

    isLoading.value = true
    try {
      await apiClient.delete(`/admin/comment/planet/${commentId}`, {
        data: {
          adminId: userStore.userId,
          reason
        }
      })
      error.value = null
      return true
    } catch (err) {
      error.value = '删除星球评论失败: ' + (err as Error).message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  return {
    admins,
    isAdmin,
    error,
    isLoading,
    checkAdminStatus,
    fetchAdmins,
    addAdmin,
    updateAdminStatus,
    banUser,
    unbanUser,
    deleteGalaxyComment,
    deletePlanetComment,
    clearError
  }
})
