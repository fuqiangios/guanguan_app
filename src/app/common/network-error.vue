<script setup>
import { reactive, inject, onMounted } from 'vue'
import { isEmpty } from 'lodash'
import { useAppStore } from '@/store/modules/app'

const { Image } = inject('Constant')

const { isNetworkConnected } = useAppStore()

const navigateTo = reactive({})

onMounted(() => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }

  Object.keys(params).forEach(key => {
    navigateTo[key] = params[key]
  })
})

const onContinue = () => {
  // TODO: 网络异常时处理逻辑
  if (!isNetworkConnected) {
    return
  }
  let { jumpType, name, passedParams, routeParams, url } = navigateTo
  if (jumpType !== 'switchTab') {
    jumpType = 'redirectTo'
  }
  uni[jumpType]({ name, url, passedParams, routeParams })
}

const onBack = () => {
  // TODO: 网络异常时返回处理逻辑
  console.log(getCurrentPages())
  // uni.navigateBack()
}
</script>

<template>
  <g-scroll-view class="network-error-page">
    <template #header>
      <fui-nav-bar is-go-back is-custom-back @back="onBack" />
    </template>
    <fui-empty class="pt-40" :src="Image.Empty.Network" title="网络连接异常" descr="你的网络开小差啦，再刷新试试吧">
      <view class="action">
        <fui-button @tap="onContinue">刷新</fui-button>
      </view>
    </fui-empty>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.network-error-page {
  @apply bg-white h-[100vh];
  .action {
    @apply w-20 pt-3;
  }
}
</style>
