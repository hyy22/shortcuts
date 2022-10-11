const chalk = require('chalk');
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

/**
 * 解析入口js文件
 * @param {String} data 文件内容
 * @returns {Array<String>}
 */
function parseEntryFile(data) {
  const regExp = /\/\*\*(\s|\S)+?\*\//g;
  let comments = [];
  let match;
  while ((match = regExp.exec(data)) !== null) {
    comments.push(parseComment(match[0]));
  }
  return comments;
}

/**
 * 解析多行注释
 * @param {String} comment 注释
 * @returns {Object}
 */
function parseComment(comment) {
  // 当前行类型，默认描述
  let curType = 'description';
  return comment
    .split('\n')
    .slice(1, -1)
    .reduce((prev, cur) => {
      // 移除开头无效字符
      let line = cur.replace(/^\s*\*+\s*/, '');
      if (line.startsWith('@summary')) {
        curType = 'summary';
      }
      if (line.startsWith('@example')) {
        curType = 'example';
      }
      switch (curType) {
        case 'description':
          prev.description
            ? prev.description.push(line)
            : (prev.description = [line]);
          break;
        case 'summary':
          prev.summary = line.replace(/^\s*@summary\s*/, '');
          break;
        case 'example':
          // eslint-disable-next-line no-case-declarations
          let exampleLine = line.replace(/^\s*@example\s*/, '');
          if (exampleLine) {
            prev.example
              ? prev.example.push(exampleLine)
              : (prev.example = [exampleLine]);
          }
          break;
      }
      return prev;
    }, {});
}

/**
 * 生成readme文件
 * @param {Array<Object>} docs 注释解析结果
 */
function generateReadMe(docs = []) {
  let data = `# 命令行快捷指令

自己在用的一些命令行工具合集

## 安装

\`\`\`bash
# 下载
git clone https://github.com/hyy22/shortcuts.git
cd shortcuts
# 安装依赖
yarn
# 链接到全局
yarn link
\`\`\`

> 如果使用zsh可以设置别名\`nano .zshrc\`

\`\`\`bash
alias img 'shortcuts imgen'
alias web 'shortcuts webopen'
alias translate 'shortcuts translate'
\`\`\`

## 查看命令

\`\`\`bash
shortcuts help
\`\`\`

## 命令列表
${docs
  .map(
    (v) => `
### ${v.summary}

${v.description.map((d) => `> ${d}`).join('\n')}

\`\`\`bash
${v.example.join('\n')}
\`\`\`
`
  )
  .join('\r\n')}`;
  writeFileSync(resolve(__dirname, '../README.md'), data, 'utf-8');
  console.log(chalk.greenBright('readme文件已更新'));
}

(function () {
  const entryFileData = readFileSync(
    resolve(__dirname, '../src/index.js'),
    'utf-8'
  );
  const docs = parseEntryFile(entryFileData);
  generateReadMe(docs);
})();
