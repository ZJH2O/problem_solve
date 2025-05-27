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
  mobile?: string
  bio?: string
  createdPlanets?: string[]
}
