import { useEnterpriseStore } from '@/store/modules/enterprise'
import { routeTo } from '@/router'

export default () => {
  const { shouldSupply } = useEnterpriseStore()

  function querySupplyState(pageName = '') {
    if (!shouldSupply || pageName === 'EnterpriseProfileList') {
      return true
    }
    uni.showModal({
      title: '企业基本信息待完善',
      content: '请完善企业基本信息，否则只能使用基础功能。如已完善，请重新登录后再试',
      showCancel: false,
      confirmText: '立即完善',
      success: () => {
        routeTo('EnterpriseProfileList')
      }
    })

    return false
  }

  return {
    querySupplyState
  }
}
