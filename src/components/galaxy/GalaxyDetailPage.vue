<script setup lang="ts">
import { useRoute } from 'vue-router'
import GalaxyProfile from './GalaxyProfile.vue'
import PlanetRelationManager from './PlanetRelationManager.vue'
import CommentList from './CommentList.vue'
import CommentPublisher from './CommentPublisher.vue'
import { useUserStore } from '@/stores/user'
import GalaxyCreator from './GalaxyCreator.vue'
const route = useRoute()
const userStore = useUserStore()
const galaxyId = route.params.id as string
const currentUserId = userStore.userInfo?.userId ?? -1;
</script>

<template>
  <div class="galaxy-detail-page">
    <GalaxyCreator />
    <GalaxyProfile :galaxyId="galaxyId" />

    <section class="planet-management">
      <h3>星球管理</h3>
      <PlanetRelationManager :galaxyId="galaxyId" />
    </section>

    <section class="comment-section">
      <h3>星系讨论区</h3>
      <CommentPublisher :galaxyId="parseInt(galaxyId)" :userId="currentUserId" />
      <CommentList :galaxyId="parseInt(galaxyId)" :userId="currentUserId" />
    </section>
  </div>
</template>
