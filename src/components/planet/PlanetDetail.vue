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
      <div class="btn-section">
        <button
          @click="togglePublishStatus"
          class="publish-btn"
          :class="{'published': planet.visibility === 1}"
          :disabled="publishing"
        >
          {{ planet.visibility === 1 ? '已上传到知识宇宙' : '上传到知识宇宙' }}
          <span v-if="publishing" class="loading"></span>
        </button>

        <!-- 新增的设为最爱按钮 -->
        <button
          @click="toggleFavoriteStatus"
          class="favorite-btn"
          :class="{'favorited': isFavorite}"
          :disabled="favoriting"
        >
          {{ isFavorite ? '已设为最爱' : '设为最爱' }}
          <span v-if="favoriting" class="loading"></span>
        </button>
      </div>

    </header>

    <!-- 主要内容区 -->
    <main class="detail-content">
      <section class="description">
        <h2>星球描述</h2>
        <p>{{ planet.description }}</p>
      </section>
      <button @click="showDescriptionForm = true" class="edit-btn">更新描述</button>
      <div v-if="showDescriptionForm" class="modal-overlay">
        <div class="modal-content">
          <h3>更新描述</h3>

          <div class="form-group">
            <label for="new-cdetail">描述:</label>
            <textarea
              id="new-cdetail"
              v-model="DescriptionForm.newDescription"
              rows="3"
              maxlength="200"
            ></textarea>
            <p class="char-count">{{ DescriptionForm.newDescription?.length }}/200</p>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showDescriptionForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button @click="handleUpdateDescription" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>

      <!-- 推荐知识 -->
      <section class="knowledge-section">
        <h2>推荐知识</h2>
        <div class="knowledge-grid">
          {{ planet.contentDetail }}
        </div>
      </section>
      <button @click="showCDetailForm = true" class="edit-btn">更新知识</button>
      <div v-if="showCDetailForm" class="modal-overlay">
        <div class="modal-content">
          <h3>更新知识</h3>

          <div class="form-group">
            <label for="new-cdetail">知识:</label>
            <textarea
              id="new-cdetail"
              v-model="CDetailForm.newDetail"
              rows="3"
              maxlength="200"
            ></textarea>
            <p class="char-count">{{ CDetailForm.newDetail?.length }}/200</p>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showCDetailForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button @click="handleUpdateCDetail" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>
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
import { computed, reactive, ref } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import { useUserStore } from '@/stores/user';

const showDescriptionForm = ref(false)
const showCDetailForm = ref(false)
const store = usePlanetStore();
const userStore = useUserStore();
const newComment = ref('');
const publishing = ref(false);
const DescriptionForm = reactive({
  newDescription: ''
})

const CDetailForm = reactive({
  newDetail: ''
})


const props = defineProps<{
  planet: KnowledgePlanetDto;
}>();

const favoriting = ref(false);
const isFavorite = computed(() => {
  return userStore.userInfo?.favoritePlanetId === props.planet.planetId;
});

// 新增方法：切换收藏状态
const toggleFavoriteStatus = async () => {
  try {
    favoriting.value = true;

    if (!userStore.userInfo) {
      alert('请先登录后再操作');
      return;
    }
    const planet = store.currentPlanet
    console.log("isFavorite",isFavorite.value)
    if (isFavorite.value) {
      // 取消收藏
      await store.setFavorPlanet('');
      alert('已取消最爱星球');
    } else {
      // 设为最爱
      await store.setFavorPlanet(planet.planetId);
      alert('已设为最爱星球');
    }

    // 更新用户信息
    await userStore.fetchUserInfo();

  } catch (error) {
    console.error('操作失败:', error);
    alert('操作失败，请重试');
  } finally {
    favoriting.value = false;
  }
};

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

