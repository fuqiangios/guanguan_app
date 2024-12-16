import { join } from 'path'
import nodeHtmlParser from 'node-html-parser'

const ErrorId = {
  10001: 'pages.json文件解析异常, 请查看抛出的异常信息',
  10102: 'App.vue文件中<view-router />标签数量超过1个以上',
  10201: '运行环境异常'
}

let addLabel = {
  header: [],
  footer: []
}

/**
 * 获取 配置
 * @param {*} options
 * @returns
 */
function getConfigure(options) {
  const config = Object.assign({}, Config, options)
  const routeFilePathRegList = getRouteFileMatchRegAll()

  return {
    config,
    routeFilePathRegList
  }
}

/**
 * 处理 App.vue 文件
 * @param {*} source
 * @returns
 */
function handleAppVue(source) {
  const handleAppRefs = handleAppTemplateAddCode(source)
  const labelList = handleGetTemplateRowCode(handleAppRefs.addCode)
  const handleLabelList = handleGetTemplateHeaderOrFooterLabelCode(labelList)

  source = handleAppRefs.source
  addLabel = { ...addLabel, ...handleLabelList }

  return source
}

/**
 * 处理 路由文件
 * @param {*} source
 * @param {*} path
 * @returns
 */
function handleRouteFile(source) {
  source = addCodeToHeader(source, addLabel.header.join(''))
  source = addCodeToFooter(source, addLabel.footer.join(''))

  return source
}

/**
 * 添加代码到头部
 * @param {*} source
 * @param {*} code
 */
function addCodeToHeader(source, code) {
  return source.replace(/<template(.*?)>/, s => s + code)
}

/**
 * 添加代码到尾部
 * @param {*} source
 * @param {*} code
 */
function addCodeToFooter(source, code) {
  return source.replace(/(<\/template>)(?!(([\s\S]*)(<\/template>)))/, s => code + s)
}

/**
 * 获取 App.vue 文件中 template 默认内容
 * @param {*} source
 * @returns
 */
function handleAppTemplateAddCode(source) {
  let addCode = ''
  source = source.replace(/<template>[\s\S]+<\/template>/, s => {
    addCode = s
    return ''
  })

  return {
    source,
    addCode
  }
}

/**
 * 获取 template 代码中的每组闭合根标签
 * 先移除template标签再匹配
 * 例如：3组根闭合标签
 * ```
 * <text>123</text>
 * <view />
 * <view>
 *     <text>123</text>
 * </view>
 * ```
 * @param {*} source
 */
function handleGetTemplateRowCode(source) {
  source = source.replace(/<(\/?)template>/g, '')

  // 过滤注释标签并解第一层级的所有标签
  const codeStrList = nodeHtmlParser.parse(source).querySelectorAll('> *').toString().split(',')

  // 过滤 \n和空格
  return codeStrList.map(codeStr => codeStr.replace(/\n\s+/g, ''))
}

/**
 * 获取 App.vue代码中实际添加到页面代码的头部或尾部标签
 * @param {*} labelList
 * @returns
 */
const handleGetTemplateHeaderOrFooterLabelCode = function (labelList) {
  const viewRouterReg = /<view-router(\s{0,})><\/view-router>/
  const header = []
  const footer = []

  let flag = false
  let count = 0

  labelList.forEach(label => {
    if (viewRouterReg.test(label)) {
      flag = true
      count++
      return true
    }

    if (flag) {
      footer.push(label)
    } else {
      header.push(label)
    }
  })
  // 标签异常
  if (count > 1) {
    console.error(ErrorId[10102])
  }

  return {
    header,
    footer
  }
}

/**
 * 获取 文件匹配正则（vue或nvue文件）
 * @param {string} publicPath
 * @param {string} path
 * @returns
 */
const getFileMatchReg = function (publicPath, path) {
  const fullPath = join(publicPath, `/${path}`)
  const regStr = JSON.stringify(`^${fullPath}.(n)?vue$`)
  const reg = new RegExp(regStr.substring(1, regStr.length - 1))

  return reg
}

function plugin({ pagesPath }) {
  if (!pagesPath) {
    throw new Error('路由解析失败')
  }
  const APP_PATH = join(process.env.UNI_INPUT_DIR, './App.vue')
  let pages = []

  try {
    pages = require(pagesPath).pages
    pages = pages.map(item => {
      return getFileMatchReg(process.env.UNI_INPUT_DIR, item.path)
    })
  } catch (error) {
    throw new Error('路由解析失败')
  }

  return {
    name: 'vite:uni-router-view',
    enforce: 'pre',
    transform(source, path) {
      if (path === APP_PATH) {
        source = handleAppVue(source)
      }

      if (pages.some(reg => reg.test(path))) {
        source = handleRouteFile(source)
      }

      return { code: source }
    }
  }
}

export default plugin
