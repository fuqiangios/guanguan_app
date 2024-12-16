<template>
  <view class="g-card-action">
    <!-- <view class="divide" /> -->
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.g-card-action {
  @apply relative p-3 flex flex-row justify-between content-center text-base;

  .divide {
    @apply content-[""] ml-3 absolute top-0 w-full h-[1rpx] bg-zinc-100;
  }
}
</style>
