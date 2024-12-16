import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'
import { getPermissionData } from '@/api/common'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    permissionData: null
  }),

  persist: {
    paths: ['userInfo', 'permissionData']
  },

  actions: {
    getUserInfo() {
      return new Promise(async resolve => {
        let res = await getUserInfo()
        if (!res) {
          resolve(false)
          return
        }
        this.userInfo = res
        resolve(true)
      })
    },

    getPermissionData(codeList) {
      return new Promise(async resolve => {
        let res = await getPermissionData(codeList)
        if (!res) {
          resolve(false)
          return
        }
        this.permissionData = res.map(item => item.menuCode)
        resolve(true)
      })
    }
  }
})
