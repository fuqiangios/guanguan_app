<template>
  <view class="g-slider__wrap-outer" id="slider">
    <view class="g-slider__wrap" :style="{ width: `${width}px`, height: `${blockHeight}px` }">
      <view
        class="g-slider__pole"
        :style="{
          width: `${width}px`
        }"
        :class="[{ 'g-slider__pole-section': section }]"
      >
        <view class="g-slider__pole-left" />
        <view class="g-slider__pole-right" />
      </view>
      <view
        class="g-slider__handle"
        :class="['g-slider__handle-left', disabled ? 'g-slider__disabled' : '']"
        :style="{ width: `${blockWidth}px`, height: `${blockHeight}px` }"
        :change:prop="handler.slidevalue"
        :prop="initValue"
        :data-blockWidth="blockWidth"
        :data-width="width"
        :data-step="step"
        :data-min="min"
        :data-max="max"
        :data-disabled="disabled ? 1 : 0"
        :data-value="start"
        :data-end="end"
        :data-section="section ? 1 : 0"
        @touchstart="handler.touchstart"
        @touchmove="handler.touchmove"
        @touchend="handler.touchend"
        @mousedown="handler.mousedown"
      >
        <text class="g-slider__value" v-if="showValue">{{ start }}</text>
      </view>

      <view
        class="g-slider__handle"
        :class="['g-slider__handle-right', disabled ? 'g-slider__disabled' : '']"
        :style="{ width: `${blockWidth}px`, height: `${blockHeight}px` }"
        :change:prop="handler.sectionSlidevalue"
        :prop="initEndValue"
        :data-blockWidth="blockWidth"
        :data-width="width"
        :data-step="step"
        :data-min="min"
        :data-max="max"
        :data-disabled="disabled ? 1 : 0"
        :data-value="start"
        :data-end="end"
        :data-section="section ? 1 : 0"
        @touchstart="handler.sectionTouchstart"
        @touchmove="handler.sectionTouchmove"
        @touchend="handler.sectionTouchend"
        @mousedown="handler.endMousedown"
        v-if="section"
      >
        <text class="g-slider__value" v-if="showValue">{{ end }}</text>
      </view>
    </view>
  </view>
</template>

<script src="./index.wxs" module="handler" lang="wxs"></script>

<script>
import { sleep, getRect } from '../../guan-ui/utils'
export default {
  name: 'g-slider',
  emits: ['change', 'changing'],
  props: {
    height: {
      type: [Number, String],
      default: 8
    },
    radius: {
      type: [Number, String],
      default: 100
    },
    min: {
      type: [Number, String],
      default: 0
    },
    max: {
      type: [Number, String],
      default: 100
    },
    step: {
      type: [Number, String],
      default: 1
    },
    value: {
      type: [Number, String],
      default: 0
    },
    section: {
      type: Boolean,
      default: false
    },
    endValue: {
      type: [Number, String],
      default: 100
    },
    background: {
      type: String,
      default: '#e1e1e1'
    },
    activeColor: {
      type: String,
      default: '#465CFF'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showValue: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value(val) {
      let start = this.getStartVal(val)
      this.initValue = start
      this.start = start
    },
    endValue(val) {
      let end = this.getEndVal(val)
      this.initEndValue = end
      this.end = end
    }
  },
  data() {
    return {
      blockWidth: 36,
      blockHeight: 20,
      width: 260,
      start: 0,
      end: 0,
      initValue: 0,
      initEndValue: 0
    }
  },

  mounted() {
    console.log(this.value, this.endValue)
    this.start = this.getStartVal(this.value)
    this.end = this.getEndVal(this.endValue)

    this.initValue = this.start
    this.initEndValue = this.end
    sleep(20).then(async () => {
      await getRect('#slider').then(size => {
        self.width = size.width
      })
    })  
  },

  methods: {
    getStartVal(val) {
      val = Number(val)
      let min = Number(this.min)
      val = val < min ? min : val
      return val
    },
    getEndVal(val) {
      val = Number(val)
      let min = Number(this.min)
      let max = Number(this.max)
      val = val < min ? min : val
      val = val > max ? max : val

      return val
    },
    getParams(e) {
      let val = e.value || 0
      if (this.section && !e.isStart) {
        this.end = val
      } else {
        this.start = val
      }
      let params = {
        value: this.start
      }
      if (this.section) {
        params.endValue = this.end
      }
      return params
    },
    change(e) {
      let params = this.getParams(e)
      this.$emit('change', params)
    },
    changing(e) {
      let params = this.getParams(e)
      this.$emit('changing', params)
    }
  }
}
</script>

<style lang="scss" scoped>
.g-slider__wrap-outer {
  @apply w-full flex flex-row items-end h-10 box-border;
}

.g-slider__wrap {
  @apply relative flex flex-shrink-0 items-center;
}

.g-slider__pole {
  @apply relative z-[1] h-2 bg-color-input paint-contain rounded-md;
  &-left {
    @apply bg-color-primary absolute top-0 bottom-0 left-0 z-[2];
  }
  &-right {
    @apply bg-color-primary absolute top-0 bottom-0 right-0 z-[2];
  }
  &-r {
    @apply right-0;
    transform: translate3d(-100%, 0, 0);
  }
  &-l {
    @apply left-0;
    transform: translate3d(100%, 0, 0);
  }
  &-section {
    @apply bg-color-primary;
    .g-slider__pole {
      &-left,
      &-right {
        @apply bg-color-input;
      }
    }
  }
}

.g-slider__handle {
  @apply absolute cursor-grab top-0 drop-shadow rounded-xl bg-white;
  &-left {
    @apply left-0 z-[3];
  }
  &-right {
    @apply right-0 z-[4];
  }
}

.g-slider__value {
  @apply absolute bottom-6 text-color-primary text-xs;
}

.g-slider__disabled {
  @apply cursor-not-allowed #{!important};
}
</style>
