import { get } from './'

export const getAppletList = data => {
  return get('/tvrjet-operation-cust-app/projectManage/queryAppByProject', { to: 'operation', data })
}
