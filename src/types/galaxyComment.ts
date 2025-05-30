// 基本评论结构
export interface GalaxyCommentDto {
  commentId: number
  userId: number
  galaxyId: number
  content: string
  parentId?: number
  replyToUserId?: number
  likes: number
  isLiked?: boolean
  createdAt?: string
  replies?: GalaxyCommentDto[]
}

// 分页请求参数
export interface CommentListRequest {
  galaxyId: number
  page?: number
  size?: number
  userId?: number
}

// 点赞操作参数
export interface LikeOperation {
  userId: number
  commentId: number
}

// 删除评论参数
export interface DeleteCommentParams {
  commentId: number
  userId: number
}

// 响应类型保持与之前一致
export interface ResponseMessage<T> {
  code: number
  message: string
  data: T
}
