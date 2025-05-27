import { defineStore } from 'pinia'
import type { UserBrief, UserState } from '@/types/user'
import service from '@/utils/request'
import type { LoginResponse, ResponseMessage } from '@/types/api'


export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: !!localStorage.getItem('jwt_token'),
    userInfo: null,
    loading: false,
    error: null
  }),
  getters: {
    currentUser: (state): UserBrief | null => {
      if (!state.userInfo) return null;
      return {
        userId: state.userInfo.userId,
        nickname: state.userInfo.nickname,
        avatarUrl: state.userInfo.avatarUrl || '/default-avatar.png',
        email: state.userInfo.email,
        mobile: state.userInfo.mobile
      }
    }
  },
  actions: {
    async register(userData: {
      nickname:string;
      password:string;
      email:string;
    }){
      this.loading = true
      try {
        const res = await service.post<ResponseMessage<string>>(
          'user/register',
          {
            nickname: userData.nickname,
            password: userData.password,
            email:userData.email
          }
        )

        if(res.data.code === 200){
          return await this.login({
            nickname: userData.nickname,
            password: userData.password
          })
        }

        return true
      }catch (error){
        this.error = (error as Error).message
        throw error
      }finally {
        this.loading = false
      }
    },

    async login(credentials: { nickname: string; password: string }) {
      this.loading = true
      try {
        const res = await service.post<ResponseMessage<LoginResponse>>(
          '/user/login',
          credentials
        )
        if (res.data.code === 200) {
          localStorage.setItem('jwt_token',res.data.data.data)
          await this.fetchUserInfo()
          return true
        }
        return false
      }catch(error){
        this.error = (error as Error).message
        throw error
      }finally {
        this.loading = false
      }
    },
    async fetchUserInfo() {
      try {
        const res = await service.get<ResponseMessage<UserBrief>>('/user/userinfo')
        this.userInfo = res.data.data
        this.isLoggedIn = true
      } catch (error) {
        throw error
      }
    },
    async logout() {
      localStorage.removeItem('jwt_token')
      this.isLoggedIn = false
      this.userInfo = null
    },

  }
})
