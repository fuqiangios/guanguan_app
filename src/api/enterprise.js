import { get, post, put, remove } from './'
import { isEnterprise } from '@/utils'

const EnterpriseModule = isEnterprise ? 'baseEnterprise' : 'baseAgency'

/**
 * @description 获取企业或机构列表
 * @author 崔明
 * @returns
 */
export const getEnterpriseList = () => {
  return get('/base/company/list', { to: 'base', service: 'cust' })
}

/**
 * @description 获取企业或机构详情
 * @author 崔明
 * @returns
 */
export const getEnterpriseDetail = () => {
  return get('/base/company/info', { to: 'base', service: 'cust' })
}

/**
 * @description 编辑企业或机构详情
 * @author 崔明
 * @returns
 */
export const editEnterpriseDetail = data => {
  return put('/base/company', { to: 'base', service: 'cust', data })
}

/**
 * @description 机构获取企业模板及详情
 * @author 崔明
 * @returns
 */
export const getEnterpriseInfo = data => {
  return get('/baseAgency/getEnterpriseInfo', { to: 'base', service: 'cust', data })
}

/**
 * @description 根据企业名称或统一社会信用代码判断企业是否存在
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const isEnterpriseExist = data => {
  return get('/base/company/exist', { to: 'base', service: 'cust', data })
}

/**
 * @description 查询企业人员
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const getEnterpriseMemberList = data => {
  return get('/base/company/users', { to: 'base', service: 'cust', data })
}

/**
 * @description 增加企业/机构人员
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const addEnterpriseMember = data => {
  return post(`/${EnterpriseModule}/user`, { to: 'base', service: 'cust', data })
}

/**
 * @description 编辑企业/机构人员
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const modifyEnterpriseMember = data => {
  return put(`/${EnterpriseModule}/user`, { to: 'base', service: 'cust', data })
}

/**
 * @description 获取部门列表
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const getOrganList = data => {
  return post(`/sysOrgan/tree`, { to: 'base', service: 'cust', data })
}

/**
 * @description 获取企业/机构人员详情
 * @author 崔明
 * @param {*} userId
 * @returns
 */
export const getEnterpriseMemberDetail = userId => {
  return get(`/${EnterpriseModule}/user/${userId}`, { to: 'base', service: 'cust' })
}

/**
 * @description 删除企业/机构人员
 * @author 崔明
 * @param {*} userId
 * @returns
 */
export const removeEnterpriseMember = userId => {
  return remove(`/base/company/user?id=${userId}`, { to: 'base', service: 'cust' })
}

/**
 * @description 重置人员密码
 * @author 崔明
 * @param {*} userId
 * @returns
 */
export const resetEnterpriseMemberPassword = data => {
  return put('/base/user/resetPassword', { to: 'base', service: 'cust', data })
}
