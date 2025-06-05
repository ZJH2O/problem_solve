<template>
  <div>
    <GalaxyList />
  </div>
</template>

<script setup lang="ts">
import GalaxyList from '@/components/galaxy/GalaxyList.vue'
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
const userStore = useUserStore()
onMounted(async()=>{
  try {
    await userStore.init()
    console.log('当前用户:', userStore.userInfo)
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
</script>

<style scoped lang="scss">

</style>
