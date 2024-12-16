import { has, isEmpty } from 'lodash'
import { defineStore } from 'pinia'

import envData from 'env'

export const useConfigStore = defineStore('config', {
  state: () => ({
    vconsole: false,
    localApps: [],
    envName: import.meta.env.APP_ENV,
    customEnvData: {},
    defaultEnvData: envData[import.meta.env.APP_ENV]
  }),

  persist: true,

  getters: {
    env: state => {
      if (has(envData, state.envName)) {
        return envData[state.envName]
      } else if (!isEmpty(state.customEnvData) && has(state.customEnvData, state.envName)) {
        return state.customEnvData[state.envName]
      } else {
        return state.defaultEnvData
      }
    },
    isEnvChange: state => {
      return state.envName !== import.meta.env.APP_ENV
    },
    isEnvExist: state => envName => {
      return has(envData, envName) || has(state.customEnvData, envName)
    }
  },

  actions: {
    onChangeConsole() {
      this.vconsole = !this.vconsole
    },

    addApplication(item) {
      this.localApps.push(item)
    },

    removeApplication(item) {
      this.localApps = this.localApps.filter(app => app.appId !== item.appId)
    },

    onChangeEnv(envName) {
      this.envName = envName
    },

    onRemoveEnv(key) {
      if (this.envName === key) {
        this.envName = import.meta.env.APP_ENV
      }
      delete this.customEnvData[key]
    },

    updateCustomEnvData(key, value) {
      this.customEnvData[key] = value
    },

    resetEnv() {
      this.envName = import.meta.env.APP_ENV
    }
  }
})
