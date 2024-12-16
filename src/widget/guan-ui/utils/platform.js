const PlatformEnum = Object.freeze({
  AppPlus: 'APP-PLUS',
  AppPlusNvue: 'APP-PLUS-NVUE',
  H5: 'H5',
  MpWeixin: 'MP-WEIXIN',
  Mp: 'MP'
})

function ifDefPlatform(platform = '') {
  //#ifdef APP-PLUS
  platform = PlatformEnum.AppPlus
  //#endif
  //#ifdef APP-PLUS-NVUE
  platform = PlatformEnum.AppPlusNvue
  //#endif
  //#ifdef H5
  platform = PlatformEnum.H5
  //#endif
  //#ifdef MP-WEIXIN
  platform = PlatformEnum.MpWeixin
  //#endif
  //#ifdef MP
  platform = PlatformEnum.Mp
  //#endif

  return platform
}

function ifPCPlatform() {
  let flag = false

  if (ifDefPlatform() === PlatformEnum.H5) {
    const userAgentInfo = navigator.userAgent
    const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']

    for (let v = 0; v < Agents.length - 1; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false
        break
      }
    }
  }

  return flag
}

export const platform = ifDefPlatform()

export const isPC = ifPCPlatform()

export const isApp = platform === PlatformEnum.AppPlus

export const isH5 = platform === PlatformEnum.H5

export const isMpWeixin = platform === PlatformEnum.MpWeixin

export const isMp = platform === PlatformEnum.Mp
