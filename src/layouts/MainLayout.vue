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
  background: #0f172a; // 深空背景色
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
    margin-top: 80px; // 根据导航栏实际高度调整

    // 星空装饰效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(circle at 10% 20%, rgba(255, 215, 0, 0.05) 1px, transparent 1px),
        radial-gradient(circle at 90% 80%, rgba(192, 108, 132, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      animation: starfield 100s linear infinite;
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
</style>
