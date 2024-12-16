import { createSSRApp } from 'vue'
import App from '@/App'
import Constant from '@/constant'
import { registerRoutes } from '@/router'
import { registerStore } from '@/store'
import { registerDirectives } from '@/directive'
import { date } from '@/utils'

export function createApp() {
  const app = createSSRApp(App)

  app.provide('Constant', Constant)
  app.provide('Dayjs', date)

  registerStore(app)
  registerRoutes(app)
  registerDirectives(app)

  return { app }
}
