<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAppStore } from '@/store/modules/app.js'

const { onInit, onResume, onDestroy } = useAppStore()

onLaunch(onInit)

onShow(onResume)

onHide(onDestroy)
</script>

<style lang="scss">
@import '@/widget/first-ui/fui-theme/fui-theme.css';
@import '@/style/iconfont.css';

*,
:after,
:before {
  border: 0 solid transparent;
  box-sizing: border-box !important;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', STHeiti, 'Microsoft Yahei', Tahoma,
    Simsun, sans-serif;
  margin: 0;
}

page {
  background: #f6f6f6;
  background-color: #f6f6f6;
  overflow: hidden;
}
</style>
