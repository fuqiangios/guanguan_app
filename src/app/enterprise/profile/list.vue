<script setup>
import { storeToRefs } from 'pinia'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { reactive, watch, inject, computed } from 'vue'
import { has, isEmpty } from 'lodash'
import { getRect, sleep } from '@/widget/guan-ui/utils'
import { routeTo } from '@/router'
import { useProjectStore } from '@/store/modules/project'
import { useEnterpriseStore } from '@/store/modules/enterprise'

const Constant = inject('Constant')
const { Image } = Constant

const project = useProjectStore()
const { getTemplateData } = project
const { enterpriseTemplateData } = storeToRefs(project)

const enterprise = useEnterpriseStore()
const { getEnterpriseDetail } = enterprise
const { currentEnterpriseDetail } = storeToRefs(enterprise)

const templateCode = computed(() => {
  return Constant[Global.EnterpriseType].TEMPLATE_INFO_CODE
})

const data = reactive({
  top: 0,
  tabs: [],
  current: {
    tab: 0,
    view: 'swiper-0',
    height: null
  },
  valueData: null
})

const getData = async (refresh = false) => {
  try {
    if (refresh) {
      data.valueData = {}
      await getEnterpriseDetail()
    }
    let result = currentEnterpriseDetail.value
    if (!result) {
      throw new Error('未获取到数据')
    }

    enterpriseTemplateData.value.forEach(item => {
      if (item.combine && item.key) {
        if (has(result, item.key)) {
          result = { ...result, ...result[item.key] }
        }
      }
    })

    data.valueData = result
  } catch (error) {
    console.log(error)
  } finally {
    refreshHeight()
  }
}

const onViewChange = ({ index }) => {
  data.current.tab = index ?? 0
  data.current.view = `swiper-${index || 0}`
  refreshHeight()
}

const refreshHeight = () => {
  sleep(100).then(() => {
    getRect(`#${data.current.view}`).then(size => {
      data.current.height = `${size.height}px`
    })
  })
}

const onEdit = () => {
  routeTo('EnterpriseProfileEdit', {
    title: data.tabs[data.current.tab],
    template: enterpriseTemplateData.value[data.current.tab],
    valueData: data.valueData
  })
}

onLoad(() => {
  uni.$on('<EnterpriseList>:refresh', () => getData(true))
  refreshHeight()
})

onShow(() => {
  refreshHeight()
})

onUnload(() => {
  uni.$off('<EnterpriseList>:refresh', () => getData(true))
})

watch(
  enterpriseTemplateData,
  async value => {
    if (isEmpty(value)) {
      return
    }

    data.tabs = value.map(item => item.label)
    await getData()
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <g-scroll-view class="enterprise-profile-page" bottom-space-class="h-20">
    <template #header>
      <fui-nav-bar is-go-back>
        <template #right>
          <!-- <fui-icon
            @tap="routeTo"
            v-for="(item, index) in profileData.actions"
            :key="index"
            :custom-prefix="item.prefix"
            :name="item.icon"
            :data-url="item.src"
          ></fui-icon> -->
        </template>
      </fui-nav-bar>

      <template v-if="data.tabs.length > 1">
        <view class="bg-white w-full">
          <fui-tabs
            :current="data.current.tab"
            :tabs="data.tabs"
            :short="false"
            scale="1"
            scroll
            @change="onViewChange"
          />
        </view>
      </template>
    </template>
    <template v-if="isEmpty(enterpriseTemplateData)">
      <fui-empty class="pt-40" :src="Image.Empty.Data" title="模板信息异常" descr="模板信息获取失败，再刷新试试吧">
        <view class="action">
          <fui-button @tap="getTemplateData('enterpriseTemplateData', templateCode)">刷新</fui-button>
        </view>
      </fui-empty>
    </template>
    <template v-else-if="isEmpty(data.valueData)">
      <fui-empty class="pt-40" :src="Image.Empty.Data" title="获取基本信息异常" descr="基本信息获取失败，再刷新试试吧">
        <view class="action">
          <fui-button @tap="getData(true)">刷新</fui-button>
        </view>
      </fui-empty>
    </template>
    <template v-else>
      <swiper
        :current="data.current.tab"
        :indicator-dots="false"
        :interval="4000"
        :duration="200"
        class="swiper"
        :style="{ height: data.current.height }"
      >
        <swiper-item @touchmove.stop="" v-for="(panel, index) in enterpriseTemplateData" :key="panel.key">
          <section :id="`swiper-${index}`">
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
                    :model="data.valueData"
                    :value="has(data.valueData, child.key) ? data.valueData[child.key] : null"
                    :append="child.props?.append"
                    :divide="childIndex < item.children.length - 1"
                  />
                </g-card>
              </template>
              <template v-else-if="item.type === 'list'">
                <g-card
                  v-for="(child, childIndex) in data.valueData?.[item.key]"
                  :key="`${item.key}-${childIndex}`"
                  :label="item.label"
                  :extra="`(${childIndex + 1})`"
                >
                  <g-card-item
                    v-for="(childTemplate, childTemplateIndex) in item.children"
                    :key="`${item?.key}-${childIndex}-${childTemplateIndex}`"
                    :condition="childTemplate?.condition"
                    :label="childTemplate?.label"
                    :desc="childTemplate?.desc"
                    :type="childTemplate?.type"
                    :value="child[childTemplate.key] || ''"
                    :append="childTemplate?.props?.append"
                    :divide="childTemplateIndex < Object.keys(item.children).length - 1"
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
                    :model="data.valueData"
                    :value="has(data.valueData, item.key) ? data.valueData[item.key] : null"
                    :append="item.props?.append"
                    :divide="itemsIndex < panel.items.length - 1"
                  />
                </g-card>
              </template>
            </template>
          </section>
        </swiper-item>
      </swiper>
      <view class="action" v-permission:EnterpriseProfileEdit>
        <fui-button @tap="onEdit">编辑{{ data.tabs[data.current.tab] }}</fui-button>
      </view>
    </template>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.enterprise-profile-page {
  .swiper {
    @apply h-[100vh];
  }
  .fui-icon {
    @apply text-xl m-3 mt-0 mb-0 #{!important};
  }
  .action {
    @apply fixed bottom-6 w-full box-border pl-6 pr-6;
  }
}
</style>
