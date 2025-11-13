import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import '@/styles/variables.css'
import '@/styles/globals.css'

const app = createApp(App)

app.use(store)

if (import.meta.env.DEV) {
  ;(window as typeof window & { __STORE__?: typeof store }).__STORE__ = store
}

app.mount('#app')
