<template>
  <div class="galaxy-detail-page">
    <!-- 顶部操作栏 -->
    <div class="action-bar">

    </div>

    <!-- 星系信息展示区 -->
    <div class="info-container" :key="galaxyUpdateKey">
      <GalaxyProfile :galaxyId="galaxyId" />

      <!-- 权限标签展示 -->
      <div class="permission-tags">
        <div class="tag-group">
          <el-tag v-if="galaxyStore.currentGalaxy?.label" size="large" class="tag">
            {{ galaxyStore.currentGalaxy.label }}
          </el-tag>
          <el-tag :type="galaxyStore.currentGalaxy?.permission === 0 ? 'success' : 'warning'" size="large">
            {{ galaxyStore.currentGalaxy?.permission === 0 ? '公开星系' : '私有星系' }}
          </el-tag>
        </div>
        <div class="button-group">
          <button class="custom-btn enter-btn" @click="enterGalaxy">
            进入星系
          </button>
          <button class="custom-btn edit-btn" @click="openEditor">
            <span class="edit-icon"  v-if="galaxyStore.currentGalaxy?.userId == userStore.userInfo.userId"></span> 编辑星系
          </button>
        </div>
      </div>
    </div>

    <!-- 固定在底部的评论发布器 -->
    <div class="fixed-comment-publisher">
      <CommentPublisher :galaxyId="galaxyId" :userId="currentUserId" />
    </div>
    <!-- 编辑对话框 -->
    <GalaxyEditor
      v-model="showEditor"
      :galaxy="galaxyStore.currentGalaxy"
      @updated="handleGalaxyUpdated"
    />

    <!-- 响应式布局 -->
    <div class="content">
      <section class="comment-section">
        <CommentList :galaxyId="galaxyId" :userId="currentUserId" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGalaxyStore } from '@/stores/galaxy'
import GalaxyProfile from './GalaxyProfile.vue'
import CommentList from './CommentList.vue'
import CommentPublisher from './CommentPublisher.vue'
import GalaxyEditor from '@/components/galaxy/GalaxyEditor.vue'
import type { KnowledgeGalaxyDto } from '@/types/galaxy'
import router from '@/router'

const route = useRoute()
const userStore = useUserStore()
const galaxyStore = useGalaxyStore()
const currentGalaxy = ref<KnowledgeGalaxyDto | null>(null) // 本地存储当前星系数据
const galaxyUpdateKey = ref(0) // 用于强制刷新视图的key
const galaxy = computed(() => galaxyStore.currentGalaxy)
// 响应式数据
const showEditor = ref(false)
const galaxyId = computed(() =>
  galaxyStore.currentGalaxy?.galaxyId ??
  (Array.isArray(route.params.galaxyId) ?
    route.params.galaxyId[0] :
    route.params.galaxyId)
)

const currentUserId = computed(() => userStore.userInfo?.userId ?? -1)

// 监听星系数据变化
watch(() => galaxyStore.currentGalaxy, (newVal) => {
  if (newVal) {
    currentGalaxy.value = { ...newVal } // 创建新对象确保响应式
  }
}, { immediate: true })


// 打开编辑器
const openEditor = () => {
  showEditor.value = true
}


// 处理星系更新事件
const handleGalaxyUpdated = (updatedData: Partial<KnowledgeGalaxyDto>) => {
  // 更新本地数据
  if (currentGalaxy.value) {
    currentGalaxy.value = {
      ...currentGalaxy.value,
      ...updatedData
    }
  }

  // 强制刷新视图
  galaxyUpdateKey.value += 1

  // 可选：更新store中的当前星系
  if (galaxyStore.currentGalaxy) {
    galaxyStore.currentGalaxy = { ...galaxyStore.currentGalaxy, ...updatedData }
  }

  console.log('星系信息已更新', updatedData)
}

const enterGalaxy = async() =>{
      console.log('探索星系:', galaxy.value?.name);
      router.push({
        name: 'GalaxyPlanets', // 使用路由配置中的命名路由
        params: {
          galaxyId: galaxy.value?.galaxyId // 传递星系ID作为动态参数
        }
      });
      galaxyStore.currentGalaxy = galaxy.value
      await galaxyStore.initPlanets(galaxy.value?.galaxyId)
      // 这里可以导航到星系详情页
}

</script>

<style scoped>


/* 移动端适配 */
@media (max-width: 768px) {
  .galaxy-editor {
    width: 90% !important;
    max-width: 90% !important;
  }
}

.galaxy-detail-page {
  margin-top: -100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.permission-tags {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.tag {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  font-size: 14px;
}


.planet-management,
.comment-section {
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1a2a6c;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 10px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .info-container {
    padding: 15px;
  }

  .planet-management,
  .comment-section {
    padding: 15px;
  }
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px; /* 添加按钮间距 */
  margin-bottom: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column; /* 小屏垂直排列 */
    align-items: flex-end;
  }
}
/* 权限标签容器 - Flex布局 */
.permission-tags {
  display: flex;
  justify-content: space-between; /* 标签左对齐，按钮右对齐 */
  align-items: center; /* 垂直居中 */

}

/* 标签组 */
.tag-group {
  display: flex;
  gap: 10px; /* 标签间距 */
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 12px; /* 按钮间距 */
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

/* 进入星系按钮 - 渐变效果 */
.enter-btn {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: white;
}

/* 编辑星系按钮 - 渐变效果 */
.edit-btn {
  background: linear-gradient(to right, #ff9a9e 0%, #fad0c4 100%);
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

/* 按钮悬停效果 */
.custom-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

/* 按钮点击效果 */
.custom-btn:active {
  transform: translateY(1px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .permission-tags {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .button-group {
    width: 100%;
    justify-content: flex-end;
  }

  .custom-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
