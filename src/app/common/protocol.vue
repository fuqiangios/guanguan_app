<script setup>
import base64 from 'base-64'
import { isEmpty } from 'lodash'
import { onMounted, inject, reactive } from 'vue'
import { getProtocolData } from '@/api/common'
import { isBase64 } from '@/utils'

const { Document } = inject('Constant')

const protocolData = reactive({
  title: '',
  loading: true,
  body: ''
})

onMounted(async () => {
  const { $passedParams: params } = getCurrentPages()[getCurrentPages().length - 1]
  if (isEmpty(params)) {
    return
  }

  uni.setNavigationBarTitle({
    title: Document[params.code]
  })

  protocolData.title = Document[params.code]
  await getData(params.code)
})

const getData = async type => {
  try {
    let result = await getProtocolData({ type })
    if (!result || !isBase64(result)) {
      return
    }
    protocolData.body = decodeURI(base64.decode(result))
  } catch (error) {
  } finally {
    protocolData.loading = false
  }
}
</script>

<template>
  <g-scroll-view class="protocol-page">
    <template #header>
      <fui-nav-bar :title="protocolData.title" is-go-back split-line />
    </template>
    <g-payload :data="protocolData">
      <view v-html="protocolData.body" class="bg-white p-3" />
    </g-payload>
  </g-scroll-view>
</template>
