<script setup>
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import { onMounted, reactive, getCurrentInstance } from 'vue'
import { useConfigStore } from '@/store/modules/config'
import { storeToRefs } from 'pinia'
import { isEmpty, has, merge, cloneDeep } from 'lodash'
import { showModal, isUrl } from '@/utils'

const store = useConfigStore()
const { defaultEnvData, customEnvData } = storeToRefs(store)

const initialState = reactive({
  key: '',
  form: {
    key: 'env',
    combine: false,
    label: '环境配置模板',
    rules: {
      BASE_URL: [...isUrl],
      OPERATION_URL: [...isUrl]
    },
    items: [
      {
        type: 'group',
        children: [
          {
            type: 'input',
            key: 'NAME',
            label: '配置名称',
            required: true,
            inference: 'string',
            props: {
              maxlength: 6,
              placeholder: '输入配置名称'
            }
          }
        ]
      },
      {
        type: 'group',
        children: [
          {
            type: 'input',
            key: 'BASE_URL',
            label: '平台网关地址',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入平台网关地址'
            }
          },
          {
            type: 'input',
            key: 'OPERATION_URL',
            label: '运营网关地址',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入运营网关地址'
            }
          }
        ]
      },
      {
        type: 'group',
        children: [
          {
            type: 'input',
            key: 'BASE_AUTH_SERVICE',
            label: '网关 AUTH 服务名称',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入网关 AUTH 服务名称'
            }
          },
          {
            type: 'input',
            key: 'BASE_CUST_SERVICE',
            label: '网关 CUST 服务名称',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入网关 CUST 服务名称'
            }
          },
          {
            type: 'input',
            key: 'BASE_SMS_SERVICE',
            label: '网关 SMS 服务名称',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入网关 SMS 服务名称'
            }
          }
        ]
      },
      {
        type: 'group',
        children: [
          {
            type: 'input',
            key: 'PROJECT_ID',
            label: 'Project ID',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入 Project ID'
            }
          },
          {
            type: 'input',
            key: 'PROJECT_SECRET',
            label: 'Project Secert',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入 Project Secert'
            }
          },
          {
            type: 'input',
            key: 'SYSTEM_ID',
            label: 'System ID',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入 System ID'
            }
          },
          {
            type: 'input',
            key: 'MINIO_BUCKET',
            label: 'MinIO 资源桶名称',
            required: true,
            inference: 'string',
            props: {
              placeholder: '输入MinIO Bucket'
            }
          }
        ]
      },
      {
        type: 'group',
        children: [
          {
            type: 'textarea',
            key: 'CUSTOM_HEADER',
            label: '自定义请求头',
            required: false,
            inference: 'string',
            props: { placeholder: '使用 JSON 格式，如 { "LOOK" : "UFO" }' }
          }
        ]
      }
    ]
  },
  data: {},
  isChanged: false,
  title: '新增环境配置'
})

onLoad(({ key }) => {
  let temp = cloneDeep(defaultEnvData.value)
  if (!key) {
    uni.setNavigationBarTitle({
      title: initialState.title
    })
    delete temp.NAME
  } else {
    initialState.key = key
    initialState.title = `编辑${key}`
    uni.setNavigationBarTitle({
      title: initialState.title
    })
    temp = cloneDeep(customEnvData.value)[key]

    let template = initialState.form
    template.items[0].children[0].disabled = true
    initialState.form = template
  }
  initialState.data = temp
})

const onCustomBack = async () => {
  if (!initialState.isChanged) {
    uni.navigateBack()
  } else {
    let res = await showModal({ title: '退出页面提示', content: '变更内容未保存，请确认是否返回' })
    if (!res) {
      return
    }
    uni.navigateBack()
  }
}

const onSubmit = config => {
  if (isEmpty(initialState.key) && store.isEnvExist(config.NAME)) {
    uni.showToast({ title: '环境配置名称已存在', icon: 'none' })
    return
  }
  store.updateCustomEnvData(config.NAME, config)
  uni.navigateBack({ complete: () => uni.showToast({ title: '环境已保存', icon: 'none' }) })
}

onBackPress(({ from }) => {
  if (from === 'navigateBack') {
    return false
  }
  onCustomBack()
  return true
})
</script>

<template>
  <g-scroll-view class="env-list-page" bottom-space-class="h-20">
    <template #header>
      <fui-nav-bar :title="initialState.title" is-go-back split-line is-custom-back @back="onCustomBack" />
    </template>
    <dynamic
      :template="initialState.form"
      :initial-data="initialState.data"
      :submit="onSubmit"
      @changed="e => (initialState.isChanged = e)"
    />
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.env-list-page {
  @apply h-[100vh] bg-white;
}
</style>
