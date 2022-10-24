const { createCanvas } = require('canvas');
const { existsSync, createWriteStream } = require('fs');
const path = require('path');
const chalk = require('chalk');
const { init: initConfig } = require('../utils/config');

/**
 * 配置
 */
const config = initConfig('.shortcuts/imgen');

/**
 * 生成随机颜色
 */
function generateRandomColor() {
  let r = Math.round(Math.random() * 255);
  let g = Math.round(Math.random() * 255);
  let b = Math.round(Math.random() * 255);
  let a = Number(Math.random().toFixed(1));
  return {
    r,
    g,
    b,
    a,
  };
}

/**
 * 解析尺寸
 * @param {string} size 尺寸:如200x300
 * @returns {}
 */
function parseWH(size) {
  if (!/\d+\D\d+/.test(size)) throw new Error('size format error');
  const [w, h] = size.split(/\D/);
  return {
    w: Number(w),
    h: Number(h),
  };
}

/**
 * 生成图片
 * @param {String} size 尺寸
 * @param {String} rgba 颜色
 * @param {String} type 类型
 * @returns
 */
function generateImage(size, rgba, type = 'jpg') {
  const canvas = createCanvas(size.w, size.h);
  const ctx = canvas.getContext('2d');
  // 定义填充颜色
  ctx.fillStyle =
    type === 'png'
      ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
      : `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
  // 绘制矩形
  ctx.fillRect(0, 0, size.w, size.h);
  // 绘制文字
  const renderText = `${size.w}X${size.h}`;
  const {
    width: textWidth,
    actualBoundingBoxAscent,
    actualBoundingBoxDescent,
  } = ctx.measureText(renderText);
  if (textWidth < size.w) {
    ctx.fillStyle = '#fff';
    ctx.font = '14px';
    ctx.fillText(
      renderText,
      size.w / 2 - textWidth / 2,
      size.h / 2 - (actualBoundingBoxAscent + actualBoundingBoxDescent) / 2,
      size.w
    );
  }
  // 输出
  return type === 'png' ? canvas.createPNGStream() : canvas.createJPEGStream();
}

/**
 * 程序入口
 * @param {String} size 尺寸 200*300
 * @param {String} type 类型 jpg, png
 * @param {Boolean} force 是否重新生成
 * @param {String} outdir 图片输出目录
 */
exports.main = function ({ size, type = 'jpg', force, outdir }) {
  // 确定输出路径，优先级：outdir -> prefer -> pwd
  const OUTDIR = outdir || config.get('OUTDIR') || process.cwd();
  // 图片生成规则
  const filepath = path.resolve(OUTDIR, `${size}.${type}`);
  // 校验是否存在，已存在直接返回
  if (existsSync(filepath) && !force) {
    console.log(chalk.green(filepath));
    return;
  }
  // 生成图片
  let sizeObject = {};
  try {
    sizeObject = parseWH(size);
  } catch (e) {
    console.log(chalk.red(e.message));
  }
  let colorObject = generateRandomColor();
  // 生成图片
  const writeStream = createWriteStream(filepath);
  const readStream = generateImage(sizeObject, colorObject, type);
  readStream.pipe(writeStream);
  // 返回路径
  console.log(chalk.green(filepath));
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
