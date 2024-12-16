<script setup>
import { isEmpty } from 'lodash'
import { onMounted, reactive } from 'vue'

const data = reactive({
  loading: false,
  task: null,
  installPrograss: 0,
  latestInfo: {
    version: '',
    features: [],
    downloadUrl: '',
    platform: ''
  }
})
onMounted(() => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }
  data.latestInfo = params
})
const onConfirm = () => {
  if (data.latestInfo.platform === 'ios') {
    plus.runtime.launchApplication(
      {
        action: data.latestInfo.downloadUrl
      },
      () => {
        uni.showToast({
          title: '跳转至App Store失败，请稍后再试',
          icon: 'none'
        })
      }
    )
    plus.ios.import('UIApplication').sharedApplication().performSelector('exit')
  } else {
    data.loading = true
    try {
      data.task = uni.downloadFile({
        url: data.latestInfo.downloadUrl,
        success: ({ statusCode, tempFilePath }) => {
          if (statusCode !== 200) {
            throw new Error('安装包下载失败，网络错误')
          } else {
            plus.runtime.install(
              tempFilePath,
              {
                force: false
              },
              () => {
                plus.runtime.restart()
              },
              () => {
                throw new Error('安装包损坏，请再次尝试')
              }
            )
          }
        },
        fail: ({ errMsg }) => {
          if (errMsg !== 'downloadFile:fail abort') {
            throw new Error(`安装包下载失败，原因：${errMsg}`)
          }
        }
      })
      data.task.onProgressUpdate(res => {
        data.installPrograss = res.progress
        if (res.progress == Infinity) {
          let progress = (res.totalBytesWritten / self.size) * 100
          if (progress > 100) {
            progress = 100
          }
          data.installPrograss = progress
        }
      })
    } catch (error) {
      uni.showToast({
        title: error.message,
        icon: 'none'
      })
    }
  }
}

const onAbort = () => {
  data.task.abort()
  data.loading = false
  data.installPrograss = 0
}
</script>

<template>
  <view class="upgrade-page">
    <view class="upgrade-wrap">
      <view class="cover">
        <view class="logo" />
      </view>
      <view class="header">
        <view class="label">发现新版本</view>
        <view class="version">{{ data.latestInfo.version }}</view>
      </view>
      <scroll-view class="content" scroll-y>
        <ol role="list">
          <li v-for="(desc, dIndex) in data.latestInfo.features" :key="dIndex">{{ desc }}</li>
        </ol>
      </scroll-view>

      <view class="actions">
        <template v-if="!data.loading">
          <fui-button @tap="onConfirm" class="button" height="84rpx" :size="28">立即升级</fui-button>
        </template>
        <template v-else>
          <fui-button plain @tap="onAbort" class="button" height="84rpx" :size="28">中止下载</fui-button>
        </template>
      </view>
      <view class="progress" v-if="data.loading">
        <view class="label" :style="`width: ${data.installPrograss}%`">
          <template v-if="data.installPrograss >= 10"> {{ data.installPrograss }}% </template>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: transparent;
  background: transparent;
}

.upgrade-page {
  @apply w-full h-[100vh] bg-black bg-opacity-70 flex flex-col items-center justify-center;
}

.upgrade-wrap {
  @apply relative w-[calc(100vw-1.5rem)] h-72 bg-white rounded-xl;

  .cover {
    @apply relative w-full h-32 rounded-tl-xl rounded-tr-xl bg-gradient-to-r from-cyan-600 to-primary;
    &::after {
      @apply content-[""] absolute bg-[url('@/static/upgrade/rocket.png')] top-[-220rpx] bg-cover bg-center bg-no-repeat w-[calc(100vw-1.5rem)] h-60;
    }
    .logo {
      @apply absolute bg-[url('@/static/logo.png')] top-[-110rpx] right-[210rpx] bg-cover bg-center bg-no-repeat w-10 h-10 z-10 rounded-full;
    }
  }

  .header {
    @apply absolute top-0 p-3 w-full flex flex-col;

    .label {
      @apply text-white text-xl font-semibold;
    }

    .version {
      @apply text-white tracking-wide pt-3 before:content-["V"];
    }
  }

  .content {
    @apply h-20 pl-3 pr-3 pb-3 text-left text-sm box-border overflow-hidden bg-white;
    ol {
      @apply list-item pl-3 marker:text-white list-disc text-color-desc #{!important};
      li {
        @apply relative leading-6;
      }
    }
  }

  .actions {
    @apply p-3 bg-white;
  }

  .progress {
    @apply absolute bottom-0 w-full h-4 bg-gray-200 rounded-bl-xl rounded-br-xl  overflow-hidden;
    .label {
      @apply h-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none bg-gradient-to-r from-cyan-600 to-primary;
    }
  }
}
</style>
