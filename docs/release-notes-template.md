# Release 文案模板

[English Version](./release-notes-template.en.md)

以下模板可直接用于 GitHub Releases，或作为发布说明的基础文案。

## 模板：源码发布

```md
## FatCat Guardian

FatCat Guardian 是一个托盘常驻的桌面休息提醒应用。到达休息时间后，它会直接让一只猫咪“霸占”你的屏幕。

### 当前状态

- macOS 是当前主要验证平台
- Windows 已完成打包配置，但仍需要更多运行验证
- 项目采用 GPL-3.0-only 开源

### 本地开发

```bash
npm install
npm run dev
```

### 打包

```bash
npm run dist:mac
npm run dist:win
```

更多细节请查看仓库 README 与 `docs/` 目录中的测试说明。
```

## 模板：macOS 未签名测试包

```md
## macOS 测试构建包

这是 FatCat Guardian 的一个未签名、未 notarize 的 macOS 测试版本。

### 注意事项

- macOS 首次打开时可能会拦截
- 请仅在信任源码来源的前提下安装
- 如果被系统拦截，请到 Privacy & Security 中手动允许

### 建议测试内容

- 托盘图标是否正常显示
- 是否会在预期工作时长后触发提醒
- 猫咪遮罩动画是否播放正常
- `Esc` 是否可以跳过当前休息
- 多显示器覆盖是否正常
- 锁屏、休眠后是否正确暂停与恢复

详细说明：

- `docs/unsigned-mac-testing.md`
- `docs/manual-test-checklist.md`
```

## 模板：Windows 实验性测试包

```md
## Windows 实验性测试构建包

这是 FatCat Guardian 的一个未签名 Windows 测试版本。

### 注意事项

- Windows Defender SmartScreen 可能在首次运行时给出警告
- 这是实验性构建包
- 请仅在信任源码来源的前提下安装

### 建议测试内容

- 托盘图标显示
- 遮罩透明效果
- 全屏与置顶行为
- 任务栏覆盖情况
- 多显示器覆盖情况
- 锁屏与睡眠后的恢复

详细说明：

- `docs/unsigned-windows-testing.md`
- `docs/manual-test-checklist.md`
```
