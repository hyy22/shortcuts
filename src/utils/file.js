const { statSync, readdirSync } = require('fs');
const { resolve } = require('path');

/**
 * 获取指定文件夹里所有文件
 * @param {String} target 目标文件夹
 * @param {Function} filter 筛选方法，过滤返回true的值
 */
function getAllFiles(target, filter) {
  let files = [];
  function getFiles(t) {
    let isDir = statSync(t).isDirectory();
    if (isDir) {
      readdirSync(t).forEach((v) => {
        getFiles(resolve(t, v));
      });
    } else {
      if (
        !filter ||
        (typeof filter === 'function' && filter.call(null, t) === true)
      )
        files.push(t);
    }
  }
  getFiles(target);
  return files;
}

module.exports = {
  getAllFiles,
};
