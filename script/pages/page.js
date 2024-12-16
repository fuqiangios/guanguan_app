/**
 * 页面扫描注入规则
 */

const path = require('path')

const files = require.context(path.join(__dirname, '../../src/router/modules'), true, /\.js$/)

const pages = []
const startPage = []
const tabPage = []

let tabs = require('./tab')

files.keys().forEach(key => {
  files(key).forEach(item => {
    let options = {
      name: item.name,
      path: item.path,
      style: item.style || {}
    }

    if (!item.meta) {
      pages.push(options)
    } else {
      if (item.meta.tab) {
        tabPage.push({
          pagePath: item.path,
          iconPath: item.meta.iconPath,
          selectedIconPath: item.meta.selectedIconPath,
          text: item.meta.title || '未命名'
        })
      }

      options.style.navigationBarTitleText = item.meta.hasOwnProperty('title') ? item.meta.title : ''

      item.meta.start ? startPage.push(options) : pages.push(options)
    }
  })
})

tabs.list = tabPage

module.exports = {
  pages: startPage.concat(pages),
  tabs
}
