<template>
  <div>
    <GalaxyList />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import GalaxyDetailPage from '@/components/galaxy/GalaxyDetailPage.vue'
import { useRouter } from 'vue-router'
import GalaxyList from '@/components/galaxy/GalaxyList.vue'
const router = useRouter()
const userStore = useUserStore()

</script>

<style scoped lang="scss">



</style>
