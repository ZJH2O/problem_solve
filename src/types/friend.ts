// 好友DTO类型定义
export interface FriendDto {
  friendId?: number
  userId: number
  friendUserId: number

  // 好友信息（展示用）
  friendNickname?: string
  friendAvatar?: string
  friendBio?: string

  // 状态
  status: number  // 0-待确认，1-已接受，2-已拒绝，3-已删除
  statusDesc?: string

  // 来源
  source: number  // 1-搜索添加，2-同星系成员，3-评论互动
  sourceDesc?: string
  sourceId?: string

  // 申请备注
  requestMessage?: string

  // 时间信息
  createTime?: string
  confirmTime?: string
  lastChatTime?: string

  // 其他
  unreadCount?: number
  isOnline?: boolean
}

// 用户搜索结果类型（复用UserDto）
export interface UserSearchResult {
  userId: number
  email: string
  nickname: string
  avatarUrl?: string
  bio?: string
}

// 响应类型
export interface ResponseMessage<T> {
  code: number
  message: string
  data: T
}
