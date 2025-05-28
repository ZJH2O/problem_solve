import { defineStore } from 'pinia'
import type { TokenState, UserBrief, UserState } from '@/types/user'
import service from '@/utils/request'
import type { LoginResponse, ResponseMessage } from '@/types/api'


export const useUserStore = defineStore('user', {
  state: (): UserState & TokenState => ({
    isLoggedIn: !!localStorage.getItem('jwt_token'),
    userInfo: null,
    loading: false,
    error: null,
    token: null,
    tokenExpireAt: 0
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
    async init() {
      this.token = localStorage.getItem('jwt_token');
      this.isLoggedIn = !!this.token;
      if (this.token) {
        try {
          await this.fetchUserInfo(); // 自动获取用户信息
          return true;
        } catch (error) {
          console.log('获取用户信息失败:', error);
          this.logout(); // 如果 token 失效，则退出登录
        }
      }
    },
    async register(userData: {
      nickname:string;
      password:string;
      email:string;
    }){
      this.loading = true
      try {
        await service.post<ResponseMessage<string>>(
          '/user/register',
          {
            nickname: userData.nickname,
            password: userData.password,
            email:userData.email
          }
        )
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
          const token:string = res.data.data
          console.log('登录成功,token:', token)
          localStorage.setItem('jwt_token',token)
          const res1 = await this.init() // 获取用户信息
          if(res1) {
            return true
          }
        }
        return false
      }catch(error){
        this.error = (error as Error).message
        throw new Error('登录失败，用户名或密码错误')
      }finally {
        this.loading = false
      }
    },
    // async refreshToken() {
    //   try {
    //     const res = await service.post<ResponseMessage<LoginResponse>>('/auth/refresh')
    //     if (res.data.code === 200) {
    //       this.token = res.data.data.token
    //       this.tokenExpireAt = res.data.data.expireAt
    //       localStorage.setItem('jwt_token', this.token)
    //       this.scheduleTokenRefresh()
    //       return true
    //     }
    //   } catch (error) {
    //     this.logout()
    //     throw error
    //   }
    // },
    // scheduleTokenRefresh() {
    //   const refreshTime = this.tokenExpireAt - Date.now() - 300_000 // 提前5分钟刷新
    //   if (refreshTime > 0) {
    //     setTimeout(() => this.refreshToken(), refreshTime)
    //   }
    // },
    async fetchUserInfo() {
      try {
        const res = await service.get<ResponseMessage<UserBrief>>('/user/userinfo')
        this.userInfo = res.data.data
        this.isLoggedIn = true
        console.log('用户信息获取成功:', this.userInfo)
        return true
      } catch (error) {
        throw error
      }
    },
    async updateUserProfile(userData:{
      nickname?:string;
      bio?:string;
      avatarUrl?:string;
    }){
      this.loading = true
      try{
        const res = await service.put<ResponseMessage>('/user/update',userData)
        if (res.data.code === 200) {
          alert('用户信息更新成功')
          this.logout()
          return true
        }
        return false
      }catch(error){
        this.error = (error as Error).message
        throw error
      }finally{
        this.loading = false
      }
    },
    async updatePassword(data:{
      oldpassword:string;
      newpassword:string;
      repassword:string
    }){
      this.loading = true;
      try{
        const res = await service.put<ResponseMessage>('/user/updatepassword',data)
        if(res.data.code === 200){
          alert('密码更新成功，请重新登录！')
          this.logout()
          return true
        }
        return false
      }catch(error){
        this.error = (error as Error).message
        throw error
      }finally{
        this.loading = false;
      }
    },
    async updateMobile(mobile: string) {
      this.loading = true
      try {
        const res = await service.put<ResponseMessage>('/user/updatemobile', { mobile:mobile })
        if (res.data.code === 200) {
          this.logout()
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async updateEmail(email: string) {
      this.loading = true
      try {

        const res = await service.put<ResponseMessage>('/user/updateemail', {email: email })
        if (res.data.code === 200) {
          this.logout()
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async deleteAccount() {
      this.loading = true
      try {
        const userId = this.userInfo?.userId
        if (!userId) throw new Error('用户未登录')

        const res = await service.delete<ResponseMessage>('/user/delete', {
          data: { userId }
        })

        if (res.data.code === 200) {
          this.logout()
          return true
        }
        return false
      } catch (error) {
        this.error = (error as Error).message
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      localStorage.removeItem('jwt_token')
      this.isLoggedIn = false
      this.userInfo = null
    },
    clearError() {
      this.error = null
    },
  }
})
