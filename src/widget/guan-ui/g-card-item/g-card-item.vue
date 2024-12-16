<script setup>
import { isEmpty, isArray, isObject, has } from 'lodash'
import { onMounted, ref, computed, provide, markRaw, watch, toRefs } from 'vue'
import Default from './items/default.vue'
import Images from './items/images.vue'
import List from './items/list.vue'
import Multistage from './items/multi-stage.vue'

const props = defineProps({
  condition: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    required: true
  },
  items: {
    type: Object,
    default: () => {}
  },
  label: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    default: null
  },
  model: {
    type: Object,
    default: null
  },
  value: {
    type: [Boolean, Object, String, Number, Array],
    default: null
  },
  append: {
    type: String,
    default: null
  },
  divide: {
    type: Boolean,
    default: true
  }
})

provide('props', toRefs(props))

const visible = ref(!props.condition || isEmpty(props.condition))

const { model, condition } = toRefs(props)

const Component = markRaw({
  Default,
  List,
  Images,
  Multistage
})

const is = computed(() => {
  if (props.type === 'upload') {
    return Component.Images
  } else if (props.type === 'list') {
    return Component.List
  } else if (props.type === 'multi-stage') {
    return Component.Multistage
  } else {
    return Component.Default
  }
})

const handleCondition = () => {
  if (isEmpty(condition.value) || isEmpty(model.value)) {
    return
  }

  function getValue(target) {
    if (isObject(target) && has(target, 'value')) {
      return target.value
    } else if (isArray(target)) {
      return target.map(child => (isObject(child) && has(child, 'value') ? child.value : child))
    } else {
      return target
    }
  }

  let result = condition.value.map(item => {
    let value = getValue(model.value[item.target])
    if (item.lt) {
      return value < item.value
    } else if (item.le) {
      return value <= item.value
    } else if (item.eq) {
      return value == item.value
    } else if (item.ne) {
      return value != item.value
    } else if (item.ge) {
      return value >= item.value
    } else if (item.gt) {
      return value > item.value
    } else if (item.in) {
      return isArray(value) ? value.includes(item.value) : false
    } else {
      return false
    }
  })

  visible.value = !result.includes(false)
}

watch(model, handleCondition, { deep: true, immediate: true })

onMounted(handleCondition)
</script>

<template>
  <view class="g-card-item" v-if="visible">
    <view class="left-wrap">
      <view class="label">{{ label }}</view>
      <view class="desc">{{ desc }}</view>
    </view>
    <view class="value">
      <component :is="is" />
    </view>
    <view class="divide" v-if="divide" />
  </view>
</template>

<style lang="scss" scoped>
@mixin g-card-item__common {
  @apply relative flex p-3 justify-between items-start;
}

@mixin g-card-item__label {
  @apply text-zinc-800 text-xs mr-3;
}

.g-card-item {
  @include g-card-item__common;
  .left-wrap {
    @apply inline-flex flex-col items-start mr-3 min-w-[38vw] max-w-[38vw];
    .label {
      @apply text-zinc-800 text-sm;
    }

    .desc {
      @apply pt-1 text-color-extra text-xs;
    }
  }
  .value {
    @apply text-sm w-[calc(100vw-38vw-0.75rem)] flex justify-end text-color-desc;
  }
}
.g-card-item__column {
  @include g-card-item__common;
  @apply flex-col;
  .left-wrap {
    @apply min-w-full;
  }
  .value {
    @apply text-sm w-full flex justify-start text-color-desc;
  }
}
.divide {
  @apply content-[""] ml-3 absolute bottom-0 w-full h-[1rpx] bg-zinc-100;
}
</style>
