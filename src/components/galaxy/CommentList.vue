<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalaxyCommentStore } from '@/stores/galaxyComment'

const props = defineProps<{
  galaxyId: number
  userId?: number
}>()

const commentStore = useGalaxyCommentStore()
const currentPage = ref(1)

onMounted(() => loadComments())

const loadComments = async (page = 1) => {
  try {
    await commentStore.fetchComments({
      galaxyId: props.galaxyId,
      page,
      userId: props.userId
    })
    currentPage.value = page
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}
</script>


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
      :key="comment.commentId"
      class="starlog-entry"
      :style="`--delay: ${index * 0.1}s`"
    >
      <!-- 头像改为种族标识 -->
      <div class="alien-avatar">
        <svg class="energy-core"><use href="#energy-core"></use></svg>
        <span class="species-tag">碳基生物#${comment.userId}</span>
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
            @click="commentStore.toggleLike({
              userId: userId!,
              commentId: comment.commentId
            })"
            class="plasma-button"
            :class="{ 'ionized': comment.isLiked }"
          >
            <span class="energy-pulse"></span>
            ⚡ 能量共鸣 ({{ comment.likes }})
          </button>
        </div>
      </div>

      <!-- 时间戳改为星历 -->
      <div class="stardate">
        <span class="flashing-cursor"></span>
        🛜 星历 {{ new Date().getTime() }}.cyclic
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

<style scoped>
/* 深空背景 */
.cosmic-chat {
  background: linear-gradient(
    45deg,
    #0a0a2e 0%,
    #1a1a4a 50%,
    #0a0a2e 100%
  );
  border: 1px solid #00f7ff55;
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
</style>
