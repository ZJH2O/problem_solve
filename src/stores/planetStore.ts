import { defineStore } from 'pinia';
import type{ KnowledgePlanetDto } from '@/types/planet';
import type { ResponseMessage } from '@/types/api';
import service from '@/utils/request';
import { useUserStore } from './user';

const userStore = useUserStore()

export const usePlanetStore = defineStore('planet', {
  state: () => ({
    planets: [] as KnowledgePlanetDto[],
    currentPlanet: null as KnowledgePlanetDto | null
  }),
  actions:{
    async init(){
      try{
        const res = await service.get<ResponseMessage<KnowledgePlanetDto[]>>('/user/loadingplanets')
        if (res.data.code === 200) {
          this.planets = res.data.data || [];
          return true;
        }
        return false
      }catch (error) {
        console.error('初始化星球列表失败:', error);
      }
    },
     // 创建星球
    async createPlanet(payload: {
      contentTitle: string,
      userId:number
      themeId:number
      description:string
    }) {
      try {
        const response = await service.post<ResponseMessage<string>>(
          '/planet/create',
          payload
        )
        if (response.data.code === 200) {
          this.init()
          return response.data.data // 返回创建的星球ID
        }
        throw new Error(response.data.message || '创建失败')
      } catch (error) {
        throw new Error(`请求失败: ${error}`)
      }
    },

     // 获取星球信息
    async getPlanetDetail(planetId: string) {
      try {
        const response = await service.post<ResponseMessage<KnowledgePlanetDto>>(
          '/planet/planetinfo',
          { planetId }
        )
        if (response.data.code === 200) {
          this.currentPlanet = response.data.data
          return response.data.data
        }
        throw new Error(response.data.message || '获取信息失败')
      } catch (error) {
        this.currentPlanet = null
        throw new Error(`请求失败: ${error}`)
      }
    },

    // 更新星球
    async updatePlanet(payload: KnowledgePlanetDto) {
      try {
        if (!payload.planetId) throw new Error('缺少星球ID')

        const response = await service.put<ResponseMessage<void>>(
          '/planet/update',
          payload
        )
        if (response.data.code === 200) {
          return true
        }
        throw new Error(response.data.message || '更新失败')
      } catch (error) {
        throw new Error(`请求失败: ${error}`)
      }
    },

    // 删除星球
    async deletePlanet(planetId: string) {
      try {
        const response = await service.delete<ResponseMessage<string>>(
          '/planet/delete',
          { data: { planetId } }
        )
        if (response.data.code === 200) {
          return response.data.data // 返回删除的星球ID
        }
        throw new Error(response.data.message || '删除失败')
      } catch (error) {
        throw new Error(`请求失败: ${error}`)
      }
    },

    async setFavorPlanet(planetId: string){
      try{
        const res = await service.put<ResponseMessage>(
          '/user/setfavorplanet',
          { palnetId: planetId }
        )
        if(res.data.code === 200){
          if (userStore.userInfo) {
            userStore.userInfo.favorite_planet_id = res.data.data;
          }
          return res.data.data // 返回最喜欢星球id
        }
      }catch(error){
        throw new Error(`请求失败: ${error}`)
      }
    },



  }
});
