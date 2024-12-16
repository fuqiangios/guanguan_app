const { pages, tabs } = require('./page')

module.exports = {
  pages: pages,
  easycom: require('./widget'),
  globalStyle: require('./style'),
  tabBar: tabs
}
