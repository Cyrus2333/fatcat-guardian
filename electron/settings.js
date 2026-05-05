const form = document.getElementById('settings-form');
const workInput = document.getElementById('work-duration');
const restInput = document.getElementById('rest-duration');
const errorText = document.getElementById('error-text');
const cancelButton = document.getElementById('cancel-button');
const MAX_DURATION = 360;

function requestWindowResize() {
  requestAnimationFrame(() => {
    const sheet = document.querySelector('.sheet');
    const width = Math.ceil(sheet?.scrollWidth ?? document.body.scrollWidth ?? 420);
    const height = Math.ceil(sheet?.scrollHeight ?? document.body.scrollHeight ?? 220);
    window.fatcat.resizeSettingsWindow({
      width,
      height,
    });
  });
}

function sanitizeDuration(rawValue) {
  const digitsOnly = String(rawValue ?? '').replace(/\D+/g, '').slice(0, 3);
  if (!digitsOnly) {
    return '';
  }

  return String(Math.min(MAX_DURATION, Number(digitsOnly)));
}

function bindNumericInput(input) {
  input.addEventListener('input', () => {
    const sanitized = sanitizeDuration(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    errorText.textContent = '';
    requestWindowResize();
  });

  input.addEventListener('blur', () => {
    input.value = sanitizeDuration(input.value);
    requestWindowResize();
  });
}

bindNumericInput(workInput);
bindNumericInput(restInput);

window.fatcat.getSettings().then((settings) => {
  workInput.value = sanitizeDuration(settings?.customWorkDurationMinutes ?? '');
  restInput.value = sanitizeDuration(settings?.customRestDurationMinutes ?? '');
  requestWindowResize();
}).catch(() => undefined);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorText.textContent = '';

  const workValue = sanitizeDuration(workInput.value);
  const restValue = sanitizeDuration(restInput.value);
  workInput.value = workValue;
  restInput.value = restValue;

  if (!workValue || !restValue) {
    errorText.textContent = `请填写 1 到 ${MAX_DURATION} 之间的分钟数。`;
    return;
  }

  const result = await window.fatcat.saveCustomSettings({
    workDurationMinutes: Number(workValue),
    restDurationMinutes: Number(restValue),
  });

  if (!result?.ok) {
    errorText.textContent = result?.message ?? '保存失败，请重试。';
    requestWindowResize();
  }
});

cancelButton.addEventListener('click', () => {
  window.close();
});

window.addEventListener('load', requestWindowResize);
