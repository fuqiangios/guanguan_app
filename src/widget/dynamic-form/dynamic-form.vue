<script setup>
import { parseInference, t, isPopupType, dateTimeFormats, initial } from '.'
import { getCurrentInstance, inject, ref, reactive, provide, toRefs, watch, onUnmounted, onMounted } from 'vue'
import { isNumber, has, cloneDeep, isObject, isArray, isEmpty, isEqual, isFunction, unset } from 'lodash'
import { uploadFileToJiashan } from '@/api/common'
import { post, get, put, remove, upload } from '@/api'

import { useProjectStore } from '@/store/modules/project'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { useUserStore } from '@/store/modules/user'

const dayjs = inject('Dayjs')

const emit = defineEmits(['changed'])

const API_METHODS = {
  post,
  get,
  put,
  remove,
  upload
}

const STORE = {
  useProjectStore,
  useEnterpriseStore,
  useUserStore
}

const props = defineProps({
  permission: {
    type: String,
    default: ''
  },
  template: {
    type: Object,
    required: true
  },
  initialData: {
    type: Object,
    required: true
  },
  submit: {
    type: Function,
    default: null
  }
})

const { template, initialData } = toRefs(props)

const formRef = ref(null)

const formKey = ref(null)

const disabled = ref(true)

const loading = ref(false)

const initialState = {
  dictData: {},
  formData: {},
  sourceData: {},
  loadData: [],
  rulesData: [],
  gettersData: {}
}
const data = reactive({ ...initialState })

const onApiRequest = async (sourceData, loadData) => {
  let result = await Promise.all(
    Object.values(loadData).map(item => {
      if (!has(sourceData, item.sourceId) || !isObject(item.sourceParam)) {
        return Promise.resolve(false)
      }
      let { store, id, host, url, method, data, interceptors } = sourceData[item.sourceId]

      if (store && id) {
        return Promise.resolve(STORE[store]()[id])
      }

      data = data ?? {}

      if (has(item, 'sourceParam') && !isEmpty(item.sourceParam)) {
        data = { ...data, ...item.sourceParam }
      }

      if (interceptors && has(interceptors, 'request')) {
        try {
          data = eval(interceptors.request)(data)
        } catch {
          console.log('数据源前置拦截器异常')
        }
      }

      return API_METHODS[method](url, { to: host, data })
    })
  )

  if (result.includes(false)) {
    uni.showToast({ title: '部分字典数据载入失败', icon: 'none' })
  }

  Object.keys(loadData).map((key, index) => {
    try {
      let { interceptors } = sourceData[loadData[key]?.sourceId]
      if (interceptors && has(interceptors, 'response')) {
        result[index] = eval(interceptors.response)(result[index])
      }
    } catch {
      console.log('数据源响应拦截器异常')
    }

    data.dictData[key] = !result[index] ? [] : cloneDeep(result[index])
  })
  console.info('拉取字典数据', data.dictData)
}

let formDataStr = ''

