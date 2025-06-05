import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        requiresGuest: true, // 添加访客限制
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        requiresGuest: true ,// 添加访客限制
      }
    },
    {
      path: '/',
      redirect: '/home',
      component: () => import('@/layouts/MainLayout.vue'), // 包含导航栏的布局
      children: [
        {
          path: '/home',
          name: 'Home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path:'/knowledge',
          name: 'Knowledge',
          component: () => import('@/views/KnowledgeView.vue')
        },
        {
          path:'/explore',
          name: 'Explore',
          component: () => import('@/views/ExploreView.vue')
        },
        {
          path:'/galaxy-tour',
          name: 'GalaxyTour',
          component: () => import('@/views/GalaxyView.vue')
        },
        {
          path: '/planets/:id',
          component: () => import('@/views/PlanetDetailView.vue'),
          props: true
        },
        {
          path:'/user',
          name:'user',
          children: [
            {
              path: 'profile',
              name: 'UserProfile',
              component: () => import('@/views/UserProfileView.vue'),
            },
            {
              path:'friends',
              name:'UserFriends',
              component :() => import('@/views/FriendView.vue'),
            },
            {
              path:'messages',
              name:'UserMessages',
              component: () => import('@/views/MessagesView.vue')
            }
          ],
        },
        {
          path: '/galaxy/:galaxyId',
          children: [
            {
              path:'galaxyDetail',
              name: 'GalaxyDetail',
              component: () => import('@/views/GalaxyDetailView.vue'),
            }
          ]
        },
      ],
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

   // 1. 检查是否需要认证
   if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }
  else if (to.meta.requiresGuest) {
    if (!userStore.isLoggedIn) {
      next()
    } else {
      next('/') // 已登录用户跳转首页
    }
  }
  else {
    next()
  }
})

export default router
