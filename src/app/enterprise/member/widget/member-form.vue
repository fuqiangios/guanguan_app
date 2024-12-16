<script setup>
import { reactive, ref, watch } from 'vue'
import { isEmpty } from 'lodash'

const props = defineProps({
  data: Object,
  active: {
    type: Boolean,
    default: false
  }
})

const formRef = ref(null)

const formData = reactive({
  name: '',
  mobile: '',
  job: { text: '', value: '', index: 0 },
  department: ''
})

const jobPickerOptions = [
  { text: '公司管理员', value: '1' },
  { text: '安全负责人', value: '2' },
  { text: '普通员工', value: '3' }
]
const isJobPickerShow = ref(false)

const resetJobPicker = () => (isJobPickerShow.value = false)

const onJobPickerShow = () => {
  if (!props.active) {
    return
  }
  isJobPickerShow.value = true
}

const onJobPickerChange = e => {
  resetJobPicker()
  formData.job = e
}

const formRules = [
  {
    name: 'name',
    rule: ['required', 'isChinese'],
    msg: ['请输入人员姓名', '人员姓名必须为中文']
  },
  {
    name: 'mobile',
    rule: ['required', 'isMobile'],
    msg: ['请输入人员手机号码', '请检查手机号码格式后重新输入']
  },
  {
    name: 'job',
    rule: ['required'],
    msg: ['请选择人员岗位']
  }
]

const onValidate = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validator(formData, formRules).then(resolve).catch(reject)
  })
}

defineExpose({ onValidate, formData })

const emit = defineEmits(['done'])
const emitMessageCache = ref(null)

watch(formData, ({ name, mobile, job }) => {
  const emitMessage = !isEmpty(name) && !isEmpty(mobile) && !isEmpty(job.value)
  if (emitMessageCache.value === emitMessage) {
    return
  }
  emit('done', emitMessage)

  emitMessageCache.value = emitMessage
})

if (!isEmpty(props.data)) {
  watch(
    props.data,
    data => {
      let { name, mobile, job, department } = data
      formData.name = name
      formData.mobile = mobile
      formData.department = department

      const options = jobPickerOptions.find(item => item.value === job)
      if (!options) {
        return
      }
      formData.job = options
    },
    {
      immediate: true
    }
  )
}
</script>

<template>
  <view class="member-form">
    <fui-form ref="formRef">
      <fui-form-item label="姓名" :asterisk="active">
        <fui-input placeholder="请输入人员姓名" :disabled="!active" v-model="formData.name"></fui-input>
      </fui-form-item>
      <fui-form-item label="手机号" :asterisk="active">
        <fui-input placeholder="请输入人员手机号码" :disabled="!active" v-model="formData.mobile"></fui-input>
      </fui-form-item>
      <fui-form-item
        label="岗位"
        :asterisk="active"
        :disabled="!active"
        :arrow="active"
        :highlight="active"
        @click="onJobPickerShow"
      >
        <fui-input placeholder="请选择人员岗位" :value="formData.job.text" transparent disabled></fui-input>
        <fui-picker
          title="人员岗位选择"
          linkage
          :value="formData.job.text"
          :options="jobPickerOptions"
          :show="isJobPickerShow"
          @change="onJobPickerChange"
          @cancel="resetJobPicker"
        ></fui-picker>
      </fui-form-item>
      <fui-form-item label="部门">
        <fui-input placeholder="请输入人员部门" :disabled="!active" v-model="formData.department"></fui-input>
      </fui-form-item>
    </fui-form>
  </view>
</template>

<style lang="scss" scoped></style>
