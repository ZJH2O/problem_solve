export interface PlanetCommentDto {
  commentId: number;
  planetId: string;
  userId: number;
  content: string;
  parentId: number; // 父级评论ID，0表示顶级评论
  level: number; // 评论层级
  likeCount: number;
  status: 0 | 1 | 2; // 0-正常, 1-隐藏, 2-删除
  createTime: string;
  updateTime: string;
  replies?: PlanetCommentDto[];
}

export interface CreateCommentPayload {
  planetId: string;
  userId: number;
  content: string;
  parentId?: number; // 可选，默认为0（顶级评论）
}

export interface UpdateLikeCountPayload {
  commentId: number;
  likeCount: number;
}

export interface UpdateStatusPayload {
  commentId: number;
  status: 0 | 1 | 2;
}

export interface DeleteCommentPayload {
  commentId: number;
}

export interface CommentListResponse {
  total: number;
  list: PlanetCommentDto[];
}
