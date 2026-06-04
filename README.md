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
> 该分支处于实验阶段，1.x 版本中的部分功能仍未移植到该分支中，你可以在 TODO Tree 中查看未完成的功能。

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
> 我们考虑在 `2.0.0` 版本中添加配置项，用于在部分情况下将两张图片进行拼接，以去除水印。

> 请先查看该issue：[“AI生成”字样能去除吗？ #7](https://github.com/LauZzL/doubao-downloader/issues/7)

暂时不清楚为什么部分账号无法获取无水印图片，建议切换账号或环境使用。

### 2. 图像生成的区域重绘、智能编辑、变清晰等功能无法获取无水印图片

这几个功能不会返回无水印图片，如果你想对已经生成的图片二次编辑，建议将图片保存至本地后携带图片进行提交或在对话中直接描述，而不是使用 `图像生成的区域重绘` 、`智能编辑` 、`变清晰` 等功能，这样可以获得二次编辑后的原图。

例如：在对话中输入将第N张图片变清晰，而不是使用功能区按钮操作。

### 3. 无水印视频可以下载吗

> 参考 TODO TREE

插件在2.0.0正式版本中会支持视频捕获，目前已支持视频捕获相关参数提取以及面板展示，如果你想协助参与项目开发，请自行 fork 项目并提交 PR。

## 4. 提示下载成功仍处于下载状态？

使用具有 `DISABLE CSP` 功能的扩展程序禁用 CSP，但绝大部分情况你可以刷新页面重试。

## TODOs

- [x] 视频提取方法抽取
- [x] 播放功能实现
- [ ] 适配视频下载功能
- [ ] 重构已下载图片唯一标识，从URL改为key or other?
- [ ] 已下载图片展示标识(在面板图片列表中添加`已下载`标识)
 
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
