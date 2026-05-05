const { app, BrowserWindow, ipcMain, Menu, nativeImage, powerMonitor, screen, Tray } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const APP_DISPLAY_NAME = 'FatCat Guardian';
const APP_INTERNAL_NAME = 'fatcat-guardian';
const LEGACY_USER_DATA_DIRS = ['com.fatcat.fatcat-remind', 'fatcat-remind', 'fat-cat-guardian'];
const TICK_MS = 1000;
const BLOCKING_INTRO_DURATION_SECONDS = 11;
const PERFORMANCE_LOG_INTERVAL_SECONDS = 30;
const PERFORMANCE_LOG_RETENTION_COUNT = 240;
const DEFAULT_WORK_DURATION_MINUTES = 50;
const DEFAULT_REST_DURATION_MINUTES = 10;
const DEFAULT_IDLE_PAUSE_THRESHOLD_MINUTES = 15;
const POMODORO_WORK_DURATION_MINUTES = 25;
const POMODORO_REST_DURATION_MINUTES = 5;
const DOUBLE_POMODORO_WORK_DURATION_MINUTES = 50;
const DOUBLE_POMODORO_REST_DURATION_MINUTES = 10;
const MAX_CUSTOM_DURATION_MINUTES = 360;

const overlayWindows = new Map();
let tray = null;
let sessionTimer = null;
let settingsWindow = null;
let performanceLogTimer = null;

let runtimeState = {
  settings: defaultSettings(),
  sessionMode: 'working',
  sessionActive: true,
  workElapsedSeconds: 0,
  restRemainingSeconds: 0,
  blockingRemainingSeconds: 0,
};

function configureAppIdentity() {
  app.setName(APP_DISPLAY_NAME);
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.fatcat.guardian');
  }
  const appSupportDir = path.dirname(app.getPath('userData'));
  app.setPath('userData', path.join(appSupportDir, APP_INTERNAL_NAME));
}

function logsDirectoryPath() {
  return path.join(app.getPath('userData'), 'logs');
}

function performanceLogPath() {
  return path.join(logsDirectoryPath(), 'performance.ndjson');
}

function clearLegacyUserData() {
  const appSupportDir = path.dirname(app.getPath('userData'));
  for (const dirname of LEGACY_USER_DATA_DIRS) {
    const legacyPath = path.join(appSupportDir, dirname);
    try {
      fs.rmSync(legacyPath, { recursive: true, force: true });
    } catch {}
  }
}

function ensureLogsDirectory() {
  fs.mkdirSync(logsDirectoryPath(), { recursive: true });
}

