import { resolve } from 'path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { setupHotJs, createHotVitePlugin } from './plugins/uni-pages-hot-modules'
import h5ProdEffectPlugin from 'uni-vite-plugin-h5-prod-effect'

import readPagesPlugin from './plugins/uni-read-pages'
import vwt from 'weapp-tailwindcss-webpack-plugin/vite'
import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss'
setupHotJs('inject')

const pagesPath = resolve(__dirname, './script/pages/')
const isH5 = ['h5'].includes(process.env.BUILD_PLATFORM)
const isApp = ['app'].includes(process.env.BUILD_PLATFORM)

const extraPlugin = []

const postcssPlugins = [
  require('autoprefixer')(),
  require('tailwindcss')({
    config: resolve(__dirname, './tailwind.config.js')
  })
]

if (!isH5) {
  extraPlugin.push(vwt())
  postcssPlugins.push(postcssWeappTailwindcssRename({}))
}

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        env: resolve(__dirname, 'env')
      }
    },
    define: {
      Global: {
        EnterpriseType: process.env.TYPE
      }
    },
    envPrefix: ['ENTERPRISE_', 'MECHANISM_', 'APP_'],
    plugins: [uni(), createHotVitePlugin(), h5ProdEffectPlugin(), readPagesPlugin({ pagesPath })].concat(extraPlugin),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$isH5: ${isH5}; $isApp: ${isApp};`
        }
      },
      postcss: {
        plugins: postcssPlugins
      }
    }
  }
})
