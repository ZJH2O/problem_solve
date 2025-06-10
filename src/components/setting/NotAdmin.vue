<template>
  <div class="starlight-container">
    <!-- 粒子背景 -->
    <div class="space-particle" v-for="(p, i) in particles" :key="i" :style="particleStyle(p)"></div>

    <!-- 主要内容 -->
    <div class="starlight-content">
      <h1 class="nebula-title">🚀 不靠谱星际百科知识交流平台 🪐</h1>

      <div class="warp-drive-section">
        <h2>🛸 曲速航行结束声明</h2>
        <p class="quantum-text">
          感谢您搭乘本次知识曲速航行！本飞船已完成{{ lightYearsTraveled }}光年的知识传输，
          消耗了{{ coffeeCupsConsumed }}杯量子咖啡☕️，避免了{{ alienInvasionsPrevented }}次外星文明入侵危机。
        </p>
      </div>

      <div class="thank-section">
        <h2>👽 跨星系鸣谢</h2>

        <div class="thank-card" v-for="(group, index) in thankGroups" :key="index">
          <h3 class="pulsar-header">{{ group.title }}</h3>
          <ul class="nebula-list">
            <li v-for="(name, i) in group.names" :key="i">
              {{ name }} <span class="alien-emoji">👾</span>
            </li>
          </ul>
        </div>

        <div class="android-note">
          <p>特别感谢：{{ androidNames.join('、') }}等{{ androidNames.length }}位仿生人编辑</p>
          <p class="small-print">(他们不需要睡觉，但需要定期充电⚡️)</p>
        </div>
      </div>

      <div class="disclaimer">
        <h2>⚠️ 星际免责声明</h2>
        <p>
          本平台内容可能存在42%的宇宙真理和58%的星际八卦🌌，
          请勿将黑洞照片用作自拍背景🌑，否则可能引发时空悖论⏳。
          最终解释权归半人马座α星分社所有。
        </p>
      </div>

      <div class="signature">
        <p>在{{ currentDate }}，于银河系边缘发来问候</p>
        <p class="robot-sign">🤖 平台管理员：{{ robotName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 类型定义
type Particle = {
  size: number;
  x: number;
  y: number;
  speed: number;
};

type ThankGroup = {
  title: string;
  names: string[];
};

// 响应式数据
const lightYearsTraveled = ref(42);
const coffeeCupsConsumed = ref(999);
const alienInvasionsPrevented = ref(3);
const particles = ref<Particle[]>([]);
const robotName = ref('Z-3PO');

// 致谢分组
const thankGroups = ref<ThankGroup[]>([
  {
    title: '🌠 星际导航员',
    names: ['张健豪', '赵元见', '郭伟宇']
  },
  {
    title: '🧪 量子内容工程师',
    names: ['赵元见', '陈文涛', '张健豪','郭伟宇']
  },
  {
    title: '🛸 外星文明联络部',
    names: ['赵元见', '陈文涛', '张健豪']
  }
]);

// 修改机器人管理员名称
robotName.value = 'R2-Content2';

// 添加新的致谢分组
thankGroups.value.push({
  title: '🦑 外星生物顾问',
  names: ['Zorg Ambassador', 'Kraken Scholar']
});

// 仿生人编辑
const androidNames = ref(['Data-3000', 'Bender-9000', 'R2-Edit2', 'C3P-Content-O']);

// 当前日期
const currentDate = computed(() => new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}));

// 粒子样式
const particleStyle = (p: Particle) => ({
  width: `${p.size}px`,
  height: `${p.size}px`,
  left: `${p.x}px`,
  top: `${p.y}px`,
  opacity: Math.random() * 0.7 + 0.3,
  animationDuration: `${p.speed}s`
});

// 初始化粒子背景
const initParticles = () => {
  const count = 150;
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    newParticles.push({
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: Math.random() * 10 + 5
    });
  }

  particles.value = newParticles;
};

onMounted(() => {
  initParticles();
});
</script>

<style scoped>
.starlight-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f2b 0%, #020617 100%);
  color: #b6f9ff;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
  padding: 2rem;
}

.space-particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  pointer-events: none;
  animation: twinkle infinite alternate;
  z-index: 0;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 0.8; }
}

.starlight-content {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  z-index: 2;
}

.nebula-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  text-shadow: 0 0 10px rgba(0, 209, 255, 0.7);
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0% { text-shadow: 0 0 10px rgba(0, 209, 255, 0.7); }
  50% { text-shadow: 0 0 20px rgba(0, 209, 255, 1), 0 0 30px rgba(98, 0, 255, 0.8); }
  100% { text-shadow: 0 0 10px rgba(0, 209, 255, 0.7); }
}

.warp-drive-section, .thank-section, .disclaimer {
  background: rgba(15, 30, 60, 0.6);
  border: 1px solid rgba(0, 195, 255, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.3);
  backdrop-filter: blur(5px);
}

.quantum-text {
  font-size: 1.1rem;
  line-height: 1.7;
}

.thank-card {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(20, 40, 80, 0.4);
  border-radius: 8px;
}

.pulsar-header {
  color: #9d4edd;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.nebula-list {
  list-style: none;
  padding: 0;
}

.nebula-list li {
  padding: 0.5rem 0;
  border-bottom: 1px dashed rgba(0, 195, 255, 0.3);
  font-size: 1.1rem;
}

.alien-emoji {
  margin-left: 8px;
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

.android-note {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(30, 60, 120, 0.4);
  border-left: 3px solid #00eeff;
}

.small-print {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

.disclaimer p {
  font-size: 0.95rem;
  line-height: 1.6;
}

.signature {
  text-align: center;
  margin-top: 3rem;
  font-size: 1.1rem;
}

.robot-sign {
  font-size: 1.3rem;
  color: #00eeff;
  margin-top: 0.5rem;
}
</style>
