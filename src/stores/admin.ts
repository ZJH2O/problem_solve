// src/stores/admin.ts
import { defineStore } from 'pinia';
import adminService from '@/services/adminService';
import type { SystemAdmin } from '@/types/admin';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    admins: [] as SystemAdmin[],
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    // 获取管理员列表
    async fetchAdmins() {
      this.isLoading = true;
      this.error = null;

      try {
        this.admins = await adminService.fetchAdmins();
      } catch (error: any) {
        this.error = error.message || '获取管理员列表失败';
        console.error('fetchAdmins error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 添加管理员
    async addAdmin(userId: number) {
      this.isLoading = true;
      this.error = null;

      try {
        await adminService.addAdmin({ userId });
        await this.fetchAdmins(); // 刷新列表
      } catch (error: any) {
        this.error = error.message || '添加管理员失败';
        console.error('addAdmin error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 删除星系评论
    async deleteGalaxyComment(commentId: number, reason: string) {
      try {
        return await adminService.deleteGalaxyComment({ commentId, reason });
      } catch (error: any) {
        console.error('deleteGalaxyComment error:', error);
        throw new Error(error.message || '删除评论失败');
      }
    },

    // 删除星球评论
    async deletePlanetComment(commentId: number, reason: string) {
      try {
        return await adminService.deletePlanetComment({ commentId, reason });
      } catch (error: any) {
        console.error('deletePlanetComment error:', error);
        throw new Error(error.message || '删除评论失败');
      }
    },

    // 封禁用户
    async banUser(userId: number, reason: string, duration: number) {
      try {
        return await adminService.banUser({ userId, reason, duration });
      } catch (error: any) {
        console.error('banUser error:', error);
        throw new Error(error.message || '封禁用户失败');
      }
    },

    // 解封用户
    async unbanUser(userId: number) {
      try {
        return await adminService.unbanUser(userId);
      } catch (error: any) {
        console.error('unbanUser error:', error);
        throw new Error(error.message || '解封用户失败');
      }
    }
  }
});
