// src/services/adminService.ts

import type {
  SystemAdmin,
  AddAdminRequest,
  DeleteCommentRequest,
  BanUserRequest,
  ApiResponse,
  DeleteAdminRequest // 新增类型
} from '@/types/admin';
import type{ ResponseMessage } from '@/types/api';
import service from '@/utils/request';

export default {
  // 获取所有管理员
  async fetchAdmins(): Promise<SystemAdmin[]> {
    const response = await service.get<ResponseMessage<SystemAdmin[]>>('/admin/list');
    if (response.data.code === 200) {
      console.log('获取管理员列表成功:', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || '获取管理员列表失败');
    }
  },

  // 添加管理员
  async addAdmin(request: AddAdminRequest): Promise<SystemAdmin> {
    // 默认权限
    if (!request.permissions) {
      request.permissions = JSON.stringify(["USER_BAN", "CONTENT_DELETE"]);
    }
    const response: ApiResponse<SystemAdmin> = await service.post('/admin/add', {
      userId: request.userId,
      permissions: request.permissions
    });
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '添加管理员失败');
    }
  },

  // 删除星系评论
  async deleteGalaxyComment(request: DeleteCommentRequest): Promise<boolean> {
    const response: ApiResponse = await service.delete(`/admin/galaxy/comment/${request.commentId}`, {
      params: { reason: request.reason }
    });
    if (response.data.code === 200) {
      return true;
    } else {
      throw new Error(response.data.message || '删除星系评论失败');
    }
  },

  // 删除星球评论
  async deletePlanetComment(request: DeleteCommentRequest): Promise<boolean> {
    const response: ApiResponse = await service.delete(`/admin/planet/comment/${request.commentId}`, {
      params: { reason: request.reason }
    });
    if (response.data.code === 200) {
      return true;
    } else {
      throw new Error(response.data.message || '删除星球评论失败');
    }
  },

  // 封禁用户
  async banUser(request: BanUserRequest): Promise<boolean> {
    const response: ApiResponse = await service.post('/admin/user/ban', {
      userId: request.userId,
      reason: request.reason,
      duration: request.duration
    });
    if (response.data.code === 200) {
      return true;
    } else {
      throw new Error(response.data.message || '封禁用户失败');
    }
  },

  // 解封用户
  async unbanUser(userId: number): Promise<boolean> {
    const response: ApiResponse = await service.post(`/admin/user/unban/${userId}`);
    if (response.data.code === 200) {
      return true;
    } else {
      throw new Error(response.data.message || '解封用户失败');
    }
  },

  // 删除管理员
  async deleteAdmin(adminId: number): Promise<boolean> {
    const response = await service.delete<ResponseMessage>(`/admin/delete/${adminId}`);
    if (response.data.code === 200) {
      return true;
    } else {
      throw new Error(response.data.message || '删除管理员失败');
    }
  },
};