function appendPerformanceLog(entry) {
  ensureLogsDirectory();
  const filePath = performanceLogPath();
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`);

  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    if (lines.length > PERFORMANCE_LOG_RETENTION_COUNT) {
      fs.writeFileSync(filePath, `${lines.slice(-PERFORMANCE_LOG_RETENTION_COUNT).join('\n')}\n`);
    }
  } catch {}
}

function collectPerformanceSnapshot(reason = 'interval') {
  const metrics = app.getAppMetrics().map((metric) => ({
    pid: metric.pid,
    type: metric.type,
    name: metric.name ?? null,
    serviceName: metric.serviceName ?? null,
    cpuPercent: Number((metric.cpu?.percentCPUUsage ?? 0).toFixed(2)),
    idleWakeupsPerSecond: metric.cpu?.idleWakeupsPerSecond ?? 0,
    memoryWorkingSetKb: metric.memory?.workingSetSize ?? 0,
    memoryPeakWorkingSetKb: metric.memory?.peakWorkingSetSize ?? 0,
  }));

  appendPerformanceLog({
    timestamp: new Date().toISOString(),
    reason,
    mode: runtimeState.sessionMode,
    sessionActive: runtimeState.sessionActive,
    displayCount: screen.getAllDisplays().length,
    overlayWindowCount: overlayWindows.size,
    metrics,
  });
}

function restartPerformanceLogging() {
  if (performanceLogTimer) {
    clearInterval(performanceLogTimer);
    performanceLogTimer = null;
  }

  if (!runtimeState.settings.enablePerformanceLogging) {
    return;
  }

  collectPerformanceSnapshot('startup');
  performanceLogTimer = setInterval(() => {
    collectPerformanceSnapshot('interval');
  }, PERFORMANCE_LOG_INTERVAL_SECONDS * 1000);
}

function defaultSettings() {
  return {
    scheduleMode: 'double-pomodoro',
    workDurationMinutes: DOUBLE_POMODORO_WORK_DURATION_MINUTES,
    restDurationMinutes: DOUBLE_POMODORO_REST_DURATION_MINUTES,
    customWorkDurationMinutes: null,
    customRestDurationMinutes: null,
    customScheduleConfigured: false,
    idlePauseThresholdMinutes: DEFAULT_IDLE_PAUSE_THRESHOLD_MINUTES,
    enableEmergencyBypass: true,
    enablePerformanceLogging: false,
    catAssetSource: 'builtin',
    builtinScene: 'duo-neko',
  };
}

function isValidCustomDuration(value) {
  return Number.isFinite(value) && value >= 1 && value <= MAX_CUSTOM_DURATION_MINUTES;
}

function hasConfiguredCustomSchedule(settings = runtimeState.settings) {
  return (
    settings.customScheduleConfigured === true &&
    isValidCustomDuration(settings.customWorkDurationMinutes) &&
    isValidCustomDuration(settings.customRestDurationMinutes)
  );
}

function customModeLabel(settings = runtimeState.settings) {
  if (!hasConfiguredCustomSchedule(settings)) {
    return '自定义模式（先设置时长）';
  }

  return `自定义模式 (${settings.customWorkDurationMinutes} 分钟 / ${settings.customRestDurationMinutes} 分钟)`;
}

function applyScheduleMode(mode) {
  if (mode === 'custom' && !hasConfiguredCustomSchedule()) {
    return false;
  }

  runtimeState.settings.scheduleMode = mode;
  if (mode === 'pomodoro') {
    runtimeState.settings.workDurationMinutes = POMODORO_WORK_DURATION_MINUTES;
    runtimeState.settings.restDurationMinutes = POMODORO_REST_DURATION_MINUTES;
  } else if (mode === 'double-pomodoro') {
    runtimeState.settings.workDurationMinutes = DOUBLE_POMODORO_WORK_DURATION_MINUTES;
    runtimeState.settings.restDurationMinutes = DOUBLE_POMODORO_REST_DURATION_MINUTES;
  } else {
    runtimeState.settings.workDurationMinutes = runtimeState.settings.customWorkDurationMinutes;
    runtimeState.settings.restDurationMinutes = runtimeState.settings.customRestDurationMinutes;
  }

  return true;
}

function normalizeSettings(settings) {
  const next = {
    ...defaultSettings(),
    ...settings,
  };

  next.customWorkDurationMinutes = isValidCustomDuration(next.customWorkDurationMinutes)
    ? Math.round(next.customWorkDurationMinutes)
    : null;
  next.customRestDurationMinutes = isValidCustomDuration(next.customRestDurationMinutes)
    ? Math.round(next.customRestDurationMinutes)
    : null;
  next.customScheduleConfigured =
    next.customScheduleConfigured === true &&
    next.customWorkDurationMinutes !== null &&
    next.customRestDurationMinutes !== null;
  next.enablePerformanceLogging = next.enablePerformanceLogging !== false;

  if (!['pomodoro', 'double-pomodoro', 'custom'].includes(next.scheduleMode)) {
    next.scheduleMode = 'double-pomodoro';
  }

  if (next.scheduleMode === 'custom' && !hasConfiguredCustomSchedule(next)) {
    next.scheduleMode = 'double-pomodoro';
  }

  if (next.scheduleMode === 'pomodoro') {
    next.workDurationMinutes = POMODORO_WORK_DURATION_MINUTES;
    next.restDurationMinutes = POMODORO_REST_DURATION_MINUTES;
  } else if (next.scheduleMode === 'double-pomodoro') {
    next.workDurationMinutes = DOUBLE_POMODORO_WORK_DURATION_MINUTES;
    next.restDurationMinutes = DOUBLE_POMODORO_REST_DURATION_MINUTES;
  } else {
    next.workDurationMinutes = next.customWorkDurationMinutes;
    next.restDurationMinutes = next.customRestDurationMinutes;
  }

  return next;
}

function stateFilePath() {
  return path.join(app.getPath('userData'), 'state.json');
}

function loadPersistedState() {
  try {
    const raw = fs.readFileSync(stateFilePath(), 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed.settings);
  } catch {
    return defaultSettings();
  }
}

function savePersistedState() {
  const payload = {
    settings: runtimeState.settings,
  };
  fs.mkdirSync(path.dirname(stateFilePath()), { recursive: true });
  fs.writeFileSync(stateFilePath(), JSON.stringify(payload, null, 2));
}

function minutesToSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value * 60);
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function createSnapshot() {
  const workDurationSeconds = minutesToSeconds(runtimeState.settings.workDurationMinutes);

  return {
    settings: runtimeState.settings,
    session: {
      mode: runtimeState.sessionMode,
      sessionActive: runtimeState.sessionActive,
      workElapsedSeconds: runtimeState.workElapsedSeconds,
      workRemainingSeconds: Math.max(0, workDurationSeconds - runtimeState.workElapsedSeconds),
      restRemainingSeconds: runtimeState.restRemainingSeconds,
      idleSeconds: 0,
      blockingIntroRemainingSeconds: runtimeState.blockingRemainingSeconds,
    },
    catAsset: {
      kind: 'builtin',
      bundle: null,
    },
  };
}

function trayStatusText(snapshot) {
  if (!snapshot.session.sessionActive) {
    if (snapshot.session.mode === 'blocking') {
      return `已暂停 · 肥猫进场剩余 ${formatClock(snapshot.session.blockingIntroRemainingSeconds)}`;
    }
    if (snapshot.session.mode === 'resting') {
      return `已暂停 · 休息剩余 ${formatClock(snapshot.session.restRemainingSeconds)}`;
    }
    return '已暂停 · 屏幕锁定或睡眠中';
  }

  if (snapshot.session.mode === 'idle') {
    return '待机中 · 准备开始工作计时';
  }
  if (snapshot.session.mode === 'working') {
    return `工作中 · 距离休息还有 ${formatClock(snapshot.session.workRemainingSeconds)}`;
  }
  if (snapshot.session.mode === 'blocking') {
    return `肥猫进场中 · 剩余 ${formatClock(snapshot.session.blockingIntroRemainingSeconds)}`;
  }
  return `休息中 · 还剩 ${formatClock(snapshot.session.restRemainingSeconds)}`;
}

function trayIconImage() {
  let iconFilename = 'tray-icon-mac.png';
  if (process.platform === 'win32') {
    iconFilename = 'tray-icon-win.ico';
  } else if (process.platform !== 'darwin') {
    iconFilename = 'tray-icon-master.png';
  }
  const iconPath = path.join(__dirname, 'assets', iconFilename);
  const image = nativeImage.createFromPath(iconPath);
  const sized = image.resize({ width: 18, height: 18 });
  if (process.platform === 'darwin') {
    sized.setTemplateImage(true);
  }
  return sized;
}

function rebuildTrayMenu() {
  if (!tray) {
    return;
  }

  const snapshot = createSnapshot();
  const statusText = trayStatusText(snapshot);
  const allowSkip = snapshot.session.mode === 'blocking' || snapshot.session.mode === 'resting';
  const allowStartBreak = snapshot.session.mode === 'idle' || snapshot.session.mode === 'working';
  const { scheduleMode } = runtimeState.settings;
  const customScheduleReady = hasConfiguredCustomSchedule();

  const menu = Menu.buildFromTemplate([
    { label: statusText, enabled: false },
    { type: 'separator' },
    {
      label: '模式',
      submenu: [
        {
          label: '番茄时钟模式 (25 分钟 / 5 分钟)',
          type: 'radio',
          checked: scheduleMode === 'pomodoro',
          click: () => {
            applyScheduleMode('pomodoro');
            savePersistedState();
            broadcastSnapshot();
          },
        },
        {
          label: '双倍番茄模式 (50 分钟 / 10 分钟)',
          type: 'radio',
          checked: scheduleMode === 'double-pomodoro',
          click: () => {
            applyScheduleMode('double-pomodoro');
            savePersistedState();
            broadcastSnapshot();
          },
        },
        {
          label: customModeLabel(),
          type: 'radio',
          enabled: customScheduleReady,
          checked: scheduleMode === 'custom',
          click: () => {
            if (!applyScheduleMode('custom')) {
              return;
            }
            savePersistedState();
            broadcastSnapshot();
          },
        },
        {
          type: 'separator',
        },
        {
          label: '编辑自定义时长…',
          click: () => {
            openSettingsWindow();
          },
        },
      ],
    },
    {
      label: runtimeState.settings.enablePerformanceLogging ? '关闭性能日志' : '开启性能日志',
      click: () => {
        runtimeState.settings.enablePerformanceLogging = !runtimeState.settings.enablePerformanceLogging;
        savePersistedState();
        restartPerformanceLogging();
        broadcastSnapshot();
      },
    },
    { type: 'separator' },
    {
      label: '立即休息',
      enabled: allowStartBreak,
      click: () => {
        startBreakInternal();
        broadcastSnapshot();
      },
    },
    {
      label: '跳过本次休息',
      enabled: allowSkip,
      click: () => {
        skipRest();
        broadcastSnapshot();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
  tray.setToolTip(`${APP_DISPLAY_NAME}\n${statusText}`);
}

function createTray() {
  tray = new Tray(trayIconImage());
  tray.on('click', () => {
    tray.popUpContextMenu();
  });
  rebuildTrayMenu();
}

function focusAnyVisibleOverlay() {
  for (const window of overlayWindows.values()) {
    if (!window || window.isDestroyed()) {
      continue;
    }
    if (window.isVisible()) {
      window.show();
      window.focus();
      return;
    }
  }
}

function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 420,
    height: 240,
    minWidth: 420,
    minHeight: 220,
    useContentSize: true,
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: `${APP_DISPLAY_NAME} · 自定义模式`,
    autoHideMenuBar: true,
    backgroundColor: '#15110f',
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function resizeSettingsWindow(payload) {
  if (!settingsWindow || settingsWindow.isDestroyed()) {
    return;
  }

  const contentWidth = Number(payload?.width);
  const contentHeight = Number(payload?.height);
  const nextWidth = Number.isFinite(contentWidth) ? Math.max(420, Math.ceil(contentWidth)) : 420;
  const nextHeight = Number.isFinite(contentHeight) ? Math.max(220, Math.ceil(contentHeight)) : 220;

  settingsWindow.setContentSize(nextWidth, nextHeight);
  settingsWindow.center();
}

function fitOverlayWindowToDisplay(window, display) {
  if (!window || window.isDestroyed()) {
    return;
  }
  const { bounds } = display;
  const currentBounds = window.getBounds();
  const boundsChanged =
    currentBounds.x !== bounds.x ||
    currentBounds.y !== bounds.y ||
    currentBounds.width !== bounds.width ||
    currentBounds.height !== bounds.height;

  if (boundsChanged) {
    window.setBounds(bounds);
  }
}

function createOverlayWindow(display) {
  const window = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: false,
    fullscreenable: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  window.setAlwaysOnTop(true, 'screen-saver');
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  window.setContentProtection(true);
  window.loadFile(path.join(__dirname, 'overlay.html'));
  window.webContents.on('did-finish-load', () => {
    sendSnapshotToOverlay();
  });
  window.on('closed', () => {
    overlayWindows.delete(display.id);
  });

  return window;
}

function syncOverlayWindows() {
  const displays = screen.getAllDisplays();
  const liveIds = new Set(displays.map((display) => display.id));

  for (const [displayId, window] of overlayWindows.entries()) {
    if (!liveIds.has(displayId)) {
      overlayWindows.delete(displayId);
      if (!window.isDestroyed()) {
        window.close();
      }
    }
  }

  for (const display of displays) {
    let window = overlayWindows.get(display.id);
    if (!window || window.isDestroyed()) {
      window = createOverlayWindow(display);
      overlayWindows.set(display.id, window);
      if (runtimeState.sessionMode === 'blocking' || runtimeState.sessionMode === 'resting') {
        fitOverlayWindowToDisplay(window, display);
        window.showInactive();
        if (process.platform === 'darwin' && typeof window.setSimpleFullScreen === 'function' && !window.isSimpleFullScreen()) {
          window.setSimpleFullScreen(true);
        }
        window.moveTop();
      }
    }
    fitOverlayWindowToDisplay(window, display);
  }
}

function showOverlay() {
  syncOverlayWindows();
  for (const [displayId, window] of overlayWindows.entries()) {
    const display = screen.getAllDisplays().find((item) => item.id === displayId);
    if (display) {
      fitOverlayWindowToDisplay(window, display);
    }

    const wasVisible = window.isVisible();
    if (!wasVisible) {
      window.showInactive();
      if (process.platform === 'darwin' && typeof window.setSimpleFullScreen === 'function' && !window.isSimpleFullScreen()) {
        window.setSimpleFullScreen(true);
      }
      window.moveTop();
    }
  }
}

function hideOverlay() {
  for (const window of overlayWindows.values()) {
    if (!window || window.isDestroyed()) {
      continue;
    }
    window.hide();
  }
}

function finishRest() {
  runtimeState.workElapsedSeconds = 0;
  runtimeState.restRemainingSeconds = 0;
  runtimeState.blockingRemainingSeconds = 0;
  runtimeState.sessionMode = runtimeState.sessionActive ? 'working' : 'idle';
  hideOverlay();
}

function startBreakInternal() {
  runtimeState.sessionMode = 'blocking';
  runtimeState.blockingRemainingSeconds = BLOCKING_INTRO_DURATION_SECONDS;
  runtimeState.restRemainingSeconds = minutesToSeconds(runtimeState.settings.restDurationMinutes);
  if (runtimeState.sessionActive) {
    showOverlay();
  } else {
    hideOverlay();
  }
}

function skipRest() {
  runtimeState.workElapsedSeconds = 0;
  runtimeState.restRemainingSeconds = 0;
  runtimeState.blockingRemainingSeconds = 0;
  runtimeState.sessionMode = runtimeState.sessionActive ? 'working' : 'idle';
  hideOverlay();
}

function finishBlockingIntro() {
  if (runtimeState.sessionMode !== 'blocking') {
    return;
  }
  runtimeState.blockingRemainingSeconds = 0;
  runtimeState.sessionMode = 'resting';
  if (runtimeState.sessionActive) {
    showOverlay();
  }
}

function handleSessionActivityChange(active) {
  if (runtimeState.sessionActive === active) {
    return;
  }

  runtimeState.sessionActive = active;
  if (active) {
    if (runtimeState.sessionMode === 'idle') {
      runtimeState.sessionMode = 'working';
    }
    if (runtimeState.sessionMode === 'blocking' || runtimeState.sessionMode === 'resting') {
      showOverlay();
    }
  } else {
    if (runtimeState.sessionMode === 'working') {
      runtimeState.sessionMode = 'idle';
    }
    hideOverlay();
  }

  broadcastSnapshot();
}

function sessionLoop() {
  if (runtimeState.sessionMode === 'idle') {
    if (runtimeState.sessionActive) {
      runtimeState.sessionMode = 'working';
    }
  } else if (runtimeState.sessionMode === 'working') {
    if (!runtimeState.sessionActive) {
      runtimeState.sessionMode = 'idle';
    } else {
      runtimeState.workElapsedSeconds += 1;
      if (runtimeState.workElapsedSeconds >= minutesToSeconds(runtimeState.settings.workDurationMinutes)) {
        startBreakInternal();
      }
    }
  } else if (runtimeState.sessionMode === 'blocking') {
    if (runtimeState.sessionActive) {
      showOverlay();
      runtimeState.blockingRemainingSeconds = Math.max(0, runtimeState.blockingRemainingSeconds - 1);
      if (runtimeState.blockingRemainingSeconds === 0) {
        runtimeState.sessionMode = 'resting';
      }
    } else {
      hideOverlay();
    }
  } else if (runtimeState.sessionMode === 'resting') {
    if (runtimeState.sessionActive) {
      showOverlay();
      runtimeState.restRemainingSeconds = Math.max(0, runtimeState.restRemainingSeconds - 1);
      if (runtimeState.restRemainingSeconds === 0) {
        finishRest();
      }
    } else {
      hideOverlay();
    }
  }

  broadcastSnapshot();
}

function sendSnapshotToOverlay() {
  for (const window of overlayWindows.values()) {
    if (!window || window.isDestroyed()) {
      continue;
    }
    window.webContents.send('fatcat:snapshot', createSnapshot());
  }
}

function broadcastSnapshot() {
  rebuildTrayMenu();
  sendSnapshotToOverlay();
}

function registerPowerMonitor() {
  powerMonitor.on('lock-screen', () => handleSessionActivityChange(false));
  powerMonitor.on('suspend', () => handleSessionActivityChange(false));
  powerMonitor.on('unlock-screen', () => handleSessionActivityChange(true));
  powerMonitor.on('resume', () => handleSessionActivityChange(true));
  if (process.platform === 'darwin') {
    powerMonitor.on('user-did-resign-active', () => handleSessionActivityChange(false));
    powerMonitor.on('user-did-become-active', () => handleSessionActivityChange(true));
  }
}

ipcMain.on('fatcat:overlay-ready', () => {
  sendSnapshotToOverlay();
});

ipcMain.on('fatcat:finish-blocking-intro', () => {
  finishBlockingIntro();
  broadcastSnapshot();
});

ipcMain.on('fatcat:skip-rest', () => {
  skipRest();
  broadcastSnapshot();
});

ipcMain.handle('fatcat:get-settings', () => {
  return runtimeState.settings;
});

ipcMain.handle('fatcat:save-custom-settings', (_event, payload) => {
  const work = Number(payload?.workDurationMinutes);
  const rest = Number(payload?.restDurationMinutes);

  if (!isValidCustomDuration(work)) {
    return { ok: false, message: `工作时长请输入 1 到 ${MAX_CUSTOM_DURATION_MINUTES} 分钟。` };
  }

  if (!isValidCustomDuration(rest)) {
    return { ok: false, message: `休息时长请输入 1 到 ${MAX_CUSTOM_DURATION_MINUTES} 分钟。` };
  }

  runtimeState.settings.customWorkDurationMinutes = Math.round(work);
  runtimeState.settings.customRestDurationMinutes = Math.round(rest);
  runtimeState.settings.customScheduleConfigured = true;
  applyScheduleMode('custom');
  savePersistedState();
  broadcastSnapshot();

  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }

  return { ok: true };
});

ipcMain.on('fatcat:resize-settings-window', (_event, payload) => {
  resizeSettingsWindow(payload);
});

configureAppIdentity();

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

app.on('second-instance', () => {
  focusAnyVisibleOverlay();
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
  }
});

app.whenReady().then(() => {
  clearLegacyUserData();
  runtimeState.settings = loadPersistedState();
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  syncOverlayWindows();
  createTray();
  registerPowerMonitor();
  restartPerformanceLogging();
  broadcastSnapshot();

  sessionTimer = setInterval(sessionLoop, TICK_MS);
  screen.on('display-added', () => {
    syncOverlayWindows();
    collectPerformanceSnapshot('display-added');
  });
  screen.on('display-removed', () => {
    syncOverlayWindows();
    collectPerformanceSnapshot('display-removed');
  });
  screen.on('display-metrics-changed', () => {
    syncOverlayWindows();
    collectPerformanceSnapshot('display-metrics-changed');
  });
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.on('before-quit', () => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
  if (performanceLogTimer) {
    clearInterval(performanceLogTimer);
    performanceLogTimer = null;
  }
});
