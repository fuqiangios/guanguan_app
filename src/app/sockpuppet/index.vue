<script setup>
import { inject, reactive } from 'vue'
import { has } from 'lodash'
import { routeTo } from '@/router'

const { Image } = inject('Constant')

const data = reactive({
  banner: '/static/sockpuppet/banner.png',
  menu: [
    {
      image: '/static/sockpuppet/sq.png',
      label: '述求'
    },
    {
      image: '/static/sockpuppet/zjdf.png',
      label: '资金兑付'
    },
    {
      image: '/static/sockpuppet/tjtx.png',
      label: '特精特新'
    },
    {
      image: '/static/sockpuppet/zcpp.png',
      label: '政策匹配'
    },
    {
      image: '/static/sockpuppet/aqsc.png',
      label: '安全生产',
      name: 'Login'
    },
    {
      image: '/static/sockpuppet/jrfw.png',
      label: '金融服务'
    },
    {
      image: '/static/sockpuppet/yqpt.png',
      label: '园企平台',
      name: 'LiTong'
    }
  ],
  service: [
    {
      background: '/static/sockpuppet/aqsczr_bg.png',
      image: '/static/sockpuppet/aqsczr.png',
      label: '安全生产责任险'
    },
    {
      background: '/static/sockpuppet/symm_bg.png',
      image: '/static/sockpuppet/symm.png',
      label: '商业秘密泄露自查'
    }
  ],
  portrait: ['企业综合画像', '安全生产画像', '专精特新画像']
})

const onClickItem = ({ currentTarget: { dataset } }) => {
  if (!has(dataset, 'name')) {
    uni.showToast({ title: '正在开发中...', icon: 'none' })
    return
  }
  switch (dataset.name) {
    case 'Login':
      uni.reLaunch({ name: 'Login' })
      break
    case 'LiTong':
      let data = {
        appImage: dataset.image,
        appName: dataset.label,
        appUrl: 'https://qf.ltitgroup.com:8443/yjapp/#/login'
      }
      console.log(data)
      routeTo('Mp', data, 'slide-in-bottom')
      break
    default:
      break
  }
}
</script>

<template>
  <g-scroll-view class="sockpuppet">
    <template #header>
      <fui-nav-bar title=" " split-line />
    </template>

    <view class="banner">
      <image class="image" mode="aspectFill" :src="data.banner" />
    </view>

    <view class="menu">
      <view
        class="items"
        hover-class="hover"
        :hover-stay-time="150"
        v-for="(item, index) in data.menu"
        :key="index"
        :data-name="item?.name ?? undefined"
        :data-image="item?.image ?? undefined"
        :data-label="item?.label ?? undefined"
        @tap="onClickItem"
      >
        <view>
          <image class="image" mode="aspectFit" :src="item.image" />
        </view>
        <span class="label">{{ item.label }}</span>
      </view>
    </view>

    <view class="service">
      <view class="header">善企服务</view>
      <view class="wrap" @tap.catch="onClickItem">
        <view
          class="items"
          hover-class="hover"
          :hover-stay-time="150"
          v-for="(item, index) in data.service"
          :key="index"
          :style="`
          background-image: url(${item.background});
        `"
        >
          <view>
            <image class="image" mode="aspectFit" :src="item.image" />
          </view>
          <span class="label">{{ item.label }}</span>
        </view>
      </view>
    </view>

    <view class="portrait">
      <view class="header">企业画像</view>
      <view class="tabs">
        <fui-tabs :tabs="data.portrait" center scale="1"></fui-tabs>
      </view>
      <fui-empty :src="Image.Empty.Data" />
    </view>
  </g-scroll-view>
</template>

<style lang="scss" scoped>
.banner {
  @apply m-3 rounded-xl overflow-hidden;
  .image {
    @apply w-full h-24;
  }
}

.menu {
  @apply m-3 p-3 grid grid-cols-4	gap-6  content-center bg-white rounded-xl overflow-clip;
  .items {
    @apply flex flex-col items-center;
    .image {
      @apply w-12 h-12;
    }
    .label {
      @apply mt-1 text-xs text-color-desc;
    }
  }
}

.service {
  @apply m-3;
  .header {
    @apply text-lg font-semibold mb-3;
  }
  .wrap {
    @apply grid grid-cols-2	gap-2;
    .items {
      @apply h-[4.5rem] w-full flex items-center justify-center bg-no-repeat bg-contain;
      .label {
        @apply ml-2 mb-1 text-sm text-black;
      }
      .image {
        @apply w-8 h-8;
      }
    }
  }
}

.portrait {
  @apply m-3;
  .header {
    @apply text-lg font-semibold;
  }

  .tabs {
    .fui-tabs__scrollbox {
      @apply bg-transparent #{!important};
    }
  }
}
</style>
