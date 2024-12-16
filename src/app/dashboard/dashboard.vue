<script setup>
import EnterpriseCard from './widget/enterprise-card'
import MessageCard from './widget/message-card'
import AppletCard from './widget/applet-card'
import BannerPanel from './widget/banner-panel'
import { onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { onTabItemTap } from '@dcloudio/uni-app'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import useSupply from '@/hooks/useSupply'
import { sleep } from '@/widget/guan-ui/utils'

const enterpriseStore = useEnterpriseStore()

const { querySupplyState } = useSupply()

const tabClick = ref(false)

const currentTemplate = ref(true)

const getInitData = () => {
  enterpriseStore.getEnterpriseDetail()
  sleep(100).then(enterpriseStore.getEnterpriseAppletList)
}

onShow(getInitData)

onMounted(querySupplyState)

onTabItemTap(() => {
  if (tabClick.value) {
    currentTemplate.value = false
  }
  tabClick.value = true
  setTimeout(() => {
    getInitData()
    currentTemplate.value = true
    tabClick.value = false
  }, 200)
})
</script>

<template>
  <g-scroll-view class="dashboard-page">
    <fui-status-bar />
    <template v-if="currentTemplate">
      <banner-panel />
      <enterprise-card />
      <!-- <message-card v-permission:DashboardRecentMessageCard /> -->
      <applet-card />
    </template>
    <view class="tips-wrap">
      <view class="tips-wrap-container">
        <view class="handler"> 双击刷新数据 </view>
      </view>
      <view class="tips-wrap-container"></view>
    </view>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.dashboard-page {
  .tips-wrap {
    @apply fixed flex w-full justify-between items-center;
    bottom: calc(var(--window-bottom) + 10px);
    &-container {
      @apply flex-1 flex justify-center;
      .handler {
        @apply relative bg-[#e2eefa] flex items-center text-primary pt-2 pb-2 pl-4 pr-4 rounded-lg text-xs animate-bounce;
        &::after {
          @apply w-4 h-4 rotate-45 bg-[#e2eefa] absolute content-[""] z-[-1] -bottom-1 left-0  right-0 mx-auto;
        }
      }
    }
  }
}
</style>
