<script setup>
import { reactive, onMounted, getCurrentInstance } from 'vue'
import { isEmpty, debounce } from 'lodash'

const props = defineProps({
  feedBack: {
    type: Boolean,
    default: false
  },
  jumpTo: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: '#block'
  },
  loading: {
    type: Boolean,
    default: false
  },
  bottomSpaceClass: {
    type: String,
    default: 'h-6'
  }
})

const emit = defineEmits(['scroll', 'upper', 'lower'])

const nodes = reactive({})

const initDom = (self = getCurrentInstance()) => {
  uni
    .createSelectorQuery()
    .in(self?.proxy)
    .selectAll(props.tag)
    .boundingClientRect(data => {
      if (isEmpty(data)) {
        return
      }
      nodes.dataList = data
      nodes.positionList = data.map(item => item.top)
    })
    .exec()
}

props.feedBack && onMounted(initDom)

const onScroll = debounce(event => {
  if (!props.feedBack || props.loading || isEmpty(nodes.positionList) || isEmpty(nodes.dataList)) {
    return
  }
  let { scrollTop } = event.detail

  let index = nodes.positionList.findIndex((item, index) => {
    if (index === nodes.positionList.length - 1) {
      return scrollTop >= item
    }

    return scrollTop >= item && scrollTop <= nodes.positionList[index + 1]
  })

  emit('scroll', { index: index + 1, params: nodes.dataList[index + 1] })
}, 10)
</script>

<template>
  <view class="scroll-view">
    <view class="scroll-view__header">
      <slot name="header"></slot>
    </view>
    <slot name="fixed" />
    <template v-if="loading">
      <fui-loading type="row" :isFixed="false" text="正在加载..." class="h-40 flex items-end" />
    </template>

    <scroll-view
      v-show="!loading"
      scroll-y
      scroll-with-animation
      enable-flex
      scroll-anchoring
      class="scroll-view__wrap"
      :throttle="false"
      :upper-threshold="50"
      :lower-threshold="200"
      :scroll-into-view="jumpTo"
      @scroll="onScroll"
      @scrolltoupper="emit('upper', $event)"
      @scrolltolower="emit('lower', $event)"
    >
      <slot />
      <view :class="bottomSpaceClass" />
    </scroll-view>
    <view class="scroll-view__footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.scroll-view {
  @apply flex flex-col h-[100vh] overflow-hidden;

  &__header {
    @apply shrink-0;
  }

  &__wrap {
    @apply flex-1 h-[1px];
  }

  &__footer {
    @apply shrink-0;
  }

  .no-more {
    @apply text-zinc-600 text-sm;
    @apply before:content-[""] w-1/4 h-[1rpx] text-sm;
  }
}
</style>
