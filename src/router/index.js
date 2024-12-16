import router, { beforeEach, afterEach, onError, afterNotNext } from '@/utils/route'
import { useAppStore } from '@/store/modules/app'
import { isObject } from 'lodash'

export function registerRoutes(app) {
  app.use(router)

  // 全局路由前置守卫
  beforeEach(async (to, from, next) => {
    const { isNetworkConnected } = useAppStore()

    // // 当命中网络异常条件后，进行重定向
    // if (!isNetworkConnected && to.name !== 'NetworkError') {
    //   afterNotNext(() => uni.navigateTo({ name: 'NetworkError', passedParams: to }))
    //   return
    // }
    console.log('即将进行跳转')
    next()
  })

  // 全局路由后置守卫
  afterEach((to, from) => {
    console.log('✌🏻完成跳转')
  })

  // 路由异常捕获
  onError((to, from) => {
    console.log('路由报错，请检查跳转参数')
  })
}

export const routeTo = (pageName, passedParams, animationType = 'pop-in') => {
  if (isObject(pageName)) {
    let { dataset } = pageName.currentTarget
    !dataset.name && pageName.target.name && (dataset.name = pageName.target.name)
    pageName = dataset.name
  }

  uni.navigateTo({ name: pageName, passedParams, animationType })
}

export const redirectTo = (pageName, passedParams) => {
  if (isObject(pageName)) {
    let { dataset } = pageName.currentTarget
    !dataset.name && pageName.target.name && (dataset.name = pageName.target.name)
    pageName = dataset.name
  }

  uni.redirectTo({ name: pageName, passedParams })
}
