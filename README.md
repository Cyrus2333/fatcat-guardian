# FatCat Guardian

FatCat Guardian is a tray-first desktop break reminder built with Electron.

Instead of a small toast or notification, it brings a cat directly onto the screen when it is time to rest, as if a real cat decided to occupy your workspace.

## What It Does

FatCat Guardian is designed for people who stay in front of the computer for too long and tend to ignore normal reminder popups.

When the work timer reaches its limit, the app raises a full-screen transparent overlay and lets a cat take over the desktop for the break period.

## Highlights

- tray-first experience with no permanent main window
- full-screen transparent overlay instead of a small notification
- support for multi-monitor coverage during breaks
- built-in preset schedules plus custom work/rest durations
- local media assets with no cloud processing requirement

## Platform Status

- macOS: primary tested platform
- Windows: packaging is scaffolded, runtime verification still recommended

## Quick Start

Requirements:

- Node.js 20 or newer recommended
- npm

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run syntax checks:

```bash
npm run check
```

Build release artifacts:

```bash
npm run dist:mac
npm run dist:win
```

## Current Scope

- macOS-first desktop app, with Windows packaging scaffolded
- tray-only workflow, no permanent main window
- full-screen transparent overlay across multiple displays
- work/rest schedule presets plus custom schedule
- local media assets for the cat animation

## License

This project is licensed under `GPL-3.0-only`. See [LICENSE](/Users/huangjingye/Documents/project/fatcat-guardian/LICENSE).

## Local Development

For the current best runtime experience, use macOS during active development and manual testing.

## Packaging

Build scripts:

```bash
npm run dist:mac
npm run dist:win
```

Generic entry:

```bash
npm run dist
```

Current output directory:

- `release/`

Current runtime media assets:

- `public/cats/neko1.webm`
- `public/cats/neko2.webm`

## Windows Packaging Status

Windows packaging is scaffolded with `electron-builder` and currently targets:

- `nsis`
- `portable`

Build command:

```bash
npm run dist:win
```

Current status:

- the project can be configured for Windows packaging from this repo
- the app still needs runtime validation on a real Windows machine
- Windows signing is not configured yet

Electron Builder documents that Windows builds can be produced locally from macOS or Linux in many cases, but target-platform validation is still important, especially for overlay behavior and installer UX. See:

- [electron-builder: Multi Platform Build](https://www.electron.build/multi-platform-build.html)
- [electron-builder: Windows code signing](https://www.electron.build/code-signing-win.html)

Detailed tester instructions are in [docs/unsigned-windows-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-windows-testing.md).
Release note templates are in [docs/release-notes-template.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/release-notes-template.md).
Manual verification steps are in [docs/manual-test-checklist.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/manual-test-checklist.md).

## Open Source Release Plan

This project is currently prepared for the following open-source workflow:

1. Publish the source repository.
2. Document local development and packaging steps clearly.
3. Optionally attach unsigned and unnotarized macOS test builds for trusted testers.

This means the repository is ready for public code sharing even if Apple signing and notarization are not set up yet.

## Unsigned macOS Test Builds

If you package the app without Apple Developer signing and notarization, the build can still be shared for limited testing, but it should be treated as a test artifact rather than a polished consumer release.

Important limitations:

- macOS will usually block the app on first launch.
- Testers must manually override Gatekeeper.
- This is suitable for small-scale testing, not broad end-user distribution.

Suggested wording for a GitHub Release:

> Test build only. This macOS package is unsigned and not notarized. macOS may block it on first launch. Please only install it if you trust the source and are comfortable manually allowing it in Privacy & Security settings.

Detailed tester instructions are in [docs/unsigned-mac-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-mac-testing.md).

## Unsigned Windows Test Builds

Unsigned Windows builds are practical for testing and open-source sharing, but they are still test artifacts.

Important limitations:

- Windows Defender SmartScreen may warn on first launch.
- Installer reputation will be weak until the app is signed and distributed more broadly.
- Overlay behavior should be tested on a real multi-monitor Windows setup before calling it production-ready.

Suggested use:

- attach the unsigned `nsis` installer or `portable` build to GitHub Releases
- label it clearly as a test build
- collect tester feedback specifically on overlay coverage, taskbar coverage, and multi-display behavior

## Formal macOS Distribution

If you later want downloadable macOS builds that open more cleanly for end users, you will need Apple signing and notarization.

This repo already includes the needed scaffolding:

- `build/icon.icns`
- `build/entitlements.mac.plist`
- `build/entitlements.mac.inherit.plist`
- `scripts/notarize.cjs`

Recommended signing certificate:

- `Developer ID Application: <Your Name or Team> (<TEAM_ID>)`

Supported notarization env var flows:

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

Formal macOS packaging:

```bash
npm install
npm run check
npm run dist:mac
```

Expected macOS outputs:

- `release/FatCat Guardian-<version>-arm64.dmg`
- `release/FatCat Guardian-<version>-arm64-mac.zip`
- `release/mac-arm64/FatCat Guardian.app`

Recommended validation:

```bash
codesign --verify --deep --strict --verbose=2 "release/mac-arm64/FatCat Guardian.app"
spctl --assess --type execute --verbose "release/mac-arm64/FatCat Guardian.app"
xcrun stapler validate "release/FatCat Guardian-<version>-arm64.dmg"
```

If notarization credentials are missing, packaging still succeeds, but notarization is skipped.

## Project Data

Runtime state is persisted locally in:

- `~/Library/Application Support/fatcat-guardian/state.json`

Performance logs, when manually enabled from the tray menu, are written to:

- `~/Library/Application Support/fatcat-guardian/logs/performance.ndjson`

## Repository Polish

Optional improvements before publishing:

- add screenshots or a short demo clip for the repository page
- optionally test the Windows build on a real Windows machine before advertising support
