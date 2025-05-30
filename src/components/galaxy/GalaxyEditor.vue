<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="600px"
    :before-close="handleClose"
    custom-class="galaxy-editor"
  >
    <div class="editor-container">
      <div class="preview-section">
        <div class="galaxy-preview">
          <div class="galaxy-icon">
            <div class="core"></div>
            <div class="ring"></div>
            <div class="particles">
              <div v-for="i in 8" :key="i" class="particle"></div>
            </div>
          </div>
          <div class="preview-info">
            <h3>{{ form.name || '星系名称' }}</h3>
            <div class="tag-permission">
              <el-tag v-if="form.label" size="small" class="tag">{{ form.label }}</el-tag>
              <el-tag
                :type="form.permission === 0 ? 'success' : 'warning'"
                size="small"
              >
                {{ form.permission === 0 ? '公开星系' : '私有星系' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="form-section"
      >
        <el-form-item label="星系名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="输入星系名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="星系标签" prop="label">
          <el-input
            v-model="form.label"
            placeholder="为星系添加标签（可选）"
            maxlength="15"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="访问权限" prop="permission">
          <el-radio-group v-model="form.permission">
            <el-radio :label="0" border>
              <div class="permission-option">
                <el-icon><Unlock /></el-icon>
                <div>
                  <div class="title">公开星系</div>
                  <div class="desc">所有用户可见</div>
                </div>
              </div>
            </el-radio>
            <el-radio :label="1" border>
              <div class="permission-option">
                <el-icon><Lock /></el-icon>
                <div>
                  <div class="title">私有星系</div>
                  <div class="desc">仅限受邀用户访问</div>
                </div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="saving"
        >
          保存更改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Unlock } from '@element-plus/icons-vue'
import { useGalaxyStore } from '@/stores/galaxy'
import type { KnowledgeGalaxyDto } from '@/types/galaxy'
import type { FormInstance, FormRules } from 'element-plus'

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
  galaxyId: '',
  name: '',
  label: '',
  permission: 0 as 0 | 1
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
  return form.galaxyId ? '编辑星系' : '创建星系'
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
  form.galaxyId = ''
  form.name = ''
  form.label = ''
  form.permission = 0
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

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    // 调用store更新星系信息
    if (form.galaxyId) {
      await galaxyStore.updateGalaxy({
        galaxyId: form.galaxyId,
        name: form.name,
        label: form.label,
        permission: form.permission
      } as KnowledgeGalaxyDto)

      ElMessage.success('星系信息更新成功')
      emit('updated')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error as Error).message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section {
  background: linear-gradient(135deg, #1a2a6c, #2a4d69);
  border-radius: 10px;
  padding: 20px;
  color: white;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, #ffd700, #ff9800);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.7);
  z-index: 2;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  z-index: 1;
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
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform-origin: 0 0;
}

.particle:nth-child(1) { transform: rotate(0deg) translate(40px); }
.particle:nth-child(2) { transform: rotate(45deg) translate(40px); }
.particle:nth-child(3) { transform: rotate(90deg) translate(40px); }
.particle:nth-child(4) { transform: rotate(135deg) translate(40px); }
.particle:nth-child(5) { transform: rotate(180deg) translate(40px); }
.particle:nth-child(6) { transform: rotate(225deg) translate(40px); }
.particle:nth-child(7) { transform: rotate(270deg) translate(40px); }
.particle:nth-child(8) { transform: rotate(315deg) translate(40px); }

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.preview-info {
  flex: 1;
}

.preview-info h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  font-weight: 600;
}

.tag-permission {
  display: flex;
  gap: 8px;
}

.tag {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409eff;
  border: none;
}

.form-section {
  padding: 0 10px;
}

.permission-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 15px;
}

.permission-option .el-icon {
  font-size: 24px;
}

.permission-option .title {
  font-weight: 600;
  margin-bottom: 3px;
}

.permission-option .desc {
  font-size: 0.85rem;
  color: #888;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style>
.galaxy-editor .el-dialog__header {
  background: linear-gradient(to right, #1a2a6c, #2a4d69);
  margin: 0;
  padding: 15px 20px;
}

.galaxy-editor .el-dialog__title {
  color: white;
  font-weight: 600;
}

.galaxy-editor .el-dialog__headerbtn .el-dialog__close {
  color: white;
}

.galaxy-editor .el-dialog__body {
  padding: 20px;
}

.galaxy-editor .el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
}
</style>
