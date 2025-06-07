<template>
  <div class="dialog-overlay cosmic-bg">
    <div class="dialog-content sci-fi-card">
      <h3 class="galaxy-title">🚀 发射新星球</h3>

      <form @submit.prevent="handleSubmit" class="stellar-form">
        <div class="form-group nebula-input">
          <label class="cyber-label">星球名称</label>
          <input
            v-model="formData.contentTitle"
            required
            placeholder="给你的星球起个炫酷的名字..."
            class="glowing-input"
          >
        </div>

        <div class="form-group nebula-input">
          <label class="cyber-label">星球描述</label>
          <textarea
            v-model="formData.description"
            rows="3"
            required
            placeholder="描述你的星球特色..."
            class="glowing-input"
          ></textarea>
        </div>

        <div class="form-group theme-selector">
          <label class="cyber-label">星球主题</label>
          <div class="theme-options">
            <label
              v-for="theme in themes"
              :key="theme.id"
              :class="['theme-card', { 'active': formData.themeId === theme.id }]"
              @click="formData.themeId = theme.id"
            >
              <span class="theme-icon">{{ theme.icon }}</span>
              <span class="theme-name">{{ theme.name }}</span>
              <span class="theme-desc">{{ theme.description }}</span>
            </label>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="cancel-btn cosmic-button" @click="emit('cancel')">
            ✖ 返回行星控制台
          </button>
          <button type="submit" class="submit-btn cosmic-button">
            🚀 发射星球
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const emit = defineEmits<{
  (e: 'submit', data: { contentTitle: string; description: string; themeId:number }): void;
  (e: 'cancel'): void;
}>();

const formData = reactive({
  contentTitle:'',
  description:'',
  themeId:1 // 默认选择学习主题
});

// 三种主题类型
const themes = [
  { id: 1, name: '学习星球', icon: '📚', description: '穿越知识黑洞' },
  { id: 2, name: '生活星球', icon: '🍕', description: '星际日常生活' },
  { id: 3, name: '游戏星球', icon: '🎮', description: '异星战场冒险' }
];

const handleSubmit = () => {
  if (formData.contentTitle && formData.description && formData.themeId > 0) {
    emit('submit', {
      contentTitle: formData.contentTitle,
      description: formData.description,
      themeId: formData.themeId
    });
  }
};
</script>

<style scoped>
/* 宇宙背景效果 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 15, 30, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 科幻卡片设计 */
.dialog-content {
  background: linear-gradient(145deg, #1a2a4a, #0c1a3a);
  padding: 2rem;
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  border: 1px solid #00eeff;
  box-shadow: 0 0 30px rgba(0, 195, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.dialog-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00eeff, #ff00cc);

}


/* 标题样式 */
.galaxy-title {
  margin-top: 0;
  color: #00eeff;
  text-align: center;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(0, 238, 255, 0.7);
  margin-bottom: 1.5rem;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 1.8rem;
}

.cyber-label {
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: #00eeff;
  font-size: 1.1rem;
}

/* 输入框特效 */
.glowing-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(15, 20, 40, 0.7);
  border: 1px solid #3d67ff;
  border-radius: 6px;
  color: #e0f7fa;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.glowing-input:focus {
  outline: none;
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.5);
}

.glowing-input::placeholder {
  color: #7d9bff;
}

/* 主题选择器 */
.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(25, 30, 70, 0.6);
  border: 1px solid #3d67ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(61, 103, 255, 0.5);
}

.theme-card.active {
  border-color: #00eeff;
  box-shadow: 0 0 15px rgba(0, 238, 255, 0.7);
  transform: scale(1.05);
}

.theme-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.theme-name {
  font-weight: 600;
  color: #e0f7fa;
  margin-bottom: 5px;
}

.theme-desc {
  font-size: 0.85rem;
  color: #7d9bff;
}

/* 按钮样式 */
.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.cosmic-button {
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn {
  background: linear-gradient(45deg, #00c9ff, #00eeff);
  color: #0a0f2b;
  box-shadow: 0 4px 15px rgba(0, 201, 255, 0.4);
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 238, 255, 0.6);
}

.cancel-btn {
  background: linear-gradient(45deg, #ff5555, #ff00cc);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 85, 85, 0.4);
}

.cancel-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 0, 204, 0.6);
}
</style>
