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
  favoritePlanetId?: string
  favorite_galaxy_id?: number
  reward?: Reward
}

export interface TokenState {
  token: string | null
  tokenExpireAt: number
}

export interface Reward {
  fuelValue?:number
  knowledgeDust?:number
}

export interface viewUser{
  nickname: string
  email: string
  bio:string
}
