import { defineStore } from 'pinia';
import type{ KnowledgePlanetDto } from '@/types/planet';
import type { ResponseMessage } from '@/types/api';
import service from '@/utils/request';
import { useUserStore } from './user';

const userStore = useUserStore()

export const usePlanetStore = defineStore('planet', {
  state: () => ({
    planets: [] as KnowledgePlanetDto[],
    currentPlanet: null as KnowledgePlanetDto | null,
    favoritePlanet: null as KnowledgePlanetDto | null,
    searchResultPlanet: [] as KnowledgePlanetDto[],
    hotPlanets: [] as KnowledgePlanetDto[],
    currentRandomPlanet: null as KnowledgePlanetDto | null,
    currentSelectPlanet: null as KnowledgePlanetDto | null,
    minVisitors: 0,
    maxVisitors: 0
  }),
  actions:{
    async init(){
      try{
        const res = await service.get<ResponseMessage<KnowledgePlanetDto[]>>('/user/loadingplanets')
        if (res.data.code === 200) {
          this.planets = res.data.data || [];
          this.calculateVisitorRange(); // 新增:初始化时计算访客数量范围
          return true;
        }
        return false
      }catch (error) {
        console.error('初始化星球列表失败:', error);
      }
    },
    // 新增方法：计算访客数量范围
    calculateVisitorRange() {
      if (this.planets.length === 0) {
        this.minVisitors = 400;
        this.maxVisitors = 0;
        return;
      }

      const visitorCounts = this.planets.map(p => p.visitCount || 0);
      this.minVisitors = Math.min(...visitorCounts);
      this.maxVisitors = Math.max(...visitorCounts);

      // 处理特殊情况
      if (this.minVisitors === this.maxVisitors) {
        this.minVisitors = 0;
        this.maxVisitors = Math.max(this.maxVisitors, 1);
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
        const response = await service.post<ResponseMessage<KnowledgePlanetDto>>(
          '/planet/create',
          payload
        )
        if (response.data.code === 200) {
          await this.init()
          this.planets.push(response.data.data)
          console.log(response.data.data)
          alert("创建星球成功")
          return response.data.data // 返回创建的星球ID
        }
        throw new Error(response.data.message || '创建失败')
      } catch (error) {
        throw new Error(`请求失败: ${error}`)
      }
    },

    //上传星球
    async publishPlanet(planetId: string){
      try{
        const res = await service.post<ResponseMessage<string>>(
          '/planet/publish',
          {planetId}
        )
        if(res.data.code === 200){
          return res.data.data
        }
        throw new Error(res.data.message || '获取信息失败')
      }catch(error){
        throw new Error(`请求失败: ${error}`)
      }
    },
    //访问星球
    async VisitPlanet(planetId:string){
      try{
        const res = await service.get<ResponseMessage<KnowledgePlanetDto>>(
          `/planet/visit/${planetId}`
        )
        if(res.data.code === 200){
          this.currentPlanet = res.data.data
          console.log("访问星球",this.currentPlanet.visitCount)
          this.calculateVisitorRange();
          return res.data.data
        }
      }catch(error){
        console.log("访问星球失败")
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
          this.planets = this.planets.filter(p => p.planetId !== planetId)
          this.init()
          return response.data.data // 返回删除的星球ID

        }
        throw new Error(response.data.message || '删除失败')
      } catch (error) {
        throw new Error(`请求失败: ${error}`)
      }
    },

    async setFavorPlanet(planetId: string){
      try{
        const res = await service.put<ResponseMessage<string>>(
          '/user/setfavorplanet',
          null,
          { params: { planetId } }  // 使用params传递参数
        );
        if(res.data.code === 200){
          if (userStore.userInfo) {
            userStore.userInfo.favoritePlanetId = res.data.data;
          }
          return res.data.data // 返回最喜欢星球id
        }
      }catch(error){
        throw new Error(`请求失败: ${error}`)
      }
    },

    async loadingFavorPlanet(){
      try{
        const res = await service.get<ResponseMessage<KnowledgePlanetDto>>(
          '/user/loadingfavorplanet'
        )
        if(res.data.code === 200){
          return res.data.data
        }
      }catch(error){
        throw new Error(`请求失败: ${error}`)
      }
    },

       // 通用属性更新方法
      async updatePlanetAttribute(
        endpoint: string,
        payload: { planetId: string; [key: string]: any }
      ) {
        try {
          const response = await service.put<ResponseMessage<void>>(
            `/planet/${endpoint}`,
            payload
          );
          if (response.data.code === 200) {
            // 更新本地数据缓存
            this.updateLocalPlanet(payload.planetId, payload);
            return true;
          }
          throw new Error(response.data.message || '更新失败');
        } catch (error) {
          throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },

      // 更新本地星球数据
      updateLocalPlanet(planetId: string, payload: Partial<KnowledgePlanetDto>) {
        // 更新当前星球视图
        if (this.currentPlanet && this.currentPlanet.planetId === planetId) {
          this.currentPlanet = { ...this.currentPlanet, ...payload };
        }

        // 更新星球列表中的条目
        const planetIndex = this.planets.findIndex(p => p.planetId === planetId);
        if (planetIndex !== -1) {
          this.planets[planetIndex] = {
            ...this.planets[planetIndex],
            ...payload
          };
        }
      },

      // ========================= 具体更新操作 =========================

      // 更新星球标题
      async updateTitle(planetId: string, contentTitle: string) {
        return this.updatePlanetAttribute('updateTitle', { planetId, contentTitle });
      },

      // 更新封面URL
      async updateCoverUrl(planetId: string, coverUrl: string) {
        return this.updatePlanetAttribute('updateCoverUrl', { planetId, coverUrl });
      },

      // 更新可见性 (0-私有，1-公开)
      async updateVisibility(planetId: string, visibility: 0 | 1) {
        return this.updatePlanetAttribute('updatevisibility', { planetId, visibility });
      },

      // 更新简介
      async updateDescription(planetId: string, description: string) {
        return this.updatePlanetAttribute('updatedescription', { planetId, description });
      },

      // 更新内容详情
      async updateContentDetail(planetId: string, contentDetail: string) {
        return this.updatePlanetAttribute('updatecontentdetail', { planetId, contentDetail });
      },

      // 更新亮度
      async updateBrightness(planetId: string, brightness: number) {
        return this.updatePlanetAttribute('updatebrightness', { planetId, brightness });
      },

      // 更新燃料值
      async updateFuelValue(planetId: string, fuelValue: number) {
        return this.updatePlanetAttribute('updatefuelvalue', { planetId, fuelValue });
      },

      // 更新颜色方案
      async updateColorScheme(planetId: string, colorScheme: string) {
        return this.updatePlanetAttribute('updatecolorscheme', { planetId, colorScheme });
      },

      // 更新模型类型
      async updateModelType(planetId: string, modelType: number) {
        return this.updatePlanetAttribute('updatemodeltype', { planetId, modelType });
      },

      // ========================= 评论管理 =========================

      // 添加评论到星球
      async addCommentToPlanet(planetId: string, commentId: number) {
        try {
          const res = await service.post<ResponseMessage>(
            `/planet/${planetId}/addComment/${commentId}`
          );
          if (res.data.code === 200) {
            return true;
          }
          throw new Error(res.data.message || '添加评论失败');
        } catch (error) {
          throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },

      // 从星球移除评论
      async removeCommentFromPlanet(planetId: string, commentId: number) {
        try {
          const res = await service.delete<ResponseMessage>(
            `/planet/${planetId}/removeComment/${commentId}`
          );
          if (res.data.code === 200) {
            return true;
          }
          throw new Error(res.data.message || '移除评论失败');
        } catch (error) {
          throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },
        /**
     * 新增：定向飞行到指定星球（根据星球名搜索）
     * @param planetName 要搜索的星球名称
     * @returns 星球详细信息
     */
    async searchPlanet(planetName: string): Promise<KnowledgePlanetDto[]> {
      try {
        const res = await service.get<ResponseMessage<KnowledgePlanetDto[]>>(
          '/planet/access/search',
          { params: { planetName } }  // 使用params传递查询参数
        );

        if (res.data.code === 200) {
          console.log("已经搜索星球")
          this.searchResultPlanet = res.data.data; // 存储搜索结果
          return res.data.data;
        }

        throw new Error(res.data.message || '星球搜索失败');
      } catch (error) {
        this.searchResultPlanet = []; // 清空搜索结果
        console.log("定向飞行失败")
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

    /**
     * 新增：随机访问星球
     * @returns 随机星球详细信息
     */
    async randomAccessPlanet(): Promise<KnowledgePlanetDto> {
      try {
        const res = await service.get<ResponseMessage<KnowledgePlanetDto>>(
          '/planet/access/randomAccess'
        );

        if (res.data.code === 200) {
          this.currentRandomPlanet = {...res.data.data}; // 设置为当前访问的星球
          console.log( this.currentRandomPlanet)
          return res.data.data;
        }

        throw new Error(res.data.message || '随机访问失败');
      } catch (error) {
        this.currentPlanet = null; // 清空当前星球
        console.log("随机访问失败")
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },
    async loadingHotPlanets(): Promise<KnowledgePlanetDto[]> {
      try {
        const res = await service.get<ResponseMessage<KnowledgePlanetDto[]>>(
          '/planet/access/loadinghotplanets'
        );

        if (res.data.code === 200) {
          this.hotPlanets = res.data.data; // 设置为当前访问的星球
          return res.data.data;
        }

        throw new Error(res.data.message || '加载热门星球失败');
      } catch (error) {
        this.currentPlanet = null; // 清空当前星球
        console.log("加载热门星球失败")
        throw new Error(`请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    },

  }
});
