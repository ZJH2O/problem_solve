<template>
  <nav class="cosmic-nav">
    <!-- 左侧品牌标识 -->
    <router-link to="/home" class="brand">
      <span class="logo">🚀</span>
      <h1 class="title">不靠谱星际百科</h1>
    </router-link>

    <!-- 导航菜单 -->
    <div class="nav-links">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        <span class="icon">{{ item.icon }}</span>
        {{ item.name }}
      </router-link>
    </div>

     <!-- 右侧功能区 -->
     <div class="user-actions">
      <div class="user-menu-wrapper" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
        <button class="action-btn nebula-btn">
          <svg class="user-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>

        <transition name="menu-fade">
          <div v-show="showUserMenu" class="user-menu">
            <router-link to="/user/profile" class="menu-item">
              <i class="icon-profile"></i>
              个人中心
            </router-link>
            <router-link to="/user/messages" class="menu-item">
              <i class="icon-message"></i>
              好友管理
            </router-link>
            <router-link to="/user/friends" class="menu-item">
              <i class="icon-message"></i>
              消息管理
            </router-link>
          </div>
        </transition>
      </div>

      <button class="action-btn nebula-btn">
        <svg class="settings-icon" viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.3-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.64-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  name: string
  path: string
  icon: string
}

const navItems = ref<NavItem[]>([
  { name: '首页', path: '/home', icon: '🏠' },
  { name: '知识星球', path: '/knowledge', icon: '🪐' },
  { name: '星际漫游', path: '/explore', icon: '🚀' },
  { name: '星系观光', path: '/galaxy-tour', icon: '🔭' }
])

const showUserMenu = ref(false)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

$cosmic-primary: #6C5B7B;
$stardust-purple: #C06C84;
$nebula-pink: #F67280;
$space-black: #2A2A3C;
$star-yellow: #FFD700;

.cosmic-nav {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(
    135deg,
    rgba($space-black, 0.95) 0%,
    rgba(darken($space-black, 10%), 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba($star-yellow, 0.1);
  font-family: 'Orbitron', sans-serif;
  position: relative;
  z-index: 1000;

  .brand {
    display: flex;
    align-items: center;
    text-decoration: none;
    margin-right: 3rem;

    .logo {
      font-size: 2.5rem;
      margin-right: 1rem;
      filter: drop-shadow(0 0 5px $star-yellow);
    }

    .title {
      color: $star-yellow;
      font-size: 1.8rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba($star-yellow, 0.5);
      margin: 0;
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    .nav-item {
      color: rgba(white, 0.8);
      text-decoration: none;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .icon {
        font-size: 1.2rem;
      }

      &:hover {
        background: rgba($stardust-purple, 0.2);
        color: white;
        transform: translateY(-2px);
      }

      &.active {
        color: $star-yellow;
        background: linear-gradient(
          45deg,
          rgba($stardust-purple, 0.3),
          rgba($nebula-pink, 0.3)
        );
        box-shadow: 0 0 15px rgba($stardust-purple, 0.3);

        &::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: $star-yellow;
          border-radius: 2px;
        }
      }
    }
  }

  .user-actions {
    position: relative;
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-left: auto;

  .user-menu-wrapper {
    position: relative;
  }

  .user-menu {
    position: absolute;
    right: 0;
    top: 100%;
    min-width: 180px;
    background: rgba($space-black, 0.95);
    border-radius: 8px;
    padding: 0.5rem 0;
    margin-top: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);

    .menu-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: rgba(white, 0.9);
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        background: rgba($stardust-purple, 0.2);
        color: $star-yellow;
      }

      i {
        margin-right: 0.8rem;
        font-size: 1.1rem;
      }
    }
  }

  .menu-fade-enter-active,
  .menu-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .menu-fade-enter-from,
  .menu-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: white;
    transition: fill 0.2s ease;
  }

  .nebula-btn {
    padding: 0.6rem;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      svg {
        fill: $star-yellow;
      }
    }
  }
}
}

/* 星空粒子背景效果 */
.cosmic-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 80%, rgba($star-yellow, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 20%, rgba($stardust-purple, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  animation: starfield 60s linear infinite;
}

@keyframes starfield {
  from { background-position: 0 0; }
  to { background-position: 600px 600px; }
}
</style>
