<script setup>
import { sleep, getRect, isPC } from '../utils'
import { onLoad } from '@dcloudio/uni-app'
import { onMounted, reactive, toRefs, watch } from 'vue'

const props = defineProps({
  max: {
    type: [Number, String],
    default: 5
  },
  modelValue: {
    type: [Number, String],
    default: 0
  },
  color: {
    type: String,
    default: '#CCCCCC'
  },
  activeColor: {
    type: String,
    default: '#FFB703'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: [Number, String],
    default: 56
  },
  half: {
    type: Boolean,
    default: false
  },
  halfRate: {
    type: [Number, String],
    default: 0.2
  },
  touchable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const { max, modelValue } = toRefs(props)

const data = reactive({
  stars: [],
  pageX: 0,
  pageW: 0,
  intScore: 0,
  decimalScore: 0,
  rated: false
})

const getName = (index, iScore, dScore) => {
  let name = 'star'
  if (index < iScore) {
    name += '-fill'
  }
  if (index === iScore && dScore > 0) {
    name += 'half'
  }
  return name
}

const initData = value => {
  value = Number(value)
  if (isNaN(value)) {
    value = 5
  }
  value = Math.ceil(value)
  data.stars = Array.from(new Array(value + 1).keys()).slice(1)
}

const initRateScore = value => {
  value = Number(value)
  let intVal = parseInt(value)
  let decimalVal = value % 1
  if (!props.half) {
    intVal = decimalVal > 0 ? intVal + 1 : intVal
    decimalVal = 0
  }
  data.intScore = intVal
  data.decimalScore = decimalVal
}

const getRateScore = clientX => {
  const distance = clientX - data.pageX
  let score = 0
  if (distance > 0) {
    let width = uni.upx2px(Number(props.size))
    width = (data.pageW - width * props.max) / props.max + data.pageX
    score = distance / width
    let decimalScore = score % 1
    if (!props.half) {
      decimalScore = decimalScore > 0 ? 1 : 0
    } else {
      if (decimalScore > Number(props.halfRate)) {
        decimalScore = decimalScore <= 0.5 ? 0.5 : 1
      } else {
        decimalScore = 0
      }
    }
    score = parseInt(score) + decimalScore
    let max = Number(props.max)
    score = score > max ? max : score
  }

  initRateScore(score)

  emit('update:modelValue', score)
}

const touchstart = e => {
  if (isPC || props.disabled) return

  const { clientX, screenX } = e.changedTouches[0]
  getRateScore(clientX || screenX)
}

const touchmove = e => {
  if (isPC || props.disabled || !props.touchable) return
  const { clientX, screenX } = e.changedTouches[0]
  getRateScore(clientX || screenX)
}

const mousedown = e => {
  if (!isPC || props.disabled) return
  const { clientX } = e
  getRateScore(clientX)
  data.rated = true
}

const mousemove = e => {
  if (!isPC || !data.rated || props.disabled || !props.touchable) return
  const { clientX } = e
  getRateScore(clientX)
}

const mouseup = e => {
  if (!isPC || props.disabled || !props.touchable) return
  data.rated = false
}

watch(max, value => initData(value))
watch(modelValue, value => initRateScore(value))

onLoad(() => {
  initData(props.max)
  initRateScore(props.modelValue)
})

onMounted(() => {
  sleep(100).then(() => {
    getRect('.g-rate__wrap').then(size => {
      data.pageW = size.width
      data.pageX = size.left
    })
  })
})
</script>

<template>
  <view class="g-rate__wrap" ref="g_rate_wrap">
    <view
      class="g-rate__item"
      :class="{ 'g-rate__disabled': disabled }"
      v-for="(item, index) in data.stars"
      :key="index"
      @touchstart.stop="touchstart"
      @touchmove.stop="touchmove"
      @mousedown.stop="mousedown"
      @mousemove.stop="mousemove"
      @mouseup="mouseup"
    >
      <fui-icon
        :disabled="disabled"
        :name="getName(index, data.intScore, data.decimalScore)"
        :size="size"
        :color="index < data.intScore || (index == data.intScore && data.decimalScore > 0) ? activeColor : color"
      ></fui-icon>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.g-rate__wrap {
  @apply flex flex-row cursor-pointer justify-evenly items-center leading-none text-[0px] rounded-lg paint-contain bg-color-input h-10  box-border;
}

.g-rate__disabled {
  @if ($isH5) {
    cursor: not-allowed !important;
  }
}
</style>
