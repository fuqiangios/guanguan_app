import { isEnterprise } from '@/utils'
import { useConfigStore } from '@/store/modules/config'
import { get, remove, upload, post } from './'

/**
 * @description 检查新版本
 * @author 赵佳毅
 * @param {*} platform 平台
 * @returns
 */
export const checkVersion = platform => {
  const { env } = useConfigStore()

  const plats = isEnterprise ? env.ENTERPRISE_ANDROID_PLATS : env.MECHANISM_ANDROID_PLATS
  const storeId = isEnterprise ? env.ENTERPRISE_IOS_STORE_ID : env.MECHANISM_IOS_STORE_ID

  return platform === 'ios'
    ? get('/lookup', { to: 'apple', data: { country: 'cn', id: storeId } })
    : get(`/api/plats/${plats}/latest`, { to: 'apphost' })
}

/**
 * @description 获取项目配置
 * @author 陈奕名
 * @param {*} data
 * @returns
 */
export const getConfigData = data => {
  return get('/tvrjet-thirdParty/projectManage/queryConfigByProject', { to: 'operation', data, mute: true })
}

/**
 * @description 获取项目角色配置
 * @author 陈奕名
 * @param {*} data
 * @returns
 */
export const getRoleData = data => {
  return get('/tvrjet-thirdParty/projectManage/queryRoleByProject', { to: 'operation', data, mute: true })
}

/**
 * @description 获取角色权限信息
 * @author 陈奕名
 * @param {*} roleCodeList 角色 Code 列表
 * @returns
 */
export const getPermissionData = roleCodeList => {
  return post('/tvrjet-thirdParty/projectManage/detailProjectRole', {
    to: 'operation',
    data: { roleCodeList },
    mute: true
  })
}

/**
 * @description 获取动态模板信息
 * @author 陈奕名
 * @param {*} type
 * @returns
 */
export const getTemplateData = type => {
  return get('/tvrjet-thirdParty/projectManage/queryTemplateByProject', {
    to: 'operation',
    data: { templateType: type }
  })
}

/**
 * @description 字典查询
 * @author 陈奕名
 * @param {*} code
 * @returns
 */
export const getDictData = code => {
  return get('/tvrjet-thirdParty/projectManage/queryDictTreeByProject', {
    to: 'operation',
    data: { dictTypeCode: code }
  })
}

/**
 * @description 获取服务协议/隐私政策
 * @author 陈奕名
 * @param {*} data
 * @returns
 */
export const getProtocolData = data => {
  return get('/tvrjet-operation-cust-app/projectManage/detailProjectNoAuth', { to: 'operation', data })
}

/**
 * @description MinIO 上传文件
 * @param {*} param0
 * @returns
 */
export const uploadFile = ({ filePath, formData }) => {
  return upload('/tvrjet-org-app/minIoController/unappUpload', { to: 'storage', name: 'file', filePath, formData })
}

/**
 * @description 上传至嘉善监管
 * @author 田峻铭
 * @param {*} param0
 * @returns
 */
export const uploadFileToJiashan = ({ filePath, formData }) => {
  return upload('/api/ProvideDangerInfo/UploadFile?appKey=visitor_admin', { to: 'jiashanStorage', name: 'file', filePath, formData })
}

/**
 * @description MinIO 移除文件
 * @param {*} data
 * @returns
 */
export const removeFile = formData => {
  return remove('/tvrjet-org-app/minIoController/removeOne', { to: 'storage', formData, data: formData })
}

/**
 * @description 获取地区数据
 * @author 陈奕名
 * @returns
 */
export const getAreaData = () => {
  return get('/tvrjet-thirdParty/area/getTree', { to: 'operation', mute: true })
}
