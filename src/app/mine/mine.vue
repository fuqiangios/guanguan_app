<script setup>
import { computed, inject } from 'vue'
import { isApp } from '@/utils'
import { routeTo } from '@/router'
import { useUserStore } from '@/store/modules/user'
import { useAuthStore } from '@/store/modules/auth'
import { useAppStore } from '@/store/modules/app'
import { useProjectStore } from '@/store/modules/project'
import { isMechanism, showModal } from '@/utils'

const { APP_AUDIT_ACCOUNT } = import.meta.env

const { transformRole } = useProjectStore()

const { Document } = inject('Constant')

const { userInfo } = useUserStore()

const profile = computed(() => ({
  avatar: userInfo.userName ? userInfo.userName.slice(0, 1) : '用户',
  title: userInfo.userName || '未知用户',
  desc: transformRole(userInfo?.role || []) ?? '',
  isAuditAccount: userInfo.mobile === APP_AUDIT_ACCOUNT
}))

const routeToProtocolPage = ({ target: { dataset } }) => {
  routeTo('Protocol', { code: dataset.code })
}

const onUpdate = () => {
  const { onCheckUpdate } = useAppStore()
  onCheckUpdate({ showToast: true })
}

const onClearCache = () => {
  const { systemInfo } = useAppStore()

  if (systemInfo.platform === 'android') {
    plus.cache.clear()
  }

  if (systemInfo.platform === 'ios') {
    let cache = plus.ios.invoke(plus.ios.newObject('NSURLCache'), 'sharedURLCache')
    plus.ios.invoke(cache, 'removeAllCachedResponses')
    plus.ios.invoke(cache, 'setDiskCapacity:', 0)
    plus.ios.invoke(cache, 'setMemoryCapacity:', 0)
  }

  uni.showToast({ title: '清除缓存成功', icon: 'none' })
}

const onScan = () => {
  uni.scanCode({
    success: ({ result }) => {
      try {
        result = JSON.parse(result)

        const { companyId } = result

        routeTo('SearchEnterpriseResult', { id: companyId })
      } catch ({ message }) {
        uni.showToast({
          title: '暂未识别出该二维码',
          icon: 'none'
        })
      }
    }
  })
}

const onQuit = async () => {
  const { onLogout } = useAuthStore()

  let res = await onLogout()
  if (!res) {
    uni.showToast({ title: '正在尝试清除登录状态', icon: 'none' })
    return
  }

  uni.reLaunch({ name: 'Login' })
}

const onRemoveAccount = async () => {
  let res = await showModal({
    title: '注销账号提示',
    content:
      '为防止恶意注销，我们将设立 72 小时冷静期。冷静期间您可通过本人手机号码联系，以取消提交该申请，在此期间账号功能可正常使用。冷静期满，您的账号信息将完全移除。'
  })
  if (!res) {
    return
  }
  uni.showToast({ title: '已进入注销期', icon: 'none' })
}
</script>

<template>
  <view class="mine-page">
    <fui-status-bar />

    <section class="profile-panel">
      <fui-panel :panelData="profile">
        <template #thumb>
          <fui-avatar size="large" :text="profile.avatar"></fui-avatar>
        </template>
      </fui-panel>
    </section>

    <view class="menu">
      <fui-list>
        <fui-list-cell v-if="isMechanism" arrow @click="onScan">扫一扫</fui-list-cell>
        <fui-list-cell arrow data-name="ResetPassword" :bottomBorder="false" @click="routeTo">修改密码</fui-list-cell>
      </fui-list>
    </view>

    <view class="menu">
      <fui-list>
        <fui-list-cell
          v-for="(label, code, index) in Document"
          :key="code"
          arrow
          :data-code="code"
          @click="routeToProtocolPage"
          :bottomBorder="index !== Object.keys(Document).length - 1"
        >
          {{ label }}
        </fui-list-cell>
      </fui-list>
    </view>

    <view class="menu" v-if="profile.isAuditAccount">
      <fui-list>
        <fui-list-cell arrow @click="onRemoveAccount">注销账户</fui-list-cell>
      </fui-list>
    </view>

    <view class="menu">
      <fui-list>
        <template v-if="isApp">
          <fui-list-cell arrow @click="onUpdate">检测更新</fui-list-cell>
          <fui-list-cell arrow @click="onClearCache">清除缓存</fui-list-cell>
        </template>
        <fui-list-cell arrow :bottomBorder="false" @click="onQuit">退出登录</fui-list-cell>
      </fui-list>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.mine-page {
  .profile-panel {
    @apply m-3 rounded-xl paint-contain;
  }
  .menu {
    @apply ml-3 mr-3 mb-3 rounded-xl paint-contain;
  }
}
</style>
