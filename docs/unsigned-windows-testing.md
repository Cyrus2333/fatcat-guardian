# Windows 未签名测试包说明

[English Version](./unsigned-windows-testing.en.md)

这份说明仅适用于小范围测试。

FatCat Guardian 可以打包为 Windows 应用，但未签名版本仍应被视为测试产物。

## 如何构建测试包

在项目根目录执行：

```bash
npm install
npm run check
npm run dist:win
```

预期通常会生成：

- `nsis` 安装包
- `portable` 便携版可执行包

具体文件名会随平台、架构和版本号变化。

当前 `v0.1.0-alpha` 已上传的 Windows 测试包为：

- `FatCat.Guardian.Setup.0.1.0.exe`
- `FatCat.Guardian.Portable.0.1.0-x64.exe`

建议优先分发 `Setup` 安装版，`Portable` 作为备用下载项。

## 当前注意事项

这个项目目前主要是在 macOS 上开发和验证。

Electron Builder 官方说明中提到，很多情况下可以在 macOS 或 Linux 上构建 Windows 目标，但运行时表现仍然应该在真实 Windows 机器上验证，尤其是：

- 透明遮罩渲染
- 始终置顶行为
- 多显示器覆盖
- 任务栏覆盖
- SmartScreen 警告

参考文档：

- [electron-builder: Multi Platform Build](https://www.electron.build/multi-platform-build.html)
- [electron-builder: Windows code signing](https://www.electron.build/code-signing-win.html)
- [Electron `app.setAppUserModelId`](https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows)

## 建议测试清单

建议让 Windows 测试者重点确认：

1. 托盘图标是否正常显示。
2. 提醒是否会在预期工作时长后触发。
3. 遮罩是否真正覆盖完整屏幕。
4. 多显示器在休息阶段是否都被覆盖。
5. `Esc` 是否能正常跳过当前休息。
6. 锁屏、休眠恢复后是否行为正常。

## 建议的 Release 说明文案

> Test build only. The recommended Windows download is `FatCat.Guardian.Setup.0.1.0.exe`. This package is unsigned and may trigger SmartScreen or other trust warnings. Install it only if you trust the source, and please report any issues with overlay coverage, transparency, taskbar coverage, or multi-monitor behavior. A portable fallback build is also provided.
