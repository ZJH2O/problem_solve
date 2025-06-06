<template>
  <div class="comment-section cosmic-comms">
    <!-- 评论头部 - 星际通信站 -->
    <div class="comment-header">
      <h2>📡 星球留言板 ({{ commentCount }})</h2>
      <div class="comment-actions">
        <button @click="toggleSortOrder" class="sort-btn cosmic-button">
          {{ sortOrder === 'newest' ? '🕒 时间顺序' : '🔥 引力排序' }}
        </button>
      </div>
    </div>

    <!-- 添加评论表单 - 宇宙广播 -->
    <div class="new-comment-form cosmic-form">
      <textarea
        v-model="newCommentContent"
        placeholder="留下你曾存在过的痕迹..."
        rows="3"
        class="cosmic-textarea"
      ></textarea>
      <div class="form-actions">
        <button @click="submitComment" :disabled="isSubmitting" class="submit-btn cosmic-button cosmic-primary">
          <span v-if="isSubmitting">🛸 信号发送中...</span>
          <span v-else>🚀 发射广播</span>
        </button>
      </div>
    </div>

    <!-- 评论列表 - 星际信号 -->
    <div v-if="commentsLoading" class="loading-indicator">
      <div class="cosmic-spinner"></div>
      <p>正在接收星际信号...</p>
    </div>

    <div v-else-if="topLevelComments.length === 0" class="no-comments">
      <p>🌌 这个星球上还没有足迹，成为第一个探险家吧！</p>
    </div>
    <div v-else class="scrollable-comments cosmic-scroll">
      <div class="comment-list">
        <div
          v-for="comment in sortedComments"
          :key="comment.planetCommentId"
          class="comment-item cosmic-message"
        >
          <!-- 评论主体 -->
          <div class="comment-main">
            <div class="comment-author">
              <div class="cosmic-avatar">👽</div>
              <div>
                <span class="username cosmic-username">星际旅人#{{ comment.userId }}</span>
                <span class="timestamp cosmic-timestamp">{{ formatDateTime(comment.createTime) }}</span>
              </div>
            </div>

            <div class="comment-content cosmic-text">
              {{ comment.content}}
            </div>

            <div class="comment-actions">
              <button @click="toggleLike(comment)" class="like-btn cosmic-reaction">
                <span v-if="comment.isLiked">⭐</span>
                <span v-else>🌠</span>
                {{ comment.likeCount || '引力波' }}
              </button>
              <button @click="toggleReplyForm(comment.planetCommentId)" class="reply-btn cosmic-button">
                {{ activeReplyId === comment.planetCommentId ? '🛸 取消' : '📡 回复' }}
              </button>
              <button @click="toggleCommentDetail(comment)" class="detail-btn cosmic-button">
              📡 {{ comment.showDetail ? '隐藏详情' : '查看详情' }}
              </button>
            </div>
          </div>

          <!-- 回复表单 -->
          <div v-if="activeReplyId === comment.planetCommentId" class="reply-form cosmic-form">
            <textarea
              v-model="replyContent"
              placeholder="回应这个星际信号..."
              rows="2"
              class="cosmic-textarea"
            ></textarea>
            <div class="form-actions">
              <button @click="cancelReply" class="cancel-btn cosmic-button">🚫 取消</button>
              <button @click="submitReply(comment.planetCommentId)" class="submit-btn cosmic-button cosmic-primary">✅ 发送</button>
            </div>
          </div>

          <!-- 直接回复列表（仅显示一层） -->
            <div
              v-if="comment.replies && comment.replies.length && comment.showDetail > 0"
              class="replies cosmic-replies"
            >
            <div
              v-for="reply in comment.replies"
              :key="reply.planetCommentId"
              class="reply-item cosmic-response"
            >
            <div class="reply-author">
              <span class="username cosmic-username">👾 回应者#{{ reply.userId }}</span>
            </div>
            <div class="reply-content cosmic-text">
              {{ reply.content }}
            </div>
            <div class="reply-meta">
              <span class="timestamp cosmic-timestamp">{{ formatDateTime(reply.createTime) }}</span>
              <button @click="toggleLike(reply)" class="like-btn-sm cosmic-reaction">
                🌠 {{ reply.likeCount || '脉冲' }}
              </button>
            </div>
            </div>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCommentStore } from '@/stores/comment';
import { usePlanetStore } from '@/stores/planetStore';
import type { PlanetCommentDto } from '@/types/comment';
import { useUserStore } from '@/stores/user';

