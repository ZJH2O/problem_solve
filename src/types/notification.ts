// 通知DTO类型定义
export interface NotificationDto {
  notificationId: number

  // 接收者信息
  receiverId: number
  receiverName?: string

  // 发送者信息
  senderId?: number
  senderName?: string
  senderAvatar?: string

  // 通知类型（1-7）
  type: number
  typeDesc?: string

  // 通知内容
  title: string
  content?: string

  // 关联目标
  targetType?: number
  targetId?: string
  targetTitle?: string

  // 状态信息
  isRead: number  // 0-未读 1-已读
  status?: number  // 0-正常 1-已删除

  // 时间信息
  createTime?: string
  readTime?: string
  createTimeAgo?: string

  // 额外数据
  extraData?: Record<string, any>
  jumpUrl?: string
}

// 通知类型枚举
export enum NotificationType {
  GALAXY_COMMENT_REPLY = 1,
  GALAXY_COMMENT_LIKE = 2,
  GALAXY_NEW_COMMENT = 3,
  PLANET_COMMENT_REPLY = 4,
  PLANET_COMMENT_LIKE = 5,
  PLANET_NEW_COMMENT = 6,
  SYSTEM = 7
}

// 目标类型枚举
export enum TargetType {
  GALAXY_COMMENT = 1,
  GALAXY = 2,
  PLANET_COMMENT = 3,
  PLANET = 4,
  OTHER = 5
}

// 未读数量统计
export interface UnreadCount {
  total: number
  byType: Record<number, number>
}

// 响应类型
export interface ResponseMessage<T> {
  code: number
  message: string
  data: T
}
