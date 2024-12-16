<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false,
    default: ''
  }
})
</script>

<template>
  <view class="badge" :class="type">
    <view class="label" v-text="label" />
    <view class="value" v-text="value" />
  </view>
</template>

<style lang="scss" scoped>
.badge {
  @apply inline-flex text-primary text-xs rounded-xl pl-1 pr-1 border-blue-400 border-[1px] items-center align-middle;
  background-color: #e4eefe;
  .label {
    @apply p-1;
  }
  .value {
    @apply pl-1 pr-1 flex-1 bg-blue-600 text-white rounded-xl h-4;
  }
}
.best {
  @apply text-[#0000ff] border-[#0000ff] bg-[#e5e5ff];
  .value {
    @apply bg-[#0000e5];
  }
}
.success {
  @apply text-[#ff6100] border-[#ff6100] bg-[#ffdfcc];
  .value {
    @apply bg-[#e55700];
  }
}
.warning {
  @apply text-[#000] border-[#ffff00] bg-[#ffff00];
  .value {
    @apply bg-[#666600] text-[#ffff00];
  }
}
.danger {
  @apply text-[#ff0000] border-[#ff0000] bg-[#f7e7e7];
  .value {
    @apply bg-[#c40303];
  }
}
</style>
