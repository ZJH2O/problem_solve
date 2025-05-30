// 星系基础类型
export interface KnowledgeGalaxyDto {
  galaxyId?: string
  userId: number
  name: string
  label: string
  permission?: 0 | 1
  inviteCode?: string
  planets?: string[] // 包含的星球ID
}

// 星球操作参数
export interface GalaxyPlanetOperation {
  galaxyId: string
  planetId: string
}

// 响应类型保持一致
export interface ResponseMessage<T> {
  code: number
  message: string
  data: T
}
