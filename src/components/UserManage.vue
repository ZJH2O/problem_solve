<template>
  <div class="user-manager">
    <!-- 加载状态 -->
    <div v-if="userStore.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- 未登录提示 -->
    <div v-if="!userStore.isLoggedIn" class="auth-prompt">
      <h2>请先登录</h2>
      <router-link to="/login" class="login-link">前往登录页面</router-link>
    </div>

    <!-- 已登录内容 -->
    <div v-else class="user-content">
      <!-- 用户信息展示 -->
      <div class="profile-section">
        <div class="avatar-container">
          <img
            :src="userStore.userInfo?.avatarUrl || '/default-avatar.png'"
            alt="用户头像"
            class="user-avatar"
          />
          <input
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="avatar-upload"
          />
        </div>

        <h1 class="nickname">{{ userStore.userInfo?.nickname }}</h1>
        <p class="user-id">用户ID: {{ userStore.userInfo?.userId }}</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="userStore.error" class="error-message">
        {{ userStore.error }}
      </div>

      <!-- 信息编辑表单 -->
      <form @submit.prevent="handleProfileUpdate" class="profile-form">
        <div class="form-group">
          <label for="nickname">昵称:</label>
          <input
            type="text"
            id="nickname"
            v-model="profileForm.nickname"
            required
          />
        </div>

        <div class="form-group">
          <label for="bio">个人简介:</label>
          <textarea
            id="bio"
            v-model="profileForm.bio"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="email">邮箱:</label>
          <input
            type="email"
            id="email"
            v-model="profileForm.email"
            required
          />
        </div>

        <button type="submit" class="submit-btn">更新资料</button>
      </form>

      <!-- 账户管理 -->
      <div class="account-management">
        <h2>账户管理</h2>

        <button @click="showPasswordForm = true" class="action-btn">
          修改密码
        </button>

        <button @click="showEmailForm = true" class="action-btn">
          修改邮箱
        </button>

        <button @click="handleLogout" class="action-btn logout">
          退出登录
        </button>

        <button
          @click="showDeleteConfirm = true"
          class="action-btn delete-account"
        >
          注销账户
        </button>
      </div>

      <!-- 修改密码模态框 -->
      <div v-if="showPasswordForm" class="modal-overlay">
        <form @submit.prevent="handlePasswordUpdate" class="password-form">
          <h3>修改密码</h3>

          <div class="form-group">
            <label for="current-password">当前密码:</label>
            <input
              type="password"
              id="current-password"
              v-model="passwordForm.oldPassword"
              required
            />
          </div>

          <div class="form-group">
            <label for="new-password">新密码:</label>
            <input
              type="password"
              id="new-password"
              v-model="passwordForm.newPassword"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">确认密码:</label>
            <input
              type="password"
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              required
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showPasswordForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button type="submit" class="submit-btn">确认修改</button>
          </div>
        </form>
      </div>

      <!-- 注销确认对话框 -->
      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="delete-confirm">
          <h3>确认注销账户？</h3>
          <p>此操作将永久删除您的账户和所有数据！</p>
          <div class="confirm-actions">
            <button
              @click="showDeleteConfirm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button
              @click="handleAccountDelete"
              class="confirm-delete-btn"
            >
              确认注销
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

// 表单状态
const profileForm = reactive({
  nickname: '',
  bio: '',
  email: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 界面状态
const showPasswordForm = ref(false)
const showEmailForm = ref(false)
const showDeleteConfirm = ref(false)

// 初始化数据
onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  initFormData()
})

// 初始化表单数据
const initFormData = () => {
  if (userStore.userInfo) {
    profileForm.nickname = userStore.userInfo.nickname || ''
    profileForm.bio = userStore.userInfo.bio || ''
    profileForm.email = userStore.userInfo.email || ''
  }
}

// 监听用户信息变化
watchEffect(() => {
  if (userStore.userInfo) {
    initFormData()
  }
})

// 处理资料更新
const handleProfileUpdate = async () => {
  try {
    await userStore.updateUserProfile({
      nickname: profileForm.nickname,
      bio: profileForm.bio,
      avatarUrl: profileForm.avatarUrl ,
    })
    alert('资料更新成功！')
  } catch (error) {
    console.error('资料更新失败:', error)
  }
}

// 处理密码修改
const handlePasswordUpdate = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    await userStore.updatePassword({
      oldpassword: passwordForm.oldPassword,
      newpassword: passwordForm.newPassword,
      repassword: passwordForm.confirmPassword
    })
    showPasswordForm.value = false
    alert('密码修改成功，请重新登录')
  } catch (error) {
    console.error('密码修改失败:', error)
  }
}

// 处理头像上传
const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    const file = input.files[0]
    // 这里可以添加文件上传逻辑
    console.log('上传文件:', file)
    // 示例：更新用户头像
    // await userStore.updateAvatar(file)
  }
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 处理账户注销
const handleAccountDelete = async () => {
  try {
    await userStore.deleteAccount()
    showDeleteConfirm.value = false
    router.push('/')
  } catch (error) {
    console.error('账户注销失败:', error)
  }
}
</script>

<style scoped>
.user-manager {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-prompt {
  text-align: center;
  padding: 2rem;
}

.profile-section {
  text-align: center;
  margin-bottom: 2rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.avatar-upload {
  display: none;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-container:hover::after {
  content: '更换头像';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
}

.profile-form {
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.logout {
  color: #dc3545;
  border-color: #dc3545;
}

.delete-account {
  color: white;
  background: #dc3545;
  border: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
}

.confirm-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.error-message {
  color: #dc3545;
  padding: 1rem;
  background: #ffeef0;
  border-radius: 4px;
  margin: 1rem 0;
}
</style>
