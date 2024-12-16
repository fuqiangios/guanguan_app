<!--本文件由FirstUI授权予江苏伟岸纵横科技股份有限公司（手机号： 13      0294 598 2 1，身份证尾号：2 9 0  6 70）专用，请尊重知识产权，勿私下传播，违者追究法律责任。-->
<template>
  <div
    class="fui-form__item-wrap"
    :style="{
      paddingTop: padding[0] || 0,
      paddingRight: padding[1] || 0,
      paddingBottom: padding[2] || padding[0] || 0,
      paddingLeft: padding[3] || padding[1] || 0,
      background: background,
      marginTop: marginTop + 'rpx',
      marginBottom: marginBottom + 'rpx',
      borderRadius: radius
    }"
    :class="{ 'fui-form__highlight': highlight }"
    @tap="handleClick"
  >
    <view class="fui-form__header">
      <!-- #ifdef APP-NVUE -->
      <view class="fui-form__asterisk" v-if="asterisk">
        <text :style="{ color: asteriskColor }">*</text>
      </view>
      <!-- #endif -->
      <!-- #ifndef APP-NVUE -->
      <view class="fui-form__asterisk" v-if="asterisk" :style="{ color: asteriskColor }">*</view>
      <!-- #endif -->
      <text :style="{ fontSize: getLabelSize, color: labelColor, paddingRight: getLabelRight }" v-if="label">{{
        label
      }}</text>
    </view>
    <view class="fui-form__item-content">
      <view class="fui-form__item-slot">
        <slot></slot>
      </view>
      <view class="fui-form__item-arrow" v-if="arrow" :style="{ 'border-color': arrowColor }"> </view>
    </view>
    <slot name="right"></slot>
    <view
      v-if="bottomBorder"
      :style="{ background: borderColor, left: left + 'rpx', right: right + 'rpx' }"
      class="fui-form__item-bottom"
    ></view>
  </div>
</template>

<script>
export default {
  name: 'fui-form-item',
  emits: ['click'],
  props: {
    //padding值，上、右、下、左
    padding: {
      type: Array,
      default() {
        return ['0rpx', '32rpx']
      }
    },
    //margin-top 单位rpx
    marginTop: {
      type: [Number, String],
      default: 0
    },
    //margin-bottom 单位rpx
    marginBottom: {
      type: [Number, String],
      default: 0
    },
    //标签文本
    label: {
      type: String,
      default: ''
    },
    //标题字体大小 默认使用全局设置值
    labelSize: {
      type: [Number, String],
      default: 0
    },
    labelColor: {
      type: String,
      default: '#333'
    },
    //label宽度 rpx 默认使用全局设置值
    labelWidth: {
      type: [Number, String],
      default: 0
    },
    //默认使用全局设置值
    labelRight: {
      type: [Number, String],
      default: 0
    },
    //是否显示必填的红色星号
    asterisk: {
      type: Boolean,
      default: false
    },
    asteriskColor: {
      type: String,
      default: '#FF2B2B'
    },
    background: {
      type: String,
      default: '#fff'
    },
    highlight: {
      type: Boolean,
      default: false
    },
    arrow: {
      type: Boolean,
      default: false
    },
    arrowColor: {
      type: String,
      default: '#B2B2B2'
    },
    bottomBorder: {
      type: Boolean,
      default: true
    },
    borderColor: {
      type: String,
      default: '#EEEEEE'
    },
    //下边框left值，单位rpx
    left: {
      type: [Number, String],
      default: 32
    },
    //下边框right值，单位rpx
    right: {
      type: [Number, String],
      default: 0
    },
    radius: {
      type: String,
      default: '0'
    },
    param: {
      type: [Number, String],
      default: 0
    }
  },
  computed: {
    getLabelSize() {
      const labelSize = (uni.$fui && uni.$fui.fuiFormItem && uni.$fui.fuiFormItem.labelSize) || 32
      return `${this.labelSize || labelSize}rpx`
    },
    getLabelRight() {
      const labelRight = (uni.$fui && uni.$fui.fuiFormItem && uni.$fui.fuiFormItem.labelRight) || 16
      return `${this.labelRight || labelRight}rpx`
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', {
        param: this.param
      })
    }
  }
}
</script>

<style scoped>
.fui-form__item-wrap {
  /* #ifndef APP-NVUE */
  width: 100%;
  box-sizing: border-box;
  display: flex;
  /* #endif */
  flex-direction: column;
  flex: 1;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.fui-form__highlight:active {
  /* #ifdef APP-NVUE */
  background-color: var(--fui-bg-color-hover) !important;
  /* #endif */

  /* #ifndef APP-NVUE */
  background-color: var(--fui-bg-color-hover, var(--fui-bg-color-hover)) !important;
  /* #endif */
}

.fui-form__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fui-form__asterisk {
  position: absolute;
  left: -20rpx;
  /* #ifndef APP-NVUE */
  height: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  line-height: 1.15;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex: 1;
  align-items: center;
  justify-content: center;
  line-height: 1;
  /* #endif */
}

.fui-form__item-label {
  padding-right: 12rpx;
  /* #ifndef APP-NVUE */
  display: inline-block;
  flex-shrink: 0;
  /* #endif */
}

.fui-form__item-content {
  flex: 1;
  width: 100%;
  padding: 10rpx 0;
  display: flex;
  align-items: center;
}

.fui-form__item-bottom {
  position: absolute;
  bottom: 0;
  /* #ifdef APP-NVUE */
  height: 0.5px;
  z-index: -1;
  /* #endif */
  /* #ifndef APP-NVUE */
  height: 1px;
  -webkit-transform: scaleY(0.5) translateZ(0);
  transform: scaleY(0.5) translateZ(0);
  transform-origin: 0 100%;
  z-index: 1;
  /* #endif */
}

.fui-form__item-slot {
  flex: 1;
}

.fui-form__item-arrow {
  height: 40rpx;
  width: 40rpx;
  border-width: 3px 3px 0 0;
  border-style: solid;
  transform: rotate(45deg) scale(0.5);
  /* #ifndef APP-NVUE */
  border-radius: 4rpx;
  flex-shrink: 0;
  margin-left: auto;
  box-sizing: border-box;
  /* #endif */
  /* #ifdef APP-NVUE */
  border-top-right-radius: 3rpx;
  /* #endif */
  transform-origin: center center;
  margin-right: -5.8579rpx;
}
</style>
