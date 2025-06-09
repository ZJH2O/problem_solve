/**
 * 星系管理员数据类型定义
 */

// 基本响应消息格式
export interface ResponseMessage<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 星系管理员实体
export interface GalaxyAdministrator {
  adminId: number;
  galaxyId: string;
  userId: number;
  createTime: string;
  updatedAt: string;
  nickname?:string
}

// 任命管理员请求参数
export interface AppointAdminRequest {
  galaxyId: string;
  userId: number;
}

// 撤销管理员请求参数
export interface RevokeAdminRequest {
  galaxyId: string;
  userId: number;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  size?: number;
}

// 管理员列表响应
export interface AdminListResponse {
  admins: GalaxyAdministrator[];
  total: number;
}

// 用户管理的星系响应

