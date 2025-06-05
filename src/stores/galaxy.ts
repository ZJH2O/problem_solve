import { defineStore } from 'pinia'
import type {
  KnowledgeGalaxyDto,
  GalaxyPlanetOperation,
  ResponseMessage
} from '@/types/galaxy'
import service from '@/utils/request'
import { useUserStore } from './user'
import type { KnowledgePlanetDto } from '@/types/planet'

const userStore = useUserStore()


export const useGalaxyStore = defineStore('knowledgeGalaxy', {
  state: () => ({
    galaxies: [] as KnowledgeGalaxyDto[], // 星系列表
    currentGalaxy: null as KnowledgeGalaxyDto | null ,// 当前查看的星系
    showCreator: false ,// 是否显示创建星系的对话框
    galaxyPlanets: [] as KnowledgePlanetDto[] //星系里面的星球
  }),

  actions: {
    // 初始化星系列表
    async init() {
      try{
        const res = await service.get<ResponseMessage<KnowledgeGalaxyDto[]>>('/user/loadinggalaxies')
        if (res.data.code === 200) {
          this.galaxies = res.data.data || []
          return true
        }
        throw new Error(res.data.message || '加载星系列表失败')
      }catch (error) {
        console.error('初始化星系列表失败:', error)
      }
    },
    async initPlanets(){

    },
    // 创建星系
    async createGalaxy(data:{
      userId: number
      name: string
      label: string
      permission: 0 | 1 // 默认公开
    }) {
      try {

        const response = await service.post<ResponseMessage<string>>(
          '/galaxy/create',
          data
        )

        if (response.data.code === 200) {
          // 创建成功后加入列表
          this.galaxies.push({ ...data, galaxyId: response.data.data })
          this.init()
          return response.data.data
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`创建失败: ${error}`)
      }
    },

    // 获取星系详情
    async getGalaxyInfo(galaxyId:string) {
      try {
        const response = await service.get<ResponseMessage<KnowledgeGalaxyDto>>(
          `/galaxy/${galaxyId}`
        )

        if (response.data.code === 200) {
          this.currentGalaxy = response.data.data
          console.log('获取星系信息:', this.currentGalaxy)
          return this.currentGalaxy
        }
        throw new Error(response.data.message)
      } catch (error) {
        this.currentGalaxy = null
        throw new Error(`获取失败: ${error}`)
      }
    },

    // 更新星系信息
    async updateGalaxy(payload: KnowledgeGalaxyDto) {
      try {
        if (!payload.galaxyId) throw new Error('缺少星系ID')

        // 检查是否有实际修改
        const original = this.galaxies.find(g => g.galaxyId === payload.galaxyId)
        if (original && !this.hasChanges(original, payload)) {
          return '没有需要修改的信息'
        }

        const response = await service.put<ResponseMessage<void>>(
          '/galaxy/update',
          payload
        )

        if (response.data.code === 200) {
          // 更新本地数据
          const index = this.galaxies.findIndex(g => g.galaxyId === payload.galaxyId)
          if (index > -1) {
            this.galaxies[index] = { ...this.galaxies[index], ...payload }
          }
          return '更新成功'
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`更新失败: ${error}`)
      }
    },

    // 删除星系
    async deleteGalaxy(galaxyId: string) {
      try {
        const response = await service.delete<ResponseMessage<string>>(
          '/galaxy/delete',
          { data: { galaxyId } }
        )

        if (response.data.code === 200) {
          this.galaxies = this.galaxies.filter(g => g.galaxyId !== galaxyId)
          return galaxyId
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`删除失败: ${error}`)
      }
    },

    // 添加星球到星系
    async addPlanetToGalaxy(params: {
      galaxyId:number
      planetId:string
    }) {
      try{
        const res = await service.post<ResponseMessage<KnowledgePlanetDto>>(
          '/galaxy/addplanet',
          params
        )
        if(res.data.code === 200){
          this.galaxyPlanets.push(res.data.data)
          console.log("已经添加星球")
          return res.data.data
        }
      }catch (error) {
        throw new Error(`添加失败: ${error}`)
      }

    },
    // 从星系移除星球
    async removePlanetFromGalaxy(params: {
      galaxyId:number
      planetId:string
    }) {
      try{
        const res = await service.post<ResponseMessage<string>>(
          '/galaxy/deleteplanet',
          params
        )
        if(res.data.code === 200){
          console.log("已经删除星球")
          return res.data.data
        }
      }catch(error){
        throw new Error(`删除失败: ${error}`)
      }
    },
    // 新增：更新星系名称
    async updateGalaxyName(galaxyId: string, newName: string) {
      try {
        console.log("更新星系名称")
        const response = await service.put<ResponseMessage<void>>(
          '/galaxy/updateName',
          {}, // 空请求体
          { params: { galaxyId, newName } } // 查询参数
        )

        if (response.data.code === 200) {
          // 更新本地数据
          const galaxy = this.galaxies.find(g => g.galaxyId === galaxyId)
          if (galaxy) {
            galaxy.name = newName
          }
          return true
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`更新名称失败: ${error}`)
      }
    },

    // 新增：更新星系标签
    async updateGalaxyLabel(galaxyId: string, newLabel: string) {
      try {
        console.log("更新标签")
        const response = await service.put<ResponseMessage<void>>(
          '/galaxy/updateLabel',
          {},
          { params: { galaxyId, newLabel } }
        )

        if (response.data.code === 200) {
          const galaxy = this.galaxies.find(g => g.galaxyId === galaxyId)
          if (galaxy) {
            galaxy.label = newLabel
          }
          return true
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`更新标签失败: ${error}`)
      }
    },

    // 新增：更新星系权限
    async updateGalaxyPermission(galaxyId: string, newPermission: 0 | 1) {
      try {
        console.log("更新权限")
        const response = await service.put<ResponseMessage<void>>(
          '/galaxy/updatePermission',
          {},
          { params: { galaxyId, newPermission } }
        )

        if (response.data.code === 200) {
          const galaxy = this.galaxies.find(g => g.galaxyId === galaxyId)
          if (galaxy) {
            galaxy.permission = newPermission
          }
          return true
        }
        throw new Error(response.data.message)
      } catch (error) {
        throw new Error(`更新权限失败: ${error}`)
      }
    },
    // 辅助方法：检查名称是否存在
    async checkNameExists(name: string) {
      return this.galaxies.some(g => g.name === name)
    },

    // 辅助方法：检测修改
    hasChanges(original: KnowledgeGalaxyDto, updated: KnowledgeGalaxyDto) {
      return ['name', 'label', 'permission', 'inviteCode'].some(
        key => original[key] !== updated[key]
      )
    },


    async setFavorGalaxy(galaxyId: number){
      try{
        const res = await service.put<ResponseMessage<number>>(
          '/user/setfavorplanet',
          { galaxyId: galaxyId }
        )
        if(res.data.code === 200){
          if (userStore.userInfo) {
            userStore.userInfo.favorite_galaxy_id = res.data.data;
          }
          return res.data.data // 返回最喜欢星球id
        }
      }catch(error){
        throw new Error(`请求失败: ${error}`)
      }
    },
  }
})
