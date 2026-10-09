<div align="center" >
<img style="display: block; margin: 0 auto; " src="./src/assets/logo.png" width="200" height="200" />
</div>

<h1 align="center">豆包下载器</h1>
<p align="center">豆包 AI 无水印资源批量下载浏览器扩展/油猴脚本。</p>

<div align="center">

<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/LauZzL/doubao-downloader?style=for-the-badge">
<a href="https://github.com/LauZzL/doubao-downloader/releases/latest">
<img alt="GitHub Release" src="https://img.shields.io/github/v/release/LauZzL/doubao-downloader?style=for-the-badge">
</a>
<img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/LauZzL/doubao-downloader/total?style=for-the-badge">

</div>

> [!WARNING]
> 2.0版本已完成重构，可能仍存在一些未被发现的BUG，如果你追求稳定性请选择1.x版本，但在1.x版本中视频提取未被支持。

## 开始使用

你可以拉取代码自行构建或到[Releases](https://github.com/LauZzL/doubao-downloader/releases/latest)下载构建好的文件。

> 构建后的文件位于 `dist` 目录下。

### 以油猴脚本形式使用

> 如果你的浏览器已经安装了油猴插件，那么你可以在 `Releases` 中点击 `doubao-downloader.user.js` 即可自动跳转至安装页面(这可能需要你有良好的网络环境)。

将 `doubao-downloader.user.js` 添加到油猴扩展中使用。

### 以浏览器扩展形式使用

> 你必须要打开浏览器扩展页面的 `开发者模式` 选项才能以扩展方式使用。

- 手动打包：在浏览器扩展页面中选择 `加载未打包的扩展程序`，选择 `dist` 目录，导入即可。

![KOLlEle.png](https://iili.io/KOLlEle.png)

- 使用构建好的文件：`.zip` 文件可直接拖入进行添加，或解压后选择 `加载未打包的扩展程序` 导入。

> `.crx` 文件暂时无法拖入安装，安装后可能无法正常使用。

## 常见问题

### 1. 安装成功还是有水印？

> [!NOTE]
> ~~我们考虑在 `2.0.0` 版本中添加配置项，用于在部分情况下将两张图片进行拼接，以去除水印。~~

> 请先查看该issue：[“AI生成”字样能去除吗？ #7](https://github.com/LauZzL/doubao-downloader/issues/7)

暂时不清楚为什么部分账号无法获取无水印图片，建议切换账号或环境使用。

### 2. 图像生成的区域重绘、智能编辑、变清晰等功能无法获取无水印图片

这几个功能不会返回无水印图片，如果你想对已经生成的图片二次编辑，建议将图片保存至本地后携带图片进行提交或在对话中直接描述，而不是使用 `图像生成的区域重绘` 、`智能编辑` 、`变清晰` 等功能，这样可以获得二次编辑后的原图。

例如：在对话中输入将第N张图片变清晰，而不是使用功能区按钮操作。

### 3. 无水印视频可以下载吗

> 参考 TODO TREE

已支持无水印视频下载。

#### 对话已删除，但视频仍在「AI创作」中

可在下载器面板中点击「按作品ID下载视频」，输入该视频的 `nodeId`，直接请求下载地址，无需原对话链接或视频 `vid`。

获取 `nodeId` 的方法：登录作品所属账号，打开浏览器开发者工具的 Network（网络）面板，再打开豆包「AI创作」中的对应视频。查看 `node_info` 响应中的 `data.children`，找到对应视频的条目，复制其 `id`（不是 `key`）；如果页面已经发出了 `get_download_info` 请求，也可从请求体的 `requests` 中复制该视频的 `node_id`。这些字段来自下载器现有的视频接口；页面实际请求可能随豆包更新而变化。

请将较长的 ID 作为文本完整复制，避免数字精度丢失。该方式只能下载当前账号仍有权限访问的作品；下载质量取决于接口返回的文件，无法恢复服务端已删除的作品或将低清视频变成高清。

## 4. 提示下载成功仍处于下载状态？

使用具有 `DISABLE CSP` 功能的扩展程序禁用 CSP，但绝大部分情况你可以刷新页面重试。

## TODOs

- [x] 视频提取方法抽取
- [x] 播放功能实现
- [x] 适配视频下载功能
- [ ] 重构已下载图片唯一标识，从URL改为key or other?
- [x] 已下载图片展示标识(在面板图片列表中添加`已下载`标识)
 
## 预览

![fte807e.png](https://iili.io/fte807e.png)

## 开发环境

- [React 19](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey)

## 参与开发

加入该项目同开发者共同维护。

- 你可以通过 [PR](https://github.com/LauZzL/doubao-downloader/pulls) 对项目代码做出贡献
- 你可以通过 [Issues](https://github.com/LauZzL/doubao-downloader/issues) 提交问题或提出建议

### 本地开发(基于油猴)

```shell
# 安装依赖
pnpm install

# 启动开发环境:油猴开发环境
pnpm dev
```

### 打包

打包后会在项目目录下生成 `dist` 文件夹，文件中会包含浏览器扩展所需要的相关文件，以及主要脚本。

```shell
# 打包
pnpm build
```

## 免责声明

本项目仅供学习交流，请勿用于商业、非法用途。
