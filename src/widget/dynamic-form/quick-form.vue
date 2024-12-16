<script setup>
import { parseInference, t, initial } from '.'
import { getCurrentInstance, ref, reactive, provide, watch, onUnmounted, onMounted } from 'vue'
import { isNumber, has, isObject, isArray, isEmpty, isEqual, unset, cloneDeep } from 'lodash'
import { uploadFileToJiashan } from '@/api/common'

const emit = defineEmits(['update:modelValue', 'confirm', 'delete'])

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  dictData: {
    type: Object,
    default: () => {}
  },
  rulesData: {
    type: Object,
    default: () => {}
  },
  submit: {
    type: Function,
    default: null
  }
})

const initialState = {
  index: null,
  formData: {},
  templateData: [],
  dictData: {},
  rulesData: {}
}

const data = reactive({ ...initialState })

const title = ref(props.label ?? '')

const quickFormRef = ref(null)

const disabled = ref(true)

let formDataStr = ''

const onFileUpload = ({ path }) => {
  return new Promise(async resolve => {
    let res = await uploadFileToJiashan({ filePath: path })
    if (!res) {
      resolve(false)
      return
    }
    resolve(res)
  })
}

const onFileDelete = async fileName => {
  return new Promise(async resolve => {
    resolve(true)
  })
}

provide('onFileUpload', onFileUpload)
provide('onFileDelete', onFileDelete)

const onUploadChange = (event, key) => {
  data.formData[key] = []
  data.formData[key] = event.itemList.map(item => item.path) || []
}

const toClean = () => {
  let cleanData = {}
  Object.entries(data.formData).forEach(([key, value]) => {
    if (isObject(value)) {
      if (has(value, 'visable')) {
        unset(value, 'visable')
      }

      if (has(value, 'value') && isEmpty(value.value)) {
        value = null
      }
    }

    if (!isArray(value) && isEmpty(value)) {
      return
    }

    if (isNumber(value)) {
      value = value.toString()
    }
    cleanData[key] = value
  })
  return cleanData
}

const onClose = () => {
  emit('update:modelValue', false)
}

const onRemove = () => {
  emit('delete', { index: data.index })
  onClose()
}

