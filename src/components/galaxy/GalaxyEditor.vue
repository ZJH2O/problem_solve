<template>
  <!-- 宇宙主题弹窗容器 -->
  <div v-if="dialogVisible" class="custom-overlay" @click.self="handleOverlayClick"></div>

  <!-- 弹窗主体 -->
  <transition name="fade-scale">
    <div v-if="dialogVisible" class="custom-dialog galaxy-editor">
      <!-- 动态宇宙背景 -->
      <div class="cosmic-background"></div>

      <!-- 弹窗头部 -->
      <div class="dialog-header">
        <h2 class="cosmic-title">{{ title }}</h2>
        <button class="close-btn" @click="dialogVisible = false"></button>
      </div>

      <!-- 内容容器 -->
      <div class="editor-container">
        <!-- 星系预览区 -->
        <div class="preview-section nebula-effect">
          <div class="galaxy-preview">
            <div class="galaxy-icon">
              <div class="core"></div>
              <div class="ring"></div>
              <div class="particles">
                <div v-for="i in 8" :key="i" class="particle"></div>
              </div>
            </div>
            <div class="preview-info">
              <h3 class="hologram-text">{{ form.name || '星系名称' }}</h3>
              <div class="tag-permission">
                <span v-if="form.label" class="cosmic-tag">
                  {{ form.label }}
                </span>
                <span :class="form.permission === 0 ? 'public-tag' : 'private-tag'">
                  <i v-if="form.permission === 0">🔓</i>
                  <i v-else>🔒</i>
                  {{ form.permission === 0 ? '公开星系' : '私有星系' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单输入区 -->
        <form class="form-section quantum-form">
          <div class="form-group">
            <label>星系名称</label>
            <div class="input-wrapper">
              <input
                v-model="form.name"
                placeholder="输入星系名称"
                maxlength="20"
                class="hologram-input"
              >
              <span class="input-glow"></span>
            </div>
            <div class="word-count">{{ form.name.length }}/20</div>
          </div>

          <div class="form-group">
            <label>星系标签</label>
            <div class="input-wrapper">
              <input
                v-model="form.label"
                placeholder="为星系添加标签（可选）"
                maxlength="15"
                class="hologram-input"
              >
              <span class="input-glow"></span>
            </div>
            <div class="word-count">{{ form.label.length }}/15</div>
          </div>

          <div class="form-group">
            <label>访问权限</label>
            <div class="permission-options">
              <label class="permission-option">
                <input type="radio" v-model="form.permission" :value="1">
                <div class="option-content">
                  <div class="permission-icon public">🔓</div>
                  <div>
                    <div class="title">公开星系</div>
                    <div class="desc">所有用户可见</div>
                  </div>
                </div>
              </label>

              <label class="permission-option">
                <input type="radio" v-model="form.permission" :value="0">
                <div class="option-content">
                  <div class="permission-icon private">🔒</div>
                  <div>
                    <div class="title">私有星系</div>
                    <div class="desc">仅限受邀用户访问</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>

      <!-- 弹窗底部操作区 -->
      <div class="dialog-footer">
        <button class="cosmic-btn cancel-btn" @click="dialogVisible = false">
          取消
        </button>
        <button class="cosmic-btn confirm-btn" @click="submitForm" >
          <span>保存更改</span>

        </button>
      </div>

      <!-- 动态星流背景 -->
      <div class="stars" id="stars"></div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import {  ElMessageBox } from 'element-plus'
import { useGalaxyStore } from '@/stores/galaxy'
import type { KnowledgeGalaxyDto } from '@/types/galaxy'
import type { FormInstance, FormRules } from 'element-plus'
import router from '@/router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  galaxy: {
    type: Object as () => KnowledgeGalaxyDto | null,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const galaxyStore = useGalaxyStore()
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  galaxyId: galaxyStore.currentGalaxy?.galaxyId??null,
  name: galaxyStore.currentGalaxy?.name??null,
  label: galaxyStore.currentGalaxy?.label??null,
  permission: galaxyStore.currentGalaxy?.permission??0
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入星系名称', trigger: 'blur' },
    { min: 3, max: 20, message: '名称长度在3到20个字符', trigger: 'blur' }
  ],
  label: [
    { max: 15, message: '标签不能超过15个字符', trigger: 'blur' }
  ]
})

const title = computed(() => {
  return  '编辑星系'
})

// 监听外部传入的显示状态
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

// 监听对话框关闭
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

