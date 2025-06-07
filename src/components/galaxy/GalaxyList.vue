<template>
  <div class="galaxy-list-container">
    <div class="creator-bg" v-if="galaxyStore.showCreator">
      <GalaxyCreator @close="galaxyStore.showCreator = false" />
    </div>
    <!-- 头部区域 -->
    <div class="galaxy-header">
      <div class="title-container">
        <div class="starry-background"></div>
        <h1 class="main-title">知识星系导航</h1>
        <p class="subtitle">探索知识宇宙的无限可能</p>
      </div>

      <div class="controls">
        <div class="search-container">

          <input
            v-model="searchTerm"
            type="text"
            placeholder="搜索星系名称或描述..."
            class="search-input"
          />
        </div>

        <button class="add-galaxy-btn" @click="addGalaxy">
          <i class="fas fa-plus"></i>
          <span>创建新星系</span>
        </button>
      </div>
    </div>

    <!-- 星系列表 -->
    <div class="galaxy-grid">
      <div
        v-for="galaxy in filteredGalaxies"
        :key="galaxy.galaxyId"
        class="galaxy-card"
        :class="{'public': galaxy.permission === 1, 'private': galaxy.permission === 0}"
      >
        <!-- 添加删除按钮 -->
        <button class="delete-btn" @click.stop="confirmDeleteGalaxy(galaxy)" v-if="userStore.userInfo.userId==galaxy.userId">
          ×
        </button>

        <div class="card-header">
          <div class="galaxy-icon">
          </div>
          <div class="title-container">
            <h3 class="galaxy-name">{{ galaxy.name }}</h3>
            <div class="permission-badge">
              {{ galaxy.permission === 1 ? '公开星系' : '私有星系' }}
            </div>
          </div>
        </div>

        <div class="galaxy-info">
          <p class="galaxy-label">{{ galaxy.label || '这个星系还没有描述...' }}</p>

          <div class="galaxy-meta">
            <div class="meta-item">
              <span>创建者: {{ galaxy.userId}}</span>
            </div>
            <div class="meta-item">
              <span>{{ galaxy.planets ? galaxy.planets.length : 0 }} 个知识星球</span>
            </div>
          </div>
        </div>

        <div class="galaxy-actions">
          <button class="action-btn explore" @click.stop="exploreGalaxy(galaxy)">
            探索星系
          </button>
          <button class="action-btn share" @click.stop="shareGalaxy(galaxy)">
            分享
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGalaxies.length === 0" class="empty-state">
      <i class="fas fa-stars"></i>
      <h3>未找到匹配的星系</h3>
      <p>尝试调整搜索条件或创建新的星系</p>
      <button class="create-btn" @click="addGalaxy">创建新星系</button>
    </div>
  </div>

  <!-- 分享模态框 -->
  <div v-if="showShareModal" class="share-modal">
    <div class="modal-overlay" @click="showShareModal = false"></div>

    <div class="modal-content cosmic-modal">
      <div class="modal-header">
        <h3>分享星系: {{ shareGalaxyData?.name }}</h3>
        <button class="close-btn" @click="showShareModal = false">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- 搜索框 -->
        <div class="search-container">
          <input
            v-model="friendSearchKeyword"
            type="text"
            placeholder="搜索好友名称..."
            class="quantum-input"
          />
          <i class="fas search-icon">🔍</i>
        </div>

        <!-- 好友列表 -->
        <div class="friend-list">
          <div v-if="filteredFriends.length === 0" class="empty-friends">

            <p>未找到匹配的好友</p>
          </div>

          <div
            v-for="friend in filteredFriends"
            :key="friend.friendId"
            class="friend-item"
          >
            <div class="friend-info">
              <div class="friend-avatar">
                <svg class="mini-energy-core">
                  <circle cx="50%" cy="50%" r="45%" fill="#00f7ff" />
                </svg>
              </div>
              <div class="friend-details">
                <span class="friend-name">{{ friend.friendNickname }}</span>
                <span class="friend-status" :class="friend.isOnline ? 'online' : 'offline'">
                  {{ friend.isOnline ? '在线' : '离线' }}
                </span>
              </div>
            </div>
            <button
              class="share-action-btn"
              @click="sendShareRequest(friend.friendUserId)"

            >
              <!-- <span v-if="friend.isSharing">
                <i class="fas fa-spinner fa-spin"></i> 发送中...
              </span> -->
              <span >
                 分享
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGalaxyStore } from '@/stores/galaxy';
import type { KnowledgeGalaxyDto } from '@/types/galaxy';
import GalaxyCreator from './GalaxyCreator.vue';
import router from '@/router';
import { useFriendStore } from '@/stores/friend';
import type { FriendDto } from '@/types/friend';
import { useUserStore } from '@/stores/user';
const galaxyStore = useGalaxyStore();
const searchTerm = ref('');
const friendStore = useFriendStore();
const showShareModal = ref(false);
const shareGalaxyData = ref<KnowledgeGalaxyDto | null>(null);
const friendSearchKeyword = ref('');
const friends = ref<FriendDto[]>([]);
const userStore = useUserStore()
// 初始化星系数据
onMounted(async () => {
      await galaxyStore.init();
    });

    // 计算属性：过滤星系
    const filteredGalaxies = computed(() => {
      if (!searchTerm.value) return galaxyStore.galaxies;

      const term = searchTerm.value.toLowerCase();
      return galaxyStore.galaxies.filter(galaxy =>
        galaxy.name.toLowerCase().includes(term) ||
        (galaxy.label && galaxy.label.toLowerCase().includes(term))
      );
    });

    // 处理星系操作
    const exploreGalaxy = (galaxy: KnowledgeGalaxyDto) => {
      console.log('探索星系:', galaxy.name);
      galaxyStore.currentGalaxy = galaxy;
      router.push({
        name: 'GalaxyDetail', // 使用路由配置中的命名路由
        params: {
          galaxyId: galaxy.galaxyId // 传递星系ID作为动态参数
        }
      });
      // 这里可以导航到星系详情页
    };

    const shareGalaxy = (galaxy: KnowledgeGalaxyDto) => {
      shareGalaxyData.value = galaxy;
      showShareModal.value = true;
      loadFriends();
    };

    // 加载好友列表
    const loadFriends = async () => {
      try {
        await friendStore.fetchFriendList();
        friends.value = friendStore.acceptedFriends.map(friend => ({
          ...friend,
          isSharing: false
        }));
      } catch (error) {
        console.error('加载好友列表失败:', error);
      }
    };


    // 过滤好友列表
    const filteredFriends = computed(() => {
      if (!friendSearchKeyword.value) {
        return friends.value.slice(0, 4); // 默认展示最多4个好友
      }

      const keyword = friendSearchKeyword.value.toLowerCase();
      return friends.value.filter(friend =>
        friend.friendNickname?.toLowerCase().includes(keyword)
      );
    });
    // 发送分享请求
    const sendShareRequest = async (friendUserId: number) => {
      // if (!shareGalaxyData.value) return;

      // try {
      //   // 更新UI状态
      //   const friend = friends.value.find(f => f.friendUserId === friendUserId);
      //   if (friend) friend.isSharing = true;

      //   // 发送分享请求
      //   await friendStore.sendFriendRequest({
      //     friendUserId,
      //     source: 2, // 2表示星系分享
      //     sourceId: shareGalaxyData.value.galaxyId.toString(),
      //     requestMessage: `我想与你分享星系：${shareGalaxyData.value.name}`
      //   });

      //   // 成功提示
      //   alert(`已成功分享星系给${friend?.friendName}`);
      // } catch (error) {
      //   console.error('分享失败:', error);
      //   alert('分享失败，请重试');
      // } finally {
      //   // 重置状态
      //   const friend = friends.value.find(f => f.friendUserId === friendUserId);
      //   if (friend) friend.isSharing = false;
      // }
      console.log("已发送分享请求给:",friendUserId)
    };

    const addGalaxy = () => {
      console.log('创建新星系');
      galaxyStore.showCreator = true;
    };

    // 新增：确认删除星系
