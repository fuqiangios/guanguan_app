<script setup>
import { reactive, ref, inject } from 'vue'
import { isUrl, UUID } from '@/utils'
import { useConfigStore } from '@/store/modules/config'
import { storeToRefs } from 'pinia'

const { Image } = inject('Constant')

const emit = defineEmits(['update:modelValue', 'update'])
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const store = useConfigStore()
const { localApps } = storeToRefs(store)

const initialState = reactive({
  data: localApps,
  form: { name: '', url: '' },
  rules: {
    url: [...isUrl]
  }
})

const localAppsRef = ref(null)

const onAdd = async () => {
  let result = false

  result = await localAppsRef.value.validator()

  if (!result) {
    return
  }
  const { name, url } = initialState.form

  store.addApplication({
    appName: name,
    appId: UUID(),
    appImage: '/static/mp/debug.png',
    appUrl: url
  })
}
const onClose = () => {
  localAppsRef.value.clearValicationField()
  initialState.form = {}
  emit('update:modelValue', false)
}
</script>

<template>
  <fui-bottom-popup :show="modelValue" :maskClosable="true" @close="onClose">
    {{ void (extraTips = initialState.data.length > 0 ? '（点击应用即可移除）' : '') }}
    <g-card-header label="本地调试应用列表" :extra="extraTips" />
    <view class="local-application-wrap">
      <view class="local-application-wrap__items">
        <template v-if="initialState.data.length">
          <fui-grid :columns="4" :showBorder="false" class="!pt-1 !pb-1">
            <fui-grid-item v-for="item in initialState.data" :key="item.appId" @tap="store.removeApplication(item)">
              <view class="item">
                <view class="icon">
                  <fui-lazyload :src="item.appImage" class="icon" width="90" height="90" />
                </view>
                <text>{{ item.appName }}</text>
              </view>
            </fui-grid-item>
          </fui-grid>
        </template>
        <template v-else>
          <fui-empty :src="Image.Empty.Applet" class="empty" />
        </template>
      </view>

      <view class="form">
        <g-form class="pb-6" :model="initialState.form" ref="localAppsRef" :rules="initialState.rules">
          <g-form-item label="应用名称" required prop="name">
            <g-input v-model="initialState.form.name" placeholder="请输入应用名称" :maxlength="10" :minlength="10">
            </g-input>
          </g-form-item>
          <g-form-item label="应用地址" required prop="url">
            <g-input v-model="initialState.form.url" placeholder="http(s)://192.168.xx.xx"> </g-input>
          </g-form-item>
        </g-form>
        <view class="pl-6 pr-6 pt-3">
          <fui-button @tap="onAdd" :disabled="initialState.data.length > 7">新增应用</fui-button>
        </view>
      </view>
    </view>
  </fui-bottom-popup>
</template>

<style lang="scss" scoped>
.local-application-wrap {
  @apply relative h-[60vh];
  &__items {
    @apply h-[30vh] flex justify-center;

    .empty {
      ::v-deep uni-image {
        @apply h-40 w-[13.2rem] #{!important};
      }
    }

    .item {
      @apply h-full w-full flex flex-col justify-center items-center;
      .icon {
        @apply flex items-center justify-center rounded-xl overflow-clip #{!important};
      }
      text {
        @apply mt-3 text-xs;
      }
    }
  }
  .form {
    @apply h-[34vh] fixed left-0 bottom-3 w-full;
    &:before {
      @apply content-[""] ml-6 absolute top-0 w-full h-[1rpx] bg-zinc-100;
    }
  }
}
</style>
