import { defineStore } from 'pinia'
import { isApp, isVersionUpdated, isDev, isProd } from '@/utils'
import { useProjectStore } from './project'
import { checkVersion } from '@/api/common'
import { routeTo } from '@/router'
import { sleep, getProperty } from '@/widget/guan-ui/utils'
import { isEmpty } from 'lodash'
import { useConfigStore } from './config'

export const useAppStore = defineStore('app', {
  state: () => ({
    version: '',
    recentVersionInfo: null,
    isNetworkConnected: true,
    systemInfo: null
  }),

  persist: {
    paths: ['version', 'systemInfo']
  },

  actions: {
    onInit() {
      // 获取设备信息
      this.systemInfo = uni.getSystemInfoSync()

      // 初始化项目配置
      useProjectStore().init()

      if (isApp) {
        // 强制设备横屏状态
        plus.screen.lockOrientation('portrait-primary')

        // 检测是否有新版本
        this.onCheckUpdate({ showToast: false })
      }
    },

    onResume() {
      // 监听网络状态
      uni.onNetworkStatusChange(this.onNetworkChangeCallback)
    },

    onDestroy() {
      // 取消监听网络状态
      uni.offNetworkStatusChange(this.onNetworkChangeCallback)
    },

    onNetworkChangeCallback({ isConnected }) {
      this.isNetworkConnected = isConnected
    },

    async onCheckUpdate({ showToast = false }) {
      if (isDev) {
        return
      }

      const { isEnvChange } = useConfigStore()

      let { platform } = this.systemInfo

      let { version } = await getProperty()

      this.version = version

      if (platform === 'ios' && !isProd) {
        console.info('iOS平台且非生产环境，跳过自动检测升级')
        return
      }
      if (isEnvChange) {
        console.info('非默认环境，跳过自动检测升级')
        return
      }

      try {
        let result = await checkVersion(platform)
        if (!result || isEmpty(result)) {
          throw new Error('当前为最新版本')
        }

        let update = false
        let [recentVersion, content, downloadUrl] = ['', [], '']

        if (platform === 'ios') {
          let { version, releaseNotes, trackViewUrl } = result[0]
          update = isVersionUpdated(this.version, version.replace('v', ''))
          if (!update) {
            throw new Error('当前为最新版本')
          }
          recentVersion = version
          content = releaseNotes
          downloadUrl = trackViewUrl
        } else {
          let { version, features, download_url } = result
          update = isVersionUpdated(this.version, version)
          if (!update) {
            throw new Error('当前为最新版本')
          }
          recentVersion = version
          content = features
          downloadUrl = download_url
        }

        if (!update) {
          this.recentVersionInfo = null
          throw new Error('当前为最新版本')
        }

        if (content.match(/[(\r\n\s)\r\n\s]+/)) {
          content = content.split(/[(\r\n\s)\r\n\s]+/)
        } else {
          content = [content]
        }

        this.recentVersionInfo = {
          version: recentVersion,
          features: content,
          downloadUrl: downloadUrl,
          platform
        }

        sleep(3000).then(() => routeTo('Upgrade', this.recentVersionInfo, 'fade-in'))
      } catch (error) {
        showToast && uni.showToast({ title: error.message, icon: 'none' })
        this.recentVersionInfo = null
      }
    }
  }
})
