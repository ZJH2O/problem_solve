// types/user.ts
export interface UserState {
  isLoggedIn: boolean
  userInfo: UserBrief | null
  loading: boolean
  error: string | null
}

export interface UserBrief {
  userId: number
  nickname: string
  avatarUrl?: string
  email?: string
  bio?: string
  createdPlanets?: string[]
  mobile?:string
  createdAt?: string
  favorite_planet_id?: string
}

export interface TokenState {
  token: string | null
  tokenExpireAt: number
}
