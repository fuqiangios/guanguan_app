import { isEmpty, isFunction } from 'lodash'
import { useUserStore } from '@/store/modules/user'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { useAppStore } from '@/store/modules/app'
import { compressImage, useSignatureModule, usePermissionModule, pathToBase64 } from '@/utils'
import { onChooseImage, sleep } from '@/widget/guan-ui/utils'
import permission from '@/constant/permission'

const JS_BRIDGE_KEY = 'g'

class MiniProgramLoader {
  view = null
  IS_UNIAPP = false
  queue = {}
  queueId = 1
  lock = false

  actions = () => {
    const instance = this
    return {
      initEnv: (data, callback) => {
        instance.IS_UNIAPP = !isEmpty(data)
        callback({ data: 'ok' })
      },

      scanQRCode: (_, callback) => {
        uni.scanCode({
          success: function (res) {
            callback({
              data: res
            })
          },
          error: err => {
            callback({
              data: err
            })
          }
        })
      },

      getUserInfo: (_, callback) => {
        const { userInfo } = useUserStore()
        callback({
          data: userInfo
        })
      },

      getCompanyInfo: (_, callback) => {
        const { currentEnterpriseDetail } = useEnterpriseStore()
        callback({
          data: currentEnterpriseDetail
        })
      },

      previewImage: (data, callback) => {
        try {
          uni.previewImage(data)
          callback({
            data: 'ok'
          })
        } catch (error) {
          callback({
            data: error
          })
        }
      },

      chooseImage: async (data, callback) => {
        if (instance.lock) {
          return
        }

        instance.lock = true

        const { systemInfo } = useAppStore()

        let isAllowChoose = true

        if (systemInfo.platform === 'android') {
          isAllowChoose = await usePermissionModule([
            permission.ANDROID.WRITE_EXTERNAL_STORAGE,
            permission.ANDROID.CAMERA,
            permission.ANDROID.READ_EXTERNAL_STORAGE
          ])
        }

        if (!isAllowChoose) {
          callback({
            data: '权限未授予，请重新尝试'
          })
          instance.lock = false
          return
        }

        try {
          let result = await onChooseImage(data, true)
          if (isEmpty(result)) {
            throw new Error('获取图片失败')
          }
          result.tempFilePaths = await Promise.all(
            result.tempFilePaths.map(path => {
              return new Promise(resolve => {
                uni.saveFile({
                  tempFilePath: path,
                  success: async function (res) {
                    res.savedFilePath = await compressImage(res.savedFilePath)
                    resolve(pathToBase64(res.savedFilePath))
                  },
                  fail: function (err) {
                    resolve(err)
                  }
                })
              })
            })
          )
          callback({
            data: result
          })
        } catch (error) {
          callback({
            data: error.message
          })
        } finally {
          instance.lock = false
        }
      },

      signature: async (_, callback) => {
        const { systemInfo } = useAppStore()

        let res = await useSignatureModule(systemInfo.platform)
        callback({
          data: res
        })
      },

      eagleModule: async (data, callback) => {

        try {
          const EagleModule = uni.requireNativePlugin('EagleModule')
          EagleModule.userModuleAsyncFunc(data, res =>
            callback({
              data: res
            })
          )
        } catch (error) {
          callback({
            orgin: data,
            data: error
          })
        }
      },

      onClose: () => {
        uni.navigateBack()
      }
    }
  }

  constructor(view) {
    this.view = view
  }

  onMessage(options) {
    const self = this
    const { handler, inject, actions } = self

    if (isEmpty(options)) {
      return
    }

    let { handlerName, callbackId, data, params } = options

    function callHandler(data) {
      let { withKey, message } = handler(handlerName, data, null, callbackId)
      inject.call(self, withKey, message)
    }

    function messageInterceptor() {
      if (handlerName === 'response') {
        const callback = self.queue[callbackId]
        if (callback) {
          callback()
          delete self.queue[callbackId]
        }
      } else {
        const action = actions.call(self)

        if (action[handlerName] && isFunction(action[handlerName])) {
          sleep(150).then(() => action[handlerName](data ?? params, callHandler))
        }
      }
    }

    messageInterceptor()
  }

  handler(handlerName, responseData, callback, responseId) {
    let message = {
      handlerName,
      responseId,
      responseData
    }

    if (callback) {
      let cbId = `callback_${this.queueId++}_${new Date().getTime()}`
      this.queue[cbId] = callback
      message.responseId = cbId
    }
    return {
      withKey: `${JS_BRIDGE_KEY}._callHandler`,
      message
    }
  }

  inject(callbackFunc, ...args) {
    let result = null

    if (args.length) {
      result = JSON.stringify(args)
      result = result.substr(1, result.length - 2)
    }

    this.view.evalJS(`${callbackFunc}(${result})`)
  }
}

export default MiniProgramLoader
