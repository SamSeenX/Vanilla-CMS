import { showToast } from './toast.js';

export function setupBuildConsole() {
  const modal = document.getElementById('build-modal');
  const closeBtn = document.getElementById('btn-close-build');
  const triggerBtn = document.getElementById('btn-trigger-build');
  const consoleOutput = document.getElementById('build-output');

  function openConsole() {
    modal.classList.add('open');
  }

  function closeConsole() {
    modal.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeConsole);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeConsole();
  });

  triggerBtn.addEventListener('click', async () => {
    openConsole();
    consoleOutput.textContent = '⏳ Executing Vite production build on target workspace...\n\n';
    triggerBtn.disabled = true;

    try {
      showToast('Static build started...', 'info');
      const res = await fetch('/api/build', { method: 'POST' });
      const data = await res.json();
      triggerBtn.disabled = false;

      if (data.success) {
        consoleOutput.textContent += data.stdout || '';
        consoleOutput.textContent += '\n\n✨ Build completed successfully! HTML files updated in dist/.';
        showToast('Site build complete!', 'success');
      } else {
        consoleOutput.textContent += data.stderr || data.stdout || 'Unknown error occurred';
        showToast('Build failed. Check console for details.', 'error');
      }
    } catch {
      triggerBtn.disabled = false;
      consoleOutput.textContent += '\n❌ Network error while communicating with CMS engine.';
      showToast('Build request failed', 'error');
    }
  });
}
