# FatCat Guardian

[中文 README](/Users/huangjingye/Documents/project/fatcat-guardian/README.md)

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
- Windows: packaging is scaffolded, runtime verification is still recommended

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

- the repository is configured for Windows packaging
- runtime behavior still needs validation on a real Windows machine
- Windows signing is not configured yet

Electron Builder documents that Windows builds can often be produced from macOS or Linux, but target-platform validation is still important for transparent overlays, always-on-top behavior, and installer UX:

- [electron-builder: Multi Platform Build](https://www.electron.build/multi-platform-build.html)
- [electron-builder: Windows code signing](https://www.electron.build/code-signing-win.html)

Detailed notes:

- [docs/unsigned-windows-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-windows-testing.md)
- [docs/release-notes-template.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/release-notes-template.md)
- [docs/manual-test-checklist.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/manual-test-checklist.md)

## Open Source Release Plan

This repository is currently prepared for the following open-source workflow:

1. Publish the source repository first
2. Document local development and packaging steps clearly
3. Optionally attach unsigned and unnotarized test builds for trusted early testers

That means the project is already in a good state for public source release, even if Apple signing and notarization are not configured yet.

## Unsigned macOS Test Builds

If you package the app without Apple Developer signing and notarization, the build can still be shared for limited testing, but it should be treated as a test artifact rather than a polished end-user release.

Limitations:

- macOS will usually block the app on first launch
- testers must manually allow it in system settings
- suitable for small-scale testing, not broad consumer distribution

Detailed notes:

- [docs/unsigned-mac-testing.md](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-mac-testing.md)

## Unsigned Windows Test Builds

Unsigned Windows builds are also practical for open-source testing, but they should still be treated as test artifacts.

Limitations:

- Windows Defender SmartScreen may warn on first launch
- installer trust remains weak without signing and reputation
- overlay behavior and multi-monitor coverage should be validated on real Windows hardware

Suggested approach:

- attach unsigned `nsis` or `portable` builds to GitHub Releases
- label them clearly as test builds
- collect feedback on transparency, multi-monitor coverage, and taskbar coverage

## Future Formal macOS Distribution

If you later want smoother end-user installation on macOS, you will still need Apple signing and notarization.

This repository already includes the required scaffolding:

- `build/icon.icns`
- `build/entitlements.mac.plist`
- `build/entitlements.mac.inherit.plist`
- `scripts/notarize.cjs`

Recommended certificate:

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

Expected outputs:

- `release/FatCat Guardian-<version>-arm64.dmg`
- `release/FatCat Guardian-<version>-arm64-mac.zip`
- `release/mac-arm64/FatCat Guardian.app`

Recommended validation:

```bash
codesign --verify --deep --strict --verbose=2 "release/mac-arm64/FatCat Guardian.app"
spctl --assess --type execute --verbose "release/mac-arm64/FatCat Guardian.app"
xcrun stapler validate "release/FatCat Guardian-<version>-arm64.dmg"
```

If notarization credentials are missing, the build still succeeds, but notarization is skipped.

## Local Data

Runtime state is stored at:

- `~/Library/Application Support/fatcat-guardian/state.json`

Performance logs, when manually enabled from the tray menu, are written to:

- `~/Library/Application Support/fatcat-guardian/logs/performance.ndjson`

## Further Repository Polish

If you want to improve the repository presentation later, consider adding:

- README screenshots or a short demo clip
- a polished first GitHub Release note
- updated Windows compatibility notes after real hardware testing
