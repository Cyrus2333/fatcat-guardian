# Unsigned macOS Test Build Guide

[中文版本](/Users/huangjingye/Documents/project/fatcat-guardian/docs/unsigned-mac-testing.md)

This guide is for small-scale testing only.

If you share a macOS build of FatCat Guardian without Apple signing and notarization:

- macOS will usually warn that the app cannot be verified
- testers will need to manually allow the app
- this should only be used by people who trust the source

## Build the Test Package

From the project root:

```bash
npm install
npm run check
npm run dist:mac
```

Expected outputs:

- `release/FatCat Guardian-<version>-arm64.dmg`
- `release/FatCat Guardian-<version>-arm64.zip`

For tester distribution, the `.dmg` is usually the most convenient artifact.

## Tester Install Steps

1. Download the `.dmg`.
2. Drag `FatCat Guardian.app` into `Applications`.
3. Try opening the app once.
4. If macOS blocks it, open `System Settings > Privacy & Security`.
5. Scroll to the security section and click `Open Anyway`.
6. Confirm the warning dialog and open the app again.

Apple documents this override flow here:

- [Open a Mac app from an unknown developer](https://support.apple.com/en-euro/guide/mac-help/mh40616/mac)
- [Safely open apps on your Mac](https://support.apple.com/en-lamr/102445)

## Suggested Release Note

Use wording like this when attaching a test build to a release:

> Test build only. This package is unsigned and not notarized, so macOS may block it on first launch. Install it only if you trust the source, then allow it manually in Privacy & Security if needed.

## What Not To Promise

For unsigned test builds, avoid claiming:

- one-click install
- no system warnings
- polished public distribution
- malware-reviewed Apple notarization
