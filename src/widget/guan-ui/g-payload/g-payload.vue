<script setup>
import { isEmpty } from 'lodash'
import { inject } from 'vue'

const { Image } = inject('Constant')

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  emptyType: {
    type: String,
    default: 'Data'
  }
})
</script>

<template>
  <template v-if="data.loading">
    <fui-loading type="row" :is-fixed="false" text="正在加载..." class="h-32 flex items-center" />
  </template>
  <template v-else-if="isEmpty(data.body)">
    <fui-empty class="pt-40" :src="Image.Empty[emptyType]" title="暂无数据" descr="未查询到数据内容" />
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<style lang="scss" scoped></style>