const computedData = templateData => {
  if (isEmpty(templateData)) {
    return
  }

  const { combine, key, items, rules, sourceData, getters } = templateData

  if (combine && key) {
    formKey.value = key
  }

  let [loadData, rulesData, formData] = [{}, {}, {}]

  Object.entries(rules).forEach(([key, value]) => {
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

  data.rulesData = rulesData
  data.gettersData = getters

  items.forEach(item => {
    if (item.type === 'group' && has(item, 'children') && !isEmpty(item.children)) {
      item.children.forEach(({ key: itemKey, inference, type, children, sourceId, sourceParam }) => {
        if (sourceId && sourceParam) {
          loadData[itemKey] = { sourceId, sourceParam }
        }

        if (children && !isEmpty(children)) {
          Object.values(children).map(({ key: childKey, sourceId, sourceParam }) => {
            if (sourceId && sourceParam) {
              loadData[childKey] = { sourceId, sourceParam }
            }
          })
        }

        formData[itemKey] = parseInference(inference, type, itemKey, initialData.value)
      })
    } else if (item.type === 'list' && has(item, 'children') && !isEmpty(item.children)) {
      item.children.forEach(({ key: itemKey, inference, type, children, sourceId, sourceParam }) => {
        if (sourceId && sourceParam) {
          loadData[itemKey] = { sourceId, sourceParam }
        }

        if (children && !isEmpty(children)) {
          Object.values(children).map(({ key: childKey, sourceId, sourceParam }) => {
            if (sourceId && sourceParam) {
              loadData[childKey] = { sourceId, sourceParam }
            }
          })
        }
      })

      let valueList = initialData.value[item.key]

      if (!isArray(valueList) && isEmpty(valueList)) {
        formData[item.key] = []
      } else {
        formData[item.key] = valueList
      }
    }
  })
  formDataStr = JSON.stringify(formData)
  data.formData = formData

  onApiRequest(sourceData, loadData)
}

watch(() => props.template, computedData, { immediate: true })

watch(
  () => data.formData,
  nValue => {
    const isChanged = isEqual(JSON.stringify(nValue), formDataStr)
    disabled.value = isChanged
    emit('changed', !isChanged)
  },
  { deep: true }
)

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

const onSliderChange = (event, key) => {
  if (!isObject(data.formData[key])) {
    data.formData[key] = event.value
    return
  }

  data.formData[key].value = event.value

  if (event.endValue) {
    data.formData[key].endValue = event.endValue
  }
}

const onPickerClick = key => {
  data.formData[key].visable = true
}

const onPickerChange = ({ text, value }, key) => {
  resetPicker(key)

  data.formData[key].text = isArray(text) ? text.join('/') : text + ''
  data.formData[key].value = value
}

const dateTimeHandler = str => {
  if (str === 'today') {
    return dayjs().format('YYYY-MM-DD')
  }

  return str
}

const onDatePickerChange = (key, { startDate, endDate, ...args }, props) => {
  const { type = initial[t.DATE_TIME_PICKER].type, range } = props

  resetPicker(key)

  if (!range) {
    const { result } = args
    data.formData[key].value = result
    data.formData[key].text = dateTimeFormats(args)[type - 1]
  } else {
    data.formData[key].value = [startDate.result, endDate.result]
    data.formData[key].text = `${dateTimeFormats(startDate)[type - 1]}至${dateTimeFormats(endDate)[type - 1]}`
  }
}

const onCalendarPickerChange = ({ lunar, value }, key) => {
  resetPicker(key)
  lunar = JSON.parse(
    JSON.stringify(lunar).replaceAll('cYear', 'year').replaceAll('cMonth', 'month').replaceAll('cDay', 'day')
  )

  const lunar2Object = {
    startDate: lunar[0],
    endDate: lunar[1]
  }

  data.formData[key].text = `${dateTimeFormats(lunar2Object.startDate)[2]}至${dateTimeFormats(lunar2Object.endDate)[2]}`
  data.formData[key].value = value
}

const resetPicker = key => {
  data.formData[key].visable = false
}

const onListDataChange = (key, value) => {
  data.formData[key] = value
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
      console.log(value)
    }
    cleanData[key] = value
  })
  return cleanData
}

