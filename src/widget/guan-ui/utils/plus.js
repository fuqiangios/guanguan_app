import { has } from 'lodash'
import { isApp } from './platform'

/**
 * @description 从系统相册选择文件（图片或视频） 从系统相册中选择图片或视频文件。每次仅能选择一个文件，选择后将返回选择的文件路径。
 * @param {Object} options: PlusGalleryGalleryOptions
 * @returns Promise
 */
export function onChooseMedia(options) {
  options.filter = options.filter || 'none'
  options.maximum = options.maximum || 9
  options.multiple = options.multiple || true

  return new Promise(resolve => {
    plus.gallery.pick(
      async ({ files }) => {
        await Promise.all(
          files.map(async file => {
            let { size } = await getFileInfo(file)
            return { path: file, size }
          })
        ).then(resolve)
      },
      () => resolve([]),
      options
    )
  })
}

/**
 * @description 获取文件信息
 * @param {URL} path
 * @param {String} digestAlgorithm
 * @returns Promise
 */
export function getFileInfo(path, digestAlgorithm = 'md5') {
  return new Promise(resolve => {
    plus.io.getFileInfo({
      filePath: path,
      digestAlgorithm,
      success: resolve,
      fail: () => resolve({ size: 0 })
    })
  })
}

/**
 * @description 从底部向上弹出操作菜单
 * @param {String[]} itemList
 * @param {String} title 标题
 * @returns Promise
 */
export function showActionSheet(itemList, title = '') {
  return new Promise(resolve => {
    if (!isApp) {
      uni.showActionSheet({
        itemList,
        success: ({ tapIndex }) => resolve(tapIndex + 1)
      })
    } else {
      itemList = itemList.map(item => ({ title: item }))
      plus.nativeUI.actionSheet(
        {
          title: title,
          cancel: '取消',
          buttons: itemList
        },
        ({ index }) => resolve(index)
      )
    }
  })
}

/**
 * @description 从本地相册选择图片或使用相机拍照
 * @param {Object} options
 * @param {Number} options.count 最多可以选择的图片张数
 * @param {String[]} options.sizeType original 原图，compressed 压缩图，默认二者都有
 * @param {String} options.source album 从相册选视频，camera 使用相机拍摄
 * @param {Boolean} returnAll 返回所有数据
 * @returns Promise
 */
export function onChooseImage({ sizeType, count, source }, returnAll = false) {
  return new Promise(resolve => {
    uni.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: [source],
      success: res => {
        resolve(returnAll ? res : res.tempFiles)
      },
      fail: () => resolve([])
    })
  })
}

/**
 * @description 拍摄视频或从手机相册中选视频，返回视频的临时文件路径。
 * @param {Object} options
 * @param {* boolean} options.compressed 是否需要压缩
 * @param {number} options.maxDuration 拍摄视频最长拍摄时间，单位秒。最长支持 60 秒
 * @param {string} options.camera front: 前置摄像头 back: 后置摄像头
 * @param {String} options.source album 从相册选视频，camera 使用相机拍摄
 * @returns Promise
 */
export function onChooseVideo({ source, compressed, maxDuration, camera }) {
  return new Promise(resolve => {
    uni.chooseVideo({
      sourceType: [source],
      compressed: compressed,
      maxDuration: maxDuration,
      camera: camera,
      success(res) {
        let { name, size, duration, tempFilePath: path } = res
        let type = ''
        has(res, 'tempFile') && ({ type } = res.tempFile)
        resolve([{ name, size, duration, path, type }])
      },
      fail: () => resolve([])
    })
  })
}

/**
 * @description 获取节点布局信息
 * @param {String} selector 元素节点
 * @param {Boolean} all 是否返回全部节点信息
 * @returns {Promise} 返回
 */
export function getRect(selector, all = false) {
  return new Promise(resolve => {
    uni
      .createSelectorQuery()
      .in(this)
      [all ? 'selectAll' : 'select'](selector)
      .boundingClientRect(rect => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect)
        }
        if (!all && rect) {
          resolve(rect)
        }
      })
      .exec()
  })
}

/**
 * @description 获取配置信息
 * @returns {Promise} 返回
 */
export function getProperty() {
  return new Promise(resolve => {
    plus.runtime.getProperty(plus.runtime.appid, function (property) {
      resolve(property)
    })
  })
}
