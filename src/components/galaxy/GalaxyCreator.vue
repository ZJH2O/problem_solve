<script setup lang="ts">
import { ref } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'
import type { KnowledgeGalaxyDto } from '@/types/galaxy'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const galaxyStore = useGalaxyStore()

// 表单数据及验证
const formData = ref<KnowledgeGalaxyDto>({
  userId: userStore.userInfo?.userId || -1,
  name: '',
  label: '',
  permission: 1
})

// 星流动画星星数组

const isSubmitting = ref(false)
// 提交表单
const submit = async () => {
  try {
    const id = await galaxyStore.createGalaxy(formData.value)
    alert(`星系创建成功！ID: ${id}`)
    formData.value = { ...formData.value, name: '', label: '' } // 重置表单
  } catch (error) {
    console.error('创建星系失败:', error)
    alert(`创建失败: ${error || '未知错误'}`)
  }
}


</script>

<template>
  <div class="galaxy-creator">
    <!-- 宇宙背景 -->
    <div class="cosmic-bg"></div>

    <div class="creator-container">
      <div class="creator-header">
        <h1 class="creator-title">🌌 星系创建引擎</h1>
        <p class="creator-subtitle">正在初始化星区坐标系统...</p>
      </div>

      <form class="creator-form" @submit.prevent="submit">
        <!-- 输入框组 -->
        <div class="form-group">
          <label class="form-label">星系名称</label>
          <div class="input-wrapper">
            <input
              v-model="formData.name"
              class="form-input"
              placeholder="请输入星系核心标识符"
              required
              :disabled="!userStore.userInfo"
            >
            <span class="input-glow"></span>
          </div>
        </div>

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
        <button type="submit" class="submit-btn" :disabled="!formData.name || !formData.label">
          <span class="button-text">启动创建程序</span>
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
            <div class="item-value">{{ formData.name || '新宇宙-'+Date.now().toString().slice(-4) }}</div>
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
                {{ formData.permission === 1 ? '全宇宙可见' : '仅限授权访问' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 动态星流背景 -->
    <div class="stars" id="stars"></div>
  </div>
</template>

<style scoped>
/* 基础宇宙背景 */
.cosmic-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a1a30, #050c20);
  overflow: hidden;
  z-index: -1;
}

/* 容器样式 */
.creator-container {
  max-width: 720px;
  margin: 30px auto;
  padding: 35px 40px;
  background: rgba(5, 15, 35, 0.9);
  border: 1px solid rgba(100, 200, 250, 0.1);
  border-radius: 20px;
  position: relative;
  box-shadow: 0 0 60px rgba(0, 200, 255, 0.15),
              inset 0 0 30px rgba(0, 200, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* 标题样式 */
.creator-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.4rem;
  color: #7df9ff;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 20px #00ffff;
}

.creator-subtitle {
  text-align: center;
  color: #88aaff;
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.8;
}

/* 表单样式 */
.form-group {
  position: relative;
}

.input-wrapper, .select-wrapper {
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #a0d5ff;
  font-size: 1.1rem;
  letter-spacing: 0.8px;
}

.form-input, .form-select {
  width: 100%;
  padding: 16px 24px;
  background: rgba(2, 10, 25, 0.9);
  border: none;
  border-radius: 12px;
  color: #e0f3ff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  outline: none;
  z-index: 2;
}

.form-input:focus, .form-select:focus {
  background: rgba(2, 10, 25, 1);
  box-shadow: 0 0 20px rgba(100, 200, 250, 0.2);
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
  padding: 18px 40px;
  background: linear-gradient(45deg, #0066cc, #003366);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 1.2px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 30px;
}

.submit-btn:hover {
  background: linear-gradient(45deg, #0099ff, #0066cc);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.3);
}

.submit-btn:active {
  transform: scale(0.96);
}

.loading-indicator {
  display: inline-block;
  margin-left: 15px;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover .loading-indicator {
  opacity: 1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 预览区域 */
.galaxy-preview {
  margin-top: 40px;
  padding: 25px;
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
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle var(--duration) infinite ease-in-out,
             drift var(--duration) linear infinite;
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
  .creator-container {
    padding: 25px;
  }

  .creator-title {
    font-size: 1.8rem;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
