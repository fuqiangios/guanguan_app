<script setup>
import { ref, reactive, inject, watch, computed } from 'vue'
import _, { isEmpty } from 'lodash'

const { Image } = inject('Constant')

const dayjs = inject('Dayjs')

// TODO: 获取操作日志列表
const mockData = reactive({
  countData: ['2023年', '2022年', '2021年', '2020年', '2019年', '2018年'],

  logData: [
    {
      dateTime: '2023-04-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-04-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-04-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-04-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-12-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-11-19 15:37',
      user: '小赵',
      content: '内容'
    },
    {
      dateTime: '2023-11-19 15:37',
      user: '小赵',
      content: '内容1'
    },
    {
      dateTime: '2023-11-19 15:37',
      user: '小赵',
      content: '内容2'
    }
  ]
})

const current = reactive({
  index: -1,
  data: []
})

const view = ref('')

const isLoading = ref(false)

const computedLogData = (data = [], formats = 'MM') => {
  return _(data)
    .orderBy(['dateTime'], ['desc'])
    .groupBy(item => dayjs(item['dateTime']).format(formats))
    .map((children, label) => {
      formats === 'MM' && (children = computedLogData(children, 'DD'))
      return { label, children }
    })
    .sort((prev, next) => (prev.label < next.label ? 0 : -1))
    .value()
}

const logData = computed(() => {
  console.log(computedLogData(mockData.logData))
  return computedLogData(mockData.logData)
})

const isFill = reactive({
  top: false,
  bottom: false,
  lock: false
})

watch(isFill, ({ top, bottom }) => (isFill.lock = top || bottom))

const onFillData = ({ detail: { direction } }) => {
  if (isFill.lock) {
    return
  }
  isFill[direction] = true

  // // UNDONE: 加载更多数据
  let timer = setTimeout(() => {
    clearTimeout(timer)
    mockData.logData = [
      {
        dateTime: '2023-12-19 15:37',
        user: '小赵',
        content: '测试'
      },
      {
        dateTime: '2023-12-19 15:37',
        user: '小赵',
        content: '测试'
      },
      ...mockData.logData
    ]
    isFill[direction] = false
    // view.value.refresh()
  }, 2000)
}
</script>

<template>
  <g-scroll-view class="enterprise-log-page" :loading="isLoading">
    <template #header>
      <fui-nav-bar is-go-back split-line />
      <view class="bg-white w-full">
        <fui-tabs :tabs="mockData.countData" :short="false" scale="1" scroll />
      </view>
    </template>

    <fui-empty v-if="isEmpty(logData)" class="pt-40" :src="Image.Empty.Data" title="暂无数据" descr="未查询到操作日志" />

    <section v-else>
      <fui-loading v-if="isFill.top" type="row" :isFixed="false" text="正在加载..." class="h-14 flex items-center" />

      <view class="wrap" v-for="(months, mIndex) in logData" :key="mIndex">
        <view :data-month="months.label" :id="`tag-${months.label}`" />

        <block v-for="(days, dIndex) in months.children" :key="dIndex">
          <view class="node" v-for="(sub, sIndex) in days.children" :key="sIndex">
            <section class="node-date" v-if="!sIndex">
              <span class="day">{{ days.label }}</span>
              <span class="month">{{ months.label }}</span>
            </section>
            <view class="card">
              <g-card>
                <g-card-item label="修改时间" :value="sub.dateTime" />
                <g-card-item label="修改人" :value="sub.user" />
                <g-card-item label="修改内容" :value="sub.content" :divide="false" />
              </g-card>
            </view>
          </view>
        </block>
      </view>

      <fui-loading
        v-if="isFill.bottom"
        type="row"
        :is-fixed="false"
        text="正在加载..."
        class="h-14 flex items-center"
      />

      <fui-loadmore v-else :state="3" />
    </section>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
@mixin year {
  @apply after:content-['年'];
}
.enterprise-log-page {
  .year {
    @apply mt-3 mb-6 ml-3 w-full text-3xl font-semibold;
    @apply [&:not(:first-child)]:mt-12;
    @include year;
  }

  .wrap {
    @apply relative;
    .tag {
      @apply absolute -top-10;
    }
  }
  .node {
    @apply flex w-full justify-between;
    &-date {
      @apply absolute pl-3 mt-3;
      .month {
        @apply text-xs leading-6 after:content-['月'];
      }
      .day {
        @apply text-2xl font-semibold;
      }
    }
    .card {
      @apply ml-16 w-full;
    }
  }
}
</style>
