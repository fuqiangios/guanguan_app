<script setup>
import { isEmpty, isString } from 'lodash'

const props = defineProps({
  label: {
    type: String,
    required: false
  },
  extra: {
    type: [Boolean, String, Array],
    required: false
  },
  divide: {
    type: Boolean,
    default: true
  }
})

const onClick = url => {
  uni.navigateTo({
    url,
    passedParams: props
  })
}
</script>

<template>
  <view class="g-card-header">
    <block v-if="!$slots.label">
      <span class="label">{{ label }}</span>
    </block>
    <block v-else>
      <slot name="label" />
    </block>

    <block v-if="!$slots.extra && !isEmpty(extra)">
      <block v-if="isString(extra)">
        <span class="extra">{{ extra }}</span>
      </block>
      <block v-else>
        <view class="extra" hover-class="extra-hover" @tap="onClick(extra[1])">
          <span>{{ extra[0] }}</span>
          <fui-icon name="arrowright" class="icon" />
        </view>
      </block>
    </block>
    <block v-else>
      <slot name="extra" />
    </block>
    <view v-if="divide" class="divide" />
  </view>
</template>

<style lang="scss" scoped>
.g-card-header {
  @apply relative p-3 flex flex-row justify-between content-center text-base;

  .label {
    @apply relative flex items-center font-bold text-sm before:content-[''] text-zinc-600;
    &:before {
      @apply inline-block w-1 h-4 bg-primary mr-2 rounded-sm;
    }
  }

  .extra {
    @apply flex justify-end items-center text-sm text-zinc-600;
    .icon {
      @apply text-base leading-3 text-zinc-600 #{!important};
    }
    &-hover {
      @apply opacity-50;
    }
  }

  .divide {
    @apply content-[""] ml-3 absolute bottom-0 w-full h-[1rpx] bg-zinc-100;
  }
}
</style>
