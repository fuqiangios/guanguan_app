<script setup>
import { isEmpty, isBoolean, isArray, isObject, has } from 'lodash'
import { computed, inject } from 'vue'
const { items, value } = inject('props')

const formatValue = computed(() => {
  let result = []
  Object.entries(value.value).forEach(([K, V]) => {
    if (isBoolean(V) && V) {
      if (has(items.value, K)) {
        let { label } = items.value[K]
        if (!label) {
          return
        }

        result.push(label)
      }
    } else if (isArray(V) && !!V.length) {
      let temp = V.map(item => (isObject(item) && has(item, 'text') ? item.text : null))
      result = result.concat(temp)
    }
  })
  return result.join('、')
})
</script>

<template>
  <view class="g-card-item__multi-stage">
    <span v-if="isEmpty(value)"> 待补充 </span>
    <span v-else>
      {{ formatValue }}
    </span>
  </view>
</template>
