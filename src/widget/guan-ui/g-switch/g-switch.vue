<script setup>
import { computed, onMounted, reactive, ref, toRefs } from 'vue'
import { sleep, getRect } from '../utils'

const props = defineProps({
  options: {
    type: Array,
    default() {
      return ['关闭', '开启']
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [Boolean, Number, String],
    default: 0
  }
})

const { modelValue } = toRefs(props)

const emit = defineEmits(['update:modelValue'])

const itemsRef = ref(null)
const barRef = ref(null)

const data = reactive({
  itemRect: { width: 0, height: 0 }
})

const getItemRect = () => {
  getRect('.g-switch__items-0').then(size => {
    data.itemRect = size
  })
}

const onInit = () => {
  sleep().then(getItemRect)
}

onMounted(onInit)

const barStyle = computed(() => {
  const style = {}
  style.width = `${data.itemRect.width}px`
  style.height = `${data.itemRect.height + 10}px`

  style.transform = `translateX(${props.modelValue * data.itemRect.width}px)`

  return style
})

const onOptionClick = index => {
  emit('update:modelValue', Boolean(index))
}
</script>

<template>
  <view class="g-switch__wrap">
    <view
      v-for="(item, index) in options"
      :key="index"
      class="g-switch__items"
      ref="itemsRef"
      :class="[`g-switch__items-${index}`]"
      @tap="onOptionClick(index)"
    >
      <text :class="[{ selected: modelValue == index }]">{{ item }} </text>
    </view>
    <view class="g-switch__bar" ref="barRef" :style="[barStyle]" />
  </view>
</template>

<style lang="scss" scoped>
.g-switch__wrap {
  @apply w-full box-border bg-color-input h-10 p-3 flex flex-row flex-1 items-center relative rounded-lg paint-contain;
}
.g-switch__items {
  @apply flex-1 text-center relative z-20;
  text {
    @apply text-sm text-color-extra transition-colors duration-300 ease-in-out;
    &.selected {
      @apply text-black font-semibold;
    }
  }
}
.g-switch__bar {
  @apply absolute rounded-md pt-3 pb-3 bg-color-switch opacity-80;

  transition-property: transform, color;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}
</style>
