<script setup>
import { onMounted, reactive, inject } from 'vue'
import { throttle } from 'lodash'
import { routeTo } from '@/router'
import useSupply from '@/hooks/useSupply'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { storeToRefs } from 'pinia'

const { Image } = inject('Constant')

const { appletList } = storeToRefs(useEnterpriseStore())

const { querySupplyState } = useSupply()

const appletData = reactive({
  list: appletList,
  loading: true
})

onMounted(async () => {
  await getData()
})

const getData = async () => {
  try {
    console.log(appletList)
    appletData.list = appletList
  } catch (error) {
    console.log(error.message)
  } finally {
    appletData.loading = false
  }
}

const open = throttle(data => {
  let result = querySupplyState()
  if (result) {
    // TODO: 前置逻辑
    routeTo('Mp', data, 'slide-in-bottom')
  }
}, 600)
</script>

<template>
  <g-card class="applet-card" label="应用中心">
    <template v-if="appletData.loading">
      <fui-loading type="row" :is-fixed="false" text="正在加载..." class="h-32 flex items-center" />
    </template>

    <template v-else-if="!appletData.list.length">
      <fui-empty :src="Image.Empty.Applet" class="empty" />
    </template>
    <template v-else>
      <fui-grid :columns="4" :showBorder="false" class="!pt-1 !pb-1">
        <fui-grid-item v-for="item in appletData.list" :key="item.appId" @tap="open(item)">
          <view class="item">
            <view class="icon">
              <fui-lazyload :src="item.appImage" class="icon" width="90" height="90" />
            </view>
            <text>{{ item.appName }}</text>
          </view>
        </fui-grid-item>
      </fui-grid>
    </template>
  </g-card>
</template>

<style lang="scss" scoped>
.applet-card {
  .empty {
    ::v-deep uni-image {
      @apply h-40 w-[13.2rem] #{!important};
    }
  }
  .item {
    @apply h-full w-full flex flex-col justify-center items-center;
    .icon {
      @apply flex items-center justify-center rounded-xl overflow-clip #{!important};
    }
    text {
      @apply mt-3 text-xs;
    }
  }
}
</style>
