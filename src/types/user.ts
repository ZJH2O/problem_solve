// types/user.ts
export interface UserState {
  isLoggedIn: boolean
  userInfo: UserBrief | null
  loading: boolean
  error: string | null
}

export interface UserBrief {
  userId: string
  nickname: string
  avatarUrl?: string
  email?: string
  bio?: string
  createdPlanets?: string[]
  mobile?:string
}

export interface TokenState {
  token: string | null
  tokenExpireAt: number
}
