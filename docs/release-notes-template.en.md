# Release Notes Templates

[中文版本](./release-notes-template.md)

Use the following templates when publishing the repository or attaching test builds to GitHub Releases.

## Template: Source Release

```md
## FatCat Guardian

FatCat Guardian is a tray-first desktop break reminder that blocks the screen with a cat when it is time to rest.

### Current status

- macOS is the primary tested platform
- Windows packaging is scaffolded and needs more runtime validation
- the project is open source under GPL-3.0-only

### Local development

```bash
npm install
npm run dev
```

### Packaging

```bash
npm run dist:mac
npm run dist:win
```

See the repository README and the `docs/` folder for more details.
```

## Template: macOS Unsigned Test Build

```md
## macOS Test Build

This is an unsigned and unnotarized macOS test build of FatCat Guardian.

### Important

- macOS may block the app on first launch
- only install it if you trust the source
- if blocked, allow it manually in Privacy & Security settings

### What to test

- tray icon appears correctly
- reminder triggers after the expected work interval
- cat overlay plays normally
- `Esc` skips the current break
- multi-monitor coverage works as expected
- lock or sleep pauses the session correctly

Detailed install notes:

- `docs/unsigned-mac-testing.md`
- `docs/manual-test-checklist.md`
```

### macOS Files Currently Recommended For GitHub Release Upload

Recommended:

- `release/FatCat Guardian-0.1.0-arm64.dmg`
- `release/FatCat Guardian-0.1.0-arm64.zip`

Not recommended:

- `*.blockmap`
- `builder-debug.yml`
- `builder-effective-config.yaml`
- the `release/mac-arm64/` directory itself

## Template: Windows Experimental Test Build

```md
## Windows Experimental Test Build

This is an unsigned Windows test build of FatCat Guardian.

Recommended downloads:

- `FatCat.Guardian.Setup.0.1.0.exe`
- `FatCat.Guardian.Portable.0.1.0-x64.exe` (fallback)

### Important

- Windows Defender SmartScreen may warn on first launch
- this build is experimental
- install it only if you trust the source

### What to test

- tray icon appearance
- overlay transparency
- full-screen and always-on-top behavior
- taskbar coverage
- multi-monitor coverage
- lock and sleep recovery

Detailed test notes:

- `docs/unsigned-windows-testing.md`
- `docs/manual-test-checklist.md`
```
