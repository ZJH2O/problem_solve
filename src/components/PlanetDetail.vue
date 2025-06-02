<!-- components/PlanetDetail.vue -->
<template>
  <div class="planet-detail">
    <!-- 头部信息 -->
    <header class="detail-header">
      <h1 class="title">{{ planet.contentTitle }}</h1>
      <div class="meta">
        <span class="visitors">👥 {{ planet.visitCount }} 访问</span>
        <span class="created-at">📅 {{ formatDateTime(planet.createTime) }}</span>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="detail-content">
      <section class="description">
        <h2>星球描述</h2>
        <p>{{ planet.description }}</p>
      </section>

      <!-- 推荐知识 -->
      <section class="knowledge-section">
        <h2>推荐知识</h2>
        <div class="knowledge-grid">
          <div
            v-for="item in planet.details?.recommendedKnowledge"
            :key="item.id"
            class="knowledge-card"
          >
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
            <a :href="item.sourceUrl" target="_blank">查看原文</a>
          </div>
        </div>
      </section>

      <!-- 作者留言 -->
      <section class="author-messages">
        <h2>作者留言</h2>
        <div class="message-list">
          <div
            v-for="message in planet.details?.authorMessages"
            :key="message.id"
            class="message-card"
          >
            <div class="author-info">
              <img
                :src="message.author.avatarUrl"
                :alt="message.author.username"
                class="avatar"
              >
              <span class="username">{{ message.author.username }}</span>
            </div>
            <p class="content">{{ message.content }}</p>
            <div class="attachments" v-if="message.attachments">
              <a
                v-for="att in message.attachments"
                :key="att.url"
                :href="att.url"
                class="attachment"
              >
                {{ att.type }}附件
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 读者评论 -->
      <section class="comments-section">
        <h2>读者评论（{{ commentCount }}）</h2>
        <div class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="写下你的评论..."
          ></textarea>
          <button @click="submitComment">提交评论</button>
        </div>
        <div class="comment-list">
          <div
            v-for="comment in planet.contentDetail?.readerComments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="user-info">
              <img
                :src="comment.user.avatarUrl"
                :alt="comment.user.username"
                class="avatar"
              >
              <span class="username">{{ comment.user.username }}</span>
            </div>
            <p class="content">{{ comment.content }}</p>
            <div class="comment-actions">
              <button @click="toggleLike(comment.id)">
                👍 {{ comment.reactions?.like || 0 }}
              </button>
              <button @click="showReplyForm(comment.id)">回复</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  planet: KnowledgePlanetDto;
}>();

const store = usePlanetStore();
const userStore = useUserStore();
const newComment = ref('');

// 计算属性
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

const commentCount = computed(() => {
  return props.planet.details?.readerComments?.length || 0;
});

// 方法
const submitComment = () => {
  if (!userStore.currentUser) {
    alert('请先登录后再发表评论');
    return;
  }

  if (newComment.value.trim()) {
    store.addComment(props.planet.id, {
      content: newComment.value,
      user: userStore.currentUser
    });
    newComment.value = '';
  }

  console.log('当前星球数据:', props.planet);
  console.log('Store数据:', store.planets);
};

const toggleLike = (commentId: string) => {
  store.toggleReaction(props.planet.id, commentId, 'like');
};

const showReplyForm = (commentId: string) => {
  // 实现回复功能
};
</script>

<style scoped>
.planet-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.detail-header {
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.meta {
  display: flex;
  gap: 1.5rem;
  color: #666;
}

.detail-content {
  display: grid;
  gap: 3rem;
}

/* 知识卡片样式 */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.knowledge-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s;
}

.knowledge-card:hover {
  transform: translateY(-3px);
}

/* 作者留言样式 */
.message-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* 评论区域样式 */
.comment-form {
  margin-bottom: 2rem;
}

.comment-form textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 1rem;
}

.comment-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .planet-detail {
    padding: 1rem;
  }

  .title {
    font-size: 1.8rem;
  }
}
</style>
