<script setup>
import { isEmpty } from 'lodash'
import { inject } from 'vue'
const { value } = inject('props')
</script>

<template>
  <view class="g-card-item__images">
    <span v-if="isEmpty(value)"> 未上传 </span>
    <template v-else>
      <scroll-view scroll-x scroll-with-animation enable-flex scroll-anchoring class="whitespace-nowrap h-20">
        <view v-for="(item, index) in value" :key="index" class="inline-flex" :class="[{ 'ml-3': !!index }]">
          <fui-lazyload :src="item" width="150" height="150" />
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<style lang="scss" scoped></style>
