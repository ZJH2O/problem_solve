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
            required
          />
        </div>
        <div class="form-group">
          <label class="stellar-label">维度密钥：</label>
          <input
            v-model="registerForm.password"
            type="password"
            class="stellar-input"
            placeholder="设置密码"
            required
          />
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
import { ref } from 'vue'
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

const handleRegister = async () => {
  const success = await userStore.register(registerForm.value)
  if (success) {
    alert('量子纠缠注册成功，请进行时空验证')
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
</style>