const onSave = async () => {
  try {
    let result = await quickFormRef.value.validator()

    if (!result) {
      throw new Error('校验失败，请检查内容')
    }
    emit('confirm', { index: data.index, data: toClean() })
    onClose()
  } catch (error) {
    console.log(error.message)
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const forceUpdate = () => {
  const instance = getCurrentInstance()
  instance?.proxy?.$forceUpdate()
}

watch(
  () => data.formData,
  nValue => {
    const isChanged = isEqual(JSON.stringify(nValue), formDataStr)
    disabled.value = isChanged
  },
  { deep: true }
)

onMounted(forceUpdate)

onUnmounted(() => {
  Object.assign(data, initialState)
})

const init = (index, initialData = {}, templateData) => {
  if (isEmpty(templateData)) {
    onClose()
    uni.showToast({ title: '模板信息加载失败', icon: 'none' })
    return
  }

  initialData = cloneDeep(initialData)

  title.value = !isEmpty(initialData) ? `编辑${props.label}` : `新增${props.label}`

  data.index = index ?? null

  let rulesData = props.rulesData

  Object.entries(rulesData).forEach(([key, value]) => {
    let _value = value
    if (!isEmpty(_value)) {
      _value = _value.map(item => {
        if (item.pattern) {
          item.pattern = eval(item.pattern)
        }
        return item
      })

      rulesData[key] = value
    }
  })

  data.dictData = cloneDeep(props.dictData)
  data.rulesData = cloneDeep(rulesData)
  data.templateData = cloneDeep(templateData)

  let formData = {}

  templateData.forEach(({ key, inference, type }) => {
    formData[key] = parseInference(inference, type, key, initialData)
  })

  formDataStr = JSON.stringify(formData)

  data.formData = formData
}

defineExpose({ init })
</script>

<template>
  <fui-bottom-popup :show="modelValue">
    <g-scroll-view class="g-quick-form-popup" bottom-space-class="h-20">
      <template #header>
        <view class="g-quick-form-popup__header">
          <span class="label">{{ title }}</span>
          <view class="icon" @tap="onClose">
            <fui-icon custom-prefix="feather" name="icon-x" class="icon" />
          </view>
        </view>
      </template>
      <g-form :model="data.formData" ref="quickFormRef" :rules="data.rulesData">
        <section class="g-quick-form__wrap" v-for="(item, index) in data.templateData" :key="index">
          <g-form-item
            :label="item.label"
            :required="item.required && !item.disabled"
            :condition="item.condition"
            :prop="item.key"
          >
            <template v-if="item.type === t.INPUT">
              <g-input
                :padding="[0]"
                :disabled="item.disabled ?? initial.global.disabled"
                :trim="item.trim ?? initial.global.trim"
                :placeholder="item.props.placeholder ?? initial[t.INPUT].placeholder"
                :maxlength="item.props.maxlength ?? initial[t.INPUT].maxlength"
                :minlength="item.props.minlength ?? initial[t.INPUT].minlength"
                :clearable="item.props.clearable ?? initial[t.INPUT].clearable"
                :type="item.props.type ?? initial[t.INPUT].type"
                :password="item.props.password ?? initial[t.INPUT].password"
                :append="item.props.append"
                v-model="data.formData[item.key]"
              />
            </template>
            <template v-else-if="item.type === t.TEXTAREA">
              <g-textarea
                :padding="[0]"
                :disabled="item.disabled ?? initial.global.disabled"
                :trim="item.props.trim ?? initial.global.trim"
                :borderTop="item.props.borderTop ?? initial[t.TEXTAREA].borderTop"
                :borderBottom="item.props.borderBottom ?? initial[t.TEXTAREA].borderBottom"
                :textareaBorder="item.props.border ?? initial[t.TEXTAREA].border"
                :height="initial[t.TEXTAREA].height"
                :min-height="initial[t.TEXTAREA].minHeight"
                :auto-height="item.props.autoHeight ?? initial[t.TEXTAREA].autoHeight"
                :placeholder="item.props.placeholder ?? initial[t.TEXTAREA].placeholder"
                :maxlength="item.props.maxlength ?? initial[t.TEXTAREA].maxlength"
                :minlength="item.props.minlength ?? initial[t.TEXTAREA].minlength"
                :is-counter="item.props.count ?? initial[t.TEXTAREA].count"
                v-model="data.formData[item.key]"
              />
            </template>
            <template v-else-if="item.type === t.UPLOAD">
              <g-upload
                :fileList="data.formData[item.key]"
                :filter="item.props?.filter"
                :compressed="item.props?.compressed"
                :max-duration="item.props?.maxDuration"
                :size="item.props?.size"
                :camera="item.props?.camera"
                :extension="item.props?.extension"
                :max="item.props?.max"
                :suffix="item.props?.suffix ?? initial[t.UPLOAD].suffix"
                :disabled="item.disabled ?? initial.global.disabled"
                @change="onUploadChange($event, item.key)"
              />
            </template>
            <template v-else-if="item.type === t.CHECKBOX">
              <block>
                {{ void (sources = (data.dictData[item.key] ?? item.optionItems) || initial[t.CHECKBOX].optionItems) }}
              </block>
              <g-option
                multiple
                v-model="data.formData[item.key]"
                :options="sources"
                :min="item.props?.min"
                :max="item.props?.max"
                :handler="item.props?.handler"
                :disabled="item.disabled ?? initial.global.disabled"
              />
            </template>
            <template v-else-if="item.type === t.RADIO">
              <block>
                {{ void (sources = (data.dictData[item.key] ?? item.optionItems) || initial[t.RADIO].optionItems) }}
              </block>
              <g-option
                v-model="data.formData[item.key]"
                :options="sources"
                :handler="item.props?.handler"
                :disabled="item.disabled ?? initial.global.disabled"
              />
            </template>
            <template v-else-if="item.type === t.MULTI_STAGE">
              {{ void (sources = (data.dictData[item.key] ?? item.optionItems) || initial[t.MULTI_STAGE].optionItems) }}
              <g-multi-stage
                v-model="data.formData[item.key]"
                :options="sources"
                :dict="data.dictData"
                :items="item.itemren"
                :min="item.props?.min"
                :max="item.props?.max"
                :handler="item.props?.handler"
                :disabled="item.disabled ?? initial.global.disabled"
              />
            </template>
          </g-form-item>
        </section>
      </g-form>
      <view class="submit">
        <fui-row isFlex>
          <template v-if="data.index !== null">
            <fui-col>
              <fui-button type="danger" plain @tap="onRemove">移除</fui-button>
            </fui-col>
            <fui-col :offset="1">
              <fui-button :disabled="disabled" @tap="onSave">保存</fui-button>
            </fui-col>
          </template>
          <template v-else>
            <fui-col>
              <fui-button :disabled="disabled" @tap="onSave">保存</fui-button>
            </fui-col>
          </template>
        </fui-row>
      </view>
    </g-scroll-view>
  </fui-bottom-popup>
</template>

<style lang="scss" scoped>
.g-quick-form-popup {
  @apply h-[90vh];
  &__header {
    @apply relative p-3 flex flex-row justify-between items-center content-center text-base;

    .label {
      @apply relative flex items-center font-bold text-sm before:content-[''] text-zinc-600;
    }

    .icon {
      @apply text-base #{!important};
    }

    &::after {
      @apply content-[""] ml-3 absolute bottom-0 w-full h-[1rpx] bg-zinc-100;
    }
  }
  .submit {
    @apply fixed bottom-6 w-full box-border pl-6 pr-6 z-[100];
  }
}
</style>
