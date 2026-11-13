# BoardRipper 简体中文版

基于 [AlexeyInwerp/BoardRipper](https://github.com/AlexeyInwerp/BoardRipper) 0.52.1，
中文分支位于 [yueqihe/BoardRipper](https://github.com/yueqihe/BoardRipper)。
原作者为 Alexey Lavrov / RipperDoc，原项目与本分支均采用 AGPL-3.0。

## 使用

离线版是一个独立 HTML 文件，下载后用 Edge、Chrome 或其他现代浏览器打开即可。
点击右上角语言框切换“简体中文 / English”；切换时重新加载页面，选择保存在本机。

点击“打开”选择板图或 PDF 原理图，也可将文件拖入窗口。
点击板图元件或引脚可查看网络；“图层”控制走线、过孔、丝印和覆铜。
“设置”支持中文关键词搜索，如“引脚”“轮廓”“缩放”。首页提供中文使用指南。

中文覆盖首页、工具栏、侧栏、设置、工作清单、计算器、提示和快捷键说明。
文件名、位号、网络名、用户备注、命令及代码示例保持原文。
原始文件内的说明、外部发布说明及解析器的底层诊断信息可能保留原文。

**汉化不改变格式支持范围。** `.pcb` 指 XZZ 维修板图，不支持 PADS 二进制 PCB；
OrCAD `.dsn` 也不能直接打开，原理图请使用 PDF。

## 从源码构建

需要 Node.js 22 或更高版本：

```sh
cd src/frontend
npm ci
npm run build:offline
```

输出：`src/frontend/dist-offline/boardripper-lite.html`。运行时无需翻译服务或网络连接。
网页版使用 `npm run build:lite`，桌面版沿用上游 `desktop/` 的构建流程。

Windows 内存提交额度较低时，可在 PowerShell 中限制 esbuild 并发：

```powershell
$env:GOMAXPROCS = '2'
$env:GOMEMLIMIT = '384MiB'
$env:BR_VERSION_SUFFIX = '-zh.1'
npm run build:offline
```

## 验证

```sh
npm run test:unit
npx playwright install chromium
npx playwright test --config playwright.chinese.config.ts
```

中文浏览器测试直接打开构建后的 `file://` 单文件，检查板图和 PDF 加载、离线请求、
语言切换、设置保留及中文设置搜索。可通过 `BOARDRIPPER_TEST_BOARD` 指定本地 Allegro
文件进行额外测试，文件不会纳入仓库。Windows 可设 `BOARDRIPPER_BROWSER_CHANNEL=msedge`
使用已安装的 Edge。

上游英语 UI 测试启动的开发服务器使用 `BR_DEFAULT_LANGUAGE=en`；
正常构建默认 `zh-CN`，也可通过此环境变量修改默认值。

## 维护翻译

- 文案目录：`src/frontend/src/i18n/zh-CN.json`。
- 运行时：`src/frontend/src/i18n/index.ts`。
- 只对源码中确认属于界面的文本调用 `uiText('English text')` 或模板标签
  `` uiText`Copied ${filename}` ``。模板在目录中使用 `{{0}}`、`{{1}}` 等占位符。
- 动态的文件名、位号、网络名及用户备注作为插值传入，原样保留，不能整段再翻译。
- 逻辑 ID、解析器字段、DOM 选择器、样式值和持久化键不进入翻译目录。
- 保留英文源文案，缺少译文时回退英文。语言切换采用重新加载，使模块级的标签和
  设置搜索索引同步切换，不修改 React 的 DOM 文本节点。
- 新增文案后运行单元测试；占位符校验可发现动态参数丢失或被更名的问题。

分发二进制或离线 HTML 时，请按 AGPL-3.0 同时提供对应源码及原有许可证。
