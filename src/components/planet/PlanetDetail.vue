<!-- components/PlanetDetail.vue -->
<template>
  <div class="planet-detail cosmic-bg">
    <!-- 头部信息 -->
    <div class="detail-header cosmic-card">
      <h1 class="title cosmic-glow">{{ planet.contentTitle }}</h1>
      <div class="meta cosmic-data">
        <span class="visitors">👨‍🚀拥有者：星际旅客 #{{ planet.userId }} </span>
        <span class="visitors">👥访问人数：{{ planet.visitCount }} </span>
        <span class="created-at">📅创建时间：{{ formatDateTime(planet.createTime) }}</span>
      </div>
      <div class="btn-section">
        <button
          v-if="store.currentPlanet?.userId == userStore.userInfo.userId"
          @click="togglePublishStatus"
          class="publish-btn"
          :class="{'published': planet.visibility === 1}"
          :disabled="publishing"
        >
          {{ planet.visibility === 1 ? '✅ 已上传到知识宇宙' : '🚀 上传到知识宇宙'  }}
          <span v-if="publishing" class="loading"></span>
        </button>

        <!-- 新增的设为最爱按钮 -->
        <button
          v-if="store.currentPlanet?.userId == userStore.userInfo.userId"
          @click="toggleFavoriteStatus"
          class="favorite-btn"
          :class="{'favorited': isFavorite}"
          :disabled="favoriting"
        >
          {{ isFavorite ? '⭐ 已设为星际最爱' : '✨ 设为星际最爱' }}
          <span v-if="favoriting" class="loading"></span>
        </button>

        <div class="planet-theme">
        <span class="theme-label">主题：</span>
        <span class="theme-icon">
          {{ themeIcon }}
        </span>
        <span class="theme-name">{{ themeName }}</span>
      </div>
      </div>


    </div>

    <!-- 主要内容区 -->
    <main class="detail-content">
       <!-- 左边：描述区 -->
       <div class="left-section">
      <section class="intro-section">
      <div class="section-header">
        <h2>星球档案</h2>
        <button @click="showDescriptionForm = true" class="custom-btn edit-btn"  v-if="store.currentPlanet?.userId == userStore.userInfo.userId">更新描述</button>
      </div>
      <div class="intro-grid">
        {{ planet.description }}
      </div>
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
      </section>

      <section class="knowledge-section">
        <div class="section-header">
          <h2>星球知识库</h2>
          <button @click="showCDetailForm = true" class="custom-btn edit-btn"  v-if="store.currentPlanet?.userId == userStore.userInfo.userId">更新知识</button>
        </div>
        <div class="knowledge-grid">
          {{ planet.contentDetail }}
        </div>
      </section>
      <div v-if="showCDetailForm" class="modal-overlay">
        <div class="modal-content">
          <h3>更新知识</h3>

          <div class="form-group">
            <label for="new-cdetail">知识:</label>
            <textarea
              id="new-cdetail"
              v-model="CDetailForm.newDetail"
              rows="3"
              maxlength="1000"
            ></textarea>
            <p class="char-count">{{ CDetailForm.newDetail?.length }}/1000</p>
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
      </div>
      <!-- 读者评论 -->

      <!-- 右边：评论区 -->
      <div class="right-section">
      <section class="comments-section">
        <div>
          <PlanetCommentList />
        </div>
      </section>
    </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { usePlanetStore } from '@/stores/planetStore';
import type { KnowledgePlanetDto } from '@/types/planet';
import { useUserStore } from '@/stores/user';
import PlanetCommentList from '@/components/planet/PlanetCommentList.vue';

const showDescriptionForm = ref(false)
const showCDetailForm = ref(false)
const store = usePlanetStore();
const userStore = useUserStore();

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

// 在props下方添加计算星球主题的方法
const themeName = computed(() => {
  switch(props.planet.themeId) {
    case 1: return '学习星球';
    case 2: return '生活空间';
    case 3: return '游戏世界';
    default: return '未知领域';
  }
});

const themeIcon = computed(() => {
  switch(props.planet.themeId) {
    case 1: return '📚'; // 书本图标
    case 2: return '🍕'; // 房子图标
    case 3: return '🎮'; // 游戏手柄图标
    default: return '🪐'; // 星球图标
  }
});
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



</script>

<style scoped>
.planet-detail {
  margin: 0 auto;
  padding: 2rem;
  height: 130vh;
  margin-top: -50px;
}

