const sharp = require('sharp');
const text2svg = require('text-to-svg');
const { existsSync } = require('fs');
const path = require('path');
const chalk = require('chalk');

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
 * @param {*} size 尺寸
 * @param {*} rgba 颜色
 * @param {*} type 类型
 * @returns 
 */
function generateImage(size, rgba, type = 'jpg') {
  let stream = sharp({
    create: {
      width: size.w,
      height: size.h,
      channels: 4,
      background: { r: rgba.r, g: rgba.g, b: rgba.b, alpha: type === 'png' ? rgba.a : 1 },
    }
  });
  return type === 'png' ? stream.png() : stream.jpeg();
}

/**
 * 程序入口
 * @param {*} size 尺寸 200*300
 * @param {*} type 类型 jpg, png
 * @param {*} force 是否重新生成
 */
module.exports = async function(size, type = 'jpg', force) {
  // 确定输出路径
  const OUTDIR = process.cwd();
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
  // 生成文字svg
  const textSvg = text2svg.loadSync().getSVG(size, {
    x: 0,
    y: 0,
    fontSize: 32,
    anchor: 'top',
    attributes: {
      fill: 'white',
    }
  });
  // 合成失败就取消合成
  try {
    await generateImage(sizeObject, colorObject, type)
      .composite([{ input: Buffer.from(textSvg), gravity: 'center', failOnError: false }])
      .toFile(filepath);
  } catch (e) {
    await generateImage(sizeObject, colorObject, type)
      .toFile(filepath);
  }
  
  // 返回路径
  console.log(chalk.green(filepath));
}
