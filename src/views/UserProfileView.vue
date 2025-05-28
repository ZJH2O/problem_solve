<template>
  <div class="user-profile">
    <h1>This is an user-profile page</h1>
    <UserManage />
  </div>
</template>

<script setup lang="ts">
import UserManage from '@/components/UserManage.vue';


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
