<script setup>
import { isEmpty, has, keyBy } from 'lodash'
import { computed, inject } from 'vue'
const { value, items } = inject('props')

const formatValue = computed(() => {
  if (!value.value) {
    return []
  }
  const itemsObj = keyBy(items.value, 'key')
  let result = value.value.map(item => {
    return Object.entries(item).map(([key, value]) => ({
      ...itemsObj[key],
      value: value
    }))
  })

  return result
})
</script>

<template>
  <view class="g-card-item__list">
    <section class="item" v-for="(item, index) in formatValue" :key="item.key">
      <g-card-item
        v-for="(child, childIndex) in item"
        :key="`${index}-${childIndex}-${child.key}`"
        :label="child.label"
        :type="child.type"
        :value="child.value"
      />
    </section>
  </view>
</template>

<style lang="scss" scoped>
.g-card-item__list {
  @apply w-full  box-border;

  .item {
    @apply w-full rounded-xl bg-gray-100 mt-3;
  }
}
</style>
