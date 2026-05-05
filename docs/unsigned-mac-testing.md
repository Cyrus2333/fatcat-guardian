# macOS 未签名测试包说明

[English Version](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-mac-testing.en.md)

这份说明仅适用于小范围测试。

如果你分享的是一个没有 Apple 签名、也没有 notarization 的 FatCat Guardian macOS 包：

- macOS 通常会提示无法验证开发者身份
- 测试者需要手动允许打开
- 只建议在信任源码来源的前提下安装

## 如何构建测试包

在项目根目录执行：

```bash
npm install
npm run check
npm run dist:mac
```

预期产物：

- `release/FatCat Guardian-<version>-arm64.dmg`
- `release/FatCat Guardian-<version>-arm64.zip`

对测试用户来说，通常 `.dmg` 更方便分发和安装。

## 测试者安装步骤

1. 下载 `.dmg` 文件。
2. 将 `FatCat Guardian.app` 拖到 `Applications`。
3. 尝试第一次打开应用。
4. 如果被系统拦截，打开 `System Settings > Privacy & Security`。
5. 在安全提示区域点击 `Open Anyway`。
6. 再次确认弹窗并重新打开应用。

Apple 关于这类手动放行流程的官方文档：

- [Open a Mac app from an unknown developer](https://support.apple.com/en-euro/guide/mac-help/mh40616/mac)
- [Safely open apps on your Mac](https://support.apple.com/en-lamr/102445)

## 建议的 Release 说明文案

发布测试包时，可以使用类似下面的说明：

> Test build only. This package is unsigned and not notarized, so macOS may block it on first launch. Install it only if you trust the source, then allow it manually in Privacy & Security if needed.

## 不建议承诺的内容

对于 unsigned 测试包，不建议对外宣称：

- 一键无感安装
- 不会出现系统安全提示
- 已适合面向普通大众正式分发
- 已经过 Apple 恶意软件审查
