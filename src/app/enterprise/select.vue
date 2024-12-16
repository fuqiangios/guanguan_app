<script setup>
import { onMounted, ref } from 'vue'
import { isEmpty, isArray } from 'lodash'
import { mobileFormat } from '@/utils'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { useProjectStore } from '@/store/modules/project'

const mobile = ref('')

const { transformRole } = useProjectStore()

const { enterpriseList, setCurrentEnterprise } = useEnterpriseStore()

onMounted(() => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }
  mobile.value = mobileFormat(params.mobile)
})

const avatarText = str => str.slice(0, 1)

const avatarUrl = value => {
  if (isArray(value) && !isEmpty(value)) {
    return value[0]
  }
  return ''
}
const onSelectEnterprise = async ({ currentTarget: { dataset } }) => {
  if (!dataset.enterpriseId) {
    return
  }

  try {
    let res = await setCurrentEnterprise(dataset.enterpriseId)
    if (!res) {
      throw new Error('企业信息查询失败')
    }
    uni.switchTab({ name: 'Dashboard' })
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}
</script>

<template>
  <g-scroll-view class="enterprise-select-page">
    <template #header>
      <fui-nav-bar is-go-back title=" " />
    </template>
    <view class="guide-text">
      <view class="info">你可进入以下企业</view>
      <text class="font-semibold">{{ mobile }}</text>
      <span class="desc"> 已在以下企业或组织绑定了账号，你可进入以下任一企业或组织</span>
    </view>
    <view class="enterprise-list">
      <view
        class="items"
        v-for="item in enterpriseList"
        :key="item.companyId"
        :data-enterprise-id="item.companyId"
        @tap.stop="onSelectEnterprise"
      >
        <view class="avatar">
          <template v-if="avatarUrl(item?.entLogo)">
            <fui-avatar shape="square" size="middle" :src="avatarUrl(item?.entLogo)" background="transparent" />
          </template>
          <template v-else>
            <fui-avatar shape="square" size="middle" :text="avatarText(item.companyName)" />
          </template>
        </view>
        <view class="info">
          <span class="company-name">{{ item.companyName }}</span>
          <view class="append">
            <span class="name">{{ item.userName }}</span>
            <template v-if="!!item.roleCodeList.length">
              <span class="role">{{ transformRole(item.roleCodeList) }}</span>
            </template>
          </view>
        </view>
        <fui-icon name="arrowright" class="icon" />
      </view>
    </view>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.enterprise-select-page {
  @apply bg-white;
  .guide-text {
    @apply m-3;
    .info {
      @apply pt-3 pb-3 text-2xl font-medium text-color-primary;
    }

    .desc {
      @apply text-sm text-color-dark;
    }
  }
  .enterprise-list {
    @apply ml-3 mr-3;
    .items {
      @apply p-3 flex mb-3 rounded-xl items-center border-[1px] border-gray-100;
      .avatar {
        @apply mr-3;
      }
      .info {
        @apply flex-1 inline-flex flex-col;
        .company-name {
          @apply font-semibold text-color-dark;
        }
        .append {
          @apply pt-1 text-sm text-color-extra;
          .name {
            @apply after:content-["/"] after:pl-1 after:pr-1;
          }
          .role {
            @apply [&:not(:first)]:after:content-['、'];
          }
        }
      }
      .icon {
        @apply text-xl text-gray-300 #{!important};
      }
    }
  }
}
</style>
