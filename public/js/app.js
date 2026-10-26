import { renderFileTree } from './file-tree.js';
import { renderSimpleMarkdown } from './editor.js';
import { setupToolbar, insertMediaTag } from './toolbar.js';
import { setupMediaModal } from './media-modal.js';
import { setupBuildConsole } from './build-console.js';
import { showToast } from './toast.js';

let articles = [];
let activeSlug = null;

const treeContainer = document.getElementById('file-tree');
const editorWrapper = document.getElementById('editor-wrapper');
const titleInput = document.getElementById('meta-title');
const slugInput = document.getElementById('meta-slug');
const catInput = document.getElementById('meta-category');
const dateInput = document.getElementById('meta-date');
const descInput = document.getElementById('meta-desc');
const bodyInput = document.getElementById('body-content');
const previewPane = document.getElementById('markdown-preview');
const indicator = document.getElementById('active-article-indicator');
const saveBtn = document.getElementById('btn-save');
const deleteBtn = document.getElementById('btn-delete');
const newBtn = document.getElementById('btn-new-article');

const mediaModal = setupMediaModal((url, name) => {
  insertMediaTag(bodyInput, url, name, updatePreview);
  showToast(`Inserted ${name} into editor`, 'success');
});

setupToolbar(bodyInput, () => mediaModal.openModal(), updatePreview);
setupBuildConsole();

async function loadArticles() {
  try {
    const res = await fetch('/api/articles');
    const data = await res.json();
    articles = data.articles || [];
    renderFileTree(treeContainer, articles, activeSlug, selectArticle);
  } catch {
    showToast('Failed to load articles from site', 'error');
  }
}

async function selectArticle(slug) {
  activeSlug = slug;
  renderFileTree(treeContainer, articles, activeSlug, selectArticle);

  try {
    const res = await fetch(`/api/articles/${slug}`);
    const post = await res.json();

    titleInput.value = post.metadata.title || '';
    slugInput.value = post.slug || '';
    catInput.value = post.metadata.category || '';
    dateInput.value = post.metadata.publishedDate || '';
    descInput.value = post.metadata.description || '';
    bodyInput.value = post.content || '';

    updatePreview();
    indicator.textContent = `Editing: ${post.metadata.title || slug}`;
    editorWrapper.style.display = 'flex';
    saveBtn.style.display = 'inline-flex';
    deleteBtn.style.display = 'inline-flex';
  } catch {
    showToast(`Error opening ${slug}`, 'error');
  }
}

function updatePreview() {
  previewPane.innerHTML = `
    <h1 style="margin-bottom: 0.5rem;">${titleInput.value || 'Untitled Post'}</h1>
    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
      ${catInput.value || 'Category'} &bull; ${dateInput.value || 'Date'}
    </p>
    <div>${renderSimpleMarkdown(bodyInput.value)}</div>
  `;
}

bodyInput.addEventListener('input', updatePreview);
titleInput.addEventListener('input', updatePreview);

saveBtn.addEventListener('click', async () => {
  const slug = slugInput.value.trim() || 'untitled-post';
  const payload = {
    slug,
    metadata: {
      id: slug,
      title: titleInput.value.trim(),
      category: catInput.value.trim(),
      publishedDate: dateInput.value.trim(),
      description: descInput.value.trim()
    },
    content: bodyInput.value
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  try {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Post';

    if (res.ok) {
      activeSlug = slug;
      await loadArticles();
      indicator.textContent = `Saved: ${payload.metadata.title}`;
      showToast('Article saved successfully!', 'success');
    } else {
      showToast('Error saving article', 'error');
    }
  } catch {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Post';
    showToast('Failed to save article', 'error');
  }
});

deleteBtn.addEventListener('click', async () => {
  if (!confirm(`Delete "${activeSlug}.md"? This cannot be undone.`)) return;
  try {
    const res = await fetch(`/api/articles/${activeSlug}`, { method: 'DELETE' });
    if (res.ok) {
      activeSlug = null;
      editorWrapper.style.display = 'none';
      saveBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
      indicator.textContent = 'Select an article to edit';
      showToast('Article deleted', 'info');
      await loadArticles();
    }
  } catch {
    showToast('Failed to delete article', 'error');
  }
});

newBtn.addEventListener('click', () => {
  activeSlug = null;
  renderFileTree(treeContainer, articles, activeSlug, selectArticle);
  titleInput.value = '';
  slugInput.value = '';
  catInput.value = 'General';
  dateInput.value = new Date().toISOString().split('T')[0];
  descInput.value = '';
  bodyInput.value = '';
  updatePreview();
  indicator.textContent = 'Creating New Post';
  editorWrapper.style.display = 'flex';
  saveBtn.style.display = 'inline-flex';
  deleteBtn.style.display = 'none';
  showToast('Ready for new article', 'info');
});

loadArticles();
