const { version, versionCode } = require('../../package.json')

/**
 * 版本基本信息
 */
const VERSION_CONFIG = type => ({
  name: process.env[type === 'Enterprise' ? 'ENTERPRISE_APP_NAME' : 'MECHANISM_APP_NAME'],
  appid: process.env.APP_ID,
  versionName: version,
  versionCode: versionCode
})

/**
 * 其他配置
 */
const OTHER = {
  networkTimeout: {
    request: process.env.APP_TIMEOUT_REQUEST,
    connectSocket: process.env.APP_TIMEOUT_SOCKET,
    uploadFile: process.env.APP_TIMEOUT_UPLOAD,
    downloadFile: process.env.APP_TIMEOUT_DOWNLOAD
  },
  transformPx: false,
  vueVersion: '3',
  uniStatistics: {
    enable: false
  }
}

module.exports = type => ({
  ...VERSION_CONFIG(type),
  ...require('./app-plus'),
  ...OTHER
})
