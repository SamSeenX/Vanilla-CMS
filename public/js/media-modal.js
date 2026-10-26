import { showToast } from './toast.js';

export function setupMediaModal(onInsert) {
  const modal = document.getElementById('media-modal');
  const closeBtn = document.getElementById('btn-close-media');
  const dropzone = document.getElementById('media-dropzone');
  const fileInput = document.getElementById('file-upload-input');
  const mediaGrid = document.getElementById('media-grid-container');

  async function loadMedia() {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      renderMedia(data.media || []);
    } catch {
      showToast('Failed to load media assets', 'error');
    }
  }

  function renderMedia(items) {
    mediaGrid.innerHTML = '';
    if (items.length === 0) {
      mediaGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">No media files found. Upload an image above.</div>';
      return;
    }
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <img src="${item.url}" class="media-thumb" loading="lazy" alt="${item.name}">
        <div class="media-meta">${item.name}</div>
      `;
      card.addEventListener('click', () => {
        onInsert(item.url, item.name);
        closeModal();
      });
      mediaGrid.appendChild(card);
    });
  }

  function openModal() {
    modal.classList.add('open');
    loadMedia();
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleUpload(fileInput.files[0]);
    }
  });

  async function handleUpload(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are supported', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        showToast('Uploading asset...', 'info');
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, dataUrl: reader.result })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Image uploaded successfully', 'success');
          loadMedia();
        } else {
          showToast(data.error || 'Upload failed', 'error');
        }
      } catch {
        showToast('Upload failed', 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  return { openModal };
}