const handleUpdateCDetail = async () => {
  try {
    // 确保 planetId 存在
    if (!store.currentPlanet?.planetId) {
      throw new Error("当前星球ID不存在");
    }

    // 分开传递两个参数
    await store.updateContentDetail(
      store.currentPlanet.planetId,  // 字符串类型
      CDetailForm.newDetail??'-1'          // 字符串类型
    );
    showCDetailForm.value = false
    alert('推荐知识更新成功！')
  } catch (error) {
    console.error('推荐知识更新失败:', error)
  }
}

const handleUpdateDescription = async() => {
  try{
    if (!store.currentPlanet?.planetId) {
      throw new Error("当前星球ID不存在");
    }

    await store.updateDescription(
      store.currentPlanet.planetId,  // 字符串类型
      DescriptionForm.newDescription??'-1'          // 字符串类型
    );

    showDescriptionForm.value = false
    alert('星球描述更新成功！')
  }catch(error){
    console.error('推荐知识更新失败:', error)
  }
}

// 新增方法：切换发布状态
const togglePublishStatus = async () => {
  try {
    publishing.value = true;
    const planet = store.currentPlanet
    if(planet){
        if (planet.visibility === 0) {
        // 当前是未上传状态，执行上传
        const message = await store.updateVisibility(planet.planetId, 1);
        if (message) {
          // 更新本地数据
          planet.visibility = 1;
          alert('星球已成功上传');
        }
      } else {
        // 当前是已上传状态，取消上传
        await store.updateVisibility(planet.planetId, 0);
        // 更新本地数据
        planet.visibility = 0;
        alert('已取消上传');
      }
    }

  } catch (error) {
    console.error('操作失败:', error);
    alert('操作失败，请重试');
  } finally {
    publishing.value = false;
  }
};


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
  border-bottom: 2px solid #eeeeee1c;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  color:#00eeff;
  background: linear-gradient(145deg, #0a1a2a, #0c2342);
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #00eeff;
  box-shadow: 0 0 30px rgba(0, 195, 255, 0.5);
  transform: scale(0.8) rotateX(10deg);
  animation: modalEntrance 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}
@keyframes modalEntrance {
  to { transform: scale(1) rotateX(0); }
}
/* 按钮组 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn, .submit-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  border: none;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(236, 240, 241, 0.1);
  color: #7f8c8d;
  border: 1px solid #7f8c8d;
}

.cancel-btn:hover {
  background: rgba(213, 219, 219, 0.2);
}

.submit-btn {
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  color: #0a0f2b;
  font-weight: bold;
}

.submit-btn:hover {
  background: linear-gradient(45deg, #00b3e6, #00d1ff);
  box-shadow: 0 0 15px rgba(0, 201, 255, 0.6);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-manager {
    padding: 1rem;
    margin: 1rem;
  }

  .user-avatar {
    width: 120px;
    height: 120px;
  }

  .modal-content {
    width: 95%;
  }
}

/* 输入框激光扫描效果 */
input:focus, textarea:focus {
  background: linear-gradient(to bottom,
    rgba(0,240,255,0.1) 0%,
    rgba(0,240,255,0) 100%);
  animation: scan 2s infinite;
  border-color: #00eeff;
  box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
  color:white
}

@keyframes scan {
  0% { box-shadow: 0 0 5px rgba(0, 238, 255, 0.5); }
  50% { box-shadow: 0 0 15px rgba(0, 238, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 238, 255, 0.5); }
}
.form-group {

  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}
.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.publish-btn {
  background-color: #2196F3; /* 蓝色-未上传状态 */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.publish-btn.published {
  background-color: #4CAF50; /* 绿色-已上传状态 */
}

.publish-btn:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}
/* 按钮容器 */
.btn-section {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 最爱按钮样式 */
.favorite-btn {
  background-color: #FF9800; /* 橙色-未收藏状态 */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.favorite-btn.favorited {
  background-color: #FF5722; /* 深橙色-已收藏状态 */
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.5);
}

.favorite-btn:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}
/* 加载动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}
</style>
