import { useUserStore } from '@/stores/user'
import axios, { type AxiosInstance } from 'axios'

const BASE_URL = 'http://localhost:8081'
const TIME_OUT = 20000 // 请求超时时间

// 创建实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  withCredentials: false, // 新增此项
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 Pinia store 或 localStorage 获取 token
    const token = localStorage.getItem('jwt_token') || ''
    console.log('当前请求头携带的 Token:', token)
    if (token && config.headers) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 统一处理响应数据结构
    const res = response.data
    if (res.code === 200) {
      return response
    } else {
      // 业务错误处理
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  (error) => {
    // HTTP 状态码错误处理
    let errorMessage = '网络异常，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '登录已过期，请重新登录'
          // 跳转登录页
          // window.location.href = '/login'
          break
        case 403:
          errorMessage = '权限不足，请联系管理员'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
      }
    }
    return Promise.reject(new Error(errorMessage))
  }
)

export default service
