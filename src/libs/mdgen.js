const chalk = require('chalk');
const { resolve: pathResolve } = require('path');
const { ensureFileSync } = require('fs-extra');
const { writeFileSync, existsSync } = require('fs');
const { init: initConfig } = require('../utils/config');
const { formatDate } = require('../utils/date');

/**
 * 配置
 */
const config = initConfig('.shortcuts/mdgen');
const configDefaultOutDir = 'DEFAULT_OUT_DIR';

/**
 * 写入文件
 * @param {String} file 文件路径
 * @param {Object} param1 内容相关
 */
function writeDateIntoMarkdownFile(file, { title, tag, category }) {
  const currentTime = formatDate(new Date(), 'yyyy/MM/dd hh:mm:ss');
  const data = `---
title: ${title}
date: ${currentTime}
updated: ${currentTime}
categories:${category ? `\n  - ${category}` : ''}
tags:${
    tag
      ? '\n' +
        tag
          .split(',')
          .map((v) => `  - ${v}`)
          .join('\n')
      : ''
  }
---

# ${title}
`;
  writeFileSync(file, data, 'utf-8');
  console.log(chalk.green('markdown文件创建成功'));
}

/**
 * 程序入口
 * @param {String} filename 文件名称，不带后缀
 * @param {Object} options 相关配置
 */
exports.main = function (filename, options) {
  const { title, category, tag, dir } = options;
  // 输出目录
  let outdir = dir || config.get(configDefaultOutDir);
  if (!outdir) {
    console.log(chalk.red('请先指定输出目录'));
    console.log(
      '可以通过`shortcuts mdgen config set DEFAULT_OUT_DIR #dir#` 或者`-d`选项指定'
    );
    return;
  }
  // 拼接目录，需要放在对应的category文件夹下
  let args = [outdir].concat(
    category ? [category, `${filename}.md`] : [`${filename}.md`]
  );
  const output = pathResolve.apply(null, args);
  if (existsSync(output)) {
    console.log(chalk.bgYellow(`创建失败：${filename}文件已存在`));
    return;
  }
  // 创建文件
  ensureFileSync(output);
  // 填充内容
  writeDateIntoMarkdownFile(output, {
    title: title || filename,
    category,
    tag,
  });
};

/**
 * 配置文件
 * @param  {...any} args
 * @returns
 */
exports.handleConfig = function (...args) {
  if (args.length < 2) throw new Error('need at least two arguments');
  switch (args[0]) {
    case 'get':
      console.log(config.get(args[1]));
      return;
    case 'set':
      if (!args[2]) throw new Error('set what?');
      config.set(args[1], args[2]);
      return;
    case 'unset':
      config.remove(args[1]);
      return;
  }
};