.detail-header {
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 2.5rem;
  color:#00c9ff;
  margin-bottom: 0.5rem;
}

.meta {
  display: flex;
  gap: 1.5rem;
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

/* 修改主要内容区为Flex布局 */
.detail-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* 左边区域 */
.left-section {
  flex: 5; /* 占据50%宽度 */
}

/* 右边区域 */
.right-section {
  flex: 5; /* 占据50%宽度 */
  position: relative;
  height: 100%;
}

/* 评论区设置 */
.comments-section {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 设置固定高度 */
  border: 1px solid rgba(48, 161, 231, 0.406);
  border-radius: 8px;
  padding: 1rem;

}

/* 评论列表，设置滚动 */
.comment-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 5px; /* 防止滚动条遮挡内容 */
}

/* 评论输入框固定在底部 */
.comment-form {
  position: sticky;
  bottom: 0;
  background: rgba(16, 22, 58, 0.9);
  padding: 1rem 0;
  border-top: 1px solid rgba(0, 238, 255, 0.3);
}

.comment-form textarea {
  width: 100%;
  height: 80px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00eeff;
  color: white;
  padding: 10px;
  border-radius: 4px;
}

.comment-form button {
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  color: #0a0f2b;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.comment-form button:hover {
  background: linear-gradient(45deg, #00b3e6, #00d1ff);
  box-shadow: 0 0 10px rgba(0, 201, 255, 0.5);
}

/* 响应式设计：在小屏幕下改为上下布局 */
@media (max-width: 768px) {
  .detail-content {
    flex-direction: column;
  }

  .left-section, .right-section {
    width: 100%;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* 增加分隔空间 */
.section-divider {
  height: 40px; /* 增加40px的垂直间距 */
}

/* 或者使用外边距增加间距 */
.intro-section {
  padding: 40px;
  margin-bottom: 40px; /* 在星球档案下方增加40px间距 */
  border: 1px solid rgba(48, 161, 231, 0.406);
  height: 30vh;
  border-radius: 1%;
}

.knowledge-section {
  padding: 40px;
  margin-top: 40px; /* 在星际知识库上方增加40px间距 */
  border: 1px solid rgba(48, 161, 231, 0.406);
  height: 66vh;
  border-radius: 1%;
}

/* 响应式调整：小屏幕减少间距 */
@media (max-width: 768px) {
  .section-divider {
    height: 20px;
  }

  .intro-section {
    margin-bottom: 20px;
  }

  .knowledge-section {
    margin-top: 20px;
  }
}
.cosmic-bg {
  background:  #0a1a2a;
  color: #e0f7fa;
  padding: 20px;
  min-height: 100vh;
  font-family: 'Orbitron', sans-serif;
}

.cosmic-card {
  background: rgba(12, 35, 66, 0.7);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
}

.cosmic-section {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(8, 25, 48, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 238, 255, 0.3);
}

/* 编辑星系按钮 - 渐变效果 */
.edit-btn {
  background: linear-gradient(to right, #9a9aff 0%, #fad0c4 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 编辑图标 - 纯CSS实现 */
.edit-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>');
  background-size: contain;
}
/* 自定义按钮基础样式 */
.custom-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}
/* 按钮悬停效果 */
.custom-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

/* 按钮点击效果 */
.custom-btn:active {
  transform: translateY(1px);
}

/* 添加滚动条样式 */
.intro-grid,
.knowledge-grid {
  overflow-y: auto; /* 垂直滚动 */
  max-height: calc(100% - 50px); /* 预留标题空间 */
  padding-right: 5px; /* 避免滚动条遮挡内容 */
  scrollbar-width: thin; /* Firefox支持 */
  scrollbar-color: #00c8ff2c rgba(0, 201, 255, 0.1); /* Firefox滑块颜色 */
}

/* Webkit浏览器滚动条定制 */
.intro-grid::-webkit-scrollbar,
.knowledge-grid::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.intro-grid::-webkit-scrollbar-track,
.knowledge-grid::-webkit-scrollbar-track {
  border-radius: 4px; /* 圆角 */
}

/* 新增星球主题样式 */
.planet-theme {
  display: flex;
  align-items: center;
  border-radius: 30px;
  font-size: 1rem;
}

.theme-icon {
  font-size: 1.8rem;
  margin: 0 10px;
  animation: pulse 2s infinite;
}

.theme-name {
  font-weight: bold;
  color: #00eeff;
  text-shadow: 0 0 8px rgba(0, 238, 255, 0.7);
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}


</style>
