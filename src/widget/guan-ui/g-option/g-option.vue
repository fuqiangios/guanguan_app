<script setup>
import { inject, computed, onUnmounted, reactive, toRefs, watch } from 'vue'
import { isEmpty, isArray, isObject, has } from 'lodash'

const gFormItem = inject('gFormItem')

const validateError = computed(() => {
  return (gFormItem ? gFormItem.validateState : '') === 'error'
})

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [Array, Object, String],
    default() {
      return []
    }
  },
  options: {
    type: Array,
    default() {
      return []
    }
  },
  handler: {
    type: String,
    default: ''
  },
  min: {
    type: [Number, String],
    default: ''
  },
  max: {
    type: [Number, String],
    default: '99'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { options } = toRefs(props)

const emit = defineEmits(['update:modelValue'])

const data = reactive({
  options: []
})

watch(
  options,
  array => {
    if (!isEmpty(array) && !isEmpty(props.modelValue)) {
      let values = props.modelValue
      array = array.map(item => {
        if (isArray(values)) {
          item.checked = values.map(v => (has(v, 'value') ? v.value : v)).includes(item.value)
        } else if (isObject(values)) {
          values = has(values, 'value') ? values.value : values
          item.checked = values === item.value
        } else {
          item.checked = values === item.value
        }

        return item
      })
    }
    data.options = array
  },
  {
    immediate: true
  }
)

const onItemClick = (index, disbaled) => {
  if (props.disabled || disbaled) {
    return
  }
  if (validateError.value) {
    gFormItem.clearValidate()
  }
  let { options } = data
  let checkedList = options.map(item => (item.checked ? item.value : null)).filter(item => !isEmpty(item))
  let item = options[index]
  let isChecked = checkedList.includes(item.value)
  let result = ''
  if (props.multiple) {
    let min = Number(props.min) || 0
    let max = Number(props.max) || ''

    if (checkedList.length <= min && isChecked) {
      return
    }

    if (max !== '' && checkedList.length >= max && !isChecked) {
      return
    }

    options[index].checked = options[index].checked ? false : true

    if (props.handler) {
      try {
        options = eval(props.handler)(options, options[index].value, options[index].checked)
        console.log(options)
      } catch (error) {
        console.log(error)
      }
    }

    data.options = options

    result = options
      .filter(item => item.checked && !item.disabled)
      .map(item => ({ value: item.value, text: item.label ?? item.text }))
  } else {
    if (isChecked) {
      return
    }

    options = options.map((item, oIndex) => {
      item.checked = oIndex === index ? !item.checked : false
      return item
    })

    if (props.handler) {
      try {
        options = eval(props.handler)(options, options[index].value, options[index].checked)
      } catch (error) {
        console.log(error)
      }
    }

    data.options = options

    result = options.find(item => item.checked)

    result = {
      value: result.value,
      text: result.label ?? result.text
    }
  }
  emit('update:modelValue', result)
}

onUnmounted(() => {
  data.options = []
})
</script>

<template>
  <template v-if="multiple">
    <checkbox-group class="!w-full">
      <view :class="['g-option__wrap', { error: validateError }]">
        <view
          :class="['g-option__self', { error: validateError }]"
          v-for="(item, index) in data.options"
          :key="item.label ?? item.text"
          @tap.stop="onItemClick(index, item.disabled)"
        >
          <view class="label" :class="[{ disabled: disabled || item.disabled }]">{{ item.label ?? item.text }}</view>
          <view class="icon">
            {{ void (icon = item.checked ? 'icon-check-circle' : 'icon-circle') }}
            <fui-icon
              custom-prefix="feather"
              :name="icon"
              class="icon"
              :class="[{ disabled: disabled || item.disabled }]"
            />
          </view>
          <checkbox hidden :value="item.value" :checked="item.checked" />
          <view class="divide" v-if="index !== options.length - 1" />
        </view>
      </view>
    </checkbox-group>
  </template>
  <template v-else>
    <radio-group class="!w-full">
      <view :class="['g-option__wrap', { error: validateError }]">
        <view
          :class="['g-option__self', { error: validateError }]"
          v-for="(item, index) in data.options"
          :key="item.label ?? item.text"
          @tap.stop="onItemClick(index)"
        >
          <view class="label" :class="[{ checked: item.checked }, { disabled: disabled }]">{{
            item.label ?? item.text
          }}</view>
          <view class="icon">
            {{ void (icon = item.checked ? 'icon-check-circle' : 'icon-circle') }}
            <fui-icon
              custom-prefix="feather"
              :name="icon"
              class="icon"
              :class="[{ checked: item.checked }, { disabled: disabled }]"
            />
          </view>
          <radio hidden :value="item.value" :checked="item.checked" />
          <view class="divide" v-if="index !== options.length - 1" />
        </view>
      </view>
    </radio-group>
  </template>
</template>

<style lang="scss" scoped>
.g-option__wrap {
  @apply w-full box-border flex flex-col items-center relative rounded-lg paint-contain;
  &.error {
    @apply bg-red-100;
  }
}
.g-option__self {
  @apply relative w-full flex-1 flex items-center justify-between bg-color-input h-10 p-3 box-border;
  &.error {
    @apply bg-red-100;
    .label,
    .icon {
      @apply text-red-600 #{!important};
    }
    .divide {
      @apply bg-red-200;
    }
  }

  .label {
    @apply text-sm text-black;
  }

  .icon {
    @apply text-base text-black #{!important};
  }

  .disabled {
    @apply text-color-placeholder #{!important};
  }
  .divide {
    @apply absolute content-[""]  bottom-0 w-full h-[2rpx] bg-color-placeholder opacity-20;
  }
}
</style>
