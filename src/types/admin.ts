// src/types/admin.ts

/**
 * 系统管理员类型
 * 对应后端 com.example1.demo2.pojo.SystemAdmin
 */
export interface SystemAdmin {
  adminId: number;
  userId: number;
  permissions: string;  // JSON格式的权限字符串
  scope?: string | null;  // JSON格式的管辖范围（可选）
  lastLoginIp?: string;  // 最后登录IP（可选）
  status: number;        // 0-不是管理员 1-是管理员
  createTime?: string;   // 创建时间（ISO格式字符串）
  updateTime?: string;   // 更新时间（ISO格式字符串）
}

/**
 * 添加管理员请求类型
 * 对应后端 /admin/add 接口
 */
export interface AddAdminRequest {
  userId: number;        // 被添加的用户ID
  permissions?: string;  // 权限JSON（可选，前端使用默认值）
}

/**
 * 删除管理员请求类型
 * 对应后端 /admin/delete/{adminId} 接口
 */
export interface DeleteAdminRequest {
  adminId: number;      // 管理员ID
}

/**
 * 删除评论请求类型（星系和星球共用）
 * 对应后端 /admin/galaxy/comment/{commentId} 和 /admin/planet/comment/{commentId} 接口
 */
export interface DeleteCommentRequest {
  commentId: number;     // 评论ID
  reason: string;        // 删除原因
}

/**
 * 封禁用户请求类型
 * 对应后端 /admin/user/ban 接口
 */
export interface BanUserRequest {
  userId: number;        // 被禁用户ID
  reason: string;        // 封禁原因
  duration: number;      // 封禁天数
}

/**
 * 解封用户请求类型
 * 对应后端 /admin/user/unban/{userId} 接口
 */
export interface UnbanUserRequest {
  userId: number;        // 被解封用户ID
}


/**
 * API响应格式
 * 对应后端 ResponseMessage
 */
export interface ApiResponse<T = any> {
  success: boolean;      // 操作是否成功
  message: string;       // 消息内容
  data?: T;              // 返回的数据（可选）
  code?: number;         // 状态码（可选）
}

/**
 * 管理员列表响应类型
 */
export type AdminListResponse = ApiResponse<SystemAdmin[]>;

/**
 * 简单操作响应类型（用于添加/删除/封禁等操作）
 */
export type SimpleResponse = ApiResponse;
