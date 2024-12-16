<template>
  <view class="g-steps__wrap" :class="{ 'g-steps__flex': direction === 'row' }">
    <view
      class="g-steps__node-wrap"
      :class="[
        direction === 'column' ? 'g-steps__flex-row' : 'g-steps__flex-col',
        { 'g-steps__flex-row-left': index === 0 },
        { 'g-steps__flex-row-right': index === items.length - 1 }
      ]"
      v-for="(item, index) in items"
      :key="index"
      @tap.stop="handleClick(index)"
    >
      <view
        class="g-steps__node-box"
        :class="[
          direction === 'row' ? 'g-steps__flex-row' : 'g-steps__flex-col',
          direction === 'row' ? '' : 'g-steps__node-weex'
        ]"
        :style="getStyles"
      >
        <view
          class="g-steps__line"
          :class="[
            direction === 'row' ? 'g-steps__line-row' : 'g-steps__line-col',
            index <= current && index !== 0 && !activeColor ? 'g-steps__background' : ''
          ]"
          :style="{ background: index <= current ? activeColor : nodeColor }"
          v-if="direction === 'row' && index !== 0"
        ></view>
        <view class="g-steps__node">
          <text
            class="g-steps__node-text"
            :class="{
              'g-steps__background': index <= current && !activeColor,
              'g-steps__border': index <= current && !activeColor
            }"
            v-if="item.text && isMark && index >= current"
            :style="{
              background: index <= current ? activeColor : '#fff',
              borderColor: index <= current ? activeColor : nodeColor,
              color: index <= current ? '#fff' : color
            }"
            >{{ item.text }}</text
          >
          <view
            class="g-steps__checkbox"
            :class="{ 'g-steps__background': !activeColor }"
            :style="{ background: activeColor }"
            v-if="isMark && index < current"
          >
            <view class="g-steps__checkmark"></view>
          </view>
          <view
            class="g-steps__node-dot"
            :class="{ 'g-steps__background': index <= current && !activeColor }"
            :style="{ background: index <= current ? activeColor : nodeColor }"
            v-if="!item.text && !item.src && !(isMark && index == current)"
          >
          </view>
          <image
            :src="index <= current ? item.activeSrc || item.src : item.src"
            mode="widthFix"
            class="g-steps__node-icon"
            v-if="!item.text && item.src && !(isMark && index == current)"
            :style="{ borderRadius: radius || 0 }"
          ></image>
        </view>
        <view
          v-if="index !== items.length - 1"
          class="g-steps__line"
          :class="[
            direction === 'row' ? 'g-steps__line-row' : 'g-steps__line-col',
            index !== items.length - 1 &&
            !activeColor &&
            (index < current || (index == current && isWait && direction === 'row'))
              ? 'g-steps__background'
              : ''
          ]"
          :style="{
            background: index < current || (index == current && isWait && direction === 'row') ? activeColor : nodeColor
          }"
        >
        </view>
      </view>
      <view
        class="g-steps__content"
        :class="[
          direction === 'row' ? 'g-steps__content-row' : 'g-steps__content-col',
          {
            'g-steps__content-row-left': direction === 'row' && index === 0
          },
          {
            'g-steps__content-row-right': direction === 'row' && index === items.length - 1
          }
        ]"
      >
        <text
          class="g-steps__title"
          :class="{ 'g-steps__text-row': direction === 'row', 'g-steps__color': index <= current && !activeColor }"
          v-if="item.title"
          :style="{ color: index <= current ? activeColor : color }"
          >{{ item.title }}</text
        >
        <text
          class="g-steps__descr"
          :class="{ 'g-steps__text-row': direction === 'row', 'g-steps__color': index <= current && !activeColor }"
          v-if="item.descr"
          :style="{ color: index <= current ? activeColor : descrColor, fontSize: descrSize + 'rpx' }"
          >{{ item.descr }}</text
        >
      </view>
    </view>
  </view>
</template>

