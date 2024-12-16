import { useUserStore } from '@/store/modules/user'
import { isEmpty } from 'lodash'

export default () => {
  const { permissionData } = useUserStore()

  function permission(codes = []) {
    if (isEmpty(codes)) {
      return true
    }

    codes = codes.map(item => {
      return permissionData.includes(item)
    })

    return codes.includes(true)
  }

  return {
    permission
  }
}
