// 私信消息类型
export interface PrivateMessageDto {
  messageId?: number
  senderId: number
  senderName?: string
  senderAvatar?: string
  receiverId: number
  receiverName?: string
  receiverAvatar?: string
  content: string
  messageType?: number  // 0-文本 1-图片 2-文件
  attachmentUrl?: string  // 附件URL
  isRead?: number  // 0-未读 1-已读
  status?: number  // 0-正常 1-已删除 2-已撤回
  createTime?: string
  readTime?: string

  // 验证分组
  Send?: any
}

// 消息类型枚举
export enum MessageType {
  TEXT = 0,
  IMAGE = 1,
  FILE = 2
}

// 聊天会话
export interface ChatSession {
  friendId: number
  friendUserId: number
  friendName: string
  friendAvatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isOnline?: boolean
  senderUserId?: number  // Made optional since it's only needed when sending messages
}

// 发送消息的请求参数
export interface SendMessageRequest {
  receiverId: number
  content: string
  messageType?: number
  attachmentUrl?: string
}

// 响应类型
export interface ResponseMessage<T> {
  code: number
  message: string
  data: T
}
