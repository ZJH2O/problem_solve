<template>
  <div class="stellar-container">
    <div class="stellar-glow"></div>
    <div class="login-container">
      <h2 class="stellar-title">星域公民注册</h2>
      <form @submit.prevent="handleRegister" class="stellar-form">
        <div class="form-group">
          <label class="stellar-label">量子签名：</label>
          <input
            v-model="registerForm.nickname"
            type="text"
            class="stellar-input"
            placeholder="设置用户名"
            required
          />
        </div>
        <div class="form-group">
          <label class="stellar-label">星际邮箱：</label>
          <input
            v-model="registerForm.email"
            type="email"
            class="stellar-input"
            placeholder="设置电子邮箱"
            @input="validateEmail"
            required
          />
          <!-- 邮箱验证提示 -->
          <div v-if="emailError" class="error-tip">
            × {{ emailError }}
          </div>
        </div>
        <div class="form-group">
          <label class="stellar-label">维度密钥：</label>
          <input
            v-model="registerForm.password"
            type="password"
            class="stellar-input"
            placeholder="设置密码"
            @input="validatePassword"
            required
          />
          <!-- 密码强度指示器 -->
          <div class="password-strength">
            <div class="strength-bar" :style="{ width: strengthPercent }" :class="strengthClass"></div>
          </div>
          <div v-if="passwordTip" class="password-tip">
             {{ passwordTip }}
          </div>
        </div>
        <button type="submit" class="stellar-button">超弦认证</button>
      </form>
      <div class="login-link">
        <router-link to="/login" class="stellar-link">
          <span class="stellar-text">已有星籍？</span>
          曲速通道登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

interface RegisterForm {
  nickname: string
  password: string
  email: string
}

const registerForm = ref<RegisterForm>({
  nickname: '',
  password: '',
  email: ''
})

// 邮箱验证状态
const emailError = ref<string>('')
// 密码验证状态
const passwordStrength = ref<number>(0)
const passwordTip = ref<string>('')
const passwordTipIcon = ref<string>('fa-info-circle')


// 邮箱格式验证 (使用正则表达式)[5,6](@ref)
const validateEmail = () => {
  if (!registerForm.value.email) {
    emailError.value = ''
    return
  }

  // 邮箱正则表达式验证
  const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
  if (!emailReg.test(registerForm.value.email)) {
    emailError.value = '星际邮箱格式不符合量子通信协议'
  } else {
    emailError.value = ''
  }
}

// 密码强度验证 (包含长度和复杂度检查)[8,9](@ref)
const validatePassword = () => {
  const password = registerForm.value.password

  if (!password) {
    passwordTip.value = ''
    passwordStrength.value = 0
    return
  }

  // 密码长度验证
  if (password.length < 8) {
    passwordTip.value = '维度密钥长度不足8位'
    passwordTipIcon.value = 'fa-exclamation-triangle'
    passwordStrength.value = 1
    return
  }

  // 密码复杂度验证 (数字、小写字母、大写字母、特殊字符)[8](@ref)
  let complexity = 0
  if (/[0-9]/.test(password)) complexity++  // 包含数字
  if (/[a-z]/.test(password)) complexity++  // 包含小写字母
  if (/[A-Z]/.test(password)) complexity++  // 包含大写字母
  if (/[^a-zA-Z0-9]/.test(password)) complexity++  // 包含特殊字符

  // 根据复杂度设置提示
  if (complexity < 3) {
    passwordTip.value = `安全等级不足（需要数字、字母、特殊字符）`
    passwordTipIcon.value = 'fa-exclamation-triangle'
    passwordStrength.value = 2
  } else {
    passwordTip.value = '维度密钥符合星域安全标准'
    passwordTipIcon.value = 'fa-shield-alt'
    passwordStrength.value = 3
  }
}

// 计算密码强度百分比
const strengthPercent = computed(() => {
  return `${passwordStrength.value * 33}%`
})

// 计算密码强度样式类
const strengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 1: return 'strength-weak'
    case 2: return 'strength-medium'
    case 3: return 'strength-strong'
    default: return ''
  }
})

const handleRegister = async () => {
  // 提交前再次验证
  validateEmail()
  validatePassword()

  // 如果有验证错误，阻止提交
  if (emailError.value || passwordStrength.value < 3) {
    alert('星门参数校验失败，请检查跃迁参数')
    return
  }

  const success = await userStore.register(registerForm.value)
  if (success) {
    alert("注册成功")
    router.push('/login')
  } else {
    alert('星门连接失败，请检查跃迁参数')
  }
}
</script>

<style scoped>
/* 复用星际主题公共样式 */
.stellar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at center, #0a0e2d 0%, #000318 100%);
  position: relative;
  overflow: hidden;
}

.stellar-glow {
  position: absolute;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    #00f7ff33 0%,
    #3d67ff4d 25%,
    #9d4cff33 50%,
    #3d67ff4d 75%,
    #00f7ff33 100%
  );
  animation: stellar-rotate 20s linear infinite;
  filter: blur(80px);
}

.login-container {
  position: relative;
  width: 400px;
  padding: 2.5rem;
  background: rgba(12, 15, 43, 0.8);
  border: 1px solid #3d67ff;
  border-radius: 12px;
  box-shadow: 0 0 40px #3d67ff33;
  backdrop-filter: blur(10px);
}

.stellar-title {
  text-align: center;
  color: #00f7ff;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  text-shadow: 0 0 15px #00f7ff80;
}

.stellar-form {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.stellar-label {
  display: block;
  margin-bottom: 0.8rem;
  color: #7d9bff;
  font-size: 0.9em;
}

.stellar-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(25, 30, 70, 0.6);
  border: 1px solid #3d67ff;
  border-radius: 6px;
  color: #00f7ff;
  transition: all 0.3s ease;
}

.stellar-input::placeholder {
  color: #3d67ff99;
}

.stellar-input:focus {
  outline: none;
  border-color: #00f7ff;
  box-shadow: 0 0 15px #00f7ff40;
}

.stellar-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3d67ff 0%, #00f7ff 100%);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stellar-button:hover {
  background: linear-gradient(135deg, #00f7ff 0%, #3d67ff 100%);
  box-shadow: 0 0 25px #00f7ff80;
}

.login-link {
  margin-top: 2rem;
  text-align: center;
}

.stellar-link {
  color: #00f7ff;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.stellar-link:hover {
  text-shadow: 0 0 15px #00f7ff80;
}

.stellar-text {
  color: #7d9bff;
  font-size: 0.9em;
}

@keyframes stellar-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 验证提示样式 */
.error-tip {
  margin-top: 8px;
  color: #ff6b6b;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-tip {
  color: #ffffff;
  margin-top: 8px;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 密码强度指示器 */
.password-strength {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.strength-weak {
  background: linear-gradient(90deg, #ff4757, #ff6b6b);
}

.strength-medium {
  background: linear-gradient(90deg, #ff9f43, #feca57);
}

.strength-strong {
  background: linear-gradient(90deg, #1dd1a1, #00d2d3);
  animation: glow 2s infinite alternate;
}

/* 动画效果 */
@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(0, 247, 255, 0.5); }
  100% { box-shadow: 0 0 15px rgba(0, 247, 255, 0.8); }
}
</style>
