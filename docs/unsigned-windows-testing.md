# Unsigned Windows Test Build Guide

This guide is for small-scale testing only.

FatCat Guardian can be packaged for Windows, but unsigned builds should be treated as test artifacts.

## Build the Test Package

From the project root:

```bash
npm install
npm run check
npm run dist:win
```

Expected outputs usually include:

- an `nsis` installer
- a `portable` executable package

The exact filenames depend on platform, version, and architecture.

## Current Caveat

This project is currently developed primarily on macOS.

Electron Builder documents that Windows targets can often be built from macOS or Linux, but actual runtime behavior still needs to be verified on Windows hardware, especially for:

- transparent overlay rendering
- always-on-top behavior
- multi-display coverage
- taskbar coverage
- SmartScreen warnings

Reference:

- [electron-builder: Multi Platform Build](https://www.electron.build/multi-platform-build.html)
- [electron-builder: Windows code signing](https://www.electron.build/code-signing-win.html)
- [Electron `app.setAppUserModelId`](https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows)

## Suggested Tester Checklist

Ask Windows testers to verify:

1. The tray icon appears correctly.
2. The reminder triggers after the expected work interval.
3. The overlay covers the full display area.
4. Multi-monitor setups are all covered during a break.
5. `Esc` skips the break as expected.
6. The app resumes correctly after lock and sleep.

## Suggested Release Note

> Test build only. This Windows package is unsigned and may trigger SmartScreen or other trust warnings. Install it only if you trust the source, and please report any issues with overlay coverage, transparency, or multi-monitor behavior.
