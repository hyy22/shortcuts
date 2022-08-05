// 打开浏览器
const chalk = require('chalk');
const open = require('open');
const { init: initConfig } = require('../utils/config');

/**
 * 配置
 */
const config = initConfig('.shortcuts/webopen');

/**
 * 处理别名
 * @param {...any} args 参数
 * @returns
 */
function handleAlias(...args) {
  switch (args.length) {
    case 0:
      // get all
      return console.log([...config.get().keys()].join('\n'));
    case 1:
      // get
      return console.log(config.get(args[0]));
    default:
      // set
      config.set(args[0], args[1]);
      console.log(chalk.green(`alias ${args[0]} set success`));
  }
}

/**
 * 移除别名
 * @param {String} key 键
 * @returns
 */
function removeAlias(key) {
  console.log(`alias ${key} removed`);
  return config.remove(key);
}

/**
 * 解析url
 * @param {String} url url or alias
 * @param {Array<String>} args params
 */
function parseUrl(url, ...args) {
  const aliasUrl = config.get(url);
  // 防止死循环
  if (aliasUrl && aliasUrl !== url) {
    return parseUrl(aliasUrl, ...args);
  }
  // 获取变量map
  const reg = /\$\{([^}]+)\}/g;
  let paramMap = new Map();
  let m;
  while ((m = reg.exec(url)) !== null) {
    const [param, value = ''] = m[1].split(':');
    // 取第一个有值的默认值
    let defaultValue = paramMap.has(param)
      ? paramMap.get(param).defaultValue || value
      : value;
    paramMap.set(param, { defaultValue });
  }
  // 根据变量解析参数
  let params = [];
  try {
    params = parseParams(args, paramMap);
  } catch (e) {
    return console.log(chalk.red(e.message));
  }
  // 解析url
  if (!params.length) return [url];
  return params.map((v) => {
    return url.replace(reg, (...match) => {
      return encodeURIComponent(v[match[1].split(':')[0]]);
    });
  });
}

/**
 * 解析参数
 * a=1 123 => [{a:1,b=123}]
 * b=123 => [{a:123,b:123}]
 * a=1 b=3 => [{a:1,b:3}]
 * b=134 a=1 => [{a:1,b=134}]
 * 123 345 => [{a:123,b:345}]
 * 123+33 111 => [{a:123,b:111},{a:33,b:111}]
 * b=4 1 => [{a:123,b:4}]
 * @param {Array<String>} params 参数列表
 * @param {Map} map url变量map
 */
function parseParams(params = [], map) {
  if (!map.size) return [];
  // 忽略多余参数
  params = params.slice(0, map.size);
  // map key列表
  const mapKeys = [...map.keys()];
  params.forEach((v, i) => {
    const [name, value] = v.split('=');
    // 是否命名参数
    const hasName = typeof value !== 'undefined';
    if (hasName && map.has(name)) {
      // 命名参数，取对应key赋值
      map.set(name, { ...map.get(name), value });
    } else {
      // 非命名参数，按顺序赋值
      map.set(mapKeys[i], { ...map.get(mapKeys[i]), value: name });
    }
  });
  // 二维数组
  let highArray = [];
  map.forEach((v) => {
    let value = v.value || v.defaultValue;
    highArray.push(value.split('+'));
  });
  // 生成笛卡尔数组
  let values = decareGenerator(...highArray);
  // 二维数组转换成object列表
  return values.reduce((prev, cur) => {
    let o = {};
    cur.forEach((v, i) => (o[mapKeys[i]] = v));
    prev.push(o);
    return prev;
  }, []);
}

/**
 * 生成笛卡尔积
 * @returns
 */
function decareGenerator() {
  return Array.prototype.reduce.call(
    arguments,
    (prev, cur) => {
      const result = [];
      prev.forEach((p) => {
        cur.forEach((c) => {
          result.push(p.concat([c]));
        });
      });
      return result;
    },
    [[]]
  );
}

module.exports = function (args) {
  const isAlias = args[0] === 'alias';
  const isUnAlias = args[0] === 'unalias';
  // 操作alias
  if (isAlias) {
    return handleAlias(...args.slice(1));
  }
  // 删除alias
  if (isUnAlias) {
    return removeAlias(args[1]);
  }
  // 获取url列表
  const urls = parseUrl(...args);
  // 打开url
  urls.forEach((v) => {
    console.log(chalk.green(v));
    open(v);
  });
};
