#!/usr/bin/env node
const { program } = require('commander');
const { main: imgen, handleConfig: configImgen } = require('./libs/imgen');
const webopen = require('./libs/webopen');
const translate = require('./libs/translate');
const { main: mdgen, handleConfig: configMdgen } = require('./libs/mdgen');

// 版本号
program.version('0.0.4');

// img generate
// imgen 100x200 -t png -f
program
  .command('imgen')
  .description('generate img by custom size')
  .argument('<size>', 'define custom size')
  .option('-t, --type <type>', 'generate img type', 'jpg')
  .option('-f, --force', 'force generate although img exist', false)
  .option('-o, --outdir <outdir>', 'define image output dir')
  .action((size, { type, force, outdir }) => {
    imgen({ size, type, force, outdir });
  })
  // add config command
  .command('config')
  .arguments('<args...>')
  .action((args) => {
    configImgen(...args);
  });

// web open
// 直接打开 webopen https://baidu.com
// 设置别名 webopen alias baidu https://www.baidu.com/s?wd=${keyword}
// 别名打开 webopen baidu "今天吃什么"
// 获取别名 webopen alias baidu
program
  .command('webopen')
  .description('open url quickly')
  .arguments('<args...>')
  .action((args) => {
    webopen(args);
  });

// google翻译
// translate 'hello world' -f en -t zh-CN #你好世界
// ！！谷歌关闭服务，现已无法使用
program
  .command('translate')
  .description('google translate')
  .argument('<string>', 'string to translate')
  .option('-f, --from <from>', 'from language', 'auto')
  .option('-t, --to <to>', 'to language', 'en')
  .action((text, option) => {
    translate(text, option);
  });

// markdown模版文件生成
// mdgen '文件名称' --title='文章标题，没有就使用文件名称' --category='目录名称' --tag='标签逗号隔开'
// mdgen config DEFAULT_OUT_DIR $HOME
program
  .command('mdgen')
  .description('generate markdown template file with front matter')
  .argument('<filename>', 'file name')
  .option('-T, --title <title>', 'the title of markdown')
  .option('-c, --category <category>', 'category or dirname')
  .option('-t, --tag <tag>', 'tags of markdown')
  .option('-d, --dir <dir>', 'where the markdown output')
  .action((filename, option) => {
    mdgen(filename, option);
  })
  // add config command
  .command('config')
  .arguments('<args...>')
  .action((args) => {
    configMdgen(...args);
  });

// parse args
program.parse(process.argv);
