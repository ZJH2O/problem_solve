import { defineStore } from 'pinia'
import type {
  GalaxyCommentDto,
  CommentListRequest,
  LikeOperation,
  DeleteCommentParams,
  ResponseMessage
} from '@/types/galaxyComment'
import service from '@/utils/request'

export const useGalaxyCommentStore = defineStore('galaxyComment',{
  state: () => ({
    currentComments: [] as GalaxyCommentDto[],  // 当前星系评论列表
    commentDetails: new Map<number, GalaxyCommentDto>(), // 评论详情缓存
    pagination: {
      current: 1,
      pageSize: 20,
      total: 0
    },
    currentComment: null as GalaxyCommentDto | null
  }),
  actions:{
    // 发布评论
    async publishComment(comment: {
      parentId?: number
      content: string
      galaxyId: string
      userId: number
      replyToUserId?: number
    }) {
      try {
        const response = await service.post<ResponseMessage<GalaxyCommentDto>>(
          '/galaxy/comment/publish',
          comment
        )

        if (response.data.code === 200) {
          const newComment = response.data.data;
          console.log(newComment)
          // 确保ID存在（双重验证）
          if (!newComment.galaxyCommentId) {
            console.error('后端返回空ID:', newComment);
            throw new Error('评论创建失败：缺少评论ID');
          }

          // 递归更新树形结构
          const addToTree = (comments: GalaxyCommentDto[]): boolean => {
            for (const item of comments) {
              // 如果是直接回复
              if (item.galaxyCommentId === comment.parentId) {
                if (!item.replies) item.replies = [];
                item.replies.unshift(newComment); // 新评论置顶
                return true;
              }
              // 递归查找嵌套回复
              if (item.replies?.length && addToTree(item.replies)) {
                return true;
              }
            }
            return false;
          };

          // 添加到顶级或嵌套结构
          if (!comment.parentId || !addToTree(this.currentComments)) {
            this.currentComments.unshift(newComment); // 顶级评论置顶
          }

          return newComment;
        }
        throw new Error(response.data.message);
      } catch (error) {
        throw new Error(`发布失败: ${error}`);
      }
    },
     // 获取评论列表
     async fetchComments(params: CommentListRequest) {
      try {
        const { galaxyId, page = 1, size = 20, userId } = params
        const response = await service.post<ResponseMessage<GalaxyCommentDto[]>>(
          `/galaxy/comment/list/${galaxyId}`,
          null, // POST请求体为空
          { params: { page, size, userId } } // 参数放在query string
        )

        if (response.data.code === 200) {
          this.currentComments = response.data.data
          this.pagination = {
            current: page,
            pageSize: size,
            total: response.data.data.length // 实际应该从分页接口获取总数
          }
          return this.currentComments
        }
        throw new Error(response.data.message)
      } catch (error) {
        this.currentComments = []
        throw new Error(`获取评论失败: ${error}`)
      }
    },

    // 点赞/取消点赞
    async toggleLike(params: LikeOperation) {
      try {
        const response = await service.post(
          `/galaxy/comment/like?userId=${params.userId}&commentId=${params.galaxyCommentId}`,
          null // 请求体为空
        )
        console.log("开始点赞")
        if (response.data.code === 200) {
          // 更新本地数据
          console.log(response.data.data)
          return response.data.data
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`操作失败: ${error}`)
      }
    },

    // 删除评论
    async deleteComment(params: DeleteCommentParams) {
      try {
        const response = await service.delete<ResponseMessage<void>>(
          `/galaxy/comment/delete/${params.galaxyCommentId}`,
          { params: { userId: params.userId } }
        )

        if (response.data.code === 200) {
          // 从列表和缓存中移除
          this.currentComments = this.currentComments.filter(
            c => c.galaxyCommentId !== params.galaxyCommentId
          )
          this.commentDetails.delete(params.galaxyCommentId)
          return true
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`删除失败: ${error}`)
      }
    },

     // 获取评论详情
     async fetchCommentDetail(commentId: number, userId?: number) {
      try {
        const response = await service.get<ResponseMessage<GalaxyCommentDto>>(
          `/galaxy/comment/detail/${commentId}`,
          { params: { userId } }
        )

        if (response.data.code === 200) {
          this.commentDetails.set(commentId, response.data.data)
          return response.data.data
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`获取详情失败: ${error}`)
      }
    },

    // 辅助方法：查找评论
    findCommentById(commentId: number): GalaxyCommentDto | undefined {
      const findInTree = (comments: GalaxyCommentDto[]): GalaxyCommentDto | undefined => {
        for (const comment of comments) {
          if (comment.galaxyCommentId === commentId) return comment
          if (comment.replies?.length) {
            const found = findInTree(comment.replies)
            if (found) return found
          }
        }
      }
      return findInTree(this.currentComments)
    }

  }


})
