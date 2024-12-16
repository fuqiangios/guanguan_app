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

export const platform = ifDefPlatform()

export const isApp = platform === PlatformEnum.AppPlus

export const isH5 = platform === PlatformEnum.H5

export const isMpWeixin = platform === PlatformEnum.MpWeixin

export const isMp = platform === PlatformEnum.Mp

export const isDev = import.meta.env.DEV

export const isProd = import.meta.env.PROD

export const isEnterprise = Global.EnterpriseType === 'Enterprise'

export const isMechanism = Global.EnterpriseType === 'Mechanism'
