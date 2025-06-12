<template>
  <!-- 悬浮弹窗容器 -->
  <div class="galaxy-modal" :class="{ 'is-active': isOpen }">
    <!-- 遮罩层 -->
    <div class="modal-mask" @click="handleClose"></div>

    <!-- 弹窗内容 -->
    <div class="modal-content" ref="modalContent">
      <!-- 顶部标题栏（移除拖拽事件） -->
      <div class="modal-header">
        <h2 class="modal-title">🌌 星际穿越引擎</h2>
        <button class="close-btn" @click="handleClose"></button>
      </div>

      <!-- 模式切换标签 -->
      <div class="mode-tabs">
        <button
          class="tab-button"
          :class="{ 'active': activeMode === 'create' }"
          @click="activeMode = 'create'"
        >
          🪐 创建星系
        </button>
        <button
          class="tab-button"
          :class="{ 'active': activeMode === 'join' }"
          @click="activeMode = 'join'"
        >
          🔑 加入星系
        </button>
      </div>
      <!-- 表单区域 -->
      <div class="modal-body" v-if="activeMode === 'create'">
        <form class="creator-form" @submit.prevent="submit">
          <!-- 星系名称 -->
          <div class="form-group">
            <label class="form-label">星系名称</label>
            <div class="input-wrapper">
              <input
                v-model="formData.name"
                class="form-input"
                placeholder="请输入星系核心标识符"
                required
              >
              <span class="input-glow"></span>
            </div>
          </div>

          <!-- 星系标签 -->
          <div class="form-group">
            <label class="form-label">星系标签</label>
            <div class="input-wrapper">
              <input
                v-model="formData.label"
                class="form-input"
                placeholder="建议格式：#科学/#技术/#未来"
                required
              >
              <span class="input-glow"></span>
            </div>
          </div>

          <!-- 访问权限 -->
          <div class="form-group">
            <label class="form-label">访问权限</label>
            <div class="select-wrapper">
              <select v-model="formData.permission" class="form-select">
                <option :value="1">🌟 公开星域</option>
                <option :value="0">🌑 私有星区</option>
              </select>
              <span class="select-arrow"></span>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="!formData.name || !formData.label || isSubmitting"
          >
            <span class="button-text">
              {{ isSubmitting ? '创建中...' : '启动创建程序' }}
            </span>
            <span class="loading-indicator" v-show="isSubmitting">
              <div class="spinner"></div>
            </span>
          </button>
        </form>

        <!-- 实时预览 -->
        <div class="galaxy-preview" v-if="formData.name || formData.label">
          <h3 class="preview-title">✨ 星区配置预览</h3>
          <div class="preview-grid">
            <div class="preview-item">
              <div class="item-label">星系名称</div>
              <div class="item-value">{{ formData.name || '新宇宙-' + Date.now().toString().slice(-4) }}</div>
            </div>

            <div class="preview-item">
              <div class="item-label">星系标签</div>
              <div class="item-value">
                <span v-if="formData.label" class="tag">{{ formData.label }}</span>
                <span v-else class="tag empty">未设置标签</span>
              </div>
            </div>

            <div class="preview-item">
              <div class="item-label">访问权限</div>
              <div class="item-value">
                <span :class="`permission-badge ${formData.permission === 1 ? 'public' : 'private'}`">
                  {{ formData.permission === 1 ?
                '全宇宙可见' : '仅限授权访问' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加入星系表单 -->
      <div class="modal-body" v-if="activeMode === 'join'">
        <div class="invite-form">
          <div class="form-group">
            <label class="form-label">邀请码</label>
            <div class="input-wrapper">
              <input
                v-model="inviteCode"
                class="form-input"
                placeholder="输入8位星系邀请码"
                required
              >
              <span class="input-glow"></span>
            </div>
            <div class="invite-hint">请向星系管理员获取访问邀请码</div>
          </div>

          <button
            class="submit-btn"
            @click="joinGalaxy"
            :disabled="!inviteCode || isJoining"
          >
            <span class="button-text">
              {{ isJoining ? '加入中...' : '加入星系' }}
            </span>
            <span class="loading-indicator" v-show="isJoining">
              <div class="spinner"></div>
            </span>
          </button>

          <!-- 邀请码说明 -->
          <div class="invite-info">
            <h4>📜 邀请码说明</h4>
            <ul>
              <li>邀请码由8位字母数字组成，区分大小写</li>
              <!-- <li>每个邀请码只能使用一次</li> -->
              <li>有效期为30天，过期后需重新获取</li>
              <li>加入星系后，您将获得星系管理员权限</li>
            </ul>
          </div>
        </div>
      </div>


    </div>



    <!-- 动态星流背景 -->
    <div class="stars" id="stars"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'
import type { KnowledgeGalaxyDto } from '@/types/galaxy'
import { useUserStore } from '@/stores/user'
import { useGalaxyAdminStore } from '@/stores/galaxyAdmin'
const galaxyAdminStore = useGalaxyAdminStore()
const galaxyStore = useGalaxyStore()
const userStore = useUserStore()
const activeMode = ref('create') // 'create' 或 'join'
// 弹窗状态
const isOpen = ref(galaxyStore.showCreator)
const modalContent = ref<HTMLElement | null>(null)

// 表单数据
const formData = ref<KnowledgeGalaxyDto>({
  userId: userStore.userInfo?.userId || -1,
  name: '',
  label: '',
  permission: 1
})

// 邀请码数据
const inviteCode = ref('')
const isJoining = ref(false)

// 提交状态
const isSubmitting = ref(false)

// 关闭弹窗
const handleClose = () => {
  galaxyStore.showCreator = false
}

// 提交表单
const submit = async () => {
  if (!formData.value.name || !formData.value.label) return

  isSubmitting.value = true

  try {
    await galaxyStore.createGalaxy({
      ...formData.value,
      permission: formData.value.permission ?? 1 // Ensure permission is always defined
    })
    alert(`星系创建成功！`)
    handleClose()
  } catch (error) {
    console.error('创建星系失败:', error)
    alert(`创建失败: 需要20个知识星云，请先收集知识星云！`)
  } finally {
    isSubmitting.value = false
  }
}


// 加入星系
const joinGalaxy = async () => {
  if (!inviteCode.value) return

  isJoining.value = true
  if (!userStore.userInfo?.userId) {
    alert('请先登录')
    return
  }

  try {
    // 验证邀请码格式 (8位字母数字)
    const regex = /^[a-zA-Z0-9]{8}$/;
    if (!regex.test(inviteCode.value)) {
      throw new Error('邀请码格式不正确，请输入8位字母数字组合')
    }
    console.log("已加入星系",inviteCode.value)
    //调用加入星系API
    await galaxyAdminStore.joinGalaxy(inviteCode.value)
    await galaxyStore.init()
    alert(`成功加入星系`)
    handleClose()
  } catch (error) {
    console.error('加入星系失败:', error)
    alert(`加入失败: ${error || '未知错误'}`)
  } finally {
    isJoining.value = false
  }
}




const restoreBodyScroll = () => {
  document.body.style.overflow = ''
}

// 键盘ESC关闭弹窗
const handleEscKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleClose()
  }
}

