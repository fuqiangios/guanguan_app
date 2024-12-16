<script setup>
import { computed, inject, reactive } from 'vue'
import { useProjectStore } from '@/store/modules/project'
import { useEnterpriseStore } from '@/store/modules/enterprise'
import { isMechanism } from '@/utils'
import { throttle } from 'lodash'
import { routeTo } from '@/router'
import { isEmpty } from 'lodash'

import useSupply from '@/hooks/useSupply'

const { Enterprise, Mechanism } = inject('Constant')

const enterpriseStore = useEnterpriseStore()

const { querySupplyState } = useSupply()

const current = reactive(isMechanism ? Mechanism : Enterprise)

const enterpriseData = computed(() => {
  if (isEmpty(enterpriseStore.currentEnterpriseDetail)) {
    return {}
  }

  return {
    logo: enterpriseStore.currentEnterpriseDetail[current.LOGO]?.[0] || '',
    avatar: enterpriseStore.currentEnterpriseDetail[current.NAME]?.slice(0, 1),
    title: enterpriseStore.currentEnterpriseDetail[current.NAME]
    }
})

const status = computed(() => {
  return useProjectStore().statusData
})

const computedScoreType = score => {
  const numericScore = parseFloat(score)

  let colorType = ''
  if (numericScore < 65) {
    colorType = 'danger'
  } else if (numericScore >= 65 && numericScore < 81 ) {
    colorType = 'success'
  } else if (numericScore >= 81 && numericScore < 96) {
    colorType = 'warning'
  } else {
    colorType = 'best'
  }

  return colorType
}

const jumpTo = ({ currentTarget: { dataset } }) => {
  // TODO: 权限逻辑处理
  if (dataset.disabled) {
    return
  }

  let result = querySupplyState(dataset.name)

  if (result) {
    uni.navigateTo({ name: dataset.name })
  }
}

const demo = computed(() => {
  let { currentEnterpriseDetail } = enterpriseStore,
    score = 0

  if (currentEnterpriseDetail) {
    score = currentEnterpriseDetail?.score ?? 0
  }

  return {
    ENTERPRISE_SCORE: `${score}分`,
    ENTERPRISE_EXAMINE_STATUS: '通过',
    ENTERPRISE_REGULATORY_LEVEL: '重点',
    ENTERPRISE_REGISTER: 'A级'
  }
})

const onScoreBadgeTap = throttle(key => {
  const { corporateScoreUrlApp } = useProjectStore()
  console.log(corporateScoreUrlApp)
  let data = {
    appId: '1',
    appImage: '/static/mp/app_default.png',
    appName: '得分详情',
    appUrl: null
  }
  switch (key) {
    case 'ENTERPRISE_SCORE':
      if (!corporateScoreUrlApp) {
        return
      }
      data.appName = '企业风险等级'
      data.appUrl = corporateScoreUrlApp
      break
    default:
      break
  }
  routeTo('Mp', data, 'slide-in-bottom')
}, 600)
</script>

<template>
  <g-card class="enterprise-card">
    <g-card-header>
      <template #label>
        <view class="label">
          <!-- <template v-if="enterpriseData.logo">
            <fui-avatar size="large" :src="enterpriseData.logo" background="transparent" />
          </template>
          <template v-else>
            <fui-avatar size="large" :text="enterpriseData.avatar" />
          </template> -->
          <view class="truncate">
            <view class="title">
              <fui-overflow-hidden :fontWeight="600" :text="enterpriseData.title" />
            </view>
          </view>
        </view>
      </template>
    </g-card-header>
    <view class="status">
      <view v-for="key in status" :key="key">
        <template v-if="key === 'ENTERPRISE_SCORE'">
          <g-badge
            :label="Enterprise[key]"
            :value="demo[key] ?? '待补充'"
            :type="computedScoreType(demo[key])"
            @click.catch="onScoreBadgeTap(key)"
          />
        </template>
     

        <template v-else>
          <!-- <g-badge :label="Enterprise[key]" :value="demo[key] ?? '待补充'" /> -->
        </template>
      </view>
    </view>

    <g-card-action>
      <view class="action">
        <view
          v-permission:DashboardEnterpriseQRButton
          class="item"
          hover-class="hover"
          data-name="EnterpriseQRcode"
          @tap="jumpTo"
        >
          <span>{{ current.QR }}</span>
          <fui-icon name="arrowright" class="icon" />
        </view>
        <view
          v-permission:DashboardEnterpriseProfileButton
          class="item"
          hover-class="hover"
          data-name="EnterpriseProfileList"
          :data-disabled="false"
          @tap="jumpTo"
        >
          <span>{{ current.PROFILE }}</span>
          <fui-icon name="arrowright" class="icon" />
        </view>
        <view
          v-permission:DashboardEnterpriseMemberButton
          class="item"
          hover-class="hover"
          data-name="EnterpriseMemberList"
          :data-disabled="false"
          @tap="jumpTo"
        >
          <span>{{ current.MEMBER }}</span>
          <fui-icon name="arrowright" class="icon" />
        </view>
      </view>
    </g-card-action>
  </g-card>
</template>

<style lang="scss" scoped>
.enterprise-card {
  .label {
    @apply flex items-center font-bold text-base text-zinc-600;
    .title {
      @apply w-60;
    }
  }
  .status {
    @apply pl-3 pr-3 pb-3 flex flex-wrap;
    .badge {
      @apply mt-3 mr-3;
    }
  }

  .action {
    @apply pt-1 flex justify-between w-full divide-x divide-zinc-100;
    .item {
      @apply flex-1 flex justify-center items-center text-xs text-zinc-600;
      .icon {
        @apply text-base leading-4 text-zinc-600 #{!important};
      }
    }
    .hover {
      @apply opacity-50;
    }
  }
}
</style>
