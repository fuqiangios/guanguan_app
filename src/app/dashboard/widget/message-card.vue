<script setup>
import { reactive, inject, onMounted, computed } from 'vue'

const { Image } = inject('Constant')

const recentMessageData = reactive({
  list: [
    {
      id: 'm1',
      content: '有综合检查任务需要您签收',
      status: 0
    },
    {
      id: 'm2',
      content: '有专项检查任务需要您签收',
      status: 0
    },
    {
      id: 'm3',
      content: '有日常检查任务需要您签收',
      status: 0
    },
    {
      id: 'm4',
      content: '有节假日检查任务需要您签收',
      status: 0
    },
    {
      id: 'm5',
      content: '有消防巡查任务需要您签收',
      status: 0
    }
  ],
  loading: true
})

onMounted(async () => {
  await getData()
})

const getData = async () => {
  try {
    let result = null
    if (!result) {
      throw new Error('未查询到最近消息数据')
    }

    recentMessageData.list = result
  } catch (error) {
    console.log(error.message)
  } finally {
    let timer = setTimeout(() => {
      clearTimeout(timer)
      recentMessageData.loading = false
    }, 3000)
  }
}

const extraInfo = computed(() => {
  return !recentMessageData.loading ? ['查看更多', '/app/message/message'] : ''
})
</script>

<template>
  <g-card class="message-card">
    <g-card-header label="消息中心" :extra="extraInfo" />

    <template v-if="recentMessageData.loading">
      <fui-loading type="row" :is-fixed="false" text="正在加载..." class="h-32 flex items-center" />
    </template>
    <template v-else-if="!recentMessageData.list.length">
      <fui-empty :src="Image.Empty.Message" class="empty" />
    </template>
    <template v-else>
      <section class="relative pl-3 pr-3" v-for="item in recentMessageData.list" :key="item.id">
        <view class="items">
          <view class="content">
            <fui-overflow-hidden class="!text-sm" :text="item.content" />
          </view>

          <template v-if="item.status == 0">
            <fui-tag text="未签收" type="danger" theme="light" :scaleRatio="0.9"></fui-tag>
          </template>
          <template v-else-if="item.status == 1">
            <fui-tag text="已签收" type="primary" theme="light" :scaleRatio="0.9"></fui-tag>
          </template>
        </view>
        <view class="split" />
      </section>
    </template>
  </g-card>
</template>

<style lang="scss" scoped>
.message-card {
  .empty {
    ::v-deep uni-image {
      @apply h-40 w-[13.2rem] #{!important};
    }
  }
  .items {
    @apply pt-2 pb-2 flex justify-between;
    .content {
      @apply w-56 text-sm flex items-center;
    }
  }
  .split {
    @apply content-[""] ml-3  bottom-0 w-full h-[1rpx] bg-zinc-100;
  }
}
</style>