// 生命周期钩子
onMounted(() => {
  // 初始化弹窗位置
  if (modalContent.value) {
    modalContent.value.style.left = '50%'
    modalContent.value.style.top = '50%'
    modalContent.value.style.transform = 'translate(-50%, -50%)'
  }



  // 添加键盘事件监听
  window.addEventListener('keydown', handleEscKey)

  // 初始化星流动画
  createStars()
})

onUnmounted(() => {
  // 恢复滚动
  restoreBodyScroll()

  // 移除键盘事件监听
  window.removeEventListener('keydown', handleEscKey)
})

// 监听弹窗状态变

// 创建星流动画
const createStars = () => {
  const starsContainer = document.getElementById('stars')
  if (!starsContainer) return

  // 清除旧的星星
  starsContainer.innerHTML = ''

  // 创建新星星
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div')
    star.className = 'star'

    // 随机大小和位置
    const size = Math.random() * 3 + 1
    const x = Math.random() * 100
    const y = Math.random() * 100
    const duration = Math.random() * 10 + 10

    // 设置样式
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    star.style.left = `${x}%`
    star.style.top = `${y}%`
    star.style.boxShadow = `0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.5)`
    star.style.setProperty('--duration', `${duration}s`)

    // 随机延迟
    star.style.animationDelay = `${Math.random() * 5}s`

    starsContainer.appendChild(star)
  }
}
</script>

<style scoped>
/* 弹窗基础样式 */
.galaxy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.galaxy-modal.is-active {
  pointer-events: auto;
  opacity: 1;
}

/* 遮罩层 */
.modal-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(2, 8, 26, 0.9), rgba(5, 12, 32, 0.9));
  backdrop-filter: blur(8px);
  cursor: pointer;
}

/* 弹窗内容（移除拖拽相关样式） */
.modal-content {
  position: absolute;
  max-width: 800px;
  width: 90%;
  background: rgba(5, 15, 35, 0.95);
  border-radius: 25px;
  box-shadow:
    0 0 120px rgba(0, 200, 255, 0.3),
    inset 0 0 40px rgba(0, 200, 255, 0.1);
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform, opacity;
  overflow: auto;
}

.galaxy-modal.is-active .modal-content {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

/* 顶部标题栏（移除拖拽样式） */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 40px;
  border-bottom: 1px solid rgba(100, 200, 250, 0.1);
}

.modal-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  color: #7df9ff;
  text-shadow: 0 0 15px #00ffff;
  margin: 0;
}

/* 关闭按钮 */
.close-btn {
  width: 45px;
  height: 45px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
}

.close-btn::before,
.close-btn::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 4px;
  background: linear-gradient(90deg, #a0d5ff, #7df9ff);
  border-radius: 2px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  box-shadow:
    0 0 15px rgba(160, 213, 255, 0.3),
    inset 0 0 6px rgba(160, 213, 255, 0.2);
  transition: background 0.3s ease;
}

