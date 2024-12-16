import http from '@/widget/guan-ui/g-request'
import { has, isEmpty, isFunction, merge } from 'lodash'
import { useAuthStore } from '@/store/modules/auth'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { useConfigStore } from '@/store/modules/config'
import { useAppStore } from '@/store/modules/app'

const { create, interceptors, get, post, put, remove, upload } = http

create({
  timeout: import.meta.env.APP_TIMEOUT_REQUEST,
  showLoading: false,
  prevent: true,
  firstIpv4: true
})

// 请求拦截
interceptors.request.use(config => {
  const { systemInfo } = useAppStore()
  const { env } = useConfigStore()
  let { token } = useAuthStore()
  let { currentEnterprise, projectVersionId } = useEnterpriseStore()

  const deviceInfo = {
    DeviceId: systemInfo.deviceId,
    System: systemInfo.system,
    Model: systemInfo.deviceModel
  }

  const source = {
    base: {
      host: env.BASE_URL,
      header: {
        ProjectId: env.PROJECT_ID,
        ClientId: env.CLIENT_ID,
        ClientType: env.CLIENT_TYPE,
        SystemId: env.SYSTEM_ID,
        EnterpriseType: Global.EnterpriseType.toUpperCase()
      },
      service: {
        auth: env.BASE_AUTH_SERVICE,
        cust: env.BASE_CUST_SERVICE,
        sms: env.BASE_SMS_SERVICE
      },
      data: {
        clientId: env.CLIENT_ID,
        projectId: env.PROJECT_ID
      },
      request: options => {
        options.header = {
          Authorization: token || '',
          CompanyId: currentEnterprise || '',
          ProjectVersionId: projectVersionId || ''
        }
        return options
      },
      response: ({ success, data, code, message }) => {
        if (!success) {
          onResponseCallback(code, message)
          return false
        }

        return data ?? true
      }
    },
    storage: {
      host: env.BASE_URL,
      header: {
        AppSecretKey: env.PROJECT_SECRET,
        MinIoBucketName: env.MINIO_BUCKET
      },
      response: result => {
        const { success, data, code, message } = JSON.parse(result)

        if (!success) {
          onResponseCallback(code, message)
          return false
        }

        return data ?? true
      }
    },
    jiashanStorage: {
      host: env.JIASHAN_URL,
      header: {
        ThirdPartyAccount: env.JIASHAN_ACCOUNT,
        ThirdPartyPassword: env.JIASHAN_PASSWORD,
        Authorization: env.JIASHAN_AUTH
      },
      response: result => {
        const { success, data, code, message } = JSON.parse(result)
  
        if (!success) {
          onResponseCallback(code, message)
          return false
        }
  
        return data ?? true
      }
    },
    operation: {
      host: env.OPERATION_URL,
      header: {
        ProjectId: env.PROJECT_ID,
        AppSecretKey: env.PROJECT_SECRET,
        ClientType: env.CLIENT_TYPE,
        EnterpriseType: Global.EnterpriseType.toUpperCase()
      },
      request: options => {
        options.header = {
          ProjectVersionId: projectVersionId || ''
        }
        return options
      },
      response: ({ success, data, code, message }) => {
        if (!success) {
          onResponseCallback(code, message)
          return false
        }

        return data ?? true
      }
    },
    apphost: {
      host: env.UPDATE_APK,
      response: result => result
    },
    apple: {
      host: env.UPDATE_IPA,
      response: ({ results }) => results
    }
  }

  let customHeader = {}

  try {
    let { to, service } = config

    if (isEmpty(to)) {
      throw new Error('请选择接口渠道')
    }

    let instance = source[to]

    let options = {}

    if (instance.request && isFunction(instance.request)) {
      options = instance.request(config)
    }

    delete config.to

    config.host = instance.host

    if (service) {
      config.url = `/${instance.service[service]}${config.url}`
    }

    if (has(env, 'CUSTOM_HEADER')) {
      customHeader = JSON.parse(env.CUSTOM_HEADER)
    }

    config.header = merge(instance.header, options.header, config.header, deviceInfo, customHeader)

    config.data = merge(instance.data, options.data, config.data)

    config.response = instance.response

    return config
  } catch (error) {
    console.error(error.message)
  }
})

// 响应拦截
interceptors.response.use(({ config, response }) => {
  const { statusCode, data: result } = response

  if (statusCode !== 200 || isEmpty(result)) {
    onResponseCallback(result?.code || statusCode.toString(), `错误代码: ${result?.code || statusCode}，抢修中！`)
    return false
  }

  return config.response(result)
})

async function onResponseCallback(code, message) {
  const { onLogout } = useAuthStore()
  switch (code) {
    case 'B0301':
      await onLogout()
      uni.showToast({ title: message, icon: 'none' })
      uni.reLaunch({ name: 'Login' })
      break
    case code.includes('A'):
      uni.showToast({ title: message, icon: 'none' })
      break
    case code.includes('B'):
      uni.showToast({ title: message, icon: 'none' })
      break
    case code.includes('C'):
      uni.showToast({ title: message, icon: 'none' })
      break
    default:
      uni.showToast({ title: message, icon: 'none' })
      break
  }
}

export { get, post, put, remove, upload }
