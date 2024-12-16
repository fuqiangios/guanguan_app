<script setup>
import { storeToRefs } from 'pinia'
import { ref, reactive, computed, inject } from 'vue'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { isMechanism } from '@/utils'

const { Enterprise, Mechanism } = inject('Constant')

const { currentEnterpriseDetail } = storeToRefs(useEnterpriseStore())

const current = reactive(isMechanism ? Mechanism : Enterprise)

const enterpriseData = reactive({
  name: currentEnterpriseDetail.value[current.NAME],
  logo: currentEnterpriseDetail.value[current.LOGO]?.[0] || '',
})

const qrcode = ref('')

const value = computed(() => {
  return JSON.stringify({
    entId: currentEnterpriseDetail.value?.enterpriseId,
    companyId: currentEnterpriseDetail.value?.companyId,
    code: currentEnterpriseDetail.value?.unifiedCreditCode
  })
})
const avatarText = computed(() => enterpriseData.name.slice(0, 1))

const onChange = ({ canvasId }) => {
  uni.canvasToTempFilePath({
    canvasId: canvasId,
    success(res) {
      qrcode.value = res.tempFilePath
      console.log(res.tempFilePath)
    }
  })
}

const onSave = () => {
  uni.saveImageToPhotosAlbum({
    filePath: qrcode.value,
    success() {
      uni.showToast({ title: '保存成功', icon: 'none' })
    },
    fail(rej) {
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  })
}
</script>

<template>
  <view class="enterprise-qrcode-page">
    <fui-nav-bar is-go-back />

    <section class="qrcode-panel">
      <fui-card full headerLine footerLine>
        <view class="content">
          <fui-qrcode :value="value" width="350" height="350" @ready="onChange" />
        </view>
        <template #header>
          <view class="label">
            <template v-if="enterpriseData.logo">
              <fui-avatar size="small" :src="enterpriseData.logo" background="transparent" />
            </template>
            <template v-else>
              <fui-avatar size="small" :text="avatarText"></fui-avatar>
            </template>
            <text>{{ enterpriseData.name }}</text>
          </view>
        </template>
        <template #footer>
          <view class="action">
            <fui-button text="保存到相册" plain type="primary" @tap="onSave">
              <template #left>
                <fui-icon custom-prefix="feather" name="icon-download" class="icon" />
              </template>
            </fui-button>
          </view>
        </template>
      </fui-card>
    </section>
  </view>
</template>

<style lang="scss" scoped>
.enterprise-qrcode-page {
  .qrcode-panel {
    @apply m-3  bg-white rounded-xl overflow-clip;
    .content {
      @apply pl-3 pr-3 pt-6 pb-6 flex items-center justify-center;
    }
    .label {
      @apply flex items-center p-3 text-center text-base font-semibold text-neutral-600;
      .fui-avatar__wrap {
        @apply mr-3 #{!important};
      }
    }
    .action {
      @apply p-3;
      .icon {
        @apply mr-1 text-lg text-[var(--fui-color-primary)] #{!important};
      }
    }
  }
}
</style>
