<template>
  <div class="user-management">
    <h2 class="section-title">用户账户管理</h2>

    <div class="action-cards">
      <!-- 封禁用户 -->
      <div class="action-card">
        <h3>封禁用户</h3>
        <div class="form-group">
          <label>用户ID</label>
          <input type="number" v-model="banData.userId" placeholder="输入要封禁的用户ID">
        </div>
        <div class="form-group">
          <label>封禁时长 (天)</label>
          <input type="number" v-model="banData.duration" placeholder="封禁天数">
        </div>
        <div class="form-group">
          <label>封禁原因</label>
          <textarea v-model="banData.reason" placeholder="详细描述封禁原因"></textarea>
        </div>
        <button class="action-button ban" @click="banUser">执行封禁</button>
      </div>

      <!-- 解封用户 -->
      <div class="action-card">
        <h3>解封用户</h3>
        <div class="form-group">
          <label>用户ID</label>
          <input type="number" v-model="unbanData.userId" placeholder="输入要解封的用户ID">
        </div>
        <button class="action-button unban" @click="unbanUser">解除封禁</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

// 封禁用户数据
const banData = ref({
  userId: null as number | null,
  duration: 7,
  reason: ''
})

// 解封用户数据
const unbanData = ref({
  userId: null as number | null
})

const banUser = async () => {
  if (!banData.value.userId || !banData.value.reason) {
    alert('请填写完整的封禁信息')
    return
  }

  try {
    await adminStore.banUser(
      banData.value.userId,
      banData.value.reason,
      banData.value.duration
    )
    alert('用户封禁成功')
    banData.value = { userId: null, duration: 7, reason: '' }
  } catch (error) {
    alert('封禁操作失败: ' + (error as Error).message)
  }
}

const unbanUser = async () => {
  if (!unbanData.value.userId) {
    alert('请输入用户ID')
    return
  }

  try {
    await adminStore.unbanUser(unbanData.value.userId)
    alert('用户解封成功')
    unbanData.value = { userId: null }
  } catch (error) {
    alert('解封操作失败: ' + (error as Error).message)
  }
}
</script>

<style scoped>
.user-management {
  color: #e0e0ff;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #90e0ef;
  border-bottom: 2px solid #00b4d8;
  padding-bottom: 0.5rem;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.action-card {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2a3a5a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.action-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #00b4d8;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #a0a0ff;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  background: rgba(15, 30, 60, 0.5);
  border: 1px solid #2a4a7a;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.action-button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ban {
  background: linear-gradient(to right, #ff416c, #ff4b2b);
  color: white;
}

.unban {
  background: linear-gradient(to right, #00b09b, #96c93d);
  color: white;
}
</style>
