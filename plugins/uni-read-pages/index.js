export default function plugin({ pagesPath }) {
  if (!pagesPath) {
    throw new Error('路由解析失败')
  }
  try {
    pages = require(pagesPath).pages
  } catch (error) {
    throw new Error('路由解析失败')
  }

  let result = {}

  if (pages.length > 0) {
    pages.forEach(({ name, ...attr }) => {
      result[name] = attr
    })
  }

  return {
    name: 'vite:uni-read-pages',
    transform(code, id) {
      if (id.match(/main\.js/)) {
        code = `uni.pages = ${JSON.stringify(result)};
        ${code}
        `
      }

      return {
        code,
        map: null
      }
    }
  }
}
