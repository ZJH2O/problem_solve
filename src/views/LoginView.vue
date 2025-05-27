<template>
  <div class="stellar-container">
    <div class="stellar-glow"></div>
    <div class="login-container">
      <h2 class="stellar-title">星域通行认证</h2>
      <form @submit.prevent="handleLogin" class="stellar-form">
        <div class="form-group">
          <label class="stellar-label">量子签名：</label>
          <input
            v-model="loginForm.nickname"
            type="text"
            class="stellar-input"
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label class="stellar-label">维度密钥：</label>
          <input
            v-model="loginForm.password"
            type="password"
            class="stellar-input"
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" class="stellar-button">曲速登录</button>
      </form>
      <div class="register-link">
        <span class="stellar-text">未注册星民？</span>
        <router-link to="/register" class="stellar-link">立即申请星域通行证</router-link>
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

interface LoginForm {
  nickname: string
  password: string
}

const loginForm = ref<LoginForm>({
  nickname: '',
  password: ''
})

const handleLogin = async () => {
  const success = await userStore.login(loginForm.value)
  if (success) {
    // 登录成功后的跳转，这里示例跳转到首页
    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath as string)
  } else {
    console.error('登录失败')
    alert('登录失败，请检查用户名和密码')
  }
}
</script>

<style scoped>
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

@keyframes stellar-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  font-family: 'Arial', sans-serif;
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

.register-link {
  margin-top: 2rem;
  text-align: center;
}

.stellar-text {
  color: #7d9bff;
  font-size: 0.9em;
}

.stellar-link {
  color: #00f7ff;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.stellar-link:hover {
  text-shadow: 0 0 15px #00f7ff80;
}
</style>