const confirmDeleteGalaxy = (galaxy: KnowledgeGalaxyDto) => {
  if (!galaxy.galaxyId) return;

  // 使用浏览器原生确认对话框
  if (confirm(`确定要删除星系 "${galaxy.name}" 吗？此操作不可撤销！`)) {
    deleteGalaxy(galaxy.galaxyId);
  }
};

// 新增：执行删除操作
const deleteGalaxy = async (galaxyId: string) => {
  try {
    await galaxyStore.deleteGalaxy(galaxyId);
    // 可选：显示成功消息
    alert(`星系已成功删除`);
  } catch (error) {
    console.error('删除星系失败:', error);
    alert(`删除失败: ${error.message || '请重试'}`);
  }
};


</script>

<style scoped>
.galaxy-list-container {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: -50px;
  padding: 0 auto;
  font-family: 'Space Grotesk', sans-serif;
}

.galaxy-header {
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  padding: 2rem;
  background: linear-gradient(
    15deg,            /* 倾斜光带 */
    #000000 0%,       /* 深空黑 */
    #333333 20%,      /* 宇宙灰 */
    #001F3F 45%,      /* 暗物质蓝 */
    #000000 80%       /* 深空黑 */
  );
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.title-container {
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
}



.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #00b4d8, #90e0ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 180, 216, 0.3);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a0a0ff;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.controls {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.search-container {
  flex-grow: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #90e0ef;
  font-size: 1.2rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: none;
  border-radius: 50px;
  background: rgba(10, 15, 40, 0.8);
  color: white;
  font-size: 1rem;
  border: 1px solid #4a4a8a;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 180, 216, 0.2);
}

