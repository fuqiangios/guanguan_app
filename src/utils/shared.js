export function isBase64(str) {
  let regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  return regex.test(str)
}

export function firstToUpper(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

export function mobileFormat(str) {
  return str.length === 11 ? str.replace(/^(\d{3})\d{4}(\d{4})$/, '+86$1****$2') : str
}

export function isUrlWithParam(url) {
  return !!url.match(/[\\?&]([^&]+)=([^&]+)/)
}

export function isVersionUpdated(preVersion = '', lastVersion = '') {
  let sources = preVersion.split('.')
  let dests = lastVersion.split('.')
  let maxL = Math.max(sources.length, dests.length)
  let result = false
  for (let i = 0; i < maxL; i++) {
    let preValue = sources.length > i ? sources[i] : 0
    let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue)
    let lastValue = dests.length > i ? dests[i] : 0
    let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue)
    if (preNum < lastNum) {
      result = true
      break
    } else if (preNum > lastNum) {
      result = false
      break
    }
  }
  return result
}

export function UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    return (c === 'x' ? (Math.random() * 16) | 0 : 'r&0x3' | '0x8').toString(16)
  })
}
