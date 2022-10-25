const { login_cellphone, cloud } = require('NeteaseCloudMusicApi');
const ora = require('ora');
const chalk = require('chalk');
const { writeFileSync, readFileSync } = require('fs');
const { homedir } = require('os');
const { resolve: pathResolve, basename } = require('path');
const { init: initConfig } = require('../utils/config');
const { getAllFiles } = require('../utils/file');

/**
 * 配置
 */
const config = initConfig('.shortcuts/cloudmusic');
const defaultUploadDir = 'DEFAULT_UPLOAD_DIR';

/**
 * 上传歌曲
 * @param {*} args 歌曲名称列表
 */
exports.upload = async function (args, dir) {
  // 优先级 dir手动声明 -> config -> pwd当前目录
  const targetDir = dir || config.get(defaultUploadDir) || process.cwd();
  // 歌曲列表，只支持.mp3和.flac格式
  let songs = args.length
    ? args.map((v) => pathResolve(targetDir, v))
    : getAllFiles(targetDir, (v) => v.endsWith('.mp3') || v.endsWith('.flac'));
  // 循环上传
  for (let s of songs) {
    let name = basename(s);
    const spinner = ora(chalk.green(`开始上传${name}...`)).start();
    try {
      await cloud({
        songFile: {
          name,
          data: readFileSync(s),
        },
        cookie: handleLoginCookie().get(),
      });
      spinner.succeed(chalk.green(`${name} 上传成功！`));
    } catch (e) {
      spinner.fail(chalk.red(`${name} 上传失败！`));
      console.log(chalk.gray(e.message));
    }
  }
};

// 刷新cookie
function handleLoginCookie() {
  const cookieFile = pathResolve(homedir(), '.shortcuts/cloudmusic_cookie');
  return {
    get() {
      return readFileSync(cookieFile, 'utf-8');
    },
    set(cookie) {
      writeFileSync(cookieFile, cookie, { flag: 'w', encoding: 'utf-8' });
    },
  };
}

/**
 * 登录网易云音乐
 * @param {string} phone 手机号
 * @param {string} password 密码
 */
exports.login = async function (phone, password) {
  const spinner = ora(chalk.green('loading...')).start();
  try {
    const { body } = await login_cellphone({
      phone,
      password,
    });
    spinner.stop();
    // 保存cookie
    handleLoginCookie().set(body.cookie);
    console.log(chalk.bgGreenBright(`你好: ${body.profile.nickname}`));
  } catch (e) {
    spinner.stop();
    console.log(chalk.red(e.message));
  }
};

/**
 * 处理配置
 * @param  {...any} args 配置参数
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
