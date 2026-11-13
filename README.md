# BoardRipper 简体中文版

开源 PCB 板图与 PDF 原理图查看器，支持 Allegro、Altium、KiCad、EAGLE 及多种维修板图格式。可以查看元件、引脚、网络和多层走线，在板图与 PDF 之间查找对应信息。默认使用简体中文，也可切换 English。

本仓库是 [AlexeyInwerp/BoardRipper](https://github.com/AlexeyInwerp/BoardRipper) 的中文分支，初始汉化基于 0.52.1。原作者为 Alexey Lavrov / RipperDoc；保留上游署名、第三方声明与 **AGPL-3.0** 许可证。

[中文使用说明](README.zh-CN.md) · [上游英文说明快照](README.en.md) · [上游同步与汉化维护](docs/UPSTREAM_SYNC.zh-CN.md) · [许可证](LICENSE)

![板图与 PDF 原理图并排查看](docs/screenshots/01-board-pdf-lookup.png)

## 中文版有什么

- **中文界面**：首页、工具栏、元件与网络侧栏、设置、计算器、工作清单、提示和快捷键说明。
- **中英文切换**：右上角选择“简体中文 / English”，切换后重新加载，语言选择保存在当前浏览器。
- **中文设置搜索**：可搜索“引脚”“轮廓”“缩放”等中文关键词。
- **单文件离线版**：构建为一个 HTML，Edge 或 Chrome 直接打开；板图与 PDF 在本机解析，无需上传。
- **保留工程数据**：文件名、元件位号、网络名称、用户备注和命令示例保持原文。
- **跟进上游**：每天检查原项目更新，生成同步 PR，经过测试和汉化检查后合并。

原始工程内的文字、外部发布说明和解析器底层诊断信息可能保留原文。这个工具用于查看与检修，不提供 PCB 布线编辑功能，也不附带商业板图或原理图。

## 快速使用

### 轻量离线版

1. 在本仓库 [Actions → CI](https://github.com/yueqihe/BoardRipper/actions/workflows/ci.yml) 中打开最近一次成功的 `main` 构建。
2. 登录 GitHub 后，在页面底部下载 `BoardRipper-zh-CN-offline` 构建附件并解压。
3. 用 Edge 或 Chrome 打开其中的 `boardripper-lite.html`。
4. 点击“打开”，或拖入板图、PDF；点击元件或引脚查看网络，在图层面板控制走线、过孔、丝印与覆铜。

也可以按下文从源码构建。离线版没有服务器共享库、服务器板号数据库或容器自更新；板图查看、搜索、网络高亮、多图层、主题和 PDF 查看均在本机运行。

[上游在线版与下载页面](https://www.ripperdoc.de/boardripper/) 属于原项目，发布内容和语言以该网站为准。中文构建请从本仓库获取。

### Docker 部署中文版

从本仓库源码构建：

```bash
git clone https://github.com/yueqihe/BoardRipper.git
cd BoardRipper
docker compose up -d --build
# 浏览器打开 http://localhost:8081
```

仓库内的 Compose 使用 `build: .`，挂载 `./data` 保存数据，`./library` 保存板图目录。可以把现有板图库以只读方式挂到 `/library` 的子目录；拖入文件的保存目录需要写权限。容器默认限制为 2 GB 内存，PDF 索引并发通过 `PDFINDEX_POOL_MAX` 调整。

中文版更新请拉取本仓库并重新构建：

```bash
git pull --ff-only origin main
docker compose up -d --build
```

上游内置的“更新并重启”及拖入签名更新包，使用的是上游发布源，可能将容器替换为上游版本。维护中文版时请使用上面的源码构建流程。现有 Compose 中的 Docker socket 挂载供上游容器更新功能使用，普通查看无需依赖该功能。

## 主要功能

- **GPU 绘制**：PixiJS / WebGL 渲染，支持多板图标签页、缩放、旋转、镜像和触摸操作。
- **多层板查看**：独立显示顶层、底层与内层，支持顶底层并排的蝴蝶模式。
- **网络高亮**：从引脚查看整条网络，支持相邻网络追踪、规则配色及元件引脚对比。
- **PDF 联动**：原理图搜索、书签、夜间模式，从板图的元件或网络跳转查找。
- **可调整面板**：板图、原理图、图库、历史、工作清单、工具与设置可以停靠、浮动或弹出。
- **服务器图库**：Docker / Go 服务端支持目录扫描、板号参考数据库、板图与 PDF 自动匹配及缓存；离线版不含这些服务器功能。
- **多种运行方式**：离线 HTML、静态网页版、自托管服务器与 Electron 桌面封装，共用前端代码。

![多层 Allegro 板图与图层控制](docs/screenshots/03-multi-layer.png)

## 支持哪些文件

扩展名可能相同，程序会根据文件内容选择解析器。支持范围继承上游，并不表示所有同名扩展名都能打开。

| 格式 | 常见扩展名 | 说明 |
|---|---|---|
| BVR1 / BVR3 | `.bvr`、`.bv` | 文本维修板图 |
| Apple BRD | `.brd` | Apple / Mac 维修板图二进制格式 |
| BDV / BDV ASC | `.brd`、`.bdv` | 文本或混淆的维修板图 |
| FZ | `.fz` | ASUS 加密压缩板图 |
| CAE | `.cae` | ASRock PCBRepair Pro；上游标记为尚未使用真实文件验证 |
| GenCAD | `.cad` | GenCAD 1.4 文本交换格式 |
| Mentor Neutral | `.cad` | Mentor Boardstation 中性格式 |
| XZZ | `.pcb` | XZZ 加密维修板图，**不是 PADS 二进制 PCB** |
| TVW | `.tvw` | Teboview，多层、走线与钻孔信息 |
| Cadence Allegro | `.brd` | v16 / v17 / v18；v15 为部分支持、测试阶段 |
| Altium | `.PcbDoc`、`.CMPcbDoc`、`.CSPcbDoc` | Altium / Circuit Maker / Circuit Studio |
| KiCad | `.kicad_pcb` | KiCad 4–9，含元件、走线、过孔与覆铜 |
| EAGLE | `.brd` | EAGLE 6.0+ XML 板图 |
| PDF 原理图 | `.pdf` | 与板图并排查看及文本搜索 |

**PADS 二进制 `.pcb` 和 OrCAD `.dsn` 不能直接打开。** 原理图请先导出 PDF；核心板是否可查看，取决于是否提供了受支持的核心板文件。详细格式说明见 [docs/formats](docs/formats)。

## 常用快捷键

完整列表见界面的“设置 → 输入 → 键盘快捷键”。

| 操作 | Windows / Linux |
|---|---|
| 打开板图 / PDF | `Ctrl+O` / `Ctrl+P` |
| 查找 | `Ctrl+F` |
| 平移 | `W A S D` 或 `Alt+方向键` |
| 旋转 | `Q` / `E` |
| 镜像 | `Ctrl+↑` |
| 切换顶底层 | `Space` |
| 放大 / 缩小 | `Shift+W` / `Shift+S` |
| 切换图库侧栏 | `1` 左侧的反引号键 |
| 在板图与 PDF 间切换 | `Tab` |
| PDF 翻页 | `PgUp` / `PgDn` |

macOS 的打开和查找等快捷键使用 `⌘`。平移与缩放步长可在输入设置中调整。

## 从源码构建

前端使用 Node.js 22 或更高版本；完整服务端还需要 Go 1.25。桌面封装需要相应平台的构建环境。

```bash
git clone https://github.com/yueqihe/BoardRipper.git
cd BoardRipper/src/frontend
npm ci
npm run build:offline
```

离线产物：`src/frontend/dist-offline/boardripper-lite.html`。

| 命令 | 用途 |
|---|---|
| `npm run dev` | 开发服务器，默认端口 8082 |
| `npm run build` | 完整服务端使用的前端资源 |
| `npm run build:lite` | 无后端的静态网页版 |
| `npm run build:offline` | 单 HTML 离线版 |
| `npm run test:unit` | 单元测试，包括翻译占位符检查 |

PowerShell 内存提交额度较低时，可限制 esbuild 并发再构建：

```powershell
$env:GOMAXPROCS = '2'
$env:GOMEMLIMIT = '384MiB'
npm run build:offline
```

完整服务端运行示例（Bash）：

```bash
cd src/frontend
npm ci && npm run build
cd ../backend
STATIC_DIR=../frontend/dist DATA_DIR=../../data LIBRARY_DIR=/path/to/boards go run .
# http://localhost:8080
```

开发时在另一终端运行 `PORT=1336 go run .`，供 Vite 代理访问。桌面封装在 `desktop/` 下使用 `npm ci` 后运行 `node build-all.mjs --win` 或 `--mac`；本仓库未将上游预编译桌面包标为中文构建。

## 同步上游与维护翻译

[同步工作流](.github/workflows/sync-upstream.yml) 每天 **北京时间 10:00** 检查原项目 `main`，也可在 [Actions](https://github.com/yueqihe/BoardRipper/actions/workflows/sync-upstream.yml) 手动运行。GitHub 定时任务可能延迟。

有更新时，合并到 `sync/upstream` 分支，创建或更新一个待审核 PR，并触发 CI。**不会自动合并到中文版 `main`。** 有冲突时保留当前中文版，创建或更新冲突提示 Issue，等待人工处理。

源码同步与新增界面文案汉化是两步：Git 可以保留不冲突的现有翻译，但无法自动判断新功能该怎么翻译。新增英文文案需要接入 `uiText` 并补充中文目录；未翻译内容继续显示英文。具体流程见 [维护说明](docs/UPSTREAM_SYNC.zh-CN.md)。

GitHub 可能暂停长期无活动仓库的定时工作流，暂停后需在 Actions 中重新启用。源码同步也不会替换本机已下载的 HTML；需要下载新的成功构建或重新构建。

## 授权与致谢

本项目沿用 **GNU Affero General Public License v3.0**。分发离线 HTML、桌面包或其他构建时，请同时提供对应版本源码、原始许可证及第三方声明；通过网络提供修改版服务时也需要遵守 AGPL 的源码提供要求。

Allegro 与 Altium 解析器参考或移植自 KiCad，其他格式也依赖 OpenBoardView、eagleview 及维修社区的研究。完整许可证与贡献者记录见 [THIRD_PARTY.md](THIRD_PARTY.md)，原始介绍与详细致谢见 [README.en.md](README.en.md)。

上游说明其开发使用了 AI 辅助，并由维护者审核和测试；中文分支同样需要真实板图回归验证。发现中文界面或本分支的问题，请在 [本仓库提交 Issue](https://github.com/yueqihe/BoardRipper/issues)；原项目与社区链接见 [上游仓库](https://github.com/AlexeyInwerp/BoardRipper)。
