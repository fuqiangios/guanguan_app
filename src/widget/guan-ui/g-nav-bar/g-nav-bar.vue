<template>
  <view
    class="g-nav__bar"
    :class="{ 'g-nav__bar-line': splitLine, 'g-nav__bar-fixed': isFixed }"
    :style="{
      background: background,
      'border-bottom-color': lineColor,
      zIndex: zIndex
    }"
  >
    <view class="g-nav__status-bar" :style="{ height: statusBarHeight + 'px' }" v-if="statusBar"></view>
    <view class="g-nav__header" :class="[{ headerStart: custom }]">
      <view class="g-nav__left" :class="[{ initialWith: custom }]">
        <view class="g-nav__left-wrap" v-show="isGoBack" @tap="goBack">
          <view class="g-nav__left-icon-wrap">
            <fui-icon name="arrowleft" :size="60"></fui-icon>
          </view>
          <view class="g-nav__left-back-text" v-if="goBackText">{{ goBackText }}</view>
        </view>
      </view>
      <block v-if="!custom">
        <view
          class="g-nav__title"
          @tap="titleClick"
          :style="{ fontSize: size + 'px', color: color, fontWeight: fontWeight }"
        >
          <fui-overflow-hidden align="center" :text="title.length > 0 ? title : defaultTitle" />
        </view>
        <view class="g-nav__right">
          <slot name="right"></slot>
        </view>
      </block>
      <block v-else>
        <slot></slot>
      </block>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { isMechanism } from '@/utils'

const defaultTitle = computed(() => {
  const pages = getCurrentPages()
  if (!pages.length) {
    return ''
  }

  let title = pages[pages.length - 1].$page.meta.navigationBar.titleText

  if (isMechanism) {
    title = title.replace(/企业/, '机构')
  }

  return title
})
</script>

<script>
var sys = uni.getSystemInfoSync()
export default {
  name: 'g-nav-bar',
  emits: ['init', 'back', 'titleClick'],
  props: {
    //标题
    title: {
      type: String,
      default: ''
    },
    //标题字体大小，单位px
    size: {
      type: [Number, String],
      // #ifdef H5
      default: 16,
      // #endif
      // #ifndef H5
      default: 17
      // #endif
    },
    //标题颜色
    color: {
      type: String,
      // #ifdef APP-NVUE
      default: '#181818',
      // #endif
      // #ifndef APP-NVUE
      default: ''
      // #endif
    },
    fontWeight: {
      type: [Number, String],
      default: 500
    },
    //背景颜色
    background: {
      type: String,
      // #ifdef APP-NVUE
      default: '#fff',
      // #endif
      // #ifndef APP-NVUE
      default: ''
      // #endif
    },
    //是否需要底部分割线
    splitLine: {
      type: Boolean,
      default: false
    },
    //分割线颜色，仅Nvue生效
    lineColor: {
      type: String,
      default: '#eee'
    },
    //是否包含状态栏
    statusBar: {
      type: Boolean,
      default: true
    },
    //是否固定在顶部
    isFixed: {
      type: Boolean,
      default: false
    },
    //z-index
    zIndex: {
      type: [Number, String],
      default: 996
    },
    //自定义navbar内容，title、右插槽失效
    custom: {
      type: Boolean,
      default: false
    },
    //是否返回上一层
    isGoBack: {
      type: Boolean,
      default: false
    },
    //返回引导内容
    goBackText: {
      type: String,
      default: ''
    },
    // 自定义返回逻辑
    isCustomBack: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusBarHeight: sys.statusBarHeight
    }
  },
  created() {
    let obj = {}
    // #ifdef MP-WEIXIN || MP-QQ || MP-BAIDU || MP-TOUTIAO
    obj = uni.getMenuButtonBoundingClientRect()
    // #endif
    // #ifdef MP-ALIPAY
    my.hideAddToDesktopMenu()
    // #endif
    // 框架内部页面跳转会从这里获取style配置

    this.$emit('init', {
      windowWidth: sys.windowWidth,
      //不包含状态栏高度固定为：44px
      height: 44,
      statusBarHeight: this.statusBarHeight,
      //小程序右上角悬浮按钮左边界坐标，单位：px
      left: obj.left || -1,
      //小程序右上角悬浮按钮宽度，单位：px
      btnWidth: obj.width || 0,
      //小程序右上角悬浮按钮高度，单位：px
      btnHeight: obj.height || 0
    })
  },

  methods: {
    goBack() {
      if (this.isCustomBack) {
        this.$emit('back')
        return
      }
      uni.navigateBack()
    },

    titleClick() {
      this.$emit('titleClick')
    }
  }
}
</script>

<style lang="scss" scoped>
.g-nav__status-bar {
  @apply w-full box-border;
}

.g-nav__header {
  @apply flex-1 pl-6 pr-6 h-[44px] flex items-center overflow-hidden;
}

.headerStart {
  width: inherit;
  justify-content: flex-start;
}

.g-nav__bar {
  @apply flex-1 w-full box-border;
}

.fui-nva__bar-bg {
  @apply bg-white;
}

.g-nav__bar-line {
  position: relative;
  /* #ifdef APP-NVUE */
  border-bottom: 0.5px;
  border-bottom-style: solid;
  /* #endif */
  /* #ifndef APP-NVUE */
  border-bottom: 0;
  /* #endif */
}

/* #ifndef APP-NVUE */
.g-nav__bar-line::after {
  content: '';
  position: absolute;
  border-bottom: 1px solid var(--fui-color-border, #eeeeee) !important;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  transform-origin: 0 100%;
  bottom: 0;
  right: 0;
  left: 0;
}

/* #endif */
.g-nav__left {
  @apply flex-[0.5] flex content-start items-center justify-start;
}

.initialWith {
  width: initial;
  flex: initial;
}

.g-nav__right {
  @apply flex-[0.5] flex content-end items-center justify-end;
}

.g-nav__title {
  @apply flex-1 justify-around flex items-center pl-3 pr-3;
}

/* #ifndef APP-NVUE */
.g-nav__title-color {
  color: var(--fui-color-title, #181818) !important;
}

/* #endif */

.g-nav__bar-fixed {
  position: fixed;
  /* #ifdef H5 */
  left: var(--window-left);
  right: var(--window-right);
  /* #endif */
  /* #ifndef H5 */
  left: 0;
  right: 0;
  /* #endif */
  top: 0;
}
</style>
