<script setup>
import { onBackPress } from '@dcloudio/uni-app'
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import { isEmpty } from 'lodash'
import { editEnterpriseDetail } from '@/api/enterprise'
import { sleep } from '@/widget/guan-ui/utils'

const title = ref('')

const data = reactive({
  isChanged: false,
  template: {},
  valueData: {},
  formData: {}
})

const onSubmit = async data => {
  let result = await editEnterpriseDetail(data)
  if (!result) {
    return
  }
  try {
    uni.$emit('<EnterpriseList>:refresh', {})
  } catch (error) {
    console.log(error)
  }

  sleep(500).then(() => uni.navigateBack())
}

const onCustomBack = () => {
  if (!data.isChanged) {
    uni.navigateBack()
  } else {
    uni.showModal({
      title: '退出页面提示',
      content: '变更内容未保存，请确认是否返回',
      success: res => {
        if (res.cancel) {
          return
        } else if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  }
}

onBackPress(({ from }) => {
  if (from === 'navigateBack') {
    return false
  }
  onCustomBack()
  return true
})

onMounted(() => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }
  uni.setNavigationBarTitle({
    title: params.title
  })

  title.value = `${params.title || '内容'}编辑`

  data.template = params.template || {}
  data.valueData = params.valueData || {}
})

onUnmounted(() => {
  data.template = {}
  data.valueData = {}
  data.formData = {}
})
</script>

<template>
  <g-scroll-view class="enterprise-profile-edit" bottom-space-class="h-20">
    <template #header>
      <fui-nav-bar :title="title" is-go-back split-line is-custom-back @back="onCustomBack" />
    </template>
    <dynamic
      :template="data.template"
      :initial-data="data.valueData"
      permission="EnterpriseProfileEdit"
      :submit="onSubmit"
      @changed="e => (data.isChanged = e)"
    />
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.enterprise-profile-edit {
  @apply h-[100vh] bg-white;
}
</style>
