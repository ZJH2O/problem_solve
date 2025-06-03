export interface KnowledgePlanetDto {
  planetId?: string
  contentTitle: string
  contentDetail?:string
  creatorId: string
  themeId: number
  coverUrl?: string
  visibility?: 0 | 1
  description?: string
  visitCount?:number
  status?:number
  createTime?:string
  displayX?:number
  displayY?:number
  hue?:number
}
