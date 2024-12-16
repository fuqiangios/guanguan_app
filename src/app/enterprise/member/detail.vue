<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useProjectStore } from '@/store/modules/project'
import { has, isEmpty } from 'lodash'
import { routeTo } from '@/router'
import { getEnterpriseMemberDetail, removeEnterpriseMember, resetEnterpriseMemberPassword } from '@/api/enterprise'
import usePermission from '@/hooks/usePermission'

const { userInfo } = useUserStore()

const project = useProjectStore()

const { transformRole } = project

const { userTemplateData } = storeToRefs(project)

const { permission } = usePermission()

const userId = ref(null)

const data = reactive({
  loading: true,
  body: {}
})

onLoad(async () => {
  uni.$on('<MemberDetail>:refresh', getMemberDetailData)
})

onUnload(() => {
  uni.$off('<MemberDetail>:refresh', getMemberDetailData)
})

onMounted(async () => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]

  if (!params?.id) {
    data.loading = false
    return
  }
  userId.value = params.id
  await getMemberDetailData(userId.value)
})

const getMemberDetailData = async userId => {
  try {
    data.loading = true

    if (!userId) {
      throw new Error('缺失人员ID')
    }

    let result = await getEnterpriseMemberDetail(userId)

    if (!result) {
      throw new Error('查询人员详情失败')
    }

    if (!isEmpty(result.role)) {
      result.role = result.role.map(item => ({
        text: transformRole([item]),
        value: item
      }))
    }

    if (!isEmpty(result.station) && !isEmpty(result.stationNames)) {
      result.station = {
        text: result.stationNames[0],
        value: result.station[0]
      }
    }

    data.body = result || {}
  } catch (error) {
    console.log(error.message)
    uni.navigateBack()
  } finally {
    data.loading = false
  }
}

const onResetPassword = async () => {
  try {
    let result = await resetEnterpriseMemberPassword({ id: userId.value })
    if (!result) {
      throw new Error('重置密码失败')
    }
    uni.showToast({ title: '重置密码成功', icon: 'none' })
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const onDelete = async () => {
  try {
    let result = await removeEnterpriseMember(userId.value)
    if (!result) {
      throw new Error('删除人员失败')
    }
    uni.$emit('<MemberList>:refresh', {})
    uni.navigateBack()
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

const onEdit = () => {
  routeTo('EnterpriseMemberEdit', {
    userId: userId.value,
    valueData: data.body
  })
}

const isConfirmModelShow = ref(false)

const confirmModelTips = ref('')

const isMoreActionSheetShow = ref(false)

const moreActionData = [
  {
    text: '重置密码',
    permission: 'EnterpriseMemberResetPassword',
    action: () => {},
    tips: '是否重置该员工密码？',
    confirm: onResetPassword
  },
  {
    text: '删除人员',
    permission: 'EnterpriseMemberDelete',
    color: 'var(--fui-color-danger)',
    tips: '被删除后，该员工将无法登录当前企业，且不可撤回，是否继续删除操作？',
    confirm: onDelete
  }
]

const moreActionIndex = ref(null)

const onConfirmModelClick = ({ index, extra }) => {
  isConfirmModelShow.value = false
  if (!index) return

  moreActionData[extra].confirm()
}

const resetMoreActionSheet = () => (isMoreActionSheetShow.value = false)

const onMoreActionClick = ({ index }) => {
  resetMoreActionSheet()
  isConfirmModelShow.value = true
  moreActionIndex.value = index
  confirmModelTips.value = moreActionData[index].tips
}
</script>

<template>
  <view class="member-detail-panel">
    <fui-nav-bar is-go-back split-line />

    <g-payload :data="data">
      <section v-for="panel in userTemplateData" :key="panel.key">
        <template v-for="(item, itemsIndex) in panel.items" :key="item.key">
          <template v-if="item.type === 'group'">
            <g-card>
              <g-card-item
                v-for="(child, childIndex) in item.children"
                :key="child.key"
                :condition="child.condition"
                :label="child.label"
                :items="child?.children"
                :desc="child.desc"
                :type="child.type"
                :model="data.body"
                :value="has(data.body, child.key) ? data.body[child.key] : null"
                :append="child.props?.append"
                :divide="childIndex < item.children.length - 1"
              />
            </g-card>
          </template>
          <template v-else-if="item.type === 'list'">
            <g-card
              v-for="(child, childIndex) in data.body?.[item.key]"
              :key="`${item.key}-${childIndex}`"
              :label="item.label"
              :extra="`(${childIndex + 1})`"
            >
              {{ void (items = item.children) }}
              <g-card-item
                v-for="(V, K, itemIndex) in child"
                :key="`${item.key}-${childIndex}-${itemIndex}`"
                :condition="items[K]?.condition"
                :label="items[K].label"
                :desc="items[K].desc"
                :type="items[K].type"
                :value="V"
                :append="items[K].props?.append"
                :divide="itemIndex < Object.keys(child).length - 1"
              />
            </g-card>
          </template>
          <template v-else>
            <g-card>
              <g-card-item
                :condition="item.condition"
                :label="item.label"
                :desc="item.desc"
                :type="item.type"
                :model="data.body"
                :value="has(data.body, item.key) ? data.body[item.key] : null"
                :append="item.props?.append"
                :divide="itemsIndex < panel.items.length - 1"
              />
            </g-card>
          </template>
        </template>
      </section>

      <view class="action">
        <view class="p-3">
          <fui-row isFlex>
            <template
              v-if="permission(['EnterpriseMemberDelete', 'EnterpriseMemberResetPassword']) && userInfo.id !== userId"
            >
              <fui-col>
                <fui-button text="更多" type="primary" plain @click="() => (isMoreActionSheetShow = true)" />
              </fui-col>
              <fui-col v-permission:EnterpriseMemberEdit :offset="1">
                <fui-button text="编辑" type="primary" @tap="onEdit" />
              </fui-col>
            </template>
            <template v-else>
              <fui-col>
                <fui-button text="编辑" v-permission:EnterpriseMemberEdit type="primary" @tap="onEdit" />
              </fui-col>
            </template>
          </fui-row>
        </view>

        <fui-safe-area />
      </view>

      <fui-actionsheet
        :show="isMoreActionSheetShow"
        :itemList="moreActionData"
        @click="onMoreActionClick"
        @cancel="resetMoreActionSheet"
      />

      <fui-dialog
        type="danger"
        :extra="moreActionIndex"
        :show="isConfirmModelShow"
        :content="confirmModelTips"
        maskClosable
        @click="onConfirmModelClick"
      ></fui-dialog>
    </g-payload>
  </view>
</template>

<style lang="scss" scoped>
.action {
  @apply fixed pl-3 pr-3 left-0 bottom-3 w-full;
}
</style>