<script>
// TODO: 重构组件
export default {
  name: 'g-steps',
  emits: ['click'],
  props: {
    items: {
      type: Array,
      default() {
        return []
      }
    },
    current: {
      type: [Number, String],
      default: 0
    },
    //row/column
    direction: {
      type: String,
      default: 'row'
    },
    background: {
      type: String,
      default: 'transparent'
    },
    height: {
      type: [Number, String],
      default: 50
    },
    nodeColor: {
      type: String,
      default: '#DADADA'
    },
    color: {
      type: String,
      default: '#181818'
    },
    descrColor: {
      type: String,
      default: '#B2B2B2'
    },
    descrSize: {
      type: [Number, String],
      default: 24
    },
    // #ifdef APP-NVUE
    activeColor: {
      type: String,
      default: '#465CFF'
    },
    // #endif
    // #ifndef APP-NVUE
    activeColor: {
      type: String,
      default: ''
    },
    // #endif
    radius: {
      type: String,
      default: '0rpx'
    },
    //完成到当前步骤时是否需要对号标识
    isMark: {
      type: Boolean,
      default: true
    },
    isWait: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getStyles() {
      let styles = `height:${this.height}rpx`
      if (this.direction === 'column') {
        styles = `width:${this.height}rpx`
      }
      return styles
    }
  },
  data() {
    let isNvue = false
    // #ifdef APP-NVUE
    isNvue = true
    // #endif
    return {
      isNvue
    }
  },
  methods: {
    handleClick(index) {
      this.$emit('click', {
        index: index,
        ...this.items[index]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.g-steps__wrap {
  @apply mt-6 ml-6 mr-6;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex: 1;
  /* #endif */
  flex-direction: column;
}

.g-steps__flex {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  /* #ifdef APP-NVUE */
  align-items: flex-start !important;
  /* #endif */
}

.g-steps__node-wrap {
  position: relative;
  /* #ifndef APP-NVUE */
  width: 100%;
  display: flex;
  /* #endif */
}

.g-steps__nw-col {
  flex: 1;
}

.g-steps__flex-row {
  flex-direction: row;
}

.g-steps__flex-col {
  flex-direction: column;
}

.g-steps__line {
  /* #ifndef APP-NVUE */
  transform-origin: center;
  /* #endif */
  flex: 1;
}

.g-steps__line-row {
  /* #ifdef APP-NVUE */
  height: 0.5px;
  /* #endif */

  /* #ifndef APP-NVUE */
  height: 1px;
  transform: scaleY(0.5) translateZ(0);
  /* #endif */
}

.g-steps__line-col {
  /* #ifdef APP-NVUE */
  width: 0.5px;
  /* #endif */

  /* #ifndef APP-NVUE */
  width: 1px;
  transform: scaleX(0.5) translateZ(0);
  /* #endif */
}

.g-steps__node-box {
  /* #ifndef APP-NVUE */
  display: flex;
  flex-shrink: 0;
  /* #endif */
  align-items: center;
  overflow: hidden;
}

/* #ifdef APP-NVUE */
.g-steps__node-weex {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}

/* #endif */

.g-steps__node {
  /* #ifndef APP-NVUE */
  display: flex;
  flex-shrink: 0;
  /* #endif */
  align-items: center;
  justify-content: center;
}

.g-steps__node-text {
  /* #ifndef APP-NVUE */
  display: flex;
  box-sizing: border-box;
  border-radius: 50%;
  /* #endif */
  width: 44rpx;
  height: 44rpx;
  /* #ifdef APP-NVUE */
  border-radius: 24rpx;
  line-height: 44rpx;
  /* #endif */
  background-color: #fff;
  border-style: solid;
  border-width: 1rpx;
  font-size: 28rpx;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: normal;
  overflow: hidden;
}

.g-steps__node-icon {
  width: 44rpx;
  height: 44rpx;
  /* #ifndef APP-NVUE */
  display: block;
  /* #endif */
}

.g-steps__node-dot {
  width: 9px;
  height: 9px;
  /* #ifndef APP-NVUE */
  border-radius: 50%;
  /* #endif */
  /* #ifdef APP-NVUE */
  border-radius: 9px;
  /* #endif */
  background-color: #ccc;
}

.g-steps__content {
  /* #ifndef APP-NVUE */
  width: 100%;
  display: flex;
  box-sizing: border-box;
  /* #endif */
  flex: 1;
  flex-direction: column;
}

.g-steps__content-row {
  @apply pt-3;
  &-left {
    @apply items-start;
  }
  &-right {
    @apply items-end;
  }
  /* #ifndef APP-NVUE */
  flex-shrink: 0;
  word-break: break-all;
  /* #endif */
  align-items: center;
  overflow: hidden;
}

.g-steps__content-col {
  padding-left: 24rpx;
  padding-bottom: 64rpx;
}

.g-steps__title,
.g-steps__descr {
  /* #ifndef APP-NVUE */
  display: block;
  word-break: break-all;
  /* #endif */
  padding-bottom: 8rpx;
  font-weight: normal;
  @apply text-[0.85rem];
}

.g-steps__text-row {
  text-align: center;
}

.g-steps__checkbox {
  width: 44rpx;
  height: 44rpx;
  /* #ifdef APP-NVUE */
  border-radius: 44rpx;
  /* #endif */
  /* #ifndef APP-NVUE */
  display: inline-flex;
  box-sizing: border-box;
  border-radius: 50%;
  vertical-align: top;
  flex-shrink: 0;
  /* #endif */
  flex-direction: row;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.g-steps__checkmark {
  width: 22rpx;
  height: 44rpx;
  border-bottom-style: solid;
  border-bottom-width: 3px;
  border-bottom-color: #ffffff;
  border-right-style: solid;
  border-right-width: 3px;
  border-right-color: #ffffff;
  transform: rotate(45deg) scale(0.5);
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  transform: rotate(45deg) scale(0.5) translateZ(0);
  /* #endif */
  /* #ifdef APP-NVUE */
  transform: rotate(45deg) scale(0.5);
  /* #endif */
  transform-origin: 54% 48%;
}

/* #ifndef APP-NVUE */
.g-steps__color {
  color: var(--fui-color-primary, #465cff) !important;
}

.g-steps__border {
  border-color: var(--fui-color-primary, #465cff) !important;
}

.g-steps__background {
  background: var(--fui-color-primary, #465cff) !important;
}

/* #endif */
</style>
