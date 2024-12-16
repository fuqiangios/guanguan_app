import {removeFn, bootstrap} from './core'
import {beforeEachFn, afterEachFn, onErrorFn, routerStatus} from './storage'

/**
 * 自定义Vue的插件，用于路由监听拦截
 */
class route {

    /**
     * 路由切换前拦截，只对主动触发的路由动作切换有效
     * uni.navigateTo、uni.redirectTo、uni.reLaunch、uni.switchTab、uni.navigateBack
     * @param fn {Function} (to: Object, from: Object, next: Function)
     * @returns {Function} 返回注销事件监听的方法
     */
    beforeEach (fn) {
        beforeEachFn.push(fn)
        return () => {
            removeFn(beforeEachFn, fn)
        }
    }

    /**
     * 路由触发后的钩子（无拦截功能）
     * @param fn {Function} (to: Object, from: Object)
     * @returns {Function} 返回注销事件监听的方法
     */
    afterEach (fn) {
        afterEachFn.push(fn)
        return () => {
            removeFn(afterEachFn, fn)
        }
    }

    /**
     * 主动触发行为造成的路由错误钩子,类似onPageNotFound
     * @param fn {Function} (to: Object, from: Object)
     * @returns {Function}
     */
    onError (fn) {
        onErrorFn.push(fn)
        return () => {
            removeFn(onErrorFn, fn)
        }
    }

    /**
     * 用在beforeEach拦截中，当遇到没有next的场景，会在拦截动作之后同步的触发传入的函数
     * @param fn {Function} 要执行的函数
     * @returns {route}
     */
    afterNotNext (fn) {
        routerStatus.afterNotNext = fn
        return this
    }

    /**
     * 开放给Vue安装plugin
     * @param Vue
     * @param options
     * @returns {route}
     */
    install (Vue, options) {
        routerStatus.VUE3 = parseInt(Vue.version) === 3
        bootstrap(Vue, options)
        return this
    }
}
const routeInstance = new route()
export default routeInstance
export const beforeEach = routeInstance.beforeEach
export const afterEach = routeInstance.afterEach
export const onError = routeInstance.onError
export const afterNotNext = routeInstance.afterNotNext
