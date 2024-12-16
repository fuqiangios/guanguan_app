<script setup>
import { isEmpty } from 'lodash'
import { inject, computed, onMounted } from 'vue'

const gFormItem = inject('gFormItem')

const validateError = computed(() => {
  return (gFormItem ? gFormItem.validateState : '') === 'error'
})

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const placeholder = computed(() => {
  return props.disabled ? '未选择内容' : props.placeholder
})

const onSelectTap = () => {
  if (props.disabled) {
    return
  }
  if (validateError.value) {
    gFormItem.clearValidate()
  }
  emit('click')
}
</script>

<template>
  <view class="g-select">
    <view :class="['g-select__wrap', { error: validateError }]" @tap="onSelectTap">
      <view :class="['g-select__block', { error: validateError }, { 'g-select__placeholder': isEmpty(value) }]">
        {{ isEmpty(value) ? placeholder : value }}
      </view>
      <view :class="['g-select__direct', { error: validateError }]" v-if="!disabled">
        <fui-icon custom-prefix="feather" name="icon-chevron-right" class="icon" />
      </view>
    </view>
    <slot name="picker" />
  </view>
</template>

<style lang="scss" scoped>
.g-select__wrap {
  @apply w-full flex flex-row flex-1 items-center  rounded-lg paint-contain;
  &.error {
    @apply bg-red-100;
  }
}

.g-select__block {
  @apply text-sm flex-1 bg-color-input h-10 p-3 box-border;
  &.error {
    @apply bg-red-100 text-red-600;
  }
}

.g-select__direct {
  @apply bg-color-input h-10 p-3 box-border flex items-center;
  &.error {
    @apply bg-red-100 text-red-600;
    .icon {
      @apply text-red-600 #{!important};
    }
  }
  .icon {
    @apply text-base text-black #{!important};
  }
}

.g-select__placeholder {
  @apply text-color-placeholder overflow-visible text-sm #{!important};
}
</style>
