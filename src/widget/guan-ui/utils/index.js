/**
 * @description 进行延时
 * @param {number} value 堵塞时间 单位ms 毫秒
 * @returns {Promise} 返回
 */
export function sleep(value = 30) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, value)
  })
}

/**
 * @description 空返回方法
 */
export function func() {}


/**
 * @description 支持异步执行 forEach
 * @param {* array} array 
 * @param {* callback} callback 
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export * from './platform'
export * from './plus'