// 监听星系数据变化
watch(() => props.galaxy, (val) => {
  if (val) {
    Object.assign(form, {
      galaxyId: val.galaxyId || '',
      name: val.name || '',
      label: val.label || '',
      permission: val.permission || 0
    })
  } else {
    resetForm()
  }
})

const resetForm = () => {
  form.name = galaxyStore.currentGalaxy?.name
  form.label = galaxyStore.currentGalaxy?.label
  form.permission = galaxyStore.currentGalaxy?.permission
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleClose = (done: () => void) => {
  if (hasChanges()) {
    ElMessageBox.confirm('确定要放弃编辑吗？所有更改将丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      done()
    }).catch(() => {})
  } else {
    done()
  }
}

const hasChanges = () => {
  if (!props.galaxy) return false
  return form.name !== props.galaxy.name ||
         form.label !== props.galaxy.label ||
         form.permission !== props.galaxy.permission
}

const handleOverlayClick = () => {
  dialogVisible.value = false
}

const submitForm = async () => {
  console.log('开始保存流程')


  try {
    console.log('执行表单验证')
    saving.value = true
    console.log('验证通过，开始保存')
    if (form.galaxyId) {
      const original = props.galaxy
      if (!original) return

      // 分离更新逻辑 - 只更新变化的字段
      const updatePromises = []

      // 1. 名称更新（独立）
      if (form.name !== original.name) {
        updatePromises.push(
          galaxyStore.updateGalaxyName(form.galaxyId, form.name)
        )
      }

      // 2. 标签更新（独立）
      if (form.label !== original.label) {
        updatePromises.push(
          galaxyStore.updateGalaxyLabel(form.galaxyId, form.label)
        )
      }

      // 3. 权限更新（独立）
      if (form.permission !== original.permission) {
        updatePromises.push(
          galaxyStore.updateGalaxyPermission(form.galaxyId, form.permission)
        )
      }

      // 执行所有更新操作
       // 执行所有更新操作
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)

        // 通知父页面刷新数据
        window.parent.postMessage('refreshGalaxyList', '*')

        // 关闭对话框
        emit('updated')
        if(galaxyStore.currentGalaxy?.galaxyId) {
          await galaxyStore.getGalaxyInfo(galaxyStore.currentGalaxy.galaxyId);

          galaxyStore.currentGalaxy = {
            ...galaxyStore.currentGalaxy,
            name: form.name,
            label: form.label,
            permission: form.permission
          }
        }
        dialogVisible.value = false

        console.log('保存成功')

      }
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

function forceUpdate() {
  throw new Error('Function not implemented.')
}
</script>

<style scoped>
/* 宇宙主题遮罩层 */
.custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(12, 20, 69, 0.9) 0%, rgba(6, 10, 35, 0.95) 100%);
  backdrop-filter: blur(8px);
  z-index: 2000;
  animation: nebula-pulse 15s infinite alternate;
}

@keyframes nebula-pulse {
  0% { opacity: 0.8; }
  100% { opacity: 0.95; }
}

/* 弹窗容器 */
.custom-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  background: linear-gradient(135deg, #0f1a3d 0%, #0a1129 100%);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 25px;
  box-shadow:
    0 0 120px rgba(0, 200, 255, 0.3),
    inset 0 0 40px rgba(0, 200, 255, 0.1);
  z-index: 2001;
  overflow: hidden;
}

/* 弹窗动画 */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.95);
}

/* 弹窗头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 40px;
  border-bottom: 1px solid rgba(100, 200, 250, 0.1);
  position: relative;
  z-index: 2;
}

.cosmic-title {
  margin: 0;
  font-size: 1.8rem;
  font-family: 'Space Grotesk', sans-serif;
  background: linear-gradient(90deg, #6a82fb, #fc5c7d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(106, 130, 251, 0.5);
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

/* 宇宙背景效果 */
.cosmic-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 30%, rgba(94, 73, 155, 0.2), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(56, 134, 186, 0.2), transparent 30%);
  z-index: 0;
}



/* 内容容器 */
.editor-container {
  padding: 20px 40px 10px;
  position: relative;
  z-index: 2;
}

