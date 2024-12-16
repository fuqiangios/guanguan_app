/**
 * @description 模态窗 Promise
 * @param {String} title 标题
 * @param {String} content 内容
 * @param {String} confirmText 确定按钮的文字，默认为确认
 * @param {Boolean} showCancel 是否显示取消
 * @returns {Promise} 返回
 */
export function showModal({ title, content, confirmText = '确认', showCancel }) {
  return new Promise(resolve => {
    uni.showModal({
      title,
      content,
      confirmText,
      showCancel,
      success: res => {
        if (res.cancel) {
          resolve(false)
        } else if (res.confirm) {
          resolve(true)
        }
      },
      error: err => {
        resolve(false)
      }
    })
  })
}