.search-input:focus {
  outline: none;
  border-color: #00b4d8;
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.4);
}

.add-galaxy-btn {
  background: linear-gradient(to right, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.add-galaxy-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.5);
}

.galaxy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.galaxy-card {
  background: radial-gradient(
  ellipse at 30% 20%,
  rgba(15, 10, 60, 0.8) 0%,
  rgba(0, 0, 0, 1) 90%
);
  border-radius: 16px;
  overflow: hidden;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #2a2a5a;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.galaxy-card.public {
  border-top: 4px solid #00b4d8;
}

.galaxy-card.private {
  border-top: 4px solid #ff6b6b;
}

.galaxy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  gap: 1rem;
}

.galaxy-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #4a00e0, #8e2de2);
  color: white;
}

.title-container {
  flex: 1;
}

.galaxy-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #f0f0ff;
}

.permission-badge {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  margin-top: 0.3rem;
}

.galaxy-card.public .permission-badge {
  background: rgba(0, 180, 216, 0.2);
  color: #00b4d8;
}

.galaxy-card.private .permission-badge {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.galaxy-label {
  color: #a0a0ff;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  min-height: 4.5rem;
}

.galaxy-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #90e0ef;
  font-size: 0.9rem;
}

.meta-item i {
  color: #00b4d8;
  width: 20px;
  text-align: center;
}

.galaxy-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn.explore {
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
}

.action-btn.share {
  background: rgba(255, 255, 255, 0.1);
  color: #90e0ef;
  border: 1px solid #4a4a8a;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(10, 15, 40, 0.5);
  border-radius: 16px;
  margin-top: 2rem;
  border: 1px dashed #4a4a8a;
}

.empty-state i {
  font-size: 4rem;
  color: #4a4a8a;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #f0f0ff;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #a0a0ff;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.create-btn {
  background: linear-gradient(to right, #4a00e0, #8e2de2);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(138, 43, 226, 0.4);
}

/* 分享模态框样式 */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.cosmic-modal {
  background: radial-gradient(
    circle at 30% 20%,
    rgba(15, 10, 60, 0.95) 0%,
    rgba(5, 0, 20, 0.95) 100%
  );
  border-radius: 16px;
  border: 1px solid #4a4a8a;
  box-shadow: 0 0 30px rgba(0, 180, 216, 0.4);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  position: relative;
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(74, 74, 138, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #f0f0ff;
  font-weight: 600;
  background: linear-gradient(to right, #00b4d8, #90e0ef);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: transparent;
  border: none;
  color: #a0a0ff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #ff6b6b;
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.quantum-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border: 1px solid #4a4a8a;
  border-radius: 50px;
  background: rgba(10, 15, 40, 0.8);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 180, 216, 0.2);
}

.quantum-input:focus {
  outline: none;
  border-color: #00b4d8;
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.4);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #90e0ef;
  font-size: 1.2rem;
}

.friend-list {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 50vh;
  padding-right: 5px;
}

/* 好友列表滚动条样式 */
.friend-list::-webkit-scrollbar {
  width: 8px;
}

.friend-list::-webkit-scrollbar-track {
  background: rgba(10, 15, 40, 0.3);
  border-radius: 4px;
}

.friend-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #00f7ff, #7d9bff);
  border-radius: 4px;
  border: 1px solid rgba(0, 247, 255, 0.5);
}

.friend-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #00c9ff, #ff55ff);
}

.empty-friends {
  text-align: center;
  padding: 2rem;
  color: #a0a0ff;
}

.empty-friends i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #4a4a8a;
}

.friend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  border-radius: 10px;
  background: rgba(20, 25, 60, 0.5);
  border: 1px solid rgba(74, 74, 138, 0.3);
  transition: all 0.3s ease;
}

.friend-item:hover {
  background: rgba(30, 35, 70, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.friend-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4a00e0, #8e2de2);
  overflow: hidden;
}

.mini-energy-core {
  width: 35px;
  height: 35px;
  animation: core-rotate 8s linear infinite;
}

@keyframes core-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.friend-details {
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-weight: 600;
  color: #f0f0ff;
  font-size: 1rem;
}

.friend-status {
  font-size: 0.8rem;
}

.friend-status.online {
  color: #00e676;
}

.friend-status.offline {
  color: #ff5252;
}

.share-action-btn {
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.share-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 180, 216, 0.4);
}

.share-action-btn:disabled {
  background: linear-gradient(to right, #4a4a8a, #2a2a5a);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 新增删除按钮样式 */
.delete-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(to right, #ff6b6b00, #ff383800);
  color: white;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: scale(1.1);

}

/* 确保卡片头部有足够的空间 */
.card-header {
  position: relative;
  padding-right: 30px; /* 为删除按钮留出空间 */
}
</style>
