# Softline：Tauri 2 软电话学习骨架

这不是可打电话的 SIP 客户端。它是用于学习 Tauri 2 的 Vue 3 + TypeScript 界面框架，后续再接入 Rust SIP 引擎。

## 你现在可以做什么

- 自适应桌面侧栏、手机底部导航；拨号、联系人、通话记录、设置四个页面。
- 输入、清空、删除号码；模拟呼叫 → 1.2 秒后模拟接通 → 计时 → 挂断。
- 模拟静音与扬声器按钮（不访问真实音频设备）。
- 联系人筛选与回填号码；本次会话通话记录。
- 设置页面调用 Rust `runtime_info`，演示前端与 Rust 通信。
- 所有业务数据仅在内存，刷新后重置；无账号密码保存，无真实 SIP 注册。

## 1. 先用浏览器学界面（最快）

安装当前受支持的 Node.js LTS（建议 22.12+ 或 24 LTS）后：

```bash
npm ci
npm run dev
```

打开终端显示的 `http://localhost:1420`。浏览器预览没有 Tauri 原生能力，“检查运行环境”会明确提示。云端沙箱若限制网络接口枚举，可用 `npm run dev -- --host 127.0.0.1`。

## 2. 再运行桌面壳

按 [官方前置条件](https://v2.tauri.app/start/prerequisites/) 安装对应系统依赖：

- Windows：Visual Studio C++ Build Tools（C++ 桌面开发）、WebView2、Rust MSVC 工具链。
- Linux：对应发行版的 WebKitGTK 4.1、GTK3、构建工具等。请按官网对应发行版命令安装，不能只安装 Rust。
- macOS：Xcode Command Line Tools 和 Rust。

```bash
npm run tauri dev
```

此时“设置 → 检查运行环境”走的是：

```text
Vue 按钮 → invoke('runtime_info') → Rust 命令 → 返回字符串 → Vue 显示
```

构建当前系统安装包：

```bash
npm run tauri build
```

不要把 Linux 上 `tauri build` 理解为自动产出所有平台安装包。通常在 Windows、macOS、Linux 各自构建并测试，后续用 CI 矩阵管理。

## 3. 移动端是单独的一步

需要先按官网安装移动工具链。Android 需要 JDK、Android Studio、SDK/NDK 及目标架构；iOS 必须使用 macOS + Xcode，真机/分发还涉及签名。

```bash
# Android，先配置 Android 工具链后
npm run tauri android init
npm run tauri android dev
npm run tauri android build

# iOS，仅 macOS，先配置 Xcode 后
npm run tauri ios init
npm run tauri ios dev
npm run tauri ios build
```

本项目尚未生成 `src-tauri/gen/android` 与 `gen/apple`，由你在准备好对应工具链后 init。不能声称这个骨架已在五端验证。

**浏览器 Web**：这套 Vue 界面能跑 Web，但 Tauri 的 Rust 原生命令不能直接在普通网页运行。未来 Web 软电话需要单独的浏览器 SIP/WebRTC 接入方案，不能直接复用原生 Rust 传输与媒体栈。

## 4. 跟着官网，以这个项目为练习

1. [Create a Project](https://v2.tauri.app/start/create-project/)：理解 Vue/Vite 前端与 Rust 后端是两个部分。这个工程由官方 create-tauri-app 的 vue-ts 模板创建。
2. [Development](https://v2.tauri.app/develop/)：分别运行 `npm run dev` 和 `npm run tauri dev`，观察差别。
3. [Calling Rust](https://v2.tauri.app/develop/calling-rust/)：把 `runtime_info` 返回值改一下，确认前端收到修改。
4. [Calling the frontend](https://v2.tauri.app/develop/calling-frontend/)：后续学习 Rust 事件，将“注册状态/来电/通话状态”推给 Vue。
5. [Capabilities](https://v2.tauri.app/security/capabilities/)：学习最小权限，不要为了方便授予全部文件或 shell 权限。
6. [Distribution](https://v2.tauri.app/distribute/)：最后学习平台打包、签名和分发。

## 5. 源码从哪里读

```text
src/App.vue                    页面、模拟通话状态与交互
src/style.css                  响应式布局和视觉样式
src/phone.ts                   号码和时长工具函数、类型
src/phone.test.ts               工具函数单元测试
src/App.test.ts                 UI 交互测试（虚拟 DOM）
src-tauri/src/lib.rs            Rust 入口 + runtime_info 命令
src-tauri/src/main.rs           桌面入口
src-tauri/tauri.conf.json        窗口、构建与 CSP 配置
src-tauri/capabilities/default.json  权限范围
```

学习骨架故意没有引入 Pinia、路由库、UI 组件库。先掌握 Vue 状态和 Tauri IPC，再按复杂度拆分。

推荐下一次练习：把 App.vue 拆成 DialPad、ContactList、CallHistory、SettingsPanel；随后再把模拟通话抽成独立 service，最终用真实 SIP 适配器替换，界面不直接依赖 SIP 库。

## 6. 真实软电话后续要补什么

注册鉴权、SIP 会话状态、媒体采集播放、编解码、RTP/SRTP、NAT/ICE、设备权限、后台来电、系统通话集成。rsipstack 主要解决 SIP 信令，不能把“能 REGISTER/INVITE”当作“已实现双向语音”。移动后台来电和推送需单独设计。

## 7. 验证

```bash
npm test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml
```

本次云环境验证结果见 `VALIDATION.md`。模拟流程不产生真实网络呼叫。生产使用前必须替换示例应用 identifier，并配置平台签名、权限与安全存储。

## 在线学习课程与 GitHub Pages

课程位于 `docs/index.html`，在线模拟界面位于 `docs/demo/`。首次开启：仓库 **Settings → Pages → Deploy from a branch → main → /docs → Save**。网站地址以 Pages 设置页显示为准。

课程共 8 课，覆盖环境、结构、界面状态、Rust invoke、事件与安全、移动端及打包。
