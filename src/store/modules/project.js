import { defineStore } from 'pinia'
import { getConfigData, getRoleData, getAreaData, getTemplateData } from '@/api/common'
import { date, showModal } from '@/utils'
import { isEmpty } from 'lodash'
import { sleep } from '@/widget/guan-ui/utils'

export const useProjectStore = defineStore('project', {
  state: () => ({
    switches: {
      register: false,
      supply: false
    },
    corporateScoreUrlApp: null,
    statusData: [],
    roleData: [],
    areaData: [],
    enterpriseTemplateData: [],
    userTemplateData: [],
    lastRequestTime: null
  }),
  persist: true,
  getters: {
    isSupplyEnable: state => state.switches.supply,
    isRegisterEnable: state => state.switches.register,
    transformRole: state => {
      return codes => codes.map(code => state.roleData[code]).join('、')
    },
    getRoleOptions: state => {
      return Object.entries(state.roleData).map(([key, value]) => ({ text: value, value: key }))
    }
  },
  actions: {
    async init() {
      if (this.lastRequestTime && date(this.lastRequestTime).isAfter(date())) {
        return
      }

      try {
        let [configResult, roleDataResult, areaDataResult] = await Promise.all([
          getConfigData(),
          getRoleData(),
          getAreaData()
        ])

        if ([configResult, roleDataResult, areaDataResult].includes(false)) {
          throw new Error('配置信息获取失败')
        }

        // 获取项目角色配置，转化为键值对方便匹配
        roleDataResult = roleDataResult.filter(item => ['公司管理员', '技术负责人', '普通员工'].includes(item.roleName))
        this.roleData = roleDataResult.reduce((data, it) => {
          data[it.roleCode] = it.roleName
          return data
        }, {})

        console.log(this.roleData)

        // 控制器：1、是否允许自主注册；2、首次登录是否需要补全企业/机构信息
        this.switches = {
          register: configResult.isAutonomyRegister,
          supply: configResult.needCompletion
        }

        // 显示评分、评级、监管等级与审核状态
        this.statusData = configResult.needRatingsScores
        // 企业风险等级跳转链接
        this.corporateScoreUrlApp = configResult?.corporateScoreUrlApp ?? ''

        // 格式化地区树以适配级联选择组件
        let areaDataResultStr = JSON.stringify(areaDataResult)
        areaDataResultStr = areaDataResultStr.replace(/label/g, 'text')
        this.areaData = JSON.parse(areaDataResultStr)

        // 设置五分钟缓存时间，减少请求以优化性能
        this.lastRequestTime = date().add(5, 'minute')
        return true
      } catch (error) {
        await sleep(1500)
        let result = await showModal({
          title: '配置信息获取失败',
          content: '请检查网络权限后，再次尝试',
          confirmText: '重新获取'
        })
        if (!result) {
          return false
        }
        this.init()
        return false
      }
    },

    async reload() {
      this.lastRequestTime = null
      return await this.init()
    },

    async getTemplateData(key, code) {
      try {
        let result = await getTemplateData(code)
        if (!result) {
          throw new Error('获取动态模板失败')
        }

        let { templateFileUrl, releaseStatus } = result

        templateFileUrl = JSON.parse(templateFileUrl).app

        if (!releaseStatus) {
          throw new Error('动态模板未发布')
        }

        if (isEmpty(templateFileUrl)) {
          throw new Error('动态模板内容不存在')
        }

        this[key] = templateFileUrl ?? []
      } catch (error) {
        console.log(error.message)
      }
    }
  }
})