/* 星系预览区 */
.preview-section {
  background: rgba(16, 23, 41, 0.6);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.galaxy-preview {
  display: flex;
  align-items: center;
  gap: 20px;
}

.galaxy-icon {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.core {
  position: absolute;
  top: 35%;
  left: 35%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #ff7e5f, #feb47b);
  border-radius: 50%;
  box-shadow: 0 0 20px #ff7e5f;
  z-index: 2;
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  100% { transform: translate(-50%, -50%) scale(1.1); }
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border: 2px solid rgba(100, 200, 255, 0.6);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(100, 200, 255, 0.8);
  border-radius: 50%;
  animation: twinkle 3s infinite alternate;
}

@keyframes rotate {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* 创建粒子位置 */
.particle:nth-child(1) { top: 10%; left: 50%; }
.particle:nth-child(2) { top: 20%; left: 20%; }
.particle:nth-child(3) { top: 70%; left: 80%; }
.particle:nth-child(4) { top: 40%; left: 10%; }
.particle:nth-child(5) { top: 80%; left: 40%; }
.particle:nth-child(6) { top: 30%; left: 90%; }
.particle:nth-child(7) { top: 60%; left: 30%; }
.particle:nth-child(8) { top: 90%; left: 70%; }

.preview-info {
  flex: 1;
}

.hologram-text {
  margin: 0 0 12px;
  font-size: 1.8rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(100, 200, 255, 0.7);
}

.tag-permission {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cosmic-tag, .public-tag, .private-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.cosmic-tag {
  background: rgba(101, 73, 220, 0.3);
  border: 1px solid #6549dc;
  color: #b8a9ff;
}

.public-tag {
  background: rgba(56, 178, 172, 0.3);
  border: 1px solid #38b2ac;
  color: #81e6d9;
}

.private-tag {
  background: rgba(221, 107, 107, 0.3);
  border: 1px solid #dd6b6b;
  color: #fcb3b3;
}

/* 表单区域 */
.form-section {
  background: rgba(16, 23, 41, 0.6);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  backdrop-filter: blur(5px);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #a0aec0;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
}

.hologram-input {
  width: 100%;
  padding: 12px 15px;
  background: rgba(11, 15, 35, 0.7);
  border: 1px solid rgba(100, 200, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
}

.hologram-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
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

.hologram-input:focus ~ .input-glow {
  opacity: 1;
  transform: scaleX(1);
}

.word-count {
  text-align: right;
  font-size: 0.8rem;
  color: #718096;
  margin-top: 5px;
}

/* 权限选项 */
.permission-options {
  display: flex;
  gap: 15px;
}

.permission-option {
  flex: 1;
  position: relative;
}

.permission-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.option-content {
  padding: 15px;
  background: rgba(11, 15, 35, 0.7);
  border: 1px solid rgba(100, 200, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.permission-option input[type="radio"]:checked + .option-content {
  border-color: #4299e1;
  background: rgba(26, 32, 64, 0.5);
  box-shadow: 0 0 0 1px #4299e1;
}

.permission-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.permission-icon.public {
  background: rgba(56, 178, 172, 0.2);
  color: #81e6d9;
}

.permission-icon.private {
  background: rgba(221, 107, 107, 0.2);
  color: #fcb3b3;
}

.option-content .title {
  font-weight: 600;
  color: #fff;
  margin-bottom: 5px;
}

.option-content .desc {
  font-size: 0.85rem;
  color: #a0aec0;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 40px;
  gap: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.cosmic-btn {
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border: none;
  font-family: 'Space Grotesk', sans-serif;
}

.cancel-btn {
  background: transparent;
  color: #a0aec0;
  border: 1px solid rgba(160, 174, 192, 0.3);
}

.cancel-btn:hover {
  background: rgba(160, 174, 192, 0.1);
  color: #fff;
}

.confirm-btn {
  background: linear-gradient(90deg, #6a82fb, #fc5c7d);
  color: white;
  border: none;
  padding: 10px 30px;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(90deg, #4a5cad, #c4475f);
}

.energy-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
  opacity: 0;
  animation: pulse 2s infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 0.4; }
  100% { opacity: 0; transform: scale(1.5); }
}

/* 星流动画 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .custom-dialog {
    width: 95vw;
  }

  .dialog-header {
    padding: 20px;
  }

  .editor-container {
    padding: 15px;
  }

  .permission-options {
    flex-direction: column;
  }

  .galaxy-preview {
    flex-direction: column;
    text-align: center;
  }

  .tag-permission {
    justify-content: center;
  }

  .dialog-footer {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .cosmic-title {
    font-size: 1.5rem;
  }

  .hologram-text {
    font-size: 1.5rem;
  }

  .close-btn {
    width: 35px;
    height: 35px;
  }

  .close-btn::before,
  .close-btn::after {
    width: 20px;
  }
}
:deep(.success-message) {
  background: linear-gradient(135deg, #0a1129, #1a3a5f);
  border: 1px solid rgba(100, 200, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
  color: #7df9ff;
  font-family: 'Space Grotesk', sans-serif;
  padding: 15px 25px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
</style>
