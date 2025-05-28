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
          <div class="password-wrapper">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="stellar-input"
              placeholder="请输入密码"
            />
            <i
              class="password-toggle fas"
              :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"
              @click="togglePassword"
            ></i>
          </div>
          <div class="stellar-remember">
            <label class="cyber-checkbox">
              <input type="checkbox" v-model="rememberMe">
              <span class="cyber-glitch" data-text="记忆裂痕">记住密码</span>
            </label>
          </div>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import CryptoJS from 'crypto-js'

const router = useRouter()
const userStore = useUserStore()
const showPassword = ref(false)
const rememberMe = ref(false)
const ENCRYPT_KEY = import.meta.env.VITE_CRYPTO_KEY || 'StellarLock#2099'
// 初始化时读取存储的凭证
onMounted(() => {
  const saved = localStorage.getItem('stellar_credentials')
  if (saved) {
    try {
      const bytes = CryptoJS.AES.decrypt(saved, ENCRYPT_KEY)
      const credentials = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      loginForm.value.nickname = credentials.nickname
      loginForm.value.password = credentials.password
      rememberMe.value = true
    } catch (e) {
      localStorage.removeItem('stellar_credentials')
      console.error('无法解密存储的凭证，已清除存储', e)
    }
  }
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

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
    if (rememberMe.value) {
      const ciphertext = CryptoJS.AES.encrypt(
        JSON.stringify(loginForm.value),
        ENCRYPT_KEY
      ).toString()
      localStorage.setItem('stellar_credentials', ciphertext)
    } else {
      localStorage.removeItem('stellar_credentials')
    }
    //登录成功后的跳转，这里示例跳转到首页
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

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #3d67ff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  z-index: 10;
}

.password-toggle:hover {
  color: #00f7ff;
  text-shadow: 0 0 8px rgba(0, 247, 255, 0.5);
}

/* 调整原有输入框的padding防止文字被遮挡 */
.stellar-input {
  padding-right: 0; /* 新增 */
}

.stellar-remember {
  margin-top: 10px;
  display: flex;
  margin-left: 15rem;
  padding: 0 auto;
}

.cyber-checkbox {
  position: relative;
  cursor: pointer;
  display: flex;
}

.cyber-checkbox input {
  opacity: 0;
  position: absolute;

}

.cyber-checkbox span {
  position: relative;
  padding-left: 1.2rem;
  color: #7d9bff;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.cyber-checkbox span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  border: 1px solid #3d67ff;
  background: rgba(25, 30, 70, 0.6);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.cyber-checkbox span::after {
  content: '✓';
  position: absolute;
  left: 3px;
  top: 45%;
  transform: translateY(-50%);
  color: #00f7ff;
  opacity: 0;
  font-size: 14px;
  text-shadow: 0 0 8px #00f7ff;
  transition: all 0.3s ease;
}

.cyber-checkbox input:checked + span::after {
  opacity: 1;
}

.cyber-checkbox input:checked + span::before {
  border-color: #00f7ff;
  box-shadow: 0 0 12px #00f7ff80;
}

.cyber-glitch {
  position: relative;
}

.cyber-glitch::before {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  text-shadow: 3px 0 #3d67ff;
  background: rgba(12, 15, 43, 0.8);
  overflow: hidden;
}

@keyframes glitch-1 {
  0% { clip: rect(10px, 999px, 20px, 0) }
  100% { clip: rect(0, 999px, 15px, 0) }
}
</style>
