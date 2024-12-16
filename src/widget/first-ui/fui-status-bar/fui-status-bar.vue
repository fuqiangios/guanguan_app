<!--本文件由FirstUI授权予江苏伟岸纵横科技股份有限公司（手机号： 13  0 2  9 45 9  821，身份证尾号：29  0  6 70）专用，请尊重知识产权，勿私下传播，违者追究法律责任。-->
<template>
  <view
    :style="{ zIndex: isFixed ? zIndex : 1, background: background }"
    class="fui-status__bar"
    :class="{ 'fui-status__bar-fixed': isFixed }"
  >
    <slot />
  </view>
</template>

<script>
export default {
  name: 'fui-status-bar',
  emits: ['init'],
  props: {
    //背景色
    background: {
      type: String,
      default: 'transparent'
    },
    //是否固定在顶部
    isFixed: {
      type: Boolean,
      default: false
    },
    //z-index值，isFixed为true时生效
    zIndex: {
      type: Number,
      default: 99
    }
  }
}
</script>

<style scoped>
.fui-status__bar {
	height: var(--status-bar-height);
  /* #ifndef APP-NVUE */
  width: 100%;
  /* #endif */
  overflow: hidden;
}

.fui-status__bar-fixed {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
}
</style>