const commentStore = useCommentStore();
const planetStore = usePlanetStore();
const userStore = useUserStore();
// 响应式数据
const planetId = computed(() => planetStore.currentPlanet?.planetId || '');
const newCommentContent = ref('');
const replyContent = ref('');
const activeReplyId = ref<number | null>(null);
const isSubmitting = ref(false);
const sortOrder = ref<'newest' | 'popular'>('newest');
const commentsLoading = ref(true);

// 计算属性
const commentCount = computed(() => {
  return commentStore.currentPlanetComments.length
});
const topLevelComments = computed(() => commentStore.topLevelComments);
const userId =  computed(() => userStore.userInfo.userId);
// 排序后的评论列表
const sortedComments = computed(() => {
  const comments = [...commentStore.currentPlanetComments]; // 创建副本避免直接修改store数据

  // 按时间排序（最新优先）
  if (sortOrder.value === 'newest') {
    return comments.sort((a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  }
  // 按热度排序（点赞数优先）
  else {
    return comments.sort((a, b) => {
      // 优先按点赞数排序
      const likeDiff = b.likeCount - a.likeCount;

      // 如果点赞数相同，则按时间排序（最新的优先）
      if (likeDiff === 0) {
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
      }

      return likeDiff;
    });
  }
});

// 获取回复列表的方法
const getRepliesByCommentId = (commentId: number) => {
  return commentStore.getRepliesByCommentId(commentId) || [];
};

// 日期格式化
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 切换排序方式
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'newest' ? 'popular' : 'newest';
};

// 切换回复表单显示
const toggleReplyForm = (commentId: number) => {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null;
  } else {
    activeReplyId.value = commentId;
    replyContent.value = '';

    // 自动展开回复区域
    const comment = commentStore.currentPlanetComments.find(
      c => c.planetCommentId === commentId
    );
    if (comment) comment.isExpanded = true;
  }
};

// 取消回复
const cancelReply = () => {
  activeReplyId.value = null;
  replyContent.value = '';
};

// 点赞/取消点赞
const toggleLike = async (comment: PlanetCommentDto) => {
  if (!comment.planetCommentId || comment.planetCommentId <= 0) {
    console.error('无效评论ID:', comment.planetCommentId);
    return;
};
  if (!userId.value) {
    alert('请先登录')
    return
  }
  commentStore.currentComment = comment
  commentStore.toggleLike({
    userId: userId.value,
    commentId: comment.planetCommentId
  }).catch(error => {
    // 操作失败时回滚状态
    console.error('点赞失败:', error)
  })
};

// 提交新评论
const submitComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('评论内容不能为空');
    return;
  }

  isSubmitting.value = true;

  try {
    await commentStore.createComment({
      userId: userId.value,
      planetId: planetId.value,
      content: newCommentContent.value,
      parentId: 0 // 顶级评论
    });

    // 刷新评论列表
    await commentStore.listCommentsByPlanet(planetId.value);
    newCommentContent.value = '';
  } catch (error) {
    console.error('提交评论失败:', error);
    alert('提交评论失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 提交回复
const submitReply = async (parentId: number) => {
  if (!replyContent.value.trim()) {
    alert('回复内容不能为空');
    return;
  }

  try {
    await commentStore.createComment({
      userId: userId.value,
      planetId: planetId.value,
      content: replyContent.value,
      parentId
    });

    // 刷新评论列表
    await commentStore.listCommentsByPlanet(planetId.value);
    replyContent.value = '';
    activeReplyId.value = null;
  } catch (error) {
    console.error('提交回复失败:', error);
    alert('提交回复失败，请重试');
  }
};

// 初始化加载评论
onMounted(async () => {
  if (planetId.value) {
    try {
      commentsLoading.value = true;
      // 传入当前登录用户的ID
      await commentStore.listCommentsByPlanet(
        planetId.value,
        1,
        10,
        userStore.userInfo?.userId
      );
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      commentsLoading.value = false;
    }
  }
  console.log('评论列表',commentStore.currentPlanetComments)
});

// 新增幽默评论生成器
const humorousPhrases = [
  "根据宇宙定律第42条...",
  "我的量子计算机算出来...",
  "在参宿四的第三颗卫星上...",
  "这比无限非概率驱动器还神奇...",
  "就像巴别鱼翻译的那样..."
];

const injectHumorousComment = (content: string) => {
  // 随机决定是否添加幽默后缀
  if (Math.random() > 0.7 && content.length < 100) {
    return `${content} (${humorousPhrases[Math.floor(Math.random() * humorousPhrases.length)]})`;
  }
  return content;
};

const toggleCommentDetail = async (comment: PlanetCommentDto) => {
  if (!comment.showDetail) {
    comment.showDetail = true
  } else {
    // 关闭详情
    comment.showDetail = false;
  }
};

</script>

<style scoped lang="scss">
.comment-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
}

.sort-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
}

