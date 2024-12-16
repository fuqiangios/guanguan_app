<script setup>
import { computed, ref, toRefs, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: 1
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 99
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  negativeNumber: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const { modelValue } = toRefs(props)

const inputValue = ref(0)
const lastInput = ref(null)

const type = computed(() => {
  return props.negativeNumber ? 'text' : 'number'
})

const getScale = (value, step) => {
  let scale = 1
  let scaleVal = 1
  if (!Number.isInteger(step)) {
    scale = Math.pow(10, (step + '').split('.')[1].length)
  }
  if (!Number.isInteger(value)) {
    scaleVal = Math.pow(10, (value + '').split('.')[1].length)
  }
  return Math.max(scale, scaleVal)
}

const getValue = value => {
  value = Number(value)
  if (value < props.min) {
    value = props.min
  } else if (value > props.max) {
    value = props.max
  }
  return value
}

const calcNum = type => {
  if (
    props.disabled ||
    (inputValue.value == props.min && type === 'reduce') ||
    (inputValue.value == props.max && type === 'plus')
  ) {
    return
  }

  const scale = getScale(Number(inputValue.value), Number(props.step))
  let num = Number(inputValue.value) * scale
  let step = props.step * scale
  if (type === 'reduce') {
    num -= step
  } else if (type === 'plus') {
    num += step
  }
  let value = Number((num / scale).toFixed(String(scale).length - 1))
  if (value < props.min) {
    value = props.min
  } else if (value > props.max) {
    value = props.max
  }
  inputValue.value = String(value)
}

const onPlus = () => {
  calcNum('plus')
}

const onMinus = () => {
  calcNum('reduce')
}

function onBlur(e) {
  let value = e.detail.value
  if (value && !isNaN(Number(value))) {
    if (value.includes('.') && Number.isInteger(props.step)) {
      value = value.split('.')[0]
      value = getValue(value)
    }
    if (value > props.max) {
      value = props.max
    }
    if (!props.negativeNumber && value < props.min) {
      value = props.min
    }
  } else {
    value = lastInput.value
  }
  setTimeout(
    () => {
      e.detail.value = value
      inputValue.value = value
    },
    props.type === 'text' ? 100 : 0
  )
}

watch(
  modelValue,
  value => {
    inputValue.value = getValue(value)
  },
  { immediate: true }
)

watch(inputValue, (nValue, oValue) => {
  if (!isNaN(Number(nValue)) && Number(nValue) !== Number(oValue)) {
    const value = getValue(+nValue)
    lastInput.value = value

    emit('update:modelValue', +value)
  }
})
</script>

<template>
  <view class="g-input__number">
    <view class="g-input__number-minus" hover-class="hover" hover-stay-time="100" @tap="onMinus">
      <fui-icon custom-prefix="feather" name="icon-minus" class="icon" disabled />
    </view>
    <view class="g-input__number-self">
      <input
        :type="type"
        v-model="inputValue"
        placeholder="0"
        :disabled="disabled"
        class="g-input__number-input"
        placeholder-class="g-input__number-placeholder"
        @blur="onBlur"
      />
    </view>
    <view class="g-input__number-plus" hover-class="hover" hover-stay-time="100" @tap="onPlus">
      <fui-icon custom-prefix="feather" name="icon-plus" class="icon" disabled />
    </view>
  </view>
</template>

<style lang="scss" scoped>
@mixin button {
  @apply relative bg-color-input h-10 pt-3 pb-3 pl-10 pr-10 box-border flex items-center;
  .icon {
    @apply text-base text-color-dark #{!important};
  }
}

.g-input__number {
  @apply w-full box-border flex flex-row flex-1 items-center relative rounded-lg paint-contain divide-x-[1rpx] divide-color-placeholder;
  &-self {
    @apply text-sm flex-1 bg-color-input h-10 p-3 box-border;
  }
  &-input {
    @apply text-center;
  }

  &-minus {
    @include button;
  }

  &-plus {
    @include button;
  }

  &-placeholder {
    @apply text-color-placeholder overflow-visible text-sm #{!important};
  }
}
</style>
