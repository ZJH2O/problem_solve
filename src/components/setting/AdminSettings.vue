<template>
  <div class="admin-settings">
    <h2 class="section-title">管理员配置</h2>

    <div class="admin-actions">
      <!-- 添加管理员部分 -->
      <div class="add-admin-form">
        <h3>添加新管理员</h3>
        <div class="form-group">
          <label>用户ID</label>
          <input
            type="number"
            v-model="newAdmin.userId"
            placeholder="输入用户ID"
            :disabled="adminStore.isLoading"
          >
        </div>
        <button
          class="action-button add"
          @click="addAdmin"
          :disabled="adminStore.isLoading || !newAdmin.userId"
        >
          <span v-if="adminStore.isLoading">添加中...</span>
          <span v-else>添加管理员</span>
        </button>
      </div>

      <!-- 管理员列表 -->
      <div class="admin-list">
        <div class="list-header">
          <h3>当前管理员列表</h3>
          <button @click="refreshList" :disabled="adminStore.isLoading">
            <i class="refresh-icon">↻</i>刷新
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="adminStore.isLoading" class="loading-status">
          <div class="loader"></div>
          <span>正在加载管理员列表...</span>
        </div>

        <!-- 错误提示 -->
        <div v-if="adminStore.error" class="error-message">
          <span>{{ adminStore.error }}</span>
          <button @click="retryFetch">重试</button>
        </div>

        <!-- 表格内容 -->
        <div v-if="adminStore.admins.length > 0" class="admin-table">
          <div class="admin-header">
            <div class="header-cell">管理员ID</div>
            <div class="header-cell">用户ID</div>
            <div class="header-cell">状态</div>
            <div class="header-cell">操作</div>
          </div>

          <div
            class="admin-row"
            v-for="admin in adminStore.admins"
            :key="`${admin.adminId}-${admin.userId}`"
            :class="{'status-inactive-row': admin.status === 0}"
          >
            <div class="admin-cell">{{ admin.adminId }}</div>
            <div class="admin-cell">{{ admin.userId }}</div>
            <div class="admin-cell status-cell" :class="getStatusClass(admin)">
              {{ getStatusText(admin) }}
            </div>
            <div class="admin-cell action-cell">
              <button
                class="action-button delete"
                @click="confirmDeleteAdmin(admin)"
                :disabled="adminStore.isLoading"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态提示 -->
        <div v-else-if="!adminStore.isLoading && !adminStore.error" class="empty-list">
          <i class="empty-icon">∅</i>
          <p>暂无管理员数据</p>
        </div>
      </div>
    </div>

    <!-- 操作反馈 -->
    <div class="operation-feedback">
      <p v-if="operationMessage" :class="`feedback-${operationType}`">
        {{ operationMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SystemAdmin } from '@/types/admin'

const adminStore = useAdminStore()

// 新管理员数据
const newAdmin = ref({
  userId: null as number | null
})

// 操作反馈信息
const operationMessage = ref('')
const operationType = ref('success') // 'success' or 'error'

// 初始化获取管理员列表
onMounted(async () => {
  await adminStore.fetchAdmins()
})

// 添加管理员
const addAdmin = async () => {
  if (!newAdmin.value.userId) {
    showFeedback('请填写用户ID', 'error')
    return
  }

  try {
    await adminStore.addAdmin(Number(newAdmin.value.userId))
    showFeedback('管理员添加成功', 'success')
    newAdmin.value = { userId: null }
    await adminStore.fetchAdmins()
  } catch (error) {
    const message = (error as Error).message || '添加管理员失败'
    showFeedback(message, 'error')
  }
}

// 确认删除管理员
const confirmDeleteAdmin = (admin: SystemAdmin) => {
  ElMessageBox.confirm(
    `确定要删除管理员 ${admin.userId} 吗？此操作不可恢复。`,
    '删除管理员',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'admin-delete-confirm'
    }
  )
    .then(async () => {
      try {
        await adminStore.deleteAdmin(admin.adminId)
        showFeedback('管理员已删除', 'success')
        await adminStore.fetchAdmins()
      } catch (error) {
        const message = (error as Error).message || '删除管理员失败'
        showFeedback(message, 'error')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 重试获取列表
const retryFetch = async () => {
  adminStore.error = null
  await adminStore.fetchAdmins()
}

// 刷新列表
const refreshList = async () => {
  await adminStore.fetchAdmins()
  showFeedback('管理员列表已刷新', 'success')
}

// 显示操作反馈
const showFeedback = (message: string, type: 'success' | 'error') => {
  operationMessage.value = message
  operationType.value = type

  // 定时清除消息
  setTimeout(() => {
    operationMessage.value = ''
  }, 3000)
}

// 状态辅助函数
const getStatusClass = (admin: SystemAdmin) => {
  return {
    'status-active': admin.status === 1,
    'status-inactive': admin.status === 0
  }
}

const getStatusText = (admin: SystemAdmin) => {
  return admin.status === 1 ? '停用' : '活跃'
}
</script>

<style scoped>
.admin-settings {
  color: #e0e0ff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #90e0ef;
  text-shadow: 0 0 8px rgba(0, 180, 216, 0.5);
  padding-bottom: 10px;
  border-bottom: 2px solid #00b4d8;
}

.admin-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-top: 20px;
}

.add-admin-form,
.admin-list {
  background: rgba(15, 30, 60, 0.8);
  border-radius: 16px;
  padding: 25px;
  border: 1px solid rgba(100, 180, 255, 0.3);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.add-admin-form:hover,
.admin-list:hover {
  transform: translateY(-5px);
}

.add-admin-form h3,
.admin-list .list-header h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #4facfe;
  font-size: 1.6rem;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(100, 180, 255, 0.3);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header button {
  background: rgba(0, 180, 216, 0.2);
  color: #90e0ef;
  border: 1px solid rgba(0, 180, 216, 0.5);
  border-radius: 8px;
  padding: 8px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-header button:hover {
  background: rgba(0, 180, 216, 0.3);
  transform: scale(1.05);
}

.list-header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  margin-right: 5px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  color: #a0d0ff;
  font-size: 1.1rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 14px;
  background: rgba(10, 25, 50, 0.7);
  border: 1px solid rgba(100, 150, 255, 0.4);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #00b4d8;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.3);
}

.action-button {
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add {
  background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
  color: white;
}

.delete {
  background: #ff6b6b;
  color: white;
}

/* 表格样式 */
.admin-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.admin-header,
.admin-row {
  display: table-row;
}

.header-cell,
.admin-cell {
  display: table-cell;
  padding: 16px 12px;
  text-align: center;
  border-bottom: 1px solid rgba(100, 150, 200, 0.2);
}

.admin-header {
  background: linear-gradient(135deg, #0c3483 0%, #0077b6 100%);
}

.header-cell {
  color: #e0f7fa;
  font-weight: 600;
  font-size: 1.1rem;
}

.admin-row:nth-child(even) {
  background: rgba(15, 30, 60, 0.5);
}

.admin-row:hover {
  background: rgba(20, 50, 100, 0.7);
}

.status-cell {
  font-weight: 600;
}

.status-active {
  color: #00d19d;
  text-shadow: 0 0 5px rgba(0, 209, 157, 0.5);
}

.status-inactive {
  color: #00d19d;
}

.action-cell {
  width: 120px;
}

.action-cell .action-button {
  padding: 8px 12px;
  font-size: 0.9rem;
}

/* 状态指示器 */
.loading-status {
  padding: 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 180, 216, 0.2);
  border-radius: 50%;
  border-top: 5px solid #00b4d8;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: rgba(255, 100, 100, 0.2);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin: 20px 0;
  color: #ff6b6b;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.error-message button {
  padding: 10px 20px;
  background: rgba(255, 150, 150, 0.5);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.error-message button:hover {
  background: rgba(255, 150, 150, 0.8);
}

.empty-list {
  padding: 40px;
  text-align: center;
  color: #a0a0ff;
  font-size: 1.2rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.3;
  margin-bottom: 15px;
  display: block;
}

.operation-feedback {
  margin-top: 20px;
  text-align: center;
  min-height: 30px;
}

.feedback-success {
  color: #00d19d;
  animation: fadeInOut 3s forwards;
}

.feedback-error {
  color: #ff6b6b;
  animation: fadeInOut 3s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 900px) {
  .admin-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .admin-cell, .header-cell {
    padding: 12px 6px;
    font-size: 0.95rem;
  }

  .header-cell, .admin-list h3 {
    font-size: 1.1rem;
  }

  .action-cell {
    width: 80px;
  }

  .action-cell .action-button {
    padding: 6px 8px;
    font-size: 0.8rem;
  }
}
</style>

<style>
/* 管理员删除确认对话框全局样式 */
.admin-delete-confirm {
  background: rgba(15, 30, 60, 0.95) !important;
  border: 1px solid rgba(255, 100, 100, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 30px rgba(255, 100, 100, 0.2) !important;
  color: #e0e0ff !important;
}

.admin-delete-confirm .el-message-box__title {
  color: #ff6b6b !important;
  font-weight: 600 !important;
}

.admin-delete-confirm .el-message-box__content {
  color: #a0d0ff !important;
  font-size: 1.1rem !important;
}

.admin-delete-confirm .el-button--primary {
  background: #ff6b6b !important;
  border-color: #ff6b6b !important;
}

.admin-delete-confirm .el-button--primary:hover {
  background: #ff4f4f !important;
  border-color: #ff4f4f !important;
}
</style>
