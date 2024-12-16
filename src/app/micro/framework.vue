<script setup>
import { storeToRefs } from 'pinia'
import { isEmpty } from 'lodash'
import { onBackPress } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useAuthStore } from '@/store/modules/auth'
import { useUserStore } from '@/store/modules/user'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { useConfigStore } from '@/store/modules/config'
import MiniProgramLoader from './mini-program-loader'
import { isUrlWithParam } from '@/utils'

const ConfigStore = useConfigStore()

const { systemInfo } = useAppStore()
const { windowWidth, windowHeight, statusBarHeight } = systemInfo
const { vconsole } = storeToRefs(ConfigStore)

let [wv, mp, timestamps] = [{}, null, {}]

const { token } = useAuthStore()
const { currentEnterpriseDetail } = useEnterpriseStore()
const { userInfo } = useUserStore()

const data = reactive({
  isLoading: true,
  title: '',
  showBackAction: false,
  openParams: {}
})

const loadingStyle = computed(() => ({
  width: `${windowWidth}px`,
  height: `${windowHeight}px`,
  paddingTop: `${statusBarHeight}px`
}))

onMounted(() => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }

  data.openParams = params

  plus.navigator.setUserAgent('Guansafety')

  createView(params)
})

onUnmounted(() => {
  plus.webview.close(wv)
  ;[wv, mp, timestamps] = [{}, null, {}]
})

const createView = params => {
  let { appId, appUrl } = params

  const viewStyle = {
    top: `${statusBarHeight + 44}px`,
    width: `${windowWidth}px`,
    height: `${windowHeight - statusBarHeight - 44}px`,
    scalable: true
  }

  appUrl = generateURL(appUrl)
  wv = plus.webview.create(appUrl, appId, viewStyle)
  plus.webview.hide(wv)
  mp = new MiniProgramLoader(wv)

  onListenMpEvent()
}

const onListenMpEvent = () => {
  wv.addEventListener(
    'loaded',
    () => {
      if (!data.isLoading) {
        return
      }

      let { $getAppWebview: currentWebview } = getCurrentPages()[getCurrentPages().length - 1]

      injectJsFile()
      injectJsCode()

      data.isLoading = false

      currentWebview().append(wv)

      plus.webview.show(wv, 'fade-in', 300)
    },
    false
  )

  wv.addEventListener(
    'titleUpdate',
    ({ title }) => {
      data.title = title
      isCanGoBack()
    },
    false
  )

  wv.addEventListener(
    'error',
    () => {
      uni.navigateBack()
      uni.showToast({
        title: `${data.openParams.appName}应用资源加载失败，请稍后重试`,
        icon: 'error'
      })
    },
    false
  )

  plus.globalEvent.addEventListener('plusMessage', msg => {
    isCanGoBack()
    if (msg.data.args.data.name == 'postMessage') {
      const { options, arg } = msg.data.args.data
      if (timestamps[options.timestamp]) {
        return
      }
      timestamps[options.timestamp] = true

      mp.onMessage(arg)
    }
  })
}

const generateURL = url => {
  url = decodeURIComponent(url)
  return `${url}${isUrlWithParam(url) ? '&' : '?'}companyId=${currentEnterpriseDetail?.companyId}&token=${token}`
}

const injectJsFile = () => {
  wv.appendJsFile('/static/mp/bridge.js')
  wv.appendJsFile('/static/mp/sdk.min.js')
  vconsole.value && wv.appendJsFile('/static/mp/vconsole.min.js')
}

const injectJsCode = () => {
  let code = ''

  code += `g.initEnv();`
  !isEmpty(token) && (code += `localStorage.setItem('G2_TOKEN', '${token}');`)
  !isEmpty(userInfo) && (code += `localStorage.setItem('G2_USER', '${JSON.stringify(userInfo)}');`)
  !isEmpty(currentEnterpriseDetail) &&
    (code += `localStorage.setItem('G2_COMPANY', '${JSON.stringify(currentEnterpriseDetail)}');`)

  vconsole && (code += 'let vConsole = new VConsole({theme: "dark"});')

  wv.evalJS(`(function() {let timer = setTimeout(()=>{clearTimeout(timer);${code}}, 100)})();`)
}

const isCanGoBack = () => {
  if (!wv) {
    return
  }
  wv.canBack(({ canBack }) => {
    if (data.showBackAction === !!canBack) {
      return
    }
    data.showBackAction = !data.showBackAction
  })
}

const onCustomBack = () => {
  if (!mp.IS_UNIAPP) {
    wv.back()
  } else {
    wv.evalJS(
      `typeof window.getCurrentPages()[window.getCurrentPages().length - 1].onCustomBack === 'function' ? window.getCurrentPages()[window.getCurrentPages().length - 1].onCustomBack() : uni.navigateBack()`
    )
  }
}

onBackPress(({ from }) => {
  const buttons = [{ title: '确认' }, { title: '取消' }]

  if (from === 'navigateBack') {
    return false
  }

  if (from === 'backbutton') {
    if (data.showBackAction && wv) {
      onCustomBack()
      return true
    } else {
      plus.nativeUI.actionSheet({ title: `是否退出${data.openParams.appName}`, buttons }, ({ index }) => {
        if (index === 1) {
          uni.navigateBack()
        }
      })
      return true
    }
  }
})

const onClose = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="mp-framework-page">
    <template v-if="data.isLoading">
      <view class="loading" :style="[loadingStyle]">
        <image class="loading__icon" :src="data.openParams.appImage" />
        <text class="loading__text">{{ data.openParams.appName }}</text>
        <g-loading type="row" text="应用资源加载中..." :is-fixed="false" class="mt-6 flex items-center" />
      </view>
    </template>
    <template v-else>
      <g-nav-bar
        :is-go-back="data.showBackAction"
        :title="data.title || data.openParams.appName"
        class="mp-framework-page_navbar"
        is-custom-back
        @back="onCustomBack"
      >
        <template #right>
          <fui-icon @tap="onClose" custom-prefix="feather" name="icon-x" class="icon"></fui-icon>
        </template>
      </g-nav-bar>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.mp-framework-page {
  .loading {
    @apply flex flex-col items-center bg-white w-[100vw] h-[50vh];
    &__icon {
      @apply mt-3 h-8 w-8 rounded-full paint-contain #{!important};
    }
    &__text {
      @apply mt-3 text-base font-semibold;
    }
  }
  &_navbar {
    .icon {
      @apply text-lg text-black #{!important};
    }
  }
}
</style>
