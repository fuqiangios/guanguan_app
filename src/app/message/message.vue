<script setup>
import { ref } from 'vue'
const tabs = [
  {
    name: '未签收'
  },
  {
    name: '已签收'
  }
]

const isShowSearchBar = ref(false)

const resetSearchBar = () => (isShowSearchBar.value = false)

const isShowDataPicker = ref(false)

const resetFilterAction = () => (isShowDataPicker.value = false)

const onDateFilterChange = () => {
  resetFilterAction()
}
const onDateFilterCancel = () => {
  resetFilterAction()
}
</script>

<template>
  <view class="message-page">
    <fui-nav-bar is-go-back title="消息中心" :custom="isShowSearchBar" split-line>
      <fui-search-bar focus @cancel="resetSearchBar"></fui-search-bar>

      <template #right>
        <fui-icon custom-prefix="feather" name="icon-filter" @tap="() => (isShowDataPicker = true)"></fui-icon>
        <fui-icon custom-prefix="feather" name="icon-search" @tap="() => (isShowSearchBar = true)"></fui-icon>
      </template>
    </fui-nav-bar>
    <view class="bg-white w-full">
      <fui-tabs :tabs="tabs" :short="false" scale="1"></fui-tabs>
    </view>

    <fui-date-picker
      title="时间范围筛选"
      range
      :show="isShowDataPicker"
      type="3"
      @change="onDateFilterChange"
      @cancel="onDateFilterCancel"
    ></fui-date-picker>
  </view>
</template>

<style lang="scss" scoped>
.message-page {
  .tabs {
    @apply w-full border-b border-solid border-neutral-100;
  }
  .fui-search__bar-wrap {
    @apply bg-white #{!important};
  }
  .fui-icon {
    @apply text-xl m-3 mt-0 mb-0 #{!important};
  }
}
</style>
