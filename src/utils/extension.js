import permission from '../constant/permission'
import { pathToBase64 } from './image'

/**
 * @description 签字模块调用
 * @param {String} platform: 平台
 * @param {Object} options: 配置信息
 * @returns Promise
 */
export function useSignatureModule(platform) {
  return new Promise(async resolve => {
    try {
      const callback = res => {
        Promise.all(res.map(path => pathToBase64(path)))
          .then(result => resolve(result))
          .catch(_ => {
            throw new Error('转译 Base64 失败')
          })
      }

      if (platform === 'android') {
        const isAllowSign = await usePermissionModule([permission.ANDROID.WRITE_EXTERNAL_STORAGE])

        if (!isAllowSign) {
          return
        }

        const SignatureModule = uni.requireNativePlugin('SignatureModule')
        SignatureModule.sign({ themeColor: '#1352C5' }, callback)
      } else {
        const EagleModule = uni.requireNativePlugin('EagleModule')
        EagleModule.userModuleAsyncFunc(
          {
            name: 'Sign',
            maxCount: 3
          },
          result => {
            resolve(result)
          }
        )
      }
    } catch (error) {
      console.log(error)
      resolve([])
    }
  })
}

export function usePermissionModule(permissions) {
  return new Promise(resolve => {
    const PermissionModule = uni.requireNativePlugin('PermissionModule')
    try {
      PermissionModule.onRequest(permissions, ({ result }) => resolve(result))
    } catch {
      resolve(false)
    }
    // TODO: iOS 权限请求未处理
  })
}
