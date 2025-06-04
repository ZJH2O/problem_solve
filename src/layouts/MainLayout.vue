<template>
  <div class="main-layout">
    <NavBar class="nav-container" />
    <main class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width:100vw ;
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #0a0f1f 0%,   // 顶部更深的蓝黑色
    #050814 100%  // 底部接近纯黑的深蓝
  );
  z-index: -2;
  .nav-container {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .content-container {
    flex: 1;
    position: relative;
    padding: 2rem 5%;
    margin-top: 70px; // 根据导航栏实际高度调整

    // 星空装饰效果
    &::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        // 冷色调星星（蓝紫色系）
        radial-gradient(circle at 15% 25%, rgba(124, 122, 255, 0.249) 0.8px, transparent 1.5px),
        radial-gradient(circle at 70% 60%, rgba(137, 43, 226, 0.292) 1px, transparent 2px),
        // 暖色调点缀（金色流星）
        radial-gradient(circle at 85% 10%, rgba(255, 217, 0, 0.32) 1.5px, transparent 2px),
        // 星云效果（紫色雾状）
        radial-gradient(circle at 50% 50%, rgba(76, 0, 130, 0.128) 30px, transparent 100px);

        background-size:
          120px 120px,  // 小星星
          250px 250px,  // 中星星
          400px 400px,  // 大星星
          100% 100%;    // 星云
        pointer-events: none;
        // 添加发光效果
        filter:
          brightness(1.1)     // 整体亮度提升10%
          contrast(1.2);       // 对比度提升20%

        // 增强闪烁动画
        animation:
          starfield 120s linear infinite,
          twinkle 3s ease-in-out infinite alternate;  // 缩短周期增强闪烁感
    }
  }

}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 星空动画
@keyframes starfield {
  from { background-position: 0 0; }
  to { background-position: 1000px 1000px; }
}

@media (max-width: 768px) {
  .content-container {
    padding: 1.5rem;
    margin-top: 60px;
  }
}
@keyframes starfield {
  0% {
    background-position: 0 0, 100px 50px, 200px 100px, 0 0;
    opacity: 0.9;
  }
  50% {
    opacity: 1; // 增加闪烁效果
  }
  100% {
    background-position: 1000px 500px, 800px 300px, 600px 100px, 100px 50px;
    opacity: 0.8;
  }
}

// 添加星光闪烁特效
@keyframes twinkle {
  0%, 100% {
    filter:
      brightness(1.1)
      contrast(1.2)
      drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));  // 添加微光晕
  }
  50% {
    filter:
      brightness(1.8)    // 峰值亮度提升80%
      contrast(1.5)
      drop-shadow(0 0 8px rgba(200, 180, 255, 0.8));  // 强化光晕
  }
}
</style>
