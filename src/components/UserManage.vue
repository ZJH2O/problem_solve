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
          <button @click="showAvatarForm = true" class="avatar-edit-btn">
            更换头像
          </button>
        </div>

        <h1 class="nickname">{{ userStore.userInfo?.nickname }}</h1>
        <p class="user-id">用户ID: {{ userStore.userInfo?.userId }}</p>

        <!-- 个人简介 -->
        <div class="bio-section">
          <h3>个人简介</h3>
          <p>{{ userStore.userInfo?.bio || '暂无简介' }}</p>
          <button @click="showBioForm = true" class="edit-btn">编辑</button>
        </div>

        <!-- 邮箱信息 -->
        <div class="email-section">
          <h3>邮箱</h3>
          <p>{{ userStore.userInfo?.email || '未设置邮箱' }}</p>
          <button @click="showEmailForm = true" class="edit-btn">更换邮箱</button>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="userStore.error" class="error-message">
        {{ userStore.error }}
      </div>

      <!-- 账户管理 -->
      <div class="account-management">
        <h2>账户管理</h2>

        <button @click="showPasswordForm = true" class="action-btn">
          修改密码
        </button>

        <button @click="showNicknameForm = true" class="action-btn">
          修改昵称
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

      <!-- 修改昵称模态框 -->
      <div v-if="showNicknameForm" class="modal-overlay">
        <div class="modal-content">
          <h3>修改昵称</h3>

          <div class="form-group">
            <label for="new-nickname">新昵称:</label>
            <input
              type="text"
              id="new-nickname"
              v-model="nicknameForm.newNickname"
              required
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showNicknameForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button @click="handleUpdateNickname" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>

      <!-- 修改头像模态框 -->
      <div v-if="showAvatarForm" class="modal-overlay">
        <div class="modal-content">
          <h3>更新头像</h3>

          <div class="avatar-preview">
            <img
              :src="avatarPreview || userStore.userInfo?.avatarUrl || '/default-avatar.png'"
              alt="头像预览"
              class="preview-image"
            />
          </div>

          <div class="form-group">
            <label for="avatar-upload" class="upload-label">
              选择图片
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              @change="handleAvatarChange"
              class="file-input"
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showAvatarForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button
              @click="handleAvatarUpload"
              class="submit-btn"
              :disabled="!selectedAvatar"
            >
              上传头像
            </button>
          </div>
        </div>
      </div>

      <!-- 修改简介模态框 -->
      <div v-if="showBioForm" class="modal-overlay">
        <div class="modal-content">
          <h3>更新个人简介</h3>

          <div class="form-group">
            <label for="new-bio">个人简介:</label>
            <textarea
              id="new-bio"
              v-model="bioForm.newBio"
              rows="3"
              maxlength="200"
            ></textarea>
            <p class="char-count">{{ bioForm.newBio.length }}/200</p>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showBioForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button @click="handleUpdateBio" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>

      <!-- 修改密码模态框 -->
      <div v-if="showPasswordForm" class="modal-overlay">
        <div class="modal-content">
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
            <button @click="handlePasswordUpdate" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>

      <!-- 修改邮箱模态框 -->
      <div v-if="showEmailForm" class="modal-overlay">
        <div class="modal-content">
          <h3>修改邮箱</h3>

          <div class="form-group">
            <label for="new-email">新邮箱地址:</label>
            <input
              type="email"
              id="new-email"
              v-model="emailForm.newEmail"
              required
            />
          </div>

          <div class="form-group">
            <label for="email-password">当前密码:</label>
            <input
              type="password"
              id="email-password"
              v-model="emailForm.password"
              required
            />
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="showEmailForm = false"
              class="cancel-btn"
            >
              取消
            </button>
            <button @click="handleUpdateEmail" class="submit-btn">确认修改</button>
          </div>
        </div>
      </div>

      <!-- 注销确认对话框 -->
      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content delete-confirm">
          <h3>确认注销账户？</h3>
          <p>此操作将永久删除您的账户和所有数据！</p>

          <div class="form-group">
            <label for="delete-password">请输入密码确认:</label>
            <input
              type="password"
              id="delete-password"
              v-model="deletePassword"
              required
            />
          </div>

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
              :disabled="!deletePassword"
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
// 表单数据
const nicknameForm = reactive({
  newNickname: ''
})

const bioForm = reactive({
  newBio: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const emailForm = reactive({
  newEmail: '',
  password: ''
})

const deletePassword = ref('')

// 头像上传相关
const selectedAvatar = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// 模态框状态
const showNicknameForm = ref(false)
const showAvatarForm = ref(false)
const showBioForm = ref(false)
const showPasswordForm = ref(false)
const showEmailForm = ref(false)
const showDeleteConfirm = ref(false)

// 初始化数据
onMounted(async () => {
  if (userStore.isLoggedIn || !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  initFormData()
})

// 初始化表单数据
const initFormData = () => {
  if (userStore.userInfo) {
    nicknameForm.newNickname = userStore.userInfo.nickname || ''
    bioForm.newBio = userStore.userInfo.bio || ''
  }
}

// 监听用户信息变化
watchEffect(() => {
  if (userStore.userInfo) {
    initFormData()
  }
})

// 更新昵称
const handleUpdateNickname = async () => {
  if (!nicknameForm.newNickname.trim()) {
    alert('昵称不能为空')
    return
  }

  try {
    await userStore.updateNickname(nicknameForm.newNickname)
    showNicknameForm.value = false
    alert('昵称更新成功！')
  } catch (error) {
    console.error('昵称更新失败:', error)
  }
}

// 更新个人简介
const handleUpdateBio = async () => {
  try {
    await userStore.updateBio(bioForm.newBio)
    showBioForm.value = false
    alert('个人简介更新成功！')
  } catch (error) {
    console.error('个人简介更新失败:', error)
  }
}

// 修改密码
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

    // 密码修改成功后需要重新登录
    setTimeout(() => {
      alert('密码修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
    }, 1000)

  } catch (error) {
    console.error('密码修改失败:', error)
    alert(`密码修改失败: ${(error as Error).message}`)
  }
}

// 头像选择处理
const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    selectedAvatar.value = input.files[0]

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(selectedAvatar.value)
  }
}

