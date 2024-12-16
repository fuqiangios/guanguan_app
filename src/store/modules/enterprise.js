import { defineStore } from 'pinia'
import { getEnterpriseList, getEnterpriseDetail, getOrganList } from '@/api/enterprise'
import { getAppletList } from '@/api/micro'
import { isEmpty } from 'lodash'
import { useUserStore } from './user'
import { useProjectStore } from './project'
import { useConfigStore } from './config'

import Constant from '@/constant'

export const useEnterpriseStore = defineStore('enterprise', {
  state: () => ({
    projectVersionId: '',
    currentEnterprise: '',
    currentEnterpriseDetail: null,
    enterpriseList: [],
    appletList: [],
    enterpriseOrganList: []
  }),

  persist: true,

  getters: {
    shouldSupply: state => {
      const { switches } = useProjectStore()
      if (switches.supply) {
        return state.currentEnterpriseDetail.updateCount === 0
      } else {
        return false
      }
    },
    defaultOrganId: state=> {
      return state.enterpriseOrganList[0].organId
    }
  },

  actions: {
    getEnterpistList() {
      return new Promise(async resolve => {
        try {
          let listResult = await getEnterpriseList()

          if (!listResult) {
            throw new Error('未获取到企业列表')
          }

          this.enterpriseList = listResult || []

          if (listResult.length === 1) {
            // TODO: 机构 ID 需要确认
            let res = await this.setCurrentEnterprise(listResult[0].companyId)
            if (!res) {
              throw new Error('企业详情获取失败')
            }
          }

          resolve(listResult)
        } catch (error) {
          console.log(error.message)
          resolve(false)
        }
      })
    },

    getEnterpriseDetail() {
      const { getTemplateData } = useProjectStore()

      return new Promise(async resolve => {
        let res = await getEnterpriseDetail()
        if (!res || isEmpty(res)) {
          resolve(false)
          return
        }

        this.currentEnterpriseDetail = res
        this.projectVersionId = res?.projectVersionId ?? ''
        
        // 获取动态模板
        getTemplateData('enterpriseTemplateData', Constant[Global.EnterpriseType].TEMPLATE_INFO_CODE),
        getTemplateData('userTemplateData', Constant[Global.EnterpriseType].TEMPLATE_MEMBER_CODE)
        
        resolve(true)
      })
    },

    getEnterpriseOrgan() {
      return new Promise(async resolve => {
        let res = await getOrganList()
        if (!res || isEmpty(res)) {
          resolve(false)
          return
        }

        this.enterpriseOrganList = res
       
        resolve(true)
      })
    },
    setCurrentEnterprise(enterpriseId) {
      const { getUserInfo, getPermissionData } = useUserStore()
      return new Promise(async resolve => {
        try {
          if (!enterpriseId) {
            throw new Error('缺少企业ID')
          }

          let enterprise = this.enterpriseList.find(item => item.companyId === enterpriseId)

          if (isEmpty(enterprise)) {
            throw new Error('企业不存在')
          }

          console.log(enterprise)

          this.currentEnterprise = enterpriseId

          let [detailResult, userResult, permissionResult, organResult] = await Promise.all([
            this.getEnterpriseDetail(),
            getUserInfo(),
            getPermissionData(enterprise.roleCodeList),
            this.getEnterpriseOrgan()
          ])

          if (!detailResult || !userResult || !permissionResult || !organResult) {
            throw new Error('获取企业详情/用户信息/权限信息失败')
          }

          resolve(true)
        } catch (error) {
          console.log(error.message)
          this.currentEnterprise = ''
          resolve(false)
        }
      })
    },

    getEnterpriseAppletList() {
      const { localApps } = useConfigStore()

      try {
        return new Promise(async resolve => {
          let result = await getAppletList()
          if (!result) {
            throw new Error('未查询到应用数据')
          }
          if (!isEmpty(localApps.value)) {
            result = result.concat(localApps.value)
          }
          this.appletList = result
          console.log(this.appletList )
          resolve(true)
        })
      } catch (error) {
        console.log(error.message)
        this.appletList = []
        resolve(false)
      }
    }
  }
})
