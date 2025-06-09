<template>

  <div class="stellar-container">
    <div class="stellar-glow"></div>

    <!-- 添加的主标题容器 -->
    <div
      class="stellar-main-title-container"
      :class="{'title-hidden': showLoginContainer}"
      @click="showLoginContainer = true"
    >
      <h1 class="stellar-main-title">
        <!-- 添加幽默元素和科幻感 -->
      <span class="title-part" style="--delay: 0s">不靠</span>
      <span class="title-part" style="--delay: 0.2s">谱星</span>
      <span class="title-part" style="--delay: 0.4s">际百</span>
      <span class="title-part" style="--delay: 0.6s">科</span>
      <!-- <span class="title-blink">!</span> -->
      </h1>
      <div class="stellar-subtitle">
      <!-- 添加幽默副标题 -->
      <span class="subtitle-text">知识交流平台</span>
      <!-- <span class="subtitle-humor">(知识可能扭曲，请系好安全带!)</span> -->
    </div>
      <div class="stellar-prompt">
        <i class="fas fa-hand-pointer"></i>点击进入知识星域
        <!-- <span class="prompt-text">点击进入知识星域</span> -->
      <span class="prompt-humor">(小心知识黑洞!)</span>
      </div>
    </div>


    <div class="login-container" v-show="showLoginContainer">
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
const showLoginContainer = ref(false) // 控制登录框显示
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
    alert("登录成功")
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

/* 新增主标题样式 */
.stellar-main-title-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  cursor: pointer;
  z-index: 20;
  transition: all 1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.stellar-main-title {
  color: #ffffff;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 6px;
  font-size: 5rem;
  margin-bottom: 1rem;
  text-shadow:
    0 0 15px #9d4cff80,
    0 0 25px #3d67ff80,
    0 0 35px #00f7ff80;
  animation: title-pulse 3s ease-in-out infinite alternate;
}

.stellar-subtitle {
  display: block;
  font-size: 1.5rem;
  letter-spacing: 3px;
  color: #00f7ff;
  margin-top: 0.8rem;
  text-shadow: 0 0 10px #00f7ff80;
  animation: subtitle-pulse 4s ease-in-out infinite alternate;
}

.stellar-prompt {
  color: #7d9bff;
  font-size: 1.2rem;
  margin-top: 2rem;
  opacity: 0.8;
  animation: prompt-bounce 2s ease-in-out infinite;
}

.stellar-prompt i {
  margin-right: 8px;
  animation: spin 3s linear infinite;
}

@keyframes title-pulse {
  0% {
    text-shadow:
      0 0 15px #9d4cff80,
      0 0 25px #3d67ff80;
    transform: scale(1);
  }
  100% {
    text-shadow:
      0 0 25px #9d4cff,
      0 0 35px #3d67ff,
      0 0 45px #00f7ff80;
    transform: scale(1.05);
  }
}

@keyframes subtitle-pulse {
  0% {
    opacity: 0.7;
    text-shadow: 0 0 5px #00f7ff80;
  }
  100% {
    opacity: 1;
    text-shadow: 0 0 15px #00f7ff, 0 0 25px #3d67ff80;
  }
}

@keyframes prompt-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.title-hidden {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  pointer-events: none;
}

/* 调整登录框动画 */
.login-container {
  /* 原有样式保持不变 */
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.login-container {
  /* 当显示时添加的样式 */
  opacity: 1;
  transform: translateY(0);
}
/* 新增幽默标题样式 */
.stellar-main-title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.title-part {
  display: inline-block;
  animation: text-glitch 5s infinite;
  animation-delay: var(--delay);
}

.title-blink {
  color: #ff00c1;
  animation: blink 1s infinite alternate;
  margin-left: 10px;
  text-shadow: 0 0 10px #ff00c1;
}

.stellar-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.subtitle-text {
  font-size: 1.8rem;
  letter-spacing: 3px;
  color: #00f7ff;
  text-shadow: 0 0 10px #00f7ff80;
}

.subtitle-humor {
  font-size: 1rem;
  color: #ffcc00;
  font-style: italic;
  margin-top: 0.5rem;
  animation: wobble 3s infinite;
  text-shadow: 0 0 5px #ffcc0080;
}

.stellar-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.prompt-text {
  font-size: 1.2rem;
}

.prompt-humor {
  font-size: 0.9rem;
  color: #ff6600;
  font-style: italic;
  margin-top: 0.3rem;
  animation: shake 5s infinite;
}

/* 新增动画效果 */
@keyframes text-glitch {
  0%, 100% {
    transform: translate(0);
    text-shadow:
      0 0 15px #9d4cff80,
      0 0 25px #3d67ff80;
  }
  1%, 99% {
    transform: translate(-2px, 2px);
    text-shadow:
      -2px 0 #ff00c1,
      2px 0 #00fff9;
  }
  2%, 98% {
    transform: translate(2px, -2px);
    text-shadow:
      2px 0 #ff00c1,
      -2px 0 #00fff9;
  }
}

@keyframes blink {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}
</style>
