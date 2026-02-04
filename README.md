![doubao-downloader](https://socialify.git.ci/LauZzL/doubao-downloader/image?custom_language=React&description=1&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Dark)

> [!WARNING]
> 该分支处于实验阶段，1.x 版本中的部分功能仍未移植到该分支中，你可以在 TODO Tree 中查看未完成的功能。

## 项目介绍

**基于 React 开发的豆包 AI 无水印资源批量下载浏览器扩展/油猴脚本。**

## 开始使用

你可以拉取代码自行构建或到[Releases](https://github.com/LauZzL/doubao-downloader/releases)下载构建好的文件。

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

> 请先查看该issue：[“AI生成”字样能去除吗？ #7](https://github.com/LauZzL/doubao-downloader/issues/7)

暂时不清楚为什么部分账号无法获取无水印图片，建议切换账号或环境使用。

### 2. 图像生成的区域重绘、智能编辑、变清晰等功能无法获取无水印图片

这几个功能不会返回无水印图片。

### 3. 无水印视频可以下载吗

插件不支持视频下载，但可以使用手机下载。详情见：[Issue #6](https://github.com/LauZzL/doubao-downloader/issues/6)

## 预览

![fte807e.png](https://iili.io/fte807e.png)


## 开发环境

- [React 19](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)

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
