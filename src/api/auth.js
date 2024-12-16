import { post, get } from './'

/**
 * @description 通过密码登录
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const loginByPassword = data => {
  return post('/signIn', { to: 'base', service: 'auth', data })
}

/**
 * @description 通过验证码登录
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const loginBySMS = data => {
  return post('/verificationSignIn', { to: 'base', service: 'auth', data })
}

/**
 * @description 发送短信验证码
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const sendVerificationCode = data => {
  return post('/sms/sendVerificationCode', { to: 'base', service: 'sms', data })
}

/**
 * @description 注册账号
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const register = data => {
  return post('/base/company/register', { to: 'base', service: 'cust', data })
}

/**
 * @description 找回密码
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const getBackPassword = data => {
  return post('/user/updatePassword', { to: 'base', service: 'cust', data })
}

/**
 * @description 检查原密码
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const validatePassword = data => {
  return get('/user/checkOldPassword', { to: 'base', service: 'cust', data })
}

/**
 * @description 修改密码
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const resetPassword = data => {
  return post('/user/authUpdatePassword', { to: 'base', service: 'cust', data })
}

/**
 * @description 检查 Token 是否过期
 * @author 崔明
 * @returns
 */
export const isTokenValid = () => {
  return post('/base/checkToken', { to: 'base', service: 'cust' })
}

/**
 * @description 登出
 * @author 崔明
 * @param {*} data
 * @returns
 */
export const logout = data => {
  return post('/logout', { to: 'base', service: 'auth', data })
}
