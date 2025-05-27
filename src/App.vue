<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="background-layer">
    <div class="main-container">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.background-layer{
  position:absolute;
  top:0;
  left:0;
  width:100vw;
  height: 100%;
}


</style>
