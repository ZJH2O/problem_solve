<template>
  <div class="stellar-container">
    <div class="stellar-glow"></div>
    <div class="manager-container">
      <h2 class="stellar-title">星系星球管理</h2>
      <div class="form-group">
        <label class="stellar-label">星球ID：</label>
        <input
          v-model="planetId"
          placeholder="输入星球ID"
          class="stellar-input"
        />
      </div>
      <div class="buttons">
        <button @click="addPlanet" class="stellar-button">添加星球</button>
        <button @click="removePlanet" class="stellar-button remove">移除星球</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGalaxyStore } from '@/stores/galaxy'

const props = defineProps<{
  galaxyId: string
}>()

const galaxyStore = useGalaxyStore()
const planetId = ref('')

const addPlanet = async () => {
  try {
    await galaxyStore.addPlanetToGalaxy({
      galaxyId: props.galaxyId,
      planetId: planetId.value
    })
    alert('添加成功！')
    planetId.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : '未知错误')
  }
}

const removePlanet = async () => {
  try {
    await galaxyStore.removePlanetFromGalaxy({
      galaxyId: props.galaxyId,
      planetId: planetId.value
    })
    alert('移除成功！')
    planetId.value = ''
  } catch (error) {
    alert(error instanceof Error ? error.message : '未知错误')
  }
}
</script>

<style scoped>
.stellar-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: radial-gradient(circle at center, #0a0e2d 0%, #000318 100%);
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
}

.stellar-glow {
  position: absolute;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    #00f7ff33 0%,
    #3d67ff4d 25%,
    #9d4cff33 50%,
    #3d67ff4d 75%,
    #00f7ff33 100%
  );
  animation: stellar-rotate 20s linear infinite;
  filter: blur(80px);
}

@keyframes stellar-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.manager-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: rgba(12, 15, 43, 0.8);
  border: 1px solid #3d67ff;
  border-radius: 12px;
  box-shadow: 0 0 40px #3d67ff33;
  backdrop-filter: blur(10px);
  z-index: 2;
}

.stellar-title {
  text-align: center;
  color: #00f7ff;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px #00f7ff80;
}

.form-group {
  margin-bottom: 1.8rem;
}

.stellar-label {
  display: block;
  margin-bottom: 0.8rem;
  color: #7d9bff;
  font-size: 0.9em;
}

.stellar-input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(25, 30, 70, 0.6);
  border: 1px solid #3d67ff;
  border-radius: 6px;
  color: #00f7ff;
  font-family: 'Arial', sans-serif;
  transition: all 0.3s ease;
}

.stellar-input::placeholder {
  color: #3d67ff99;
}

.stellar-input:focus {
  outline: none;
  border-color: #00f7ff;
  box-shadow: 0 0 15px #00f7ff40;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.stellar-button {
  flex: 1;
  padding: 0.8rem;
  background: linear-gradient(135deg, #3d67ff 0%, #00f7ff 100%);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
}

.stellar-button.remove {
  background: linear-gradient(135deg, #ff3d5e 0%, #ff7e00 100%);
}

.stellar-button:hover {
  box-shadow: 0 0 25px #00f7ff80;
  transform: translateY(-2px);
}

.stellar-button.remove:hover {
  box-shadow: 0 0 25px #ff3d5e80;
}
</style>
