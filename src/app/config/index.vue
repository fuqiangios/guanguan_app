<script setup>
import { throttle } from 'lodash'
import { reactive } from 'vue'
import { isApp } from '@/utils'
import { routeTo } from '@/router'
import { useConfigStore } from '@/store/modules/config'
import { useAppStore } from '@/store/modules/app'
import { useProjectStore } from '@/store/modules/project'
import { storeToRefs } from 'pinia'
import LocalAppsPopup from './widget/local-apps-popup'

const store = useConfigStore()
const { vconsole } = storeToRefs(store)

const popup = reactive({
  localApps: false,
  env: false
})

const onReloadProjectConfig = throttle(async () => {
  let result = await useProjectStore().reload()
  if (!result) {
    return
  }
  uni.showToast({ title: '配置重置成功', icon: 'none' })
}, 1500)

const onClearCache = () => {
  const { systemInfo } = useAppStore()

  if (isApp) {
    if (systemInfo.platform === 'android') {
      plus.cache.clear()
    }

    if (systemInfo.platform === 'ios') {
      let cache = plus.ios.invoke(plus.ios.newObject('NSURLCache'), 'sharedURLCache')
      plus.ios.invoke(cache, 'removeAllCachedResponses')
      plus.ios.invoke(cache, 'setDiskCapacity:', 0)
      plus.ios.invoke(cache, 'setMemoryCapacity:', 0)
    }
  }

  uni.showToast({ title: '清除缓存成功', icon: 'none' })
}
</script>

<template>
  <g-scroll-view class="config-page">
    <template #header>
      <fui-nav-bar title="调试配置" is-go-back split-line />
    </template>

    <view class="menu">
      <fui-list>
        <fui-list-cell :bottomBorder="true" @click="onReloadProjectConfig">
          <text>重新载入配置</text>
        </fui-list-cell>
        <fui-list-cell @click="onClearCache">
          <text>清理业务缓存</text>
        </fui-list-cell>
      </fui-list>
    </view>
    <view class="menu">
      <fui-list>
        <fui-list-cell arrow :bottomBorder="true" @click="() => (popup.localApps = true)">
          <text>应用本地调试</text>
        </fui-list-cell>
        <fui-list-cell @click="store.onChangeConsole">
          <text>开启 VConsole 调试框</text>
          <fui-switch :scaleRatio="0.6" :checked="vconsole" />
        </fui-list-cell>
      </fui-list>
    </view>
    <view class="menu">
      <fui-list>
        <fui-list-cell arrow :bottomBorder="false" data-name="Env" @click="routeTo">
          <text>环境切换</text>
        </fui-list-cell>
      </fui-list>
    </view>
    <local-apps-popup v-model="popup.localApps" />
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.config-page {
  .menu {
    @apply m-3 rounded-xl paint-contain;
  }
}
</style>
