const path = require('path')
const fs = require('fs-extra')

const manifest_dir = path.join(__dirname, '../../src/manifest.json')

function buildMainfest(type) {
  return new Promise((resolve, reject) => {
    fs.writeJson(
      manifest_dir,
      require('./index')(type),
      {
        encoding: 'utf-8'
      },
      err => {
        !err ? resolve() : reject(err)
      }
    )
  })
}

module.exports = buildMainfest
