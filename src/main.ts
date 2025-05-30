import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia) // ✅ 先注册到应用实例
app.use(ElementPlus)
pinia.use(({ store }) => {
  const savedState = localStorage.getItem(store.$id)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }
})

app.use(router)

app.mount('#app')
