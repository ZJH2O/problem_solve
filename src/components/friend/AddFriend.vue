<template>
  <div class="add-friend-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <h3 class="section-title">🔍 搜索用户</h3>
      <div class="search-box">
        <input
          v-model="searchKeyword"
          @keyup.enter="searchUsers"
          placeholder="输入昵称或邮箱搜索..."
          class="search-input"
        >
        <button @click="searchUsers" class="search-btn">
          搜索
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="friendStore.searchResults.length > 0" class="results-section">
      <h3 class="section-title">搜索结果</h3>
      <div class="results-grid">
        <div
          v-for="user in friendStore.searchResults"
          :key="user.userId"
          class="user-card"
        >
          <img v-if="user.avatarUrl"
            :src="user.avatarUrl || '/default-avatar.png'"
            :alt="user.nickname"
            class="user-avatar"
          >
          <div v-else class="cosmic-avatar">👽</div>
          <div class="user-info">
            <h4 class="user-name">{{ user.nickname }}</h4>
            <p class="user-bio">{{ user.bio || '暂无简介' }}</p>
          </div>
          <button
            @click="sendRequest(user)"
            class="add-btn"
            :disabled="sendingTo === user.userId"
          >
            <span v-if="sendingTo === user.userId">发送中...</span>
            <span v-else>+ 添加</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="searched && friendStore.searchResults.length === 0" class="empty-state">
      <p>未找到匹配的用户</p>
    </div>

    <!-- 添加好友对话框 -->
    <Teleport to="body">
      <div v-if="showRequestDialog" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-content">
          <h3>发送好友请求</h3>
          <div class="dialog-body">
            <p>向 <strong>{{ selectedUser?.nickname }}</strong> 发送好友请求</p>
            <div class="form-group">
              <label>选择来源：</label>
              <select v-model="requestForm.source" class="form-select">
                <option :value="1">搜索添加</option>
                <option :value="2">同星系成员</option>
                <option :value="3">评论互动</option>
              </select>
            </div>
            <div class="form-group">
              <label>留言（选填）：</label>
              <textarea
                v-model="requestForm.requestMessage"
                placeholder="介绍一下自己..."
                class="form-textarea"
                maxlength="200"
              ></textarea>
            </div>
          </div>
          <div class="dialog-footer">
            <button @click="closeDialog" class="btn-cancel">取消</button>
            <button @click="confirmRequest" class="btn-confirm">发送请求</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useFriendStore } from '@/stores/friend'
import type { UserSearchResult } from '@/types/friend'
import { ElMessage } from 'element-plus'

const friendStore = useFriendStore()

const searchKeyword = ref('')
const searched = ref(false)
const sendingTo = ref<number | null>(null)
const showRequestDialog = ref(false)
const selectedUser = ref<UserSearchResult | null>(null)

const requestForm = reactive({
  source: 1,
  sourceId: '',
  requestMessage: ''
})

const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    searched.value = true
    await friendStore.searchUsers(searchKeyword.value)
  } catch (error) {
    ElMessage.error('搜索失败')
  }
}

const sendRequest = (user: UserSearchResult) => {
  selectedUser.value = user
  showRequestDialog.value = true
}

const closeDialog = () => {
  showRequestDialog.value = false
  requestForm.requestMessage = ''
  requestForm.source = 1
}

const confirmRequest = async () => {
  if (!selectedUser.value) return

  try {
    sendingTo.value = selectedUser.value.userId
    await friendStore.sendFriendRequest({
      friendUserId: selectedUser.value.userId,
      source: requestForm.source,
      sourceId: requestForm.sourceId,
      requestMessage: requestForm.requestMessage
    })

    ElMessage.success('好友请求已发送')
    closeDialog()

    // 从搜索结果中移除
    friendStore.searchResults = friendStore.searchResults.filter(
      u => u.userId !== selectedUser.value?.userId
    )
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    sendingTo.value = null
  }
}
</script>

<style scoped>
.add-friend-container {
  min-height: 400px;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 2rem;
}

.section-title {
  color: #f0f0ff;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.search-box {
  display: flex;
  gap: 1rem;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(10, 15, 35, 0.8);
  border: 1px solid #4a4a8a;
  border-radius: 8px;
  color: #f0f0ff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00b4d8;
  box-shadow: 0 0 10px rgba(0, 180, 216, 0.3);
}

.search-btn {
  padding: 0.8rem 2rem;
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 180, 216, 0.3);
}

/* 搜索结果 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: rgba(15, 20, 45, 0.8);
  border: 1px solid #2a2a5a;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 180, 216, 0.2);
  border-color: #00b4d8;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #4a4a8a;
}

.user-info {
  flex: 1;
  margin-bottom: 1rem;
}

.user-name {
  color: #f0f0ff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.user-bio {
  color: #a0a0ff;
  font-size: 0.9rem;
}

.add-btn {
  width: 100%;
  padding: 0.6rem;
  background: linear-gradient(to right, #00ff88, #00cc66);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog-content {
  background: #0a0e2d;
  border: 1px solid #4a4a8a;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.dialog-content h3 {
  color: #f0f0ff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.dialog-body {
  margin-bottom: 2rem;
}

.dialog-body p {
  color: #a0a0ff;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #90e0ef;
  margin-bottom: 0.5rem;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 0.8rem;
  background: rgba(10, 15, 35, 0.8);
  border: 1px solid #4a4a8a;
  border-radius: 8px;
  color: #f0f0ff;
  font-size: 1rem;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.dialog-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: rgba(160, 174, 192, 0.2);
  color: #a0aec0;
  border: 1px solid #a0aec0;
}

.btn-confirm {
  background: linear-gradient(to right, #00b4d8, #0077b6);
  color: white;
}

.btn-cancel:hover,
.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #a0a0ff;
}

.cosmic-avatar {
  width: 60px;
  height: 60px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-right: 12px;
  border: #00eeff 2px solid;
}
</style>