.close-btn::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.close-btn:hover::before,
.close-btn:hover::after {
  background: linear-gradient(90deg, #7df9ff, #00ffff);
  box-shadow:
    0 0 25px rgba(125, 249, 255, 0.5),
    inset 0 0 8px rgba(125, 249, 255, 0.3);
}

/* 表单区域 */
.modal-body {
  padding: 10px 40px;
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: #a0d5ff;
  font-size: 1.1rem;
  letter-spacing: 0.8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 18px 25px;
  background: rgba(2, 10, 25, 0.9);
  border: none;
  border-radius: 12px;
  color: #e0f3ff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus,
.form-select:focus {
  background: rgba(2, 10, 25, 1);
  box-shadow: 0 0 20px rgba(100, 200, 250, 0.3);
}

.input-glow {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4dabf7, #8a2be2, transparent);
  opacity: 0;
  transform: scaleX(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.form-input:focus ~ .input-glow,
.form-select:focus ~ .input-glow {
  opacity: 1;
  transform: scaleX(1);
}

.form-select {
  appearance: none;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23a0d5ff' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"),
    linear-gradient(transparent, transparent);
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 12px;
}

.select-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-top-color: #a0d5ff;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 10px 40px;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #0066cc, #003366);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 1.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover {
  background: linear-gradient(45deg, #0099ff, #0066cc);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.3);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(45deg, #22283a, #1a1f30);
  box-shadow: none;
  transform: none;
}

.loading-indicator {
  margin-left: 15px;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 预览区域 */
.galaxy-preview {
  margin-top: 40px;
  padding: 10px 25px;
  background: rgba(5, 15, 35, 0.8);
  border: 1px dashed rgba(100, 200, 250, 0.1);
  border-radius: 15px;
}

.preview-title {
  color: #7df9ff;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.4rem;
  border-bottom: 1px solid rgba(100, 200, 250, 0.1);
  padding-bottom: 12px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  padding: 15px 0;
}

.preview-item {
  background: rgba(2, 10, 25, 0.9);
  padding: 18px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 200, 255, 0.05);
  transition: transform 0.3s ease;
}

.preview-item:hover {
  transform: translateY(-5px);
}

.item-label {
  color: #88aaff;
  font-size: 1rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.item-value {
  color: #e0f3ff;
  font-size: 1.1rem;
  line-height: 1.4;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(100, 200, 250, 0.1);
  border-radius: 20px;
  font-size: 0.95rem;
  margin-right: 8px;
}

.empty {
  color: #6c8ba5;
}

.permission-badge {
  padding: 5px 12px;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.public {
  background: linear-gradient(90deg, #00ccff, #0066ff);
  color: #e0f3ff;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.2);
}

.private {
  background: linear-gradient(90deg, #6600cc, #cc00ff);
  color: #f3e0ff;
  box-shadow: 0 0 10px rgba(200, 0, 255, 0.2);
}

/* 星流动画 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle var(--duration) infinite ease-in-out,
             drift var(--duration) linear infinite;
  will-change: transform, opacity;
}

@keyframes drift {
  from { transform: translateY(-100vh); }
  to { transform: translateY(100vh); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 90%;
    padding: 0;
    border-radius: 18px;
  }

  .modal-header {
    padding: 20px 30px;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 30px;
  }

  .close-btn {
    width: 40px;
    height: 40px;
  }

  .close-btn::before,
  .close-btn::after {
    width: 25px;
    height: 3px;
  }

  .form-input,
  .form-select {
    padding: 15px 20px;
    font-size: 1rem;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.3rem;
  }

  .modal-body {
    padding: 25px;
  }

  .submit-btn {
    padding: 18px 30px;
    font-size: 1.1rem;
  }
}/* 新增样式：模式切换标签 */
.mode-tabs {
  display: flex;
  margin: 0 40px 20px;
  border-bottom: 1px solid rgba(100, 200, 250, 0.1);
}

.tab-button {
  flex: 1;
  padding: 15px 0;
  background: transparent;
  border: none;
  color: #88aaff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #7df9ff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #00ccff, #0066ff);
}

.tab-button:hover:not(.active) {
  color: #a0d5ff;
}

/* 邀请码表单样式 */
.invite-form {
  padding: 10px 0;
}

.invite-hint {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #6c8ba5;
}

.invite-info {
  margin-top: 40px;
  padding: 20px;
  background: rgba(5, 15, 35, 0.6);
  border-radius: 15px;
  border: 1px dashed rgba(100, 200, 250, 0.1);
}

.invite-info h4 {
  color: #7df9ff;
  margin-bottom: 15px;
}

.invite-info ul {
  padding-left: 20px;
}

.invite-info li {
  margin-bottom: 10px;
  color: #a0d5ff;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mode-tabs {
    margin: 0 30px 15px;
  }

  .tab-button {
    padding: 12px 0;
    font-size: 1rem;
  }

  .invite-info {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .mode-tabs {
    margin: 0 20px 10px;
  }

  .tab-button {
    font-size: 0.95rem;
    padding: 10px 0;
  }
}
</style>
