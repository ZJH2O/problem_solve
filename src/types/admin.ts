// 管理员类型
export interface SystemAdmin {
  adminId: number
  userId: number
  permissions: string // JSON字符串
  scope?: string
  lastLoginIp?: string
  status: number // 0-活跃 1-停用
  createTime: Date
  updateTime: Date
}

// 权限类型
export type AdminPermission =
  | 'USER_BAN'
  | 'CONTENT_DELETE'
  | 'GALAXY_ACCESS'
  | 'REPORT_REVIEW'
  | 'ADMIN_MANAGE'
