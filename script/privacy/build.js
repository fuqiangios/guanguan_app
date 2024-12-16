const path = require('path')
const fs = require('fs-extra')

const privacy_dir = path.join(__dirname, '../../src/androidPrivacy.json')

function buildPrivacy() {
  return new Promise((resolve, reject) => {
    fs.writeJson(
      privacy_dir,
      require('./index')(),
      {
        encoding: 'utf-8'
      },
      err => {
        !err ? resolve() : reject(err)
      }
    )
  })
}

module.exports = buildPrivacy
