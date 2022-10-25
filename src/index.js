#!/usr/bin/env node
const { program, Command } = require('commander');
const { main: imgen, handleConfig: configImgen } = require('./libs/imgen');
const webopen = require('./libs/webopen');
const translate = require('./libs/translate');
const { main: mdgen, handleConfig: configMdgen } = require('./libs/mdgen');
const {
  upload: uploadCloudmusic,
  handleConfig: configCloudmusic,
  login: loginCloudmusic,
} = require('./libs/cloudmusic');

// 版本号
program.version('0.0.5');

/**
 * 用于测试场景，比如一个上传控件限制了图片尺寸，执行后会在当前目录下生成一张特定尺寸/格式的图片，可以定义默认图片生成路径
 * @summary 特定尺寸纯色图片生成
 * @example
 * # 生成一张100x200的png图片
 * imgen 100x200 -t png
 * # 重新生成一张100x200的png图片
 * imgen 100x200 -t png -f
 * # 在指定目录下生成一张图片
 * imgen 100x200 -t png -o '/home/xxx/downloads'
 * # 配置默认生成目录
 * imgen config set OUTDIR '/home/xxx/downloads'
 * @example
 */
function buildImgenCommand() {
  const imgenCmd = new Command('imgen');
  imgenCmd
    .description('generate img by custom size')
    .argument('<size>', 'define custom size')
    .option('-t, --type <type>', 'generate img type', 'jpg')
    .option('-f, --force', 'force generate although img exist', false)
    .option('-o, --outdir <outdir>', 'define image output dir')
    .action((size, { type, force, outdir }) => {
      imgen({ size, type, force, outdir });
    });
  // add config command
  imgenCmd
    .command('config')
    .arguments('<args...>')
    .action((args) => {
      configImgen(...args);
    });
  return imgenCmd;
}
program.addCommand(buildImgenCommand());

/**
 * 通过命令行快速打开网页，能够提高部分效率，比如开发时区分环境部署，一般只需要换个环境参数
 * @summary 快速打开网页
 * @example
 * # 打开baidu
 * webopen https://baidu.com
 * # 设置别名
 * webopen alias baidu https://www.baidu.com/s?wd=${keyword}
 * # 通过别名打开baidu并搜索
 * webopen baidu "今天吃什么"
 * # 显示所有别名
 * webopen alias
 * # 同时打开多个页面
 * webopen baidu "今天吃什么+不想吃饭"
 * @example
 */
function buildWebopenCommand() {
  const webopenCmd = new Command('webopen');
  webopenCmd
    .description('open url quickly')
    .arguments('<args...>')
    .action((args) => {
      webopen(args);
    });
  return webopenCmd;
}
program.addCommand(buildWebopenCommand());

/**
 * ！！谷歌关闭服务，现已无法使用
 * @summary google翻译
 * @example
 * translate 'hello world' -f en -t zh-CN # 你好世界
 * @example
 */
function buildTranslateCommand() {
  const translateCmd = new Command('translate');
  translateCmd
    .description('google translate')
    .argument('<string>', 'string to translate')
    .option('-f, --from <from>', 'from language', 'auto')
    .option('-t, --to <to>', 'to language', 'en')
    .action((text, option) => {
      translate(text, option);
    });
  return translateCmd;
}
program.addCommand(buildTranslateCommand());

/**
 * 在指定目录生成一个带有front matter的markdown文件
 * @summary markdown模版文件生成
 * @example
 * # 指定目录生成md文件
 * mdgen '文件名称' -d '/home/xxx/downloads'
 * # 生成带有标题、目录、标签的文件
 * mdgen '文件名称' --title='文章标题，没有就使用文件名称' --category='目录名称' --tag='标签逗号隔开'
 * # 配置默认目录
 * mdgen config set DEFAULT_OUT_DIR '/home/xxx/downloads'
 * @example
 */
function buildMdgenCommand() {
  const mdgenCmd = new Command('mdgen');
  mdgenCmd
    .description('generate markdown template file with front matter')
    .argument('<filename>', 'file name')
    .option('-T, --title <title>', 'the title of markdown')
    .option('-c, --category <category>', 'category or dirname')
    .option('-t, --tag <tag>', 'tags of markdown')
    .option('-d, --dir <dir>', 'where the markdown output')
    .action((filename, option) => {
      mdgen(filename, option);
    });
  mdgenCmd
    .command('config')
    .arguments('<args...>')
    .action((args) => {
      configMdgen(...args);
    });
  return mdgenCmd;
}
program.addCommand(buildMdgenCommand());

/**
 * 一些通过命令行直接操作网易云音乐的方法，功能有上传本地音乐到云盘...
 * @summary 网易云音乐
 * @example
 * # 登录
 * cloudmusic login 手机号 密码
 * # 上传当前目录的全部音乐
 * cloudmusic upload
 * # 上传当前目录的指定音乐
 * cloudmusic upload '枫.mp3' '搁浅.mp3'
 * # 配置默认上传路径，不配置就使用当前目录
 * cloudmusic config set DEFAULT_UPLOAD_DIR /home/xx/music
 * # 指定上传目录
 * cloudmusic upload -d /home/xx/music
 * @example
 */
function buildCloudmusicCommand() {
  const cloudmusicCmd = new Command('cloudmusic');
  cloudmusicCmd.description('some tools with nestcloudmusic');
  // login
  cloudmusicCmd
    .command('login')
    .argument('<phone>', 'your phone of nestcloudmusic')
    .argument('<password>', 'your password of nestcloudmusic')
    .action((phone, password) => {
      loginCloudmusic(phone, password);
    });
  // upload music
  cloudmusicCmd
    .command('upload')
    .alias('u')
    .description('upload named music')
    .arguments('[args...]', 'named music, or all if name not given')
    .option('-d, --dirname <dirname>', 'upload target dir')
    .action((args, { dirname }) => {
      uploadCloudmusic(args, dirname);
    });
  cloudmusicCmd
    .command('config')
    .alias('c')
    .description('config cloudmusic')
    .arguments('<cfgs...>')
    .action((cfgs) => {
      configCloudmusic(...cfgs);
    });
  return cloudmusicCmd;
}
program.addCommand(buildCloudmusicCommand());

// parse args
program.parse(process.argv);
