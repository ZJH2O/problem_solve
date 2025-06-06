import axios from 'axios'
import { useUserStore } from '@/stores/user'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 如果用户已登录，添加认证 token
    if (userStore.isLoggedIn && userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回数据部分
    return response.data
  },
  (error) => {
    // 错误处理
    const status = error.response?.status

    if (status === 401) {
      // 未授权，跳转到登录页
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    } else if (status === 403) {
      // 无权限
      console.error('操作被拒绝：没有足够权限')
    } else if (status >= 500) {
      // 服务器错误
      console.error('服务器错误：', error.response?.data?.message || '未知错误')
    }

    return Promise.reject(error.response?.data || error.message)
  }
)

export default apiClient
