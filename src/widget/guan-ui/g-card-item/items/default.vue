<script setup>
import { isEmpty, isArray, isObject, isNumber, isString, has } from 'lodash'
import { inject, computed } from 'vue'
const { value, append } = inject('props')

const formatValue = computed(() => {
  if (isObject(value.value) && has(value.value, 'text')) {
    return value.value.text
  } else if (isArray(value.value)) {
    return value.value.map(item => (isObject(item) && has(item, 'text') ? item.text : item)).join('、')
  } else if (isString(value.value)) {
    return value.value
  } else if (isNumber(value.value)) {
    return value.value.toString()
  } else {
    return ''
  }
})
</script>

<template>
  <view class="g-card-item__default">
    <span v-if="isEmpty(formatValue)"> 待补充 </span>
    <span v-else> {{ formatValue }}{{ append }} </span>
  </view>
</template>

<style lang="scss" scoped></style>