// 上传头像
const handleAvatarUpload = async () => {
  if (!selectedAvatar.value) {
    alert('请先选择头像文件')
    return
  }

  try {
    // 在实际项目中，这里应该是上传文件到服务器后返回URL
    // 这里简化为使用本地上传预览
    const newAvatarUrl = avatarPreview.value || URL.createObjectURL(selectedAvatar.value)

    // 更新头像URL
    await userStore.updataAvatarUrl(newAvatarUrl)
    showAvatarForm.value = false
    selectedAvatar.value = null
    avatarPreview.value = null
    alert('头像更新成功！')
  } catch (error) {
    console.error('头像更新失败:', error)
    alert(`头像更新失败: ${(error as Error).message}`)
  }
}

// 更新邮箱
const handleUpdateEmail = async () => {
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(emailForm.newEmail)) {
    alert('请输入有效的邮箱地址')
    return
  }

  try {
    await userStore.updateEmail(emailForm.newEmail)
    showEmailForm.value = false

    // 邮箱修改成功后需要重新登录
    setTimeout(() => {
      alert('邮箱修改成功，请重新登录')
      userStore.logout()
      router.push('/login')
    }, 1000)

  } catch (error) {
    console.error('邮箱修改失败:', error)
    alert(`邮箱修改失败: ${(error as Error).message}`)
  }
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 处理账户注销
const handleAccountDelete = async () => {
  if (!deletePassword.value) {
    alert('请输入密码')
    return
  }

  try {
    // 在实际应用中，这里应该发送密码验证请求

    await userStore.deleteAccount()
    showDeleteConfirm.value = false
    setTimeout(() => {
      router.push('/')
    }, 1000)

  } catch (error) {
    console.error('账户注销失败:', error)
    alert(`账户注销失败: ${(error as Error).message}`)
  }
}
</script>

<style scoped>
/* 全局样式 - 深空宇宙背景 */
.user-manager {
  max-width: 800px;
  margin: 2rem auto;
  margin-top: -80px;
  padding: 2rem;
  background: radial-gradient(circle at center, #0a0f2b 0%, #020617 100%);
  border: 1px solid #00eeff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.3);
  position: relative;
  overflow: hidden;
  font-family: 'Orbitron', sans-serif;
  color: #b6f9ff;
}

/* 宇宙粒子背景 */
.user-manager::before {
  content: "";
  position: absolute;
  top:0; left:0; right:0; bottom:0;
  background-image:
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 10px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 5px);
  background-size: 100px 100px, 200px 200px;
  background-position: 0 0, 20px 20px;
  animation: stars 120s linear infinite;
  z-index: -1;
}

/* 动画定义 */
@keyframes stars {
  from { background-position: 0 0, 20px 20px; }
  to { background-position: 100px 100px, 120px 120px; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 5px #00d1ff; }
  50% { box-shadow: 0 0 20px #00d1ff; }
  100% { box-shadow: 0 0 5px #00d1ff; }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

/* 用户信息区域 */
.profile-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 209, 255, 0.3);
  position: relative;
  z-index: 2;
}

/* 头像能量护盾效果 */
.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #9d4edd;
  box-shadow: 0 0 15px #5e00ff;
  animation: float 4s ease-in-out infinite;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 10px;
  background: rgba(10, 25, 47, 0.7);
  border: 1px solid #00d1ff;
  box-shadow: 0 0 10px rgba(0, 209, 255, 0.5);
  color: #b6f9ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-edit-btn:hover {
  background: rgba(0, 150, 255, 0.5);
  transform: scale(1.1);
}

/* 机甲控制面板风格 */
.account-management .action-btn {
  display: block;
  width: 100%;
  margin: 0.8rem 0;
  padding: 1rem;
  background: rgba(10, 25, 47, 0.7);
  border: 1px solid #00d1ff;
  box-shadow: 0 0 10px rgba(0, 209, 255, 0.5);
  color: #b6f9ff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background: rgba(0, 150, 255, 0.3);
  animation: pulse 1.5s infinite;
}

.action-btn::after {
  content: "▶";
  position: absolute;
  right: 15px;
  transition: transform 0.3s;
}

.action-btn:hover::after {
  transform: translateX(5px);
}

/* 特殊按钮样式 */
.action-btn.logout {
  color: #ff6b6b;
  border-color: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.action-btn.delete-account {
  color: white;
  background: linear-gradient(45deg, #ff416c, #ff4b2b);
  border: none;
  box-shadow: 0 0 15px rgba(255, 75, 43, 0.6);
}

/* 信息面板 - 机甲装甲板效果 */
.bio-section, .email-section {
  margin: 1.5rem 0;
  background: rgba(15, 30, 60, 0.6);
  padding: 1.2rem;
  border-radius: 8px;
  text-align: left;
  position: relative;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 195, 255, 0.4);
  box-shadow: inset 0 0 10px rgba(0, 150, 255, 0.3);
}

/* 模态框 - 曲速引擎舱门效果 */
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

/* 3D星球效果容器 */
.planet-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  z-index: 1;
}
.edit-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
  color:white
}

.edit-btn:hover {
  background: #f0f0f0;
  color:#020617
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
</style>
