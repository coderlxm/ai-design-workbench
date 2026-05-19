import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'
import { pinia } from './stores'

import './assets/styles/tokens.css'
import './assets/styles/base.css'
import './assets/styles/layout.css'

createApp(App).use(pinia).use(router).mount('#app')
