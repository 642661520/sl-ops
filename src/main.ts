import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { Apis } from '@/api'
import 'virtual:uno.css'
import '@/styles/global.css'

// ECharts 初始化 - 注册渲染器和组件
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

// 挂载 Apis 到全局，匹配 globals.d.ts 中的 declare global
Object.assign(globalThis, { Apis })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
