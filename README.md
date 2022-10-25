# 命令行快捷指令

自己在用的一些命令行工具合集

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

```bash
alias img 'shortcuts imgen'
alias web 'shortcuts webopen'
alias translate 'shortcuts translate'
```

## 查看命令

```bash
shortcuts help
```

## 命令列表

### 特定尺寸纯色图片生成

> 用于测试场景，比如一个上传控件限制了图片尺寸，执行后会在当前目录下生成一张特定尺寸/格式的图片，可以定义默认图片生成路径

```bash
# 生成一张100x200的png图片
imgen 100x200 -t png
# 重新生成一张100x200的png图片
imgen 100x200 -t png -f
# 在指定目录下生成一张图片
imgen 100x200 -t png -o '/home/xxx/downloads'
# 配置默认生成目录
imgen config set OUTDIR '/home/xxx/downloads'
```


### 快速打开网页

> 通过命令行快速打开网页，能够提高部分效率，比如开发时区分环境部署，一般只需要换个环境参数

```bash
# 打开baidu
webopen https://baidu.com
# 设置别名
webopen alias baidu https://www.baidu.com/s?wd=${keyword}
# 通过别名打开baidu并搜索
webopen baidu "今天吃什么"
# 显示所有别名
webopen alias
# 同时打开多个页面
webopen baidu "今天吃什么+不想吃饭"
```


### google翻译

> ！！谷歌关闭服务，现已无法使用

```bash
translate 'hello world' -f en -t zh-CN # 你好世界
```


### markdown模版文件生成

> 在指定目录生成一个带有front matter的markdown文件

```bash
# 指定目录生成md文件
mdgen '文件名称' -d '/home/xxx/downloads'
# 生成带有标题、目录、标签的文件
mdgen '文件名称' --title='文章标题，没有就使用文件名称' --category='目录名称' --tag='标签逗号隔开'
# 配置默认目录
mdgen config set DEFAULT_OUT_DIR '/home/xxx/downloads'
```


### 网易云音乐

> 一些通过命令行直接操作网易云音乐的方法，功能有上传本地音乐到云盘...

```bash
# 登录
cloudmusic login 手机号 密码
# 上传当前目录的全部音乐
cloudmusic upload
# 上传当前目录的指定音乐
cloudmusic upload '枫.mp3' '搁浅.mp3'
# 配置默认上传路径，不配置就使用当前目录
cloudmusic config set DEFAULT_UPLOAD_DIR /home/xx/music
# 指定上传目录
cloudmusic upload -d /home/xx/music
```
