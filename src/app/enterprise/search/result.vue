<script setup>
import { onShow } from '@dcloudio/uni-app'
import { reactive, inject, onMounted } from 'vue'
import { has, isEmpty } from 'lodash'
import { getRect, sleep } from '@/widget/guan-ui/utils'
import { getEnterpriseInfo } from '@/api/enterprise'

const Constant = inject('Constant')
const { Image } = Constant

const data = reactive({
  loading: true,
  top: 0,
  tabs: [],
  current: {
    tab: 0,
    view: 'swiper-0',
    height: null
  },
  companyId: '',
  templateData: null,
  valueData: null
})

const getData = async () => {
  try {
    data.loading = true
    data.valueData = {}
    let { enterpriseInfo, templateConfig } = await getEnterpriseInfo({ companyId: data.companyId })

    if (!enterpriseInfo) {
      throw new Error('未获取到数据')
    }

    if (isEmpty(templateConfig)) {
      throw new Error('信息检索失败')
    }

    if (isEmpty(templateConfig.templateFileUrl)) {
      throw new Error('模板内容不存在')
    }

    data.templateData = JSON.parse(templateConfig.templateFileUrl).app

    data.templateData.forEach(item => {
      if (item.combine && item.key) {
        if (has(enterpriseInfo, item.key)) {
          enterpriseInfo = { ...enterpriseInfo, ...enterpriseInfo[item.key] }
        }
      }
    })

    data.valueData = enterpriseInfo

    data.tabs = data.templateData.map(item => item.label)
  } catch (error) {
    console.log(error)
  } finally {
    data.loading = false
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

onMounted(async () => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }

  data.companyId = params.id
  await getData()
})

onShow(refreshHeight)
</script>

<template>
  <g-scroll-view class="search-enterprise-result-page" bottom-space-class="h-20" :loading="data.loading">
    <template #header>
      <fui-nav-bar is-go-back />

      <template v-if="!data.loading && data.tabs.length > 1">
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
    <template v-if="isEmpty(data.templateData) || isEmpty(data.valueData)">
      <fui-empty class="pt-40" :src="Image.Empty.Data" title="检索信息异常" descr="检索企业信息失败，再刷新试试吧">
        <view class="action">
          <fui-button @tap="getData">刷新</fui-button>
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
        <swiper-item @touchmove.stop="" v-for="(panel, index) in data.templateData" :key="panel.key">
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
    </template>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.search-enterprise-result-page {
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
