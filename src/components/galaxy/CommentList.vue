<template>
  <div class="comment-list cosmic-chat">
    <!-- 三维投影标题 -->
    <h3 class="hologram-title">
      <span class="flicker">/// 星域交流频道 //</span>
      <span class="signal">📡 正在接收量子信号...</span>
    </h3>

    <!-- 评论项改为星舰日志样式 -->
    <div
      v-for="(comment, index) in commentStore.currentComments"
      :key="comment.galaxyCommentId"
      class="starlog-entry"
      :style="`--delay: ${index * 0.1}s`"
    >
      <!-- 头像改为种族标识 -->
      <div class="alien-avatar">
        <svg class="energy-core">
          <circle cx="50%" cy="40%" r="40%" fill="#00f7ff" />
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
        </svg>
        <span class="species-tag">碳基生物{{comment.userId}}</span>
      </div>

      <!-- 内容区域 -->
      <div class="quantum-bubble">
        <!-- 添加星际符号 -->
        <div class="cosmic-icons">
          <span class="planet-icon">🜨</span>
          <span class="comet-icon">☄</span>
        </div>

        <!-- 文字内容 -->
        <p class="pulsar-text">{{ comment.content }}</p>

        <!-- 交互按钮 -->
        <div class="nebula-actions">
          <button
            @click="handleLike(comment);$forceUpdate()"
            class="plasma-button"
            :class="{ 'ionized': comment.isLiked }"
          >
            <span class="energy-pulse"></span>
            ⚡ 能量共鸣 ({{ comment.likeCount }})
          </button>
          <button
            @click="toggleReply(comment)"
            class="plasma-button reply-btn"
          >
            <span class="energy-pulse"></span>
            📡 量子回复
          </button>

        </div>
        <!-- 回复表单 -->
        <div v-if="activeReplyId === comment.galaxyCommentId" class="reply-form">
          <textarea
            v-model="replyContent"
            placeholder="输入你的量子回复..."
            class="quantum-input"
          ></textarea>
          <button
            @click="submitReply(comment)"
            class="plasma-button submit-reply"
          >
            🚀 发射回复
          </button>
        </div>
        <!-- 回复列表 -->
        <div v-if="comment.replies && comment.replies.length" class="reply-list">
          <div
            v-for="reply in comment.replies.slice(0, showAllReplies[comment.galaxyCommentId] ? undefined : 2)"
            :key="reply.galaxyCommentId"
            class="reply-item"
          >
            <div class="reply-avatar">
              <svg class="mini-core">
                <circle cx="50%" cy="50%" r="40%" fill="#ff00cc" />
              </svg>
            </div>
            <div class="reply-content">
              <span class="reply-user">外星人{{reply.userId}}</span>
              <span class="reply-text">{{ reply.content }}</span>
              <span class="reply-time">🕒 {{ formatDateTime(reply.createTime) }}</span>
            </div>
          </div>

          <button
            v-if="comment.replies.length > 2 && !showAllReplies[comment.galaxyCommentId]"
            @click="showAllReplies[comment.galaxyCommentId] = true"
            class="plasma-button show-more"
          >
            查看全部{{comment.replies.length}}条回复 👽
          </button>
        </div>
      </div>

      <!-- 详情面板 -->
      <!-- <div v-if="activeDetailsId === comment.galaxyCommentId" class="details-panel">
        <div class="detail-header">
          <h4>🛸 评论详情 - 星际编号 #{{comment.galaxyCommentId}}</h4>
          <button @click="activeDetailsId = null" class="close-details">×</button>
        </div>

        <div class="detail-content">
          <div class="detail-row">
            <span class="detail-label">🌌 创建时间:</span>
            <span class="detail-value">{{ formatDateTime(comment.createTime) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">👽 发布者:</span>
            <span class="detail-value">碳基生物{{comment.userId}}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">💬 内容分析:</span>
            <span class="detail-value">

            </span>
          </div>

          <div v-if="comment.replies && comment.replies.length" class="all-replies">
            <h5>📡 全部量子回复 ({{comment.replies.length}})</h5>
            <div
              v-for="reply in comment.replies"
              :key="reply.galaxyCommentId"
              class="full-reply"
            >
              <div class="reply-header">
                <span class="reply-user">👾 外星人{{reply.userId}}</span>
                <span class="reply-time">🕒 {{ formatDateTime(reply.createTime) }}</span>
              </div>
              <div class="reply-text">{{ reply.content }}</div>
            </div>
          </div>
          <div v-else class="no-replies">
            🚫 该评论尚未收到任何量子回复
          </div>
        </div>
      </div> -->



      <!-- 时间戳改为星历 -->
      <div class="stardate">
        <span class="flashing-cursor"></span>
         星历 {{ formatDateTime(comment.createTime) }}
      </div>
    </div>

    <!-- 分页改为跃迁导航 -->
    <div class="hyper-pagination">
      <button
        v-for="page in Math.ceil(commentStore.pagination.total / commentStore.pagination.pageSize)"
        :key="page"
        @click="loadComments(page)"
        class="jump-node"
        :class="{ 'active': page === currentPage }"
      >
        <div class="node-glow"></div>
        <span class="coordinate">[0x{{ page.toString(16) }}]</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalaxyCommentStore } from '@/stores/galaxyComment'
import type { GalaxyCommentDto } from '@/types/galaxyComment';
import { useNotificationStore } from '@/stores/notification';
import type { MessageDto } from '@/types/notification';

const props = defineProps<{
  galaxyId: string
  userId?: number
}>()

const commentStore = useGalaxyCommentStore()
const currentPage = ref(1)
const isLoading = ref(false)
const errorComments = ref<number[]>([]) // 存储无效评论ID
  const activeReplyId = ref<number | null>(null)
const activeDetailsId = ref<number | null>(null)
const replyContent = ref('')
const showAllReplies = ref<Record<number, boolean>>({})
const notificationStore = useNotificationStore()

onMounted(() => loadComments())

const loadComments = async (page = 1) => {
  try {
    isLoading.value = true
    errorComments.value = [] // 重置错误列表
    await commentStore.fetchComments({
      galaxyId: props.galaxyId,
      page,
      userId: props.userId
    })
    currentPage.value = page
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 增强版点赞处理
const handleLike = async (comment: GalaxyCommentDto) => {
  if (!comment.galaxyCommentId) {
    console.error('无效评论ID:', comment)
    return
  }

  if (!props.userId) {
    alert('请先登录')
    return
  }

  // 记录原始状态用于回滚
  const oldCount = comment.likeCount;
  const oldIsLiked = comment.isLiked;

  // 立即更新UI状态（乐观更新）
  comment.likeCount += comment.isLiked ? -1 : 1;
  comment.isLiked = !comment.isLiked;

  commentStore.currentComment = comment

  try {
    // 执行点赞/取消点赞操作
    const data = await commentStore.toggleLike({
      userId: props.userId,
      galaxyCommentId: comment.galaxyCommentId
    })

    // 如果是点赞操作（之前未点赞），发送通知
    if (data === "点赞成功") {
      // 构造消息内容
      const message: MessageDto = {
        userId: props.userId,                     // 当前用户ID
        receiverId: comment.userId,              // 评论作者ID
        content: `星际旅客#${props.userId}在#${props.galaxyId}星系中点赞了你的评论`,                // 通知内容
        type: 2                                  // 通知类型为2
      }

      // 发送通知（不需要等待结果）
      notificationStore.sendMessage(message).catch(e => {
        console.error('通知发送失败，但不影响点赞状态:', e)
      })
    }
  } catch (error) {
    // 操作失败时回滚状态
    comment.likeCount = oldCount;
    comment.isLiked = oldIsLiked;
    console.error('点赞操作失败:', error)
  }
}
function formatDateTime(isoString:string) {
  // 1. 创建Date对象解析ISO字符串
  const date = new Date(isoString);

  // 2. 提取日期时间组件
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份补零
  const day = String(date.getDate()).padStart(2, '0'); // 日期补零
  const hours = String(date.getHours()).padStart(2, '0'); // 小时补零
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 分钟补零

  // 3. 组合成YYYY-MM-DD HH:mm格式
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 切换回复框
const toggleReply = (comment: GalaxyCommentDto) => {
  if (activeReplyId.value === comment.galaxyCommentId) {
    activeReplyId.value = null;
  } else {
    activeReplyId.value = comment.galaxyCommentId;
    activeDetailsId.value = null; // 关闭详情面板
  }
}
// 切换详情面板
const toggleDetails = (comment: GalaxyCommentDto) => {
  if (activeDetailsId.value === comment.galaxyCommentId) {
    activeDetailsId.value = null;
  } else {
    activeDetailsId.value = comment.galaxyCommentId;
    activeReplyId.value = null; // 关闭回复框
  }
}

// 提交回复（带通知功能）
const submitReply = async (comment: GalaxyCommentDto) => {
  if (!replyContent.value.trim()) {
    alert('请先输入你的量子回复！');
    return;
  }

  if (!props.userId) {
    alert('请先登录，地球人！');
    return;
  }

  try {
    // 保存原始内容（用于通知）
    const contentToSend = replyContent.value;

    // 清空UI（优化用户体验）
    replyContent.value = '';
    activeReplyId.value = null;

    // 提交回复到服务器
    await commentStore.publishComment({
      parentId: comment.galaxyCommentId,
      content: contentToSend,
      galaxyId: props.galaxyId,
      userId: props.userId
    });

    // 仅当回复对象不是自己时发送通知
    if (props.userId !== comment.userId) {
      // 发送类型4的通知（评论回复通知）
      await notificationStore.sendMessage({
        userId: props.userId,
        receiverId: comment.userId, // 被回复的用户
        content: `星际旅客#${props.userId}回复了你的评论"${comment.content.substring(0, 30)}..."，他说: "${contentToSend.substring(0, 30)}..."`, // 截取部分内容
        type: 1 // 评论回复通知类型
      });

    }

    alert('回复已成功发射到星际网络！');
  } catch (error) {
    console.error('回复失败:', error);
    alert('量子回复失败！可能是虫洞干扰');
  }
}
</script>

<style scoped>
/* 深空背景 */
.cosmic-chat {
  background: radial-gradient(
  circle at 20% 30%,
  #001F3F 20%,      /* 暗物质蓝 */
  #000000 100%      /* 深空黑 */
);

  box-shadow: 0 0 30px #00f7ff22;
  padding: 2rem;
  border-radius: 0.5rem;
}

/* 全息投影标题 */
.hologram-title {
  font-family: 'Orbitron', sans-serif;
  color: #7df9ff;
  text-shadow: 0 0 10px #7df9ff;
  position: relative;
  margin-bottom: 2rem;
}

.signal::after {
  content: '';
  animation: signal 1.5s infinite steps(3);
}

@keyframes signal {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* 星舰日志条目 */
.starlog-entry {
  position: relative; /* 为绝对定位提供参考 */
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0;
  animation: materialize 0.6s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes materialize {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alien-avatar {
  position: relative;
  padding-top: 120%;
  background: #000b24;
  border-radius: 50%;
  overflow: hidden;
}

.energy-core {
  position: absolute;
  width: 60%;
  height: 60%;
  left: 20%;
  top: 20%;
  animation: core-rotate 10s linear infinite;
}

@keyframes core-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.quantum-bubble {
  background: #00124066;
  padding: 1.5rem;
  border-radius: 0.8rem;
  position: relative;
  border: 1px solid #00ffff33;
}

.nebula-actions {
  margin-top: 1rem;
}

.plasma-button {
  background: linear-gradient(45deg, #003366, #0066cc);
  border: 1px solid #00ffff;
  color: #aaf;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  transition: 0.3s all ease;
}

.plasma-button:hover {
  box-shadow: 0 0 15px #00ffff;
  transform: scale(1.05);
}

/* 其他细节样式... */
/* 深空背景 */
.cosmic-chat {
  background: radial-gradient(
    circle at 20% 30%,
    #001F3F 20%,
    #000000 100%
  );
  box-shadow: 0 0 30px #00f7ff22;
  padding: 2rem;
  border-radius: 0.5rem;
}

/* 全息投影标题 */
.hologram-title {
  font-family: 'Orbitron', sans-serif;
  color: #7df9ff;
  text-shadow: 0 0 10px #7df9ff;
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
}

.flicker {
  animation: flicker 3s infinite alternate;
}

@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px #7df9ff;
  }
  20%, 24%, 55% {
    opacity: 0.6;
    text-shadow: none;
  }
}

.signal {
  font-size: 0.9rem;
}
.signal::after {
  content: '';
  animation: signal 1.5s infinite steps(3);
}

@keyframes signal {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

/* 星舰日志条目 */
.starlog-entry {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0;
  animation: materialize 0.6s ease-out forwards;
  animation-delay: var(--delay);
  position: relative;
}

@keyframes materialize {
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.alien-avatar {
  position: relative;
  height: 80px;
  background: #000b24;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #00ffff33;
}

.energy-core {
  width: 40px;
  height: 40px;
  animation: core-rotate 10s linear infinite;
}

@keyframes core-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.species-tag {
  font-size: 0.7rem;
  color: #7d9bff;
  margin-top: -50px;
}

.quantum-bubble {
  background: #00124066;
  padding: 1.5rem;
  border-radius: 0.8rem;
  position: relative;
  border: 1px solid #00ffff33;
  box-shadow: 0 0 15px rgba(0, 195, 255, 0.2);
}

.quantum-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 247, 255, 0.1), transparent 70%);
  pointer-events: none;
}

.cosmic-icons {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0.5;
}

.pulsar-text {
  color: #e0f7fa;
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  position: relative;
}

.humor-rating {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background: rgba(0, 0, 30, 0.5);
  padding: 5px 10px;
  border-radius: 20px;
  width: fit-content;
}

.rating-label {
  font-size: 0.8rem;
  color: #7d9bff;
  margin-right: 8px;
}

.stars {
  display: flex;
}

.star {
  color: #555;
  font-size: 1.2rem;
  margin: 0 2px;
}

.star.active {
  color: #ffcc00;
  text-shadow: 0 0 8px #ffcc00;
}

.nebula-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.plasma-button {
  background: linear-gradient(45deg, #003366, #0066cc);
  border: 1px solid #00ffff;
  color: #aaf;
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  transition: 0.3s all ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.plasma-button:hover {
  box-shadow: 0 0 15px #00ffff;
  transform: scale(1.05);
}

.plasma-button.ionized {
  background: linear-gradient(45deg, #ff00cc30, #ff555546);
  border-color: #ff55ff;
}

.reply-btn {
  background: linear-gradient(45deg, #6600cc5d, #9900ff2d);
  border-color: #cc55ff;
}

.details-btn {
  background: linear-gradient(45deg, #00cc662c, #00ff9929);
  border-color: #55ffaa;
}

.energy-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%);
  opacity: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 0.5; }
  100% { opacity: 0; transform: scale(1.5); }
}

.reply-form {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #00ffff55;
}

.quantum-input {
  width: 100%;
  background: rgba(0, 20, 40, 0.7);
  border: 1px solid #3d67ff;
  border-radius: 10px;
  color: #e0f7fa;
  padding: 10px;
  font-size: 1rem;
  min-height: 80px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.quantum-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.5);
}

.submit-reply {
  background: linear-gradient(45deg, #cc00ff58, #ff00cc2e);
  border-color: #ff55ff;
}

.reply-list {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #00ffff55;
}

.reply-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 10, 30, 0.5);
  border-radius: 8px;
  border-left: 3px solid #ff00cc;
}

.reply-avatar {
  flex-shrink: 0;
}

.mini-core {
  width: 30px;
  height: 30px;
}

.reply-content {
  flex: 1;
}

.reply-user {
  display: block;
  font-size: 0.8rem;
  color: #ff55ff4c;
  margin-bottom: 3px;
}

.reply-text {
  font-size: 0.9rem;
  color: #aaf;
}

.reply-time {
  display: block;
  font-size: 0.7rem;
  color: #7d9bff;
  margin-top: 5px;
}

.show-more {
  background: rgba(50, 50, 100, 0.5);
  border: 1px solid #7d9bff;
  font-size: 0.9rem;
  padding: 5px 15px;
}

/* 详情面板 - 文档流显示 */
.details-panel {
  grid-column: 1 / -1; /* 跨所有列 */
  width: 100%;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(0, 15, 40, 0.9);
  border: 1px solid #00ffff;
  border-radius: 10px;
  box-shadow: 0 0 25px rgba(0, 195, 255, 0.6);
  position: relative; /* 相对定位 */
  z-index: 2;
  animation: expandIn 0.4s ease-out;
}

/* 添加展开动画 */
@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 调整星舰日志条目布局 */
.starlog-entry {
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: auto; /* 自动行高 */
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 确保内容区域不限制高度 */
.quantum-bubble {
  position: relative;
  min-height: auto; /* 移除固定高度 */
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #00ffff55;
}

.detail-header h4 {
  margin: 0;
  color: #7df9ff;
  font-size: 1.1rem;
}

.close-details {
  background: none;
  border: none;
  color: #ff5555;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-details:hover {
  transform: scale(1.2);
}

.detail-content {
  padding: 0 0.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #00ffff33;
}

.detail-label {
  width: 120px;
  color: #7d9bff;
  font-weight: bold;
}

.detail-value {
  flex: 1;
  color: #e0f7fa;
}

.all-replies {
  margin-top: 1.5rem;
}

.all-replies h5 {
  color: #7df9ff;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #00ffff55;
}

.full-reply {
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: rgba(0, 15, 30, 0.5);
  border-radius: 6px;
  border-left: 2px solid #ff00cc;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reply-user {
  color: #ff55ff;
  font-weight: bold;
}

.reply-time {
  color: #7d9bff;
  font-size: 0.8rem;
}

.reply-text {
  color: #aaf;
  line-height: 1.4;
}

.no-replies {
  text-align: center;
  color: #7d9bff;
  font-style: italic;
  padding: 1rem;
  border: 1px dashed #00ffff55;
  border-radius: 8px;
}

.stardate {
  position: absolute;
  bottom: -20px;
  right: 20px;
  font-size: 0.7rem;
  color: #7d9bff;
  background: rgba(0, 10, 30, 0.7);
  padding: 3px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.flashing-cursor {
  display: inline-block;
  width: 8px;
  height: 14px;
  background: #00f7ff;
  margin-right: 5px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hyper-pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.jump-node {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 30, 60, 0.7);
  border: 1px solid #3d67ff;
  color: #7d9bff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.jump-node:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px #3d67ff;
}

.jump-node.active {
  background: rgba(61, 103, 255, 0.3);
  box-shadow: 0 0 20px #3d67ff;
}

.node-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(61, 103, 255, 0.4), transparent 70%);
  animation: pulse 2s infinite;
}
</style>
