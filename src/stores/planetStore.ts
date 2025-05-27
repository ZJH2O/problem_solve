import { defineStore } from 'pinia';
import type{ Planet,CommentDraft, ReaderComment, } from '@/types/planet';



type PlanetCreatePayload = Omit<Planet, 'id' | 'createdAt'>;
type PlanetUpdatePayload = Partial<PlanetCreatePayload> & { id: string };

export const usePlanetStore = defineStore('planet', {
  state: () => ({
    planets: [
      { id: 1, name: '前端星球', visitors: 1500, description: '前端开发技术交流' ,createdAt: new Date('2023-01-01'),details: {
        recommendedKnowledge: [],
        authorMessages: [],
        readerComments: []
      }},
      { id: 2, name: '后端星球', visitors: 2200, description: '服务器端技术讨论' ,createdAt: new Date('2023-01-01'),details: {
        recommendedKnowledge: [],
        authorMessages: [],
        readerComments: []
      }},
      { id: 3, name: 'AI星球', visitors: 3000, description: '人工智能研究' ,createdAt: new Date('2023-01-01'),details: {
        recommendedKnowledge: [],
        authorMessages: [],
        readerComments: []
      }}
    ] as Planet[]
  }),
  getters: {
    maxVisitors: (state) => Math.max(...state.planets.map(p => p.visitors)),
    minVisitors: (state) => Math.min(...state.planets.map(p => p.visitors)),
    sortedPlanets: (state): Planet[] => {
      return [...state.planets].sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
  },

  actions:{
    getPlanetById(id: number) {
      return this.planets.find(p => p.id === id);
    },

    incrementVisitors(id: number) {
      const planet = this.planets.find(p => p.id === id);
      if (planet) {
        planet.visitors++;
      }
    },

    addComment(planetId: number, comment: CommentDraft) {
      const planet = this.planets.find(p => p.id === planetId);
      if (planet) {
        const newComment: ReaderComment = {
          ...comment,
          id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID 生成方法
          createdAt: new Date(),
          status: 'published',
          replies: [],
          upvotes: 0,
          reactions: {
            like: 0,
            disagree:  0
          }
        };

        planet.details.readerComments.push(newComment);
      }
    },

    toggleReaction(planetId: number, commentId: string, type: 'like') {
      const planet = this.planets.find(p => p.id === planetId);
      const comment = planet?.details?.readerComments.find(c => c.id === commentId);
      if (comment) {
        comment.reactions[type] = (comment.reactions[type] || 0) + 1;
      }
    },

    addPlanet(payload: PlanetCreatePayload) {
      const newPlanet: Planet = {
        ...payload,
        id: this.planets.length + 1,
        createdAt: new Date(),
        status: 'draft',
        details: {
          recommendedKnowledge: [],
          authorMessages: [],
          readerComments: []
        }
      };
      this.planets.push(newPlanet);
      return newPlanet.id;
    },

    deletePlanet(id:string|number){
      this.planets = this.planets.filter(p =>p.id !==id);
    },

    updatePlanet(payload: PlanetUpdatePayload){
      const index = this.planets.findIndex(p => p.id === payload.id);
      if(index === -1) return;

      this.planets[index] = {
        ...this.planets[index],
        ...payload,
        id: payload.id
      }
    },

    importPlanets(planets: Planet[]){
      this.planets = planets.map(p => ({
        ...p,
        // 确保导入数据完整性
        details: p.details ? {
          recommendedKnowledge: p.details.recommendedKnowledge || [],
          authorMessages: p.details.authorMessages || [],
          readerComments: p.details.readerComments || []
        } : {
          recommendedKnowledge: [],
          authorMessages: [],
          readerComments: []
        }
      }));
    },

    resetToDefault(){
      this.planets = [
        { id: 1, name: '前端星球', visitors: 1500, description: '前端开发技术交流' ,createdAt: new Date('2023-01-01'),details: {
          recommendedKnowledge: [],
          authorMessages: [],
          readerComments: []
        }},
        { id: 2, name: '后端星球', visitors: 2200, description: '服务器端技术讨论' ,createdAt: new Date('2023-01-01'),details: {
          recommendedKnowledge: [],
          authorMessages: [],
          readerComments: []
        }},
        { id: 3, name: 'AI星球', visitors: 3000, description: '人工智能研究' ,createdAt: new Date('2023-01-01'),details: {
          recommendedKnowledge: [],
          authorMessages: [],
          readerComments: []
        }}
      ]

    }
  }
});
