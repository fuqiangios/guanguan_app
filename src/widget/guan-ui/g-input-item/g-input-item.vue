<script setup>
import { isEmpty, isObject, isString } from 'lodash'
import { inject, computed, reactive, ref, toRefs } from 'vue'

const gFormItem = inject('gFormItem')

const validateError = computed(() => {
  return (gFormItem ? gFormItem.validateState : '') === 'error'
})

const emit = defineEmits(['change'])

const props = defineProps({
  placeholder: {
    type: String,
    default: '未补充'
  },
  previewKey: {
    type: String,
    default: ''
  },
  valueData: {
    type: Array,
    default: () => []
  },
  form: {
    type: Object,
    default: () => {},
    required: true
  },
  dictData: {
    type: Object,
    default: () => {}
  },
  rulesData: {
    type: Object,
    default: () => {}
  },
  max: {
    type: [Number, String],
    default: 999
  },
  min: {
    type: [Number, String],
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const { valueData, dictData, rulesData } = toRefs(props)

const quickFormRef = ref(null)

const data = reactive({
  isShowForm: false
})

const onItemClick = (index, detail = {}) => {
  if (validateError.value) {
    gFormItem.clearValidate()
  }
  quickFormRef.value.init(index, detail, props.form)
  data.isShowForm = true
}

const previewData = computed(() => {
  try {
    return valueData.value.map(item => {
      if (!isObject(item)) {
        throw new Error('非标准 ListData 数据')
      }
      let label = Object.entries(item)
        .map(([key, value]) => {
          if (props.previewKey && key === props.previewKey) {
            return value
          } else {
            return isString(value) ? value : false
          }
        })
        .filter(item => item !== false)[0]
      return { label, item }
    })
  } catch (error) {
    console.log(error)
    return []
  }
})

const onConfirm = ({ index, data }) => {
  let _valueData = valueData.value
  if (index !== undefined && index >= 0 && !isEmpty(_valueData[index])) {
    _valueData[index] = data
  } else {
    _valueData.push(data)
  }
  emit('change', _valueData)
}

const onDelete = ({ index }) => {
  let _valueData = valueData.value
  if (index !== undefined && index >= 0 && !isEmpty(_valueData[index])) {
    _valueData = _valueData.filter((_, num) => num !== index)
  } else {
    uni.showToast({ title: '删除失败' })
  }
  console.log(_valueData)
  emit('change', _valueData)
}
</script>

<template>
  <view class="g-input-item">
    <view v-for="(item, index) in previewData" :key="index" :class="['g-input-item__wrap', { error: validateError }]">
      <view
        :class="['g-input-item__block', { error: validateError }, { 'g-input-item__placeholder': isEmpty(item.label) }]"
        @tap="onItemClick(index, item.item)"
      >
        <fui-overflow-hidden>{{ isEmpty(item.label) ? placeholder : item.label }}</fui-overflow-hidden>
      </view>
      <view :class="['g-input-item__direct', { error: validateError }]" v-if="!disabled">
        <fui-icon custom-prefix="feather" name="icon-chevron-right" class="icon" />
      </view>
    </view>
    <view class="g-input-item__wrap" :class="{ error: validateError }" v-if="previewData.length < props.max">
      <view class="g-input-item__block" :class="{ error: validateError }" @tap="onItemClick()">
        <fui-overflow-hidden> 添加{{ gFormItem.label ?? '' }} </fui-overflow-hidden>
      </view>
    </view>
    <quick
      v-model="data.isShowForm"
      ref="quickFormRef"
      :label="gFormItem.label"
      :template="form"
      :initialData="data.formData"
      :dictData="dictData"
      :rulesData="rulesData"
      @confirm="onConfirm"
      @delete="onDelete"
    />
  </view>
</template>

<style lang="scss" scoped>
.g-input-item__wrap {
  @apply w-full flex flex-row flex-1 items-center rounded-lg paint-contain mb-3;
  &.error {
    @apply bg-red-100;
  }
}

.g-input-item__block {
  @apply flex w-10 items-center text-sm flex-1 bg-color-input h-10 p-3 box-border;
  &.error {
    @apply bg-red-100 text-red-600;
  }
}

.g-input-item__direct {
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

.g-input-item__placeholder {
  @apply text-color-placeholder overflow-visible text-sm #{!important};
}
</style>
