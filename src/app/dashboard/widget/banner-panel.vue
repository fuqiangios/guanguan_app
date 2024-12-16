<script setup>
import { ref } from 'vue'
const bannerData = ref([{ image: '/static/banner/banner.png' }])
</script>

<template>
  <fui-swiper
    class="banner"
    duration="600"
    border-radius="15"
    height="288"
    :list="bannerData"
    img-mode="aspectFill"
    indicator-pos="bottomCenter"
  ></fui-swiper>
</template>

<style lang="scss">
.banner {
  @apply pl-3 pr-3 pt-3;
}
</style>
