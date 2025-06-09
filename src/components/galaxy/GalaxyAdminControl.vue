<template>
  <!-- 固定在左侧边缘中间的按钮 -->
   <div v-if="userStore.userInfo.userId === galaxyStore.currentGalaxy?.userId">
  <div class="admin-panel-container">
    <button
      class="control-button cosmic-btn"
      @click="toggleAdminPanel"
    >
      <i class="icon-administrator">👑星系成员管理</i>
    </button>

    <!-- 管理员面板 -->
    <div class="admin-panel" :class="{ 'panel-open': isPanelOpen }">
      <div class="panel-header">
        <h3>星系管理员</h3>
        <button class="close-btn" @click="isPanelOpen = false">
          <i class="icon-close">×</i>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索管理员..."
          class="search-input"
        />
        <i class="icon-search">🔍</i>
      </div>

      <!-- 管理员列表 -->
      <div class="admin-list">
        <div
          v-for="admin in filteredAdmins"
          :key="admin.adminId"
          class="admin-item"
        >
          <div class="admin-info">
            <div  class="cosmic-avatar">👨‍🚀</div>
            <div>
              <div class="cosmic-username">星际旅客#{{ admin.userId }}</div>
            </div>
          </div>
          <button
            class="revoke-btn"
            @click="handleRevokeAdmin(admin.userId)"
            :disabled="isCurrentUser(admin.userId)"
          >
            撤销
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="adminStore.loading" class="loading-indicator">
          <span class="loading-text">加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-if="!adminStore.loading && filteredAdmins.length === 0" class="empty-state">
          暂无管理员
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGalaxyAdminStore } from '@/stores/galaxyAdmin';
import { useUserStore } from '@/stores/user';
import { useGalaxyStore } from '@/stores/galaxy';

const adminStore = useGalaxyAdminStore();
const userStore = useUserStore();
const galaxyStore = useGalaxyStore();

const isPanelOpen = ref(false);
const searchKeyword = ref('');

// 获取当前星系ID
const currentGalaxyId = computed(() => galaxyStore.currentGalaxy?.galaxyId);

// 过滤后的管理员列表
const filteredAdmins = computed(() => {
  if (!adminStore.currentAdmins) return [];
  console.log("不为空",adminStore.currentAdmins)
  return adminStore.currentAdmins.filter(admin =>
    admin.userId
  );
});

// 检查是否是当前用户
const isCurrentUser = (userId: number) => {
  return userStore.userInfo?.userId === userId;
};

// 切换面板显示
const toggleAdminPanel = async () => {
  isPanelOpen.value = !isPanelOpen.value;

  if (isPanelOpen.value && currentGalaxyId.value) {
    await adminStore.fetchAdminList(currentGalaxyId.value);
  }
};

// 撤销管理员
const handleRevokeAdmin = async (userId: number) => {
  if (!currentGalaxyId.value) return;

  if (!confirm(`确定要撤销该用户的管理员权限吗？`)) return;

  try {
    await adminStore.revokeAdmin({
      galaxyId: currentGalaxyId.value,
      userId
    });
  } catch (error) {
    console.error('撤销管理员失败:', error);
    alert('操作失败，请重试');
  }
};

// 监听星系变化
watch(currentGalaxyId, (newId) => {
  if (newId && isPanelOpen.value) {
    adminStore.fetchAdminList(newId);
  }
});
</script>

<style scoped>
.admin-panel-container {
  position: relative;
}



/* 管理员面板 */
.admin-panel {
  position: fixed;
  left: -350px;
  top: 0;
  height: 100vh;
  width: 320px;
  background: linear-gradient(145deg, #0a1a2a, #0c2342);
  z-index: 999;
  border-right: 1px solid rgba(48, 161, 231, 0.4);
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.5);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-open {
  transform: translateX(350px);
}

.panel-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  margin: 0;
  color: #00eeff;
  font-size: 1.4rem;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
}

.close-btn {
  background: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  color: #ff3838;
  transform: scale(1.1);
}

/* 搜索框 */
.search-box {
  position: relative;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border-radius: 30px;
  border: 1px solid #00c9ff;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.5);
}

.icon-search {
  position: absolute;
  left: 35px;
  top: 50%;
  transform: translateY(-50%);
  color: #00c9ff;
}

/* 管理员列表 */
.admin-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #00c9ff rgba(0, 201, 255, 0.1);
}

.admin-list::-webkit-scrollbar {
  width: 8px;
}

.admin-list::-webkit-scrollbar-track {
  background: rgba(0, 201, 255, 0.1);
  border-radius: 4px;
}

.admin-list::-webkit-scrollbar-thumb {
  background: #00c9ff;
  border-radius: 4px;
  border: 1px solid rgba(0, 238, 255, 0.5);
}

.admin-list::-webkit-scrollbar-thumb:hover {
  background: #00eeff;
  box-shadow: 0 0 5px rgba(0, 238, 255, 0.8);
}

.admin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
  border: 1px solid rgba(0, 201, 255, 0.1);
}

.admin-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 238, 255, 0.3);
  transform: translateX(5px);
}

.admin-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid #00c9ff;
}

.avatar-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 15px;
  background: linear-gradient(45deg, #4a69bd, #6a89cc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border: 2px solid #00c9ff;
}

.admin-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 3px;
}

.admin-email {
  font-size: 0.85rem;
  color: #aaa;
}

/* 撤销按钮 */
.revoke-btn {
  padding: 8px 16px;
  border-radius: 4px;
  background: linear-gradient(to right, #ff6b6b, #ff3838);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 56, 56, 0.3);
}

.revoke-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #ff5252, #ff1a1a);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 26, 26, 0.4);
}

.revoke-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 加载指示器 */
.loading-indicator {
  padding: 20px;
  text-align: center;
}

.loading-text {
  color: #00c9ff;
  font-style: italic;
}

/* 空状态 */
.empty-state {
  padding: 20px;
  text-align: center;
  color: #aaa;
  font-style: italic;
}
.control-button {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  width: 60px;
  height: 150px;
  border-radius: 0 25px 25px 0;
  padding: 12px 24px;
  background: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  margin-left: -2px;
}
.cosmic-btn {
  background: rgba(25, 30, 70, 0.6);
  border: 1px solid #3d67ff;
  color: #e0f7fa;
  transition: all 0.3s ease;
}

.cosmic-btn:hover {
  background: rgba(61, 103, 255, 0.3);
  box-shadow: 0 5px 15px rgba(61, 103, 255, 0.5);
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
</style>