const onSave = async () => {
  try {
    loading.value = true

    let result = await formRef.value.validator()

    if (!result) {
      throw new Error('校验失败，请检查内容')
    }

    if (isEmpty(props.submit) && !isFunction(props.submit)) {
      return
    }

    let data = formKey.value ? { [formKey.value]: toClean() } : toClean()

    await props.submit(data)
  } catch (error) {
    console.log(error.message)
    uni.showToast({ title: error.message, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const forceUpdate = () => {
  const instance = getCurrentInstance()
  instance?.proxy?.$forceUpdate()
}

onMounted(forceUpdate)

onUnmounted(() => {
  Object.assign(data, initialState)
})
</script>

<template>
  <section class="g-dynamic-form">
    <g-form :model="data.formData" ref="formRef" :rules="data.rulesData">
      <section
        class="g-dynamic-form__wrap"
        :class="[{ divide: index !== props.template.items.length - 1 }]"
        v-for="(item, index) in props.template.items"
        :key="index"
      >
        <template v-if="item.type === 'group'">
          <g-form-item
            v-for="child in item.children"
            :key="child.key"
            :label="child.label"
            :required="child.required && !child.disabled"
            :condition="child.condition"
            :prop="child.key"
          >
            <template v-if="child.type === t.INPUT">
              <g-input
                :padding="[0]"
                :disabled="child.disabled ?? initial.global.disabled"
                :trim="child.trim ?? initial.global.trim"
                :placeholder="child.props.placeholder ?? initial[t.INPUT].placeholder"
                :maxlength="child.props.maxlength ?? initial[t.INPUT].maxlength"
                :minlength="child.props.minlength ?? initial[t.INPUT].minlength"
                :clearable="child.props.clearable ?? initial[t.INPUT].clearable"
                :type="child.props.type ?? initial[t.INPUT].type"
                :password="child.props.password ?? initial[t.INPUT].password"
                :append="child.props.append"
                v-model="data.formData[child.key]"
              />
            </template>
            <template v-else-if="child.type === t.TEXTAREA">
              <g-textarea
                :padding="[0]"
                :disabled="child.disabled ?? initial.global.disabled"
                :trim="child.props.trim ?? initial.global.trim"
                :borderTop="child.props.borderTop ?? initial[t.TEXTAREA].borderTop"
                :borderBottom="child.props.borderBottom ?? initial[t.TEXTAREA].borderBottom"
                :textareaBorder="child.props.border ?? initial[t.TEXTAREA].border"
                :height="initial[t.TEXTAREA].height"
                :min-height="initial[t.TEXTAREA].minHeight"
                :auto-height="child.props.autoHeight ?? initial[t.TEXTAREA].autoHeight"
                :placeholder="child.props.placeholder ?? initial[t.TEXTAREA].placeholder"
                :maxlength="child.props.maxlength ?? initial[t.TEXTAREA].maxlength"
                :minlength="child.props.minlength ?? initial[t.TEXTAREA].minlength"
                :is-counter="child.props.count ?? initial[t.TEXTAREA].count"
                v-model="data.formData[child.key]"
              />
            </template>
            <template v-else-if="child.type === t.UPLOAD">
              <g-upload
                :fileList="data.formData[child.key]"
                :filter="child.props?.filter"
                :compressed="child.props?.compressed"
                :max-duration="child.props?.maxDuration"
                :size="child.props?.size"
                :camera="child.props?.camera"
                :extension="child.props?.extension"
                :max="child.props?.max"
                :suffix="child.props?.suffix ?? initial[t.UPLOAD].suffix"
                :disabled="child.disabled ?? initial.global.disabled"
                @change="onUploadChange($event, child.key)"
              />
            </template>
            <template v-else-if="child.type === t.CHECKBOX">
              <block>
                {{
                  void (sources = (data.dictData[child.key] ?? child.optionItems) || initial[t.CHECKBOX].optionItems)
                }}
              </block>
              <g-option
                multiple
                v-model="data.formData[child.key]"
                :options="sources"
                :min="child.props?.min"
                :max="child.props?.max"
                :handler="child.props?.handler"
                :disabled="item.disabled ?? initial.global.disabled"
              />
            </template>
            <template v-else-if="child.type === t.RADIO">
              <block>
                {{ void (sources = (data.dictData[child.key] ?? child.optionItems) || initial[t.RADIO].optionItems) }}
              </block>
              <g-option
                v-model="data.formData[child.key]"
                :options="sources"
                :handler="child.props?.handler"
                :disabled="child.disabled ?? initial.global.disabled"
              />
            </template>
            <template v-else-if="isPopupType(child.type)">
              <g-select
                :padding="[0]"
                :placeholder="child.props.placeholder ?? initial[t.PICKER].placeholder"
                :value="data.formData[child.key].text"
                @click="onPickerClick(child.key)"
                :disabled="child.disabled ?? initial.global.disabled"
                transparent
                disabled
              >
                <template #picker>
                  <template v-if="child.type === t.PICKER">
                    <block>
                      {{
                        void (sources =
                          (data.dictData[child.key] ?? child.optionItems) || initial[t.PICKER].optionItems)
                      }}
                    </block>
                    <fui-picker
                      :title="child.label"
                      :value="data.formData[child.key].text"
                      :options="sources"
                      :layer="child.props.layer ?? initial[t.PICKER].layer"
                      :linkage="child.props.linkage ?? initial[t.PICKER].linkage"
                      :show="data.formData[child.key].visable"
                      @change="onPickerChange($event, child.key)"
                      @cancel="resetPicker(child.key)"
                    />
                  </template>

                  <template v-if="child.type === t.DATE_TIME_PICKER">
                    <fui-date-picker
                      :title="child.label"
                      :value="data.formData[child.key].value"
                      :range="child.props.range ?? initial[t.DATE_TIME_PICKER].range"
                      :start="child.props.start ?? initial[t.DATE_TIME_PICKER].start"
                      :end="child.props.end ?? initial[t.DATE_TIME_PICKER].end"
                      :max-date="dateTimeHandler(child.props.maxDate) ?? initial[t.DATE_TIME_PICKER].maxDate"
                      :min-date="dateTimeHandler(child.props.minDate) ?? initial[t.DATE_TIME_PICKER].minDate"
                      :type="child.props.type ?? initial[t.DATE_TIME_PICKER].type"
                      :show="data.formData[child.key].visable"
                      @change="onDatePickerChange(child.key, $event, child.props)"
                      @cancel="resetPicker(child.key)"
                    />
                  </template>

                  <template v-if="child.type === t.CALENDAR">
                    <fui-calendar-picker
                      :type="initial[t.CALENDAR].type"
                      :show-lunar="initial[t.CALENDAR].lunar"
                      :max-date="child.props.maxDate"
                      :min-date="child.props.minDate"
                      :value="child.formData[child.key].value"
                      :show="child.formData[child.key].visable"
                      @change="onCalendarPickerChange($event, child.key)"
                      @cancel="resetPicker(child.key)"
                    />
                  </template>
                </template>
              </g-select>
            </template>
            <template v-else-if="child.type === t.MULTI_STAGE">
              {{
                void (sources = (data.dictData[child.key] ?? child.optionItems) || initial[t.MULTI_STAGE].optionItems)
              }}
              <g-multi-stage
                v-model="data.formData[child.key]"
                :options="sources"
                :dict="data.dictData"
                :items="child.children"
                :min="child.props?.min"
                :max="child.props?.max"
                :handler="child.props?.handler"
                :disabled="child.disabled ?? initial.global.disabled"
              />
            </template>
          </g-form-item>
        </template>
        <template v-else-if="item.type === 'list'">
          <g-form-item
            :key="item.key"
            :label="item.label"
            :required="item.required && !item.disabled"
            :condition="item.condition"
            :prop="item.key"
          >
            <g-input-item
              :valueData="data.formData[item.key]"
              :form="item.children"
              :dictData="data.dictData"
              :rulesData="data.rulesData"
              :min="item.props?.min"
              :max="item.props?.max"
              :priview-key="item.props?.priviewKey"
              @change="onListDataChange(item.key, $event)"
            />
          </g-form-item>
        </template>
      </section>
    </g-form>

    <view class="submit" v-permission :data-permission="permission">
      <fui-button :disabled="disabled" @tap="onSave">保存</fui-button>
    </view>
    <fui-loading text="提交中..." v-if="loading" is-fixed is-mask />
  </section>
</template>

<style lang="scss" scoped>
.g-dynamic-form {
  @apply mb-3;

  .divide {
    &::after {
      @apply block content-[""] mt-6 w-full h-[1rpx] bg-zinc-100;
    }
  }

  &__item {
    padding: 20rpx 40rpx !important;
  }

  .submit {
    @apply fixed bottom-6 w-full box-border pl-6 pr-6 z-[100];
  }
}
</style>
