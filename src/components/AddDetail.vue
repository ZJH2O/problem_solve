<!-- components/AddDetail.vue -->
<template>
  <div class="dialog-overlay">
    <div class="dialog-content">
      <h3>创建新星球</h3>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>星球名称</label>
          <input v-model="formData.name" required>
        </div>

        <div class="form-group">
          <label>描述信息</label>
          <textarea v-model="formData.description" rows="3" required></textarea>
        </div>

        <div class="form-group">
          <label>初始访问量</label>
          <input
            v-model.number="formData.visitors"
            type="number"
            min="0"
            required
          >
        </div>

        <div class="dialog-actions">
          <button type="button" class="cancel-btn" @click="emit('cancel')">
            取消
          </button>
          <button type="submit" class="submit-btn">
            创建
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const emit = defineEmits<{
  (e: 'submit', data: { name: string; description: string; visitors: number }): void;
  (e: 'cancel'): void;
}>();

const formData = reactive({
  name: '',
  description: '',
  visitors: 1000
});

const handleSubmit = () => {
  if (formData.name && formData.description && formData.visitors >= 0) {
    emit('submit', {
      name: formData.name,
      description: formData.description,
      visitors: formData.visitors
    });
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: relative;
  top: 0;
  left: 0;

  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.dialog-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h3 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn {
  background: #3498db;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
