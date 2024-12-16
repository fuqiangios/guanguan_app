import { defineStore } from 'pinia'

export const useRememberStore = defineStore('remember', {
  state: () => ({
    mobile: null,
    password: null
  }),

  persist: {
    paths: ['mobile', 'password']
  },

  actions: {
    setRememberData({ mobile, password }) {
      this.mobile = mobile
      this.password = password ?? null
    }
  }
})
