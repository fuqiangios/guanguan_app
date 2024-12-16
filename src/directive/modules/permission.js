import { useUserStore } from '@/store/modules/user'

export default {
  mounted(el, binding, vnode) {
    let { arg: code } = binding
    if (!code) {
      return
    }
    const { permissionData } = useUserStore()

    code = code ?? vnode.props?.['data-permission']

    if (!permissionData.includes(code)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
