<template>
  <div>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const userStore = useUserStore()
onMounted(async () => {
  try {
    await userStore.init()
    console.log('初始化完成，当前用户:', userStore.userInfo)
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}


</script>

<style scoped lang="scss">



</style>
