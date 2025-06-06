<template>
  <div class="comment-management">
    <h2 class="section-title">评论内容管理</h2>

    <div class="action-cards">
      <!-- 星系评论管理 -->
      <div class="action-card">
        <h3>星系评论处理</h3>
        <div class="form-group">
          <label>评论ID</label>
          <input type="number" v-model="galaxyComment.commentId" placeholder="输入违规评论ID">
        </div>
        <div class="form-group">
          <label>违规原因</label>
          <textarea v-model="galaxyComment.reason" placeholder="描述违规原因"></textarea>
        </div>
        <button class="action-button delete" @click="deleteGalaxyComment">删除评论</button>
      </div>

      <!-- 星球评论管理 -->
      <div class="action-card">
        <h3>星球评论处理</h3>
        <div class="form-group">
          <label>评论ID</label>
          <input type="number" v-model="planetComment.commentId" placeholder="输入违规评论ID">
        </div>
        <div class="form-group">
          <label>违规原因</label>
          <textarea v-model="planetComment.reason" placeholder="描述违规原因"></textarea>
        </div>
        <button class="action-button delete" @click="deletePlanetComment">删除评论</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

// 星系评论数据
const galaxyComment = ref({
  commentId: null as number | null,
  reason: ''
})

// 星球评论数据
const planetComment = ref({
  commentId: null as number | null,
  reason: ''
})

const deleteGalaxyComment = async () => {
  if (!galaxyComment.value.commentId || !galaxyComment.value.reason) {
    alert('请填写评论ID和违规原因')
    return
  }

  try {
    await adminStore.deleteGalaxyComment(
      galaxyComment.value.commentId,
      galaxyComment.value.reason
    )
    alert('星系评论删除成功')
    galaxyComment.value = { commentId: null, reason: '' }
  } catch (error) {
    alert('删除操作失败: ' + (error as Error).message)
  }
}

const deletePlanetComment = async () => {
  if (!planetComment.value.commentId || !planetComment.value.reason) {
    alert('请填写评论ID和违规原因')
    return
  }

  try {
    await adminStore.deletePlanetComment(
      planetComment.value.commentId,
      planetComment.value.reason
    )
    alert('星球评论删除成功')
    planetComment.value = { commentId: null, reason: '' }
  } catch (error) {
    alert('删除操作失败: ' + (error as Error).message)
  }
}
</script>

<style scoped>
.comment-management {
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

.delete {
  background: linear-gradient(to right, #f5576c, #f093fb);
  color: white;
}
</style>
