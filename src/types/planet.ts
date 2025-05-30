export interface Planet {
  id: number | string;
  name:string;
  visitors: number;
  description:string;
  createdAt?: Date;
  status?: 'active' | 'inactive' | 'draft';
  details: PlanetDetails;
}

// 扩展细节类型
export interface PlanetDetails {
  /** 推荐知识系统 */
  recommendedKnowledge: KnowledgeEntry[];
  /** 作者留言板 */
  authorMessages: AuthorMessage[];
  /** 读者评论系统 */
  readerComments: ReaderComment[];
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'article' | 'video' | 'course';
  sourceUrl: string;
  recommendReason: string;
  upvotes: number;
  createdAt: Date;
}

export interface AuthorMessage {
  id: string;
  content: string;
  author: UserBrief;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CommentDraft {
  content: string;
  user: UserBrief;
  // 其他可选字段
  replyTo?: {
    userId: string;
    commentId: string;
  };
  // 初始互动数据（可选）
  reactions?: {
    like?: number;
    disagree?: number;
  };
}

// 读者评论类型
export interface ReaderComment extends CommentDraft {
  id: string;
  createdAt: Date;
  status: 'published' | 'deleted' | 'flagged';
  replies: CommentReply[];
  upvotes: number;
}

// 评论回复类型
export interface CommentReply {
  id: string;
  content: string;
  user: UserBrief;
  createdAt: Date;
  // 回复对象（可选）
  replyTo?: {
    userId: string;
    commentId: string;
  };
}

// 用户简略信息
export interface UserBrief {
  userId: string;
  username: string;
  avatarUrl?: string;
  // 用户认证标识
  badge?: 'author' | 'vip' | 'expert';
}

// 附件类型
export interface Attachment {
  type: 'image' | 'file' | 'link';
  url: string;
  preview?: string; // 图片预览地址
  meta?: {
    size?: number;
    format?: string;
    duration?: number; // 音视频时长
  };
}


export interface KnowledgePlanetDto {
  planetId?: string
  title: string
  creatorId: string
  themeType: string
  coverUrl?: string
  visibility?: string
  description?: string
}
