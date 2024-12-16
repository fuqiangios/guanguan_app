<script setup>
import { onBackPress } from '@dcloudio/uni-app'
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import { addEnterpriseMember, modifyEnterpriseMember } from '@/api/enterprise'
import { sleep } from '@/widget/guan-ui/utils'
import { useProjectStore } from '@/store/modules/project'
import { useEnterpriseStore } from '@/store/modules/enterprise'

const meta = reactive({
  title: '新增人员',
  userId: ''
})

const data = reactive({
  isChanged: false,
  template: {},
  valueData: {}
})

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
  try {
    const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]

    if (params?.userId) {
      meta.userId = params.userId
      meta.title = '编辑人员信息'
    }

    data.valueData = params?.valueData
  } catch (error) {
    meta.userId = ''
    data.valueData = {}
  } finally {
    uni.setNavigationBarTitle({
      title: meta.title
    })

    const { userTemplateData } = useProjectStore()

    data.template = userTemplateData[0] || {}
  }
})

onUnmounted(() => {
  data.template = {}
  data.valueData = {}
})

const onSubmit = async data => {
  let result = false
  data.role = data.role.map(item => item.value)

  if (!meta.userId) {
    const { defaultOrganId } = useEnterpriseStore()
    data = {
      ...data,
      ...{
        organId: defaultOrganId,
        userSex: '',
        predomain: '',
        domain: [],
        expertDb: '',
        title: '',
        region: {},
        preregion: [],
        residentAddr: '',
        politics: '',
        email: '',
        education: [],
        aptitudeCrt: [],
        license: [],
        insured: true,
        unitInsuranceProve: [],
        resetPassword: false
      }
    }

    result = await addEnterpriseMember(data)
  } else {
    data.id = meta.userId
    result = await modifyEnterpriseMember(data)
  }
  if (!result) {
    return
  }
  try {
    // uni.$emit('<MemberDetail>:refresh', meta.userId)
    uni.$emit('<MemberList>:refresh', {})
  } catch (error) {
    console.log(error)
  }

  sleep(500).then(() => {
    let delta = 1
    if (meta.userId) {
      delta++
    }
    uni.navigateBack({ delta })
  })
}
</script>

<template>
  <g-scroll-view class="enterprise-member-edit" bottom-space-class="h-20">
    <template #header>
      <fui-nav-bar :title="meta.title" is-go-back split-line is-custom-back @back="onCustomBack" />
    </template>
    <dynamic
      :template="data.template"
      :initial-data="data.valueData"
      :permission="!data.userId ? 'EnterpriseMemberAdd' : 'EnterpriseMemberEdit'"
      :submit="onSubmit"
      @changed="e => (data.isChanged = e)"
    />
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.enterprise-member-edit {
  @apply h-[100vh] bg-white;
}
</style>
