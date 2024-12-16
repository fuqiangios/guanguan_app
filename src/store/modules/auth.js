import { defineStore } from 'pinia'
import sha256 from 'sha256'
import { sleep } from '@/widget/guan-ui/utils'
import Constant from '@/constant'
import { loginByPassword, loginBySMS, logout } from '@/api/auth'
import { useEnterpriseStore } from './enterprise'
import { useUserStore } from './user'
import { useRememberStore } from './remember'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null
  }),
  persist: {
    paths: ['token', 'refreshToken']
  },
  actions: {
    onLogin({ type, mobile, password, verificationCode, remember }) {
      useRememberStore().$reset()

      const { getEnterpistList } = useEnterpriseStore()

      return new Promise(async resolve => {
        let res = false

        try {
          if (type === Constant.LoginType.PASSWORD) {
            res = await loginByPassword({ mobile, password: sha256(password) })
          } else {
            res = await loginBySMS({ mobile, verificationCode })
          }
        } catch (error) {
          resolve(false)
        }

        if (!res) {
          resolve(false)
          return
        }

        if (remember) {
          useRememberStore().setRememberData({
            mobile,
            password
          })
        }

        let { access_token, refresh_token } = res

        this.token = access_token
        this.refreshToken = refresh_token

        sleep(30).then(async () => {
          let result = await getEnterpistList()

          if (!result) {
            resolve(false)
            return
          }
          resolve({ count: result.length })
        })
      })
    },

    onLogout() {
      return new Promise(async resolve => {
        let res = await logout({ refreshToken: this.refreshToken })
        if (!res) {
          resolve(false)
          return
        }

        this.$reset()
        useUserStore().$reset()
        useEnterpriseStore().$reset()

        resolve(true)
      })
    }
  }
})
