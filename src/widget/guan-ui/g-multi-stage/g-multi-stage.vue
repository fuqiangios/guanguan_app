<script setup>
import { reactive, inject, computed } from 'vue'
import { isEmpty, isArray, isObject, has, unset } from 'lodash'

const emit = defineEmits(['update:modelValue'])
const gFormItem = inject('gFormItem')

const validateError = computed(() => {
  return (gFormItem ? gFormItem.validateState : '') === 'error'
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {}
  },
  dict: {
    type: Object,
    default: () => {}
  },
  options: {
    type: Array,
    default: () => []
  },
  items: {
    type: Object,
    default: () => {},
    required: true
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

const data = reactive({
  expaned: {},
  checkedData: props.modelValue ?? {}
})

const onItemClick = key => {
  if (has(props.dict, key) && !isEmpty(props.dict[key])) {
    data.expaned[key] = !data.expaned[key] ?? true
  } else {
    if (validateError.value) {
      gFormItem.clearValidate()
    }
    data.checkedData[key] = !data.checkedData[key]
    if (!data.checkedData[key]) {
      unset(data.checkedData, key)
    }
  }
  emit('update:modelValue', data.checkedData)
}

const onChildClick = (itemKey, child) => {
  if (validateError.value) {
    gFormItem.clearValidate()
  }

  let checked = isArray(data.checkedData[itemKey]) ? data.checkedData[itemKey] ?? [] : []

  const isExist = checked.find(item => item.value === child.value)

  if (isExist) {
    checked = checked.filter(item => item.value !== child.value)
  } else {
    checked.push({ text: child.label ?? child.text, value: child.value })
  }

  if (isEmpty(checked)) {
    unset(data.checkedData, itemKey)
  } else {
    data.checkedData[itemKey] = checked
  }

  emit('update:modelValue', data.checkedData)
}

const valuesData = computed(() => {
  let values = {}
  Object.entries(data.checkedData).forEach(([key, value]) => {
    if (isArray(value)) {
      values[key] = value.map(child => (isObject(child) && has(child, 'value') ? child.value : child))
    } else {
      values[key] = value
    }
  })
  return values
})
</script>

<template>
  <view :class="['g-multi-stage__wrap', { error: validateError }]">
    <view
      :class="['g-multi-stage__self', { error: validateError }]"
      v-for="(item, index) in props.options"
      :key="item.label ?? item.text"
      @tap.stop="onItemClick(item.value)"
    >
      {{ void (model = items[item.value]) }}
      {{ void (isChildExist = has(dict, item.value) && !isEmpty(dict[item.value])) }}
      <view class="header" :class="{ split: isChildExist && data.expaned?.[item.value] }">
        <view class="label" :class="[{ disabled: disabled || item.disabled }]">{{ item.label ?? item.text }} </view>
        <template v-if="!isChildExist">
          <view class="icon">
            <fui-icon
              custom-prefix="feather"
              :name="data.checkedData?.[item.value] ? 'icon-check-circle' : 'icon-circle'"
              class="icon"
              :class="[{ disabled: disabled || item.disabled }]"
            />
          </view>
        </template>

        <template v-else>
          <view class="icon" :class="{ active: isChildExist && data.expaned?.[item.value] }">
            <fui-icon custom-prefix="feather" name="icon-chevron-down" class="icon" />
          </view>
        </template>
      </view>
      <template v-if="isChildExist">
        <view class="wrap" :style="{ height: data.expaned[item.value] ? `${dict[item.value].length * 3}rem` : 0 }">
          <view
            :class="['items', { split: childIndex !== child.length - 1 }]"
            v-for="(child, childIndex) in dict[item.value]"
            :key="child.dictId"
            @tap.stop="onChildClick(item.value, child)"
          >
            <view class="label" :class="[{ disabled: disabled || item.disabled }]">
              {{ child.label ?? child.text }}
            </view>
            <view class="icon">
              {{
                void (icon = (isArray(valuesData[item.value]) ? valuesData[item.value] ?? [] : []).includes(child.value)
                  ? 'icon-check-circle'
                  : 'icon-circle')
              }}
              <fui-icon
                custom-prefix="feather"
                :name="icon"
                class="icon"
                :class="[{ disabled: disabled || item.disabled }]"
              />
            </view>
          </view>
        </view>
      </template>

      <view class="divide" v-if="index !== options.length - 1" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.g-multi-stage__wrap {
  @apply w-full box-border flex flex-col items-center relative rounded-lg paint-contain;
  &.error {
    @apply bg-red-100;
  }
}

.g-multi-stage__self {
  @apply relative w-full flex-1 bg-color-input h-10  box-border;

  &.error {
    @apply bg-red-100;
    .header,
    .items {
      .label,
      .icon {
        @apply text-red-600 #{!important};
      }
    }
    .divide,
    .split::after {
      @apply bg-red-200;
    }
  }

  .header,
  .items {
    @apply relative p-3 flex items-center justify-between;
    .label {
      @apply text-sm text-black;
    }

    .icon {
      &.active {
        @apply rotate-180;
      }
      @apply text-base text-black transition-transform will-change-transform duration-300 ease-linear #{!important};
    }
  }

  .split {
    &::after {
      @apply absolute content-[""]  bottom-0 w-full h-[2rpx] bg-color-placeholder opacity-20;
    }
  }

  .wrap {
    @apply h-0 transition-height will-change-transform duration-150 ease-linear;
  }

  .items {
    @apply pt-3 pb-3 pl-6;
  }
  .disabled {
    @apply text-color-placeholder #{!important};
  }
  .divide {
    @apply absolute content-[""] ml-3 bottom-0 w-full h-[2rpx] bg-color-placeholder opacity-20;
  }
}
</style>
