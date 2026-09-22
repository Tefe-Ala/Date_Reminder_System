import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark')

createApp(App).use(createPinia()).use(router).mount('#app')
