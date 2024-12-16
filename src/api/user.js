import { get } from './'

export const getUserInfo = () => {
  return get('/base/user', { to: 'base', service: 'cust' })
}
