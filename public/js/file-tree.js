export function renderFileTree(container, articles, activeSlug, onSelect) {
  container.innerHTML = '';
  if (!articles || articles.length === 0) {
    container.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">No markdown posts found in content/items/</div>';
    return;
  }

  articles.forEach(art => {
    const el = document.createElement('div');
    el.className = `tree-item ${art.slug === activeSlug ? 'active' : ''}`;
    el.innerHTML = `
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📄 ${art.title || art.slug}</span>
      <span style="font-size: 0.7rem; font-family: var(--font-mono);">${art.category || 'post'}</span>
    `;
    el.addEventListener('click', () => onSelect(art.slug));
    container.appendChild(el);
  });
}
