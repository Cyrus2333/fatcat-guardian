const blockingVideo = document.getElementById('blocking-video');
const restingVideo = document.getElementById('resting-video');
const shell = document.getElementById('shell');
const badge = document.getElementById('badge');
const title = document.getElementById('title');
const copy = document.getElementById('copy');
const countdownLabel = document.getElementById('countdown-label');
const countdownValue = document.getElementById('countdown-value');

let lastMode = 'idle';
let enableEmergencyBypass = true;
let blockingFrameReady = false;

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function pauseVideo(video) {
  video.pause();
  video.classList.remove('is-visible');
}

function playVideo(video) {
  video.play().catch(() => undefined);
}

function showVideo(video) {
  video.classList.add('is-visible');
}

function hideVideo(video) {
  video.classList.remove('is-visible');
}

function waitForFirstFrame(video, callback) {
  if (typeof video.requestVideoFrameCallback === 'function') {
    video.requestVideoFrameCallback(() => {
      callback();
    });
    return;
  }
  requestAnimationFrame(() => {
    callback();
  });
}

function syncMode(snapshot) {
  const mode = snapshot?.session?.mode ?? 'idle';
  enableEmergencyBypass = snapshot?.settings?.enableEmergencyBypass ?? true;
  shell.dataset.mode = mode;

  if (mode !== 'blocking' && mode !== 'resting') {
    pauseVideo(blockingVideo);
    pauseVideo(restingVideo);
    shell.classList.add('is-hidden');
    hideVideo(blockingVideo);
    hideVideo(restingVideo);
    lastMode = mode;
    return;
  }

  shell.classList.remove('is-hidden');

  if (mode === 'blocking') {
    if (lastMode !== 'blocking') {
      hideVideo(restingVideo);
      pauseVideo(restingVideo);
      restingVideo.currentTime = 0;
      blockingVideo.currentTime = 0;
      blockingFrameReady = false;
      playVideo(blockingVideo);
      waitForFirstFrame(blockingVideo, () => {
        if ((shell.dataset.mode ?? 'idle') !== 'blocking') {
          return;
        }
        blockingFrameReady = true;
        showVideo(blockingVideo);
      });
    }
    badge.textContent = 'FatCat Guardian 进场中';
    title.textContent = '肥猫正在过来。';
    copy.textContent = '入场动画结束后会自动进入休息倒计时。';
    countdownLabel.textContent = '进入休息还剩';
    countdownValue.textContent = formatClock(snapshot.session.blockingIntroRemainingSeconds ?? 0);
  } else {
    if (lastMode !== 'resting') {
      restingVideo.currentTime = 0;
      playVideo(restingVideo);
      waitForFirstFrame(restingVideo, () => {
        if ((shell.dataset.mode ?? 'idle') !== 'resting') {
          return;
        }
        hideVideo(blockingVideo);
        pauseVideo(blockingVideo);
        showVideo(restingVideo);
      });
    } else {
      showVideo(restingVideo);
      if (restingVideo.paused) {
        playVideo(restingVideo);
      }
    }
    badge.textContent = 'FatCat Guardian 休息时间';
    title.textContent = '现在离开屏幕休息一下。';
    copy.textContent = '倒计时结束后会自动收起，继续下一轮工作。';
    countdownLabel.textContent = '休息剩余';
    countdownValue.textContent = formatClock(snapshot.session.restRemainingSeconds ?? 0);
  }

  lastMode = mode;
}

blockingVideo.addEventListener('ended', () => {
  window.fatcat.finishBlockingIntro();
});

blockingVideo.addEventListener('loadeddata', () => {
  if ((shell.dataset.mode ?? 'idle') !== 'blocking' || blockingFrameReady) {
    return;
  }
  playVideo(blockingVideo);
});

restingVideo.addEventListener('loadeddata', () => {
  restingVideo.pause();
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !enableEmergencyBypass) {
    return;
  }
  event.preventDefault();
  window.fatcat.skipRest();
});

window.fatcat.getSettings().then((settings) => {
  enableEmergencyBypass = settings?.enableEmergencyBypass ?? true;
}).catch(() => undefined);

window.fatcat.onSnapshot((snapshot) => {
  syncMode(snapshot);
});
