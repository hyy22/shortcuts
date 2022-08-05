/**
 * 操作配置文件
 * 1. key1 value1
 * 2. key2 value2
 */
const { readFileSync, writeFileSync } = require('fs');
const { ensureFileSync } = require('fs-extra');
const { homedir } = require('os');
const { resolve } = require('path');

/**
 * 初始化配置
 * @param {String} cfgFilePath 相对于home目录的文件路径
 */
function init(filePathRelativeHomeDir) {
  const configFilePath = resolve(homedir(), filePathRelativeHomeDir);
  ensureFileSync(configFilePath);
  // 读取配置文件
  const readCfgFile = () => {
    return readFileSync(configFilePath, 'utf-8');
  };
  // 写入配置文件
  const writeCfgFile = (cfg) => {
    let cfgString = '';
    cfg.forEach((val, k) => {
      cfgString += `${k} ${val}\n`;
    });
    return writeFileSync(configFilePath, cfgString, 'utf-8');
  };
  return {
    // 获取key的值，没有key的话读取全部
    get(key) {
      const configData = readCfgFile();
      const cfg = configData
        .split('\n')
        .filter((v) => v)
        .reduce((prev, cur) => {
          const [k, v] = cur.split(/\s+/);
          prev.set(k, v);
          return prev;
        }, new Map());
      return key ? cfg.get(key) : cfg;
    },
    // 设置
    set() {
      if (arguments.length < 2) throw new Error('need at least two arguments!');
      const cfg = this.get();
      cfg.set(...Array.prototype.slice.call(arguments, 0, 2));
      writeCfgFile(cfg);
    },
    // 移除，成功返回true，失败返回false
    remove(key) {
      if (!key) throw new Error('no key');
      const cfg = this.get();
      const result = cfg.delete(key);
      writeCfgFile(cfg);
      return result;
    },
    // 清空
    clear() {
      writeCfgFile(new Map());
      return true;
    },
  };
}

module.exports = { init };
