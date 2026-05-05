# FatCat Guardian

[English README](/Users/huangjingye/Documents/project/fatcat-guardian/README.en.md)

FatCat Guardian 是一个基于 Electron 的托盘常驻桌面休息提醒应用。

它不会用一个容易被忽略的小弹窗提醒你，而是在该休息的时候，直接让一只猫咪“霸占”你的屏幕，就像现实里的猫会趴上键盘一样。

## 它是做什么的

FatCat Guardian 面向那些长时间盯着电脑屏幕、并且很容易无视普通提醒弹窗的人。

当工作计时达到阈值后，应用会拉起一个全屏透明遮罩，让猫咪直接出现在桌面之上，并强制进入休息阶段。

## 主要特性

- 托盘常驻，无需长期打开主窗口
- 使用全屏透明遮罩，而不是普通通知弹窗
- 支持多显示器同时覆盖
- 内置预设工作/休息模式，也支持自定义时长
- 素材本地运行，不依赖云端处理

## 平台状态

- macOS：当前主要验证平台
- Windows：已完成打包配置，仍建议在真实 Windows 机器上继续验证运行表现

## 灵感与素材来源

这个项目的想法以及猫咪素材，来源于另一个开源项目：

- 项目作者：`zokuzoku`
- 项目仓库：[cat-gatekeeper](https://github.com/zokuzoku/cat-gatekeeper)
- 项目主页：[zokuzoku.github.io/cat-gatekeeper](https://zokuzoku.github.io/cat-gatekeeper/)

FatCat Guardian 是我基于这份想法和素材，用 Electron 桌面框架重新创作的版本。它的目标是让猫咪不只出现在浏览器里，而是能够原生覆盖完整电脑屏幕，作为真正的桌面级休息提醒。

非常感谢原作者提供了这么棒的创意，并将项目与素材开源出来。如果你后续引用相关项目、素材或衍生创作，请务必遵循对应开源协议，并正确署名原作者。

## 快速开始

环境要求：

- 推荐 Node.js 20 或更高版本
- npm

安装依赖：

```bash
npm install
```

启动开发模式：

```bash
npm run dev
```

执行语法检查：

```bash
npm run check
```

构建发布产物：

```bash
npm run dist:mac
npm run dist:win
```

## 当前范围

- 首要面向 macOS，Windows 打包链路已接好
- 托盘优先的轻量交互方式
- 多屏全屏透明遮罩
- 预设工作/休息模式与自定义时长
- 使用本地猫咪素材播放动画

## 开源协议

本项目采用 `GPL-3.0-only` 协议，见 [LICENSE](/Users/huangjingye/Documents/project/fatcat-guardian/LICENSE)。

## 本地开发说明

当前最佳开发与手动测试体验仍然是 macOS。

## 打包

可用命令：

```bash
npm run dist:mac
npm run dist:win
```

通用入口：

```bash
npm run dist
```

当前输出目录：

- `release/`

当前运行时实际使用的素材：

- `public/cats/neko1.webm`
- `public/cats/neko2.webm`

## Windows 打包状态

当前 Windows 打包已通过 `electron-builder` 配置，目标包括：

- `nsis`
- `portable`

构建命令：

```bash
npm run dist:win
```

当前状态：

- 仓库已经具备 Windows 打包配置
- 仍需要在真实 Windows 机器上验证运行效果
- 还没有接入 Windows 签名

Electron Builder 官方说明中提到，很多情况下可以在 macOS 或 Linux 上构建 Windows 目标，但像透明遮罩、置顶行为、安装器体验这类问题，仍然需要在目标平台实机验证：

- [electron-builder: Multi Platform Build](https://www.electron.build/multi-platform-build.html)
- [electron-builder: Windows code signing](https://www.electron.build/code-signing-win.html)

详细测试说明见：

- [docs/unsigned-windows-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-windows-testing.md)
- [docs/release-notes-template.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/release-notes-template.md)
- [docs/manual-test-checklist.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/manual-test-checklist.md)

## 开源发布策略

当前仓库是按下面这个开源路径准备的：

1. 先公开源码仓库
2. 在 README 中写清本地运行和打包方式
3. 如有需要，再附带未签名、未公证的测试安装包供小范围体验

也就是说，即使暂时不做 Apple 签名与 notarization，这个仓库也已经适合先公开源码。

## macOS 未签名测试包

如果没有接入 Apple Developer 签名和 notarization，macOS 包仍然可以分享给测试用户，但应被视为测试产物，而不是正式面向大众的最终发行版。

限制包括：

- macOS 首次打开时通常会拦截
- 测试者需要手动在系统设置里允许打开
- 适合小范围测试，不适合直接面向普通用户广泛分发

详细说明见：

- [docs/unsigned-mac-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-mac-testing.md)

## Windows 未签名测试包

未签名 Windows 包也适合用于开源项目早期测试，但依然应被视为测试产物。

限制包括：

- 首次运行时可能触发 Windows Defender SmartScreen 警告
- 在没有签名和积累信誉前，安装器信任度会比较弱
- 多屏覆盖、透明遮罩、任务栏覆盖等行为仍建议实机验证

建议做法：

- 在 GitHub Releases 中附上 unsigned 的 `nsis` 安装包或 `portable` 包
- 明确标注这是测试版
- 收集关于多屏覆盖、透明显示、任务栏覆盖的反馈

## 未来正式分发 macOS

如果你后续希望让用户下载后更顺滑地安装与打开 macOS 应用，仍然需要 Apple 签名和 notarization。

仓库中已经准备好的相关文件包括：

- `build/icon.icns`
- `build/entitlements.mac.plist`
- `build/entitlements.mac.inherit.plist`
- `scripts/notarize.cjs`

推荐证书：

- `Developer ID Application: <Your Name or Team> (<TEAM_ID>)`

支持的 notarization 环境变量方案：

1. Apple ID + app-specific password

```bash
export APPLE_TEAM_ID="YOUR_TEAM_ID"
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

2. App Store Connect API key

```bash
export APPLE_TEAM_ID="YOUR_TEAM_ID"
export APPLE_API_KEY="/absolute/path/AuthKey_ABC123XYZ.p8"
export APPLE_API_KEY_ID="ABC123XYZ"
export APPLE_API_ISSUER="00000000-0000-0000-0000-000000000000"
```

正式 macOS 打包命令：

```bash
npm install
npm run check
npm run dist:mac
```

预期产物：

- `release/FatCat Guardian-<version>-arm64.dmg`
- `release/FatCat Guardian-<version>-arm64-mac.zip`
- `release/mac-arm64/FatCat Guardian.app`

建议验证命令：

```bash
codesign --verify --deep --strict --verbose=2 "release/mac-arm64/FatCat Guardian.app"
spctl --assess --type execute --verbose "release/mac-arm64/FatCat Guardian.app"
xcrun stapler validate "release/FatCat Guardian-<version>-arm64.dmg"
```

如果没有配置 notarization 凭据，构建仍然会成功，但会跳过 notarization。

## 本地数据位置

运行时状态默认保存在：

- `~/Library/Application Support/fatcat-guardian/state.json`

性能日志在你手动从托盘菜单开启后，会写入：

- `~/Library/Application Support/fatcat-guardian/logs/performance.ndjson`

## 仓库进一步完善建议

如果你后续还想继续打磨仓库展示，可以补：

- README 截图或短视频演示
- 首个 GitHub Release 的测试版说明
- Windows 实机测试后的平台兼容说明更新
