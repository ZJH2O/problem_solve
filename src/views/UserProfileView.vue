<template>
  <div class="user-profile">
    <UserManage />
  </div>
</template>

<script setup lang="ts">
import UserManage from '@/components/UserManage.vue';
import { useUserStore } from '@/stores/user';
import { onUnmounted } from 'vue';
const userStore = useUserStore()
onUnmounted(async() => {
  await userStore.init()

})
</script>


<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
