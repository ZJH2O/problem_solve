import axios from '@/utils/axios'
import type { SystemAdmin } from '@/types'

const BASE_URL = '/api/admin'

export const adminService = {
  // 检查用户是否为管理员
  async isSystemAdmin(userId: number): Promise<boolean> {
    const response = await axios.get(`${BASE_URL}/is-admin/${userId}`)
    return response.data
  },

  // 获取所有系统管理员
  async getAllSystemAdmins(): Promise<SystemAdmin[]> {
    const response = await axios.get(`${BASE_URL}/list`)
    return response.data
  },

  // 添加系统管理员
  async addSystemAdmin(userId: number, permissions: string, operatorId: number): Promise<void> {
    await axios.post(`${BASE_URL}/add`, {
      userId,
      permissions,
      operatorId
    })
  },

  // 更新管理员状态
  async updateAdminStatus(adminId: number, status: number): Promise<void> {
    await axios.put(`${BASE_URL}/status/${adminId}`, { status })
  },

  // 封禁用户
  async banUser(userId: number, adminId: number, reason: string, duration: number): Promise<void> {
    await axios.post(`${BASE_URL}/ban`, {
      userId,
      adminId,
      reason,
      duration
    })
  },

  // 解封用户
  async unbanUser(userId: number, adminId: number): Promise<void> {
    await axios.post(`${BASE_URL}/unban`, {
      userId,
      adminId
    })
  },

  // 删除星系评论
  async deleteGalaxyComment(commentId: number, adminId: number, reason: string): Promise<void> {
    await axios.delete(`${BASE_URL}/comment/galaxy/${commentId}`, {
      data: {
        adminId,
        reason
      }
    })
  },

  // 删除星球评论
  async deletePlanetComment(commentId: number, adminId: number, reason: string): Promise<void> {
    await axios.delete(`${BASE_URL}/comment/planet/${commentId}`, {
      data: {
        adminId,
        reason
      }
    })
  }
}
