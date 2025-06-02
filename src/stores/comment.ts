import { defineStore } from 'pinia';
import type {
  PlanetCommentDto,
  CreateCommentPayload,
  UpdateLikeCountPayload,
  UpdateStatusPayload,
  DeleteCommentPayload,
  CommentListResponse
} from '@/types/comment';
import type { ResponseMessage } from '@/types/api';
import service from '@/utils/request';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    // 当前星球的所有评论
    currentPlanetComments: [] as PlanetCommentDto[],
    // 评论总数
    totalComments: 0,
    // 当前选中的评论（用于编辑等操作）
    currentComment: null as PlanetCommentDto | null
  }),

  getters: {
    // 获取顶级评论（无父级）
    topLevelComments: (state) => {
      return state.currentPlanetComments
        .filter(comment => comment.parentId === 0)
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    },

    // 获取某个评论的所有回复
    getRepliesByCommentId: (state) => (commentId: number) => {
      return state.currentPlanetComments
        .filter(comment => comment.parentId === commentId)
        .sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
    },

    // 获取指定ID的评论
    getCommentById: (state) => (commentId: number) => {
      return state.currentPlanetComments.find(comment => comment.commentId === commentId);
    }
  },

  actions: {
    // 创建新评论
    async createComment(payload: CreateCommentPayload) {
      try {
        // 添加默认父级评论ID
        const finalPayload = {
          ...payload,
          parentId: payload.parentId || 0
        };

        const res = await service.post<ResponseMessage<number>>(
          '/comment/create',
          finalPayload
        );

        if (res.data.code === 200) {
          return res.data.data; // 返回创建的评论ID
        }

        throw new Error(res.data.message || '创建评论失败');
      } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 获取评论详情
    async getCommentDetail(commentId: number) {
      try {
        // 后端使用 @RequestBody，前端使用查询参数
        const res = await service.get<ResponseMessage<PlanetCommentDto>>(
          '/comment/commentinfo',
          { params: { commentId } }
        );

        if (res.data.code === 200) {
          this.currentComment = res.data.data;
          return res.data.data;
        }

        throw new Error(res.data.message || '获取评论详情失败');
      } catch (error) {
        this.currentComment = null;
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 更新评论点赞数
    async updateLikeCount(payload: UpdateLikeCountPayload) {
      try {
        const res = await service.put<ResponseMessage<void>>(
          '/comment/updateLikeCount',
          payload
        );

        if (res.data.code === 200) {
          // 更新本地状态
          const commentIndex = this.currentPlanetComments.findIndex(c => c.commentId === payload.commentId);
          if (commentIndex !== -1) {
            this.currentPlanetComments[commentIndex].likeCount = payload.likeCount;
          }
          return true;
        }

        throw new Error(res.data.message || '更新点赞数失败');
      } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 更新评论状态
    async updateStatus(payload: UpdateStatusPayload) {
      try {
        const res = await service.put<ResponseMessage<void>>(
          '/comment/updateStatus',
          payload
        );

        if (res.data.code === 200) {
          // 更新本地状态
          const commentIndex = this.currentPlanetComments.findIndex(c => c.commentId === payload.commentId);
          if (commentIndex !== -1) {
            this.currentPlanetComments[commentIndex].status = payload.status;
          }
          return true;
        }

        throw new Error(res.data.message || '更新状态失败');
      } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 获取星球下的所有评论（带分页）
    async listCommentsByPlanet(planetId: string, page: number = 1, size: number = 10) {
      try {
        const res = await service.get<ResponseMessage<CommentListResponse>>(
          '/comment/listByPlanet',
          {
            params: {
              planetId,
              page,
              size
            }
          }
        );

        if (res.data.code === 200) {
          this.currentPlanetComments = res.data.data.list;
          this.totalComments = res.data.data.total;
          return {
            list: res.data.data.list,
            total: res.data.data.total
          };
        }

        throw new Error(res.data.message || '获取评论列表失败');
      } catch (error) {
        this.currentPlanetComments = [];
        this.totalComments = 0;
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 删除评论
    async deleteComment(payload: DeleteCommentPayload) {
      try {
        const res = await service.delete<ResponseMessage<void>>(
          '/comment/delete',
          { data: payload }
        );

        if (res.data.code === 200) {
          // 从本地状态中移除
          this.currentPlanetComments = this.currentPlanetComments.filter(
            comment => comment.commentId !== payload.commentId
          );
          return true;
        }

        throw new Error(res.data.message || '删除评论失败');
      } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 批量删除星球下的所有评论
    async deleteCommentsByPlanetId(planetId: string) {
      try {
        const res = await service.delete<ResponseMessage<void>>(
          `/comment/deleteByPlanetId/${planetId}`
        );

        if (res.data.code === 200) {
          this.currentPlanetComments = [];
          this.totalComments = 0;
          return true;
        }

        throw new Error(res.data.message || '删除星球评论失败');
      } catch (error) {
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    // 添加评论到当前星球（本地操作，不调用API）
    addCommentLocally(comment: PlanetCommentDto) {
      this.currentPlanetComments.push(comment);
      this.totalComments += 1;
    },

    // 移除本地评论（不调用API）
    removeCommentLocally(commentId: number) {
      this.currentPlanetComments = this.currentPlanetComments.filter(c => c.commentId !== commentId);
      this.totalComments -= 1;
    },

    // 构建评论树（递归方法）
    buildCommentTree(comments: PlanetCommentDto[], parentId: number = 0): PlanetCommentDto[] {
      const tree: PlanetCommentDto[] = [];

      comments.filter(c => c.parentId === parentId).forEach(comment => {
        const children = this.buildCommentTree(comments, comment.commentId);
        if (children.length > 0) {
          comment.replies = children;
        }
        tree.push(comment);
      });

      return tree;
    },

    // 获取完整的评论树
    getFullCommentTree(): PlanetCommentDto[] {
      return this.buildCommentTree(this.currentPlanetComments);
    },

    // 点赞评论（客户端本地操作）
    likeCommentLocally(commentId: number) {
      const comment = this.currentPlanetComments.find(c => c.commentId === commentId);
      if (comment) {
        comment.likeCount += 1;
      }
    },

    // 取消点赞（客户端本地操作）
    unlikeCommentLocally(commentId: number) {
      const comment = this.currentPlanetComments.find(c => c.commentId === commentId);
      if (comment && comment.likeCount > 0) {
        comment.likeCount -= 1;
      }
    }
  }
});
