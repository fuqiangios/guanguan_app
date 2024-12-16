<script setup>
const props = defineProps({
  label: String,
  extra: {
    type: [Boolean, String, Array],
    required: false
  }
})
</script>

<template>
  <section class="g-card">
    <view class="g-card__body">
      <g-card-header v-if="label" :label="label" :extra="extra" />
      <slot />
    </view>
  </section>
</template>

<style lang="scss" scoped>
.g-card {
  @apply pt-3 pl-3 pr-3;
  &__body {
    @apply p-0 bg-white rounded-xl overflow-clip;
  }
}
</style>
