<script setup>
import pyfl from 'pyfl'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref, reactive, onMounted } from 'vue'
import { groupBy } from 'lodash'
import { getEnterpriseMemberList } from '@/api/enterprise'
import { routeTo } from '@/router'
import { useUserStore } from '@/store/modules/user'
import { useProjectStore } from '@/store/modules/project'

const { transformRole } = useProjectStore()

const { permissionData } = useUserStore()

const memberData = reactive({
  loading: true,
  orginList: [],
  body: []
})

onLoad(() => {
  uni.$on('<MemberList>:refresh', getMemberListData)
})

onUnload(() => {
  uni.$off('<MemberList>:refresh', getMemberListData)
})

onMounted(async () => {
  await getMemberListData()
})

const getMemberListData = async () => {
  try {
    let result = await getEnterpriseMemberList({
      nonRole: 0
    })

    if (!result) {
      throw new Error('查询企业列表失败')
    }

    let { list } = result

    if (!list || list.length === 0) {
      throw new Error('查询企业列表失败')
    }

    list = list.map(item => ({
      option: item,
      userId: item.userId,
      text: item.userName,
      subText: item.mobile,
      tags: transformRole(item.roleCodes ?? [])
    }))

    memberData.orginList = list

    memberData.body = computedBodyData(list)
  } catch (error) {
    memberData.body = []
  } finally {
    memberData.loading = false
  }
}

const computedBodyData = data => {
  let result = data.map(member => {
    let word = pyfl(member.text.charAt(0))
    if (!word.match(/^[A-Z]+$/)) {
      word = '#'
    }
    return { ...member, letter: word }
  })

  result = groupBy(result, 'letter')

  result = Object.entries(result).map(item => ({
    letter: item[0],
    data: item[1]
  }))

  return result.sort((a, b) => (a.letter === '#' ? 0 : a.letter.localeCompare(b.letter)))
}

const isShowSearchBar = ref(false)

const resetSearchBar = (closeSearchBar = true) => {
  memberData.body = computedBodyData(memberData.orginList)
  closeSearchBar && (isShowSearchBar.value = false)
}

const onSearch = ({ detail: { value } }) => {
  let list = memberData.orginList.filter(item => item.text.includes(value))
  memberData.body = computedBodyData(list)
}

const onClickItem = e => {
  routeTo('EnterpriseMemberDetail', {
    id: e.option.id
  })
}
</script>

<template>
  <g-scroll-view class="enterprise-member-page">
    <template #header>
      <fui-nav-bar is-go-back :custom="permissionData.includes('EnterpriseMemberSearch') && isShowSearchBar" split-line>
        <fui-search-bar
          v-permission:EnterpriseMemberSearch
          focus
          placeholder="请输入企业人员名称进行模糊搜索"
          @cancel="resetSearchBar"
          @search="onSearch"
          @clear="resetSearchBar(false)"
        />
        <template #right>
          <fui-icon
            v-permission:EnterpriseMemberSearch
            custom-prefix="feather"
            name="icon-search"
            @tap="() => (isShowSearchBar = true)"
          ></fui-icon>
          <fui-icon
            v-permission:EnterpriseMemberAdd
            custom-prefix="feather"
            name="icon-plus"
            data-name="EnterpriseMemberEdit"
            @tap="routeTo"
          ></fui-icon>
        </template>
      </fui-nav-bar>
    </template>
    <g-payload :data="memberData">
      <fui-index-list :listData="memberData.body" @click="onClickItem" />
    </g-payload>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.enterprise-member-page {
  .fui-search__bar-wrap {
    @apply bg-white #{!important};
  }
  .fui-icon {
    @apply text-xl m-3 mt-0 mb-0 #{!important};
  }
}
</style>
