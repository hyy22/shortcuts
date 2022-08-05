# 命令行快捷指令

作为一名切图仔，开发时总会遇到一些不难却麻烦费时费力的问题，比如要测试一个特定尺寸图片上传的问题，图片从哪里来？可能有的人会直接打开百度图片搜索200*300尺寸的png图片，还有的就默默打开了photoshop???，当然也有网站可以直接生成特定尺寸的图片。。
TODO待补充

## 安装

```bash
# 下载
git clone https://github.com/hyy22/shortcuts.git
cd shortcuts
# 安装依赖
yarn
# 链接到全局
yarn link
```

> 如果使用zsh可以设置别名`nano .zshrc`

```
alias img 'shortcuts imgen'
alias web 'shortcuts webopen'
```

## 查看命令

```bash
shortcuts help
```

## 图片生成

> 在当前目录下生成图片

```bash
# 生成100x200的png图片
img -s 100x200 -t png
# 强制重新生成
img -s 100x200 -t png -f
```

## 快捷访问url

> 可以设置别名，快速访问url

```bash
# 直接打开百度
web https://baidu.com
# 设置别名
web alias baidu https://www.baidu.com/s?wd=${keyword}
# 别名打开
web baidu "今天吃什么"
# 获取别名
web alias baidu
# 获取所有别名
web alias
# 多个参数，会同时打开多个网页
web baidu "今天吃什么+不知道"
# 具名参数，可以不分顺序先后
web alias webdev https://${project}-${env}.xxx.com
web webdev env=i7+stage project=gys
# 默认值
web alias webdev https://${project:gys}-${env}.xxx.com
web webdev env=i7+stage
# 删除别名
web unalias baidu
```