<template>
  <div class="admin-settings">
    <h2 class="section-title">管理员配置</h2>

    <div class="admin-actions">
      <!-- 添加管理员 -->
      <div class="add-admin-form">
        <h3>添加新管理员</h3>
        <div class="form-group">
          <label>用户ID</label>
          <input type="number" v-model="newAdmin.userId" placeholder="输入用户ID">
        </div>
        <div class="form-group">
          <label>权限设置</label>
          <div class="permissions-grid">
            <label v-for="permission in availablePermissions" :key="permission.value">
              <input type="checkbox"
                     v-model="newAdmin.permissions"
                     :value="permission.value">
              {{ permission.label }}
            </label>
          </div>
        </div>
        <button class="action-button add" @click="addAdmin">添加管理员</button>
      </div>

      <!-- 管理员列表 -->
      <div class="admin-list">
        <h3>当前管理员列表</h3>
        <div class="admin-table">
          <div class="admin-header">
            <div class="header-cell">用户ID</div>
            <div class="header-cell">权限</div>
            <div class="header-cell">状态</div>
            <div class="header-cell action-cell">操作</div>
          </div>
          <div class="admin-row" v-for="admin in adminStore.admins" :key="admin.adminId">
            <div class="admin-cell">{{ admin.userId }}</div>
            <div class="admin-cell permissions-cell">
              <span v-for="perm in parsePermissions(admin.permissions)" :key="perm" class="permission-tag">
                {{ getPermissionLabel(perm) }}
              </span>
            </div>
            <div class="admin-cell" :class="{ 'status-active': admin.status === 0, 'status-inactive': admin.status === 1 }">
              {{ admin.status === 0 ? '活跃' : '停用' }}
            </div>
            <div class="admin-cell action-cell">
              <button v-if="admin.status === 0" class="action-button deactivate" @click="updateAdminStatus(admin.adminId, 1)">
                停用
              </button>
              <button v-else class="action-button activate" @click="updateAdminStatus(admin.adminId, 0)">
                启用
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

// 初始化获取管理员列表
onMounted(async () => {
  await adminStore.fetchAdmins()
})

// 新管理员数据
const newAdmin = ref({
  userId: null as number | null,
  permissions: [] as string[]
})

// 可用权限列表
const availablePermissions = [
  { value: 'USER_BAN', label: '用户封禁' },
  { value: 'CONTENT_DELETE', label: '内容删除' },
  { value: 'GALAXY_ACCESS', label: '星系管理' },
  { value: 'REPORT_REVIEW', label: '举报审核' },
  { value: 'ADMIN_MANAGE', label: '管理员管理' }
]

const addAdmin = async () => {
  if (!newAdmin.value.userId || newAdmin.value.permissions.length === 0) {
    alert('请填写用户ID并选择至少一项权限')
    return
  }

  try {
    await adminStore.addAdmin(
      newAdmin.value.userId,
      JSON.stringify(newAdmin.value.permissions)
    )
    alert('管理员添加成功')
    newAdmin.value = { userId: null, permissions: [] }
    await adminStore.fetchAdmins()
  } catch (error) {
    alert('添加管理员失败: ' + (error as Error).message)
  }
}

const updateAdminStatus = async (adminId: number, status: number) => {
  try {
    await adminStore.updateAdminStatus(adminId, status)
    alert('管理员状态已更新')
    await adminStore.fetchAdmins()
  } catch (error) {
    alert('更新状态失败: ' + (error as Error).message)
  }
}

// 辅助方法
const parsePermissions = (permissionsJson: string) => {
  try {
    return JSON.parse(permissionsJson)
  } catch {
    return []
  }
}

const getPermissionLabel = (value: string) => {
  const permission = availablePermissions.find(p => p.value === value)
  return permission ? permission.label : value
}
</script>

<style scoped>
.admin-settings {
  color: #e0e0ff;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #90e0ef;
  border-bottom: 2px solid #00b4d8;
  padding-bottom: 0.5rem;
}

.admin-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.add-admin-form,
.admin-list {
  background: rgba(10, 25, 47, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2a3a5a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.add-admin-form h3,
.admin-list h3 {
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

.form-group input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(15, 30, 60, 0.5);
  border: 1px solid #2a4a7a;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.permissions-grid label {
  display: flex;
  align-items: center;
  padding: 0.6rem;
  background: rgba(20, 40, 80, 0.4);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.permissions-grid label:hover {
  background: rgba(30, 60, 120, 0.5);
}

.permissions-grid input {
  width: auto;
  margin-right: 0.5rem;
}

.action-button {
  padding: 0.8rem 1.2rem;
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

.add {
  background: linear-gradient(to right, #00b09b, #96c93d);
  color: white;
  width: 100%;
}

.deactivate {
  background: #ff6b6b;
  color: white;
}

.activate {
  background: #4facfe;
  color: white;
}

.admin-table {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.admin-header,
.admin-row {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid #2a4a7a;
}

.admin-header {
  font-weight: bold;
  color: #00b4d8;
}

.header-cell,
.admin-cell {
  flex: 1;
  padding: 0 0.5rem;
}

.header-cell.action-cell,
.admin-cell.action-cell {
  flex: 0.5;
  text-align: center;
}

.permissions-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.permission-tag {
  background: rgba(0, 180, 216, 0.2);
  color: #90e0ef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.status-active {
  color: #00d19d;
}

.status-inactive {
  color: #ff6b6b;
}
</style>