.new-comment-form {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #4285f4;
      box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.submit-btn {
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3367d6;
  }

  &:disabled {
    background-color: #a0c3ff;
    cursor: not-allowed;
  }
}

.cancel-btn {
  padding: 8px 16px;
  margin-right: 10px;
  background: none;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
}

.comment-list {
  background: radial-gradient(circle at center, #0a1a2a, #0c2342);
  .comment-item {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
}

.comment-main {
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
  }

  .username {
    font-weight: 600;
    color: #333;
  }

  .timestamp {
    display: block;
    font-size: 0.85rem;
    color: #777;
  }
}

.comment-content {
  margin-bottom: 12px;
  line-height: 1.5;
  font-size: 1rem;
}

.comment-actions {
  display: flex;
  gap: 15px;

  button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      color: #333;
    }
  }
}

.reply-form {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;

  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    font-size: 0.95rem;
  }
}

.replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #eee;
}

.reply-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;

  .reply-author {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .avatar-sm {
      width: 30px;
      height: 20px;
      border-radius: 50%;
      margin-right: 8px;
      object-fit: cover;
    }

    .username {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }

  .reply-content {
    font-size: 0.95rem;
    line-height: 1.4;
    margin-bottom: 5px;
  }

  .reply-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #777;

    .like-btn-sm {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 3px;
    }
  }
}

.loading-indicator {
  text-align: center;
  padding: 30px;

  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 15px;
    border: 3px solid rgba(66, 133, 244, 0.2);
    border-radius: 50%;
    border-top-color: #4285f4;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #777;
}
/* 添加滚动容器样式 */
.scrollable-comments {
  max-height: 500px; /* 设置固定高度 */
  overflow-y: auto;  /* 启用垂直滚动 */
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.comment-list {
  padding: 15px;

  .comment-item {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    background: radial-gradient(circle at center, #0a1a2a, #0c2342);
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.cosmic-comms {
  background: radial-gradient(circle at center, #0a1a2a, #0c2342);
  color: #e0f7fa;
  border: 1px solid #00eeff;
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.comment-header {
  border-bottom: 1px solid rgba(0, 238, 255, 0.3);
  padding-bottom: 15px;
  margin-bottom: 20px;

  h2 {
    color: #00eeff;
    text-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.cosmic-button {
  background: rgba(0, 201, 255, 0.2);
  color: #e0f7fa;
  border: 1px solid #00eeff;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;

  &:hover {
    background: rgba(0, 201, 255, 0.4);
    box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.cosmic-primary {
    background: linear-gradient(45deg, #00c9ff, #00eeff);
    color: #0a0f2b;
  }
}

.cosmic-form {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(8, 25, 48, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 238, 255, 0.3);
}

.cosmic-textarea {
  width: 100%;
  padding: 12px;
  background: rgba(10, 26, 42, 0.7);
  border: 1px solid #00eeff;
  border-radius: 6px;
  color: #e0f7fa;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    box-shadow: 0 0 15px rgba(0, 238, 255, 0.8);
    outline: none;
  }
}

.cosmic-scroll {
  max-height: 580px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 40, 80, 0.3);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 238, 255, 0.5);
    border-radius: 4px;
  }
}

.comment-item {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(8, 29, 57, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 238, 255, 0.2);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
    transform: translateY(-2px);
  }
}

.cosmic-avatar {
  width: 40px;
  height: 40px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 12px;
}

.cosmic-username {
  font-weight: bold;
  color: #00eeff;
}

.cosmic-timestamp {
  font-size: 0.85rem;
  color: #80deea;
}

.cosmic-text {
  line-height: 1.6;
  margin: 15px 0;
  font-size: 1.1rem;
  color:#00eeff
}

.cosmic-reaction {
  background: none;
  border: none;
  color: #ffcc00;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1rem;
  padding: 5px 10px;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 204, 0, 0.1);
  }
}

.cosmic-replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px dashed rgba(0, 238, 255, 0.3);
}

.cosmic-response {
  padding: 10px;
  margin-bottom: 10px;
  background: rgba(8, 45, 80, 0.3);
  border-radius: 6px;
}

.loading-indicator {
  text-align: center;
  padding: 30px;

  p {
    margin-top: 15px;
    color: #80deea;
  }
}

.cosmic-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid rgba(0, 238, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00eeff;
  animation: cosmic-spin 1s linear infinite;
}

@keyframes cosmic-spin {
  to { transform: rotate(360deg); }
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #80deea;
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
</style>
