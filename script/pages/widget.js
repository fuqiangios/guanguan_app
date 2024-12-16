/**
 * 组件自动扫描注入规则
 */
module.exports = {
  autoscan: true,
  custom: {
    dynamic: '@/widget/dynamic-form/dynamic-form.vue',
    quick: '@/widget/dynamic-form/quick-form.vue',
    'fui-(.*)': '@/widget/first-ui/fui-$1/fui-$1.vue',
    'g-(.*)': '@/widget/guan-ui/g-$1/g-$1.vue',
    'd-(.*)': '@/widget/dynamic-form/d-$1/d-$1.vue'
  }
}
