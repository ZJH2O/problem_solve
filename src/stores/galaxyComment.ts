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
    }
  }),
  actions:{
    // 发布评论
    async publishComment(comment: {
      content: string
      galaxyId: number
      userId: number
    }) {
      try {
        const response = await service.post<ResponseMessage<GalaxyCommentDto>>(
          '/galaxy/comment/publish',
          comment
        )
        if (response.data.code === 200) {
          // 更新本地列表（根据实际需求调整）
          this.currentComments.unshift(response.data.data)
          return response.data.data
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`发布失败: ${error}`)
      }
    },
     // 获取评论列表
     async fetchComments(params: CommentListRequest) {
      try {
        const { galaxyId, page = 1, size = 20, userId } = params
        const response = await service.get<ResponseMessage<GalaxyCommentDto[]>>(
          `/galaxy/comment/list/${galaxyId}`,
          {
            params: { page, size, userId }
          }
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
        const response = await service.post<ResponseMessage<boolean>>(
          '/galaxy/comment/like',
          null,
          { params }
        )

        if (response.data.code === 200) {
          // 更新本地数据
          const targetComment = this.findCommentById(params.commentId)
          if (targetComment) {
            targetComment.likes += response.data.data ? 1 : -1
            targetComment.isLiked = response.data.data
          }
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
          `/galaxy/comment/delete/${params.commentId}`,
          { params: { userId: params.userId } }
        )

        if (response.data.code === 200) {
          // 从列表和缓存中移除
          this.currentComments = this.currentComments.filter(
            c => c.commentId !== params.commentId
          )
          this.commentDetails.delete(params.commentId)
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
          if (comment.commentId === commentId) return comment
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
