/**
 * app-plus 通用配置
 */
const APP_PLUS_CONFIGS = {
  background: "#F6F6F6",
  popGesture: 'none',
  safearea: {
    bottom: {
      offset: 'none'
    }
  },
  screenOrientation: 'portrait-primary',
  usingComponents: true,
  nvueStyleCompiler: 'uni-app',
  compilerVersion: 3,
  splashscreen: {
    alwaysShowBeforeRender: true,
    waiting: true,
    autoclose: true,
    delay: 0
  },
  modules: {}
}

/**
 * iOS 配置（云打包有效）
 */
const iOS_CONFIGS = {
  idfa: false
}

/**
 * Android 配置（云打包有效）
 */
const ANDROID_CONFIGS = {
  permissions: [
    '<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>',
    '<uses-permission android:name="android.permission.MOUNT_UNMOUNT_FILESYSTEMS"/>',
    '<uses-permission android:name="android.permission.VIBRATE"/>',
    '<uses-permission android:name="android.permission.READ_LOGS"/>',
    '<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>',
    '<uses-feature android:name="android.hardware.camera.autofocus"/>',
    '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
    '<uses-permission android:name="android.permission.CAMERA"/>',
    '<uses-permission android:name="android.permission.GET_ACCOUNTS"/>',
    '<uses-permission android:name="android.permission.READ_PHONE_STATE"/>',
    '<uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>',
    '<uses-permission android:name="android.permission.WAKE_LOCK"/>',
    '<uses-permission android:name="android.permission.FLASHLIGHT"/>',
    '<uses-feature android:name="android.hardware.camera"/>',
    '<uses-permission android:name="android.permission.WRITE_SETTINGS"/>'
  ]
}

/**
 * SDK 配置（云打包有效）
 */
const SDK_CONFIGS = {}

module.exports = {
  'app-plus': {
    ...APP_PLUS_CONFIGS,
    distribute: {
      android: {
        ...ANDROID_CONFIGS
      },
      ios: {
        ...iOS_CONFIGS
      },
      sdkConfigs: {
        ...SDK_CONFIGS
      }
    }
  }
}
