export function renderSimpleMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' style='max-width:100%; border-radius:6px;' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' style='color:var(--accent);'>$1</a>")
    .replace(/`([^`]+)`/gim, '<code style="background:var(--bg-hover); padding:2px 5px; border-radius:4px; font-family:var(--font-mono); font-size:0.85em;">$1</code>')
    .replace(/^\s*\n\*/gm, '<ul>\n*')
    .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2')
    .replace(/^\*(.+)/gm, '<li>$1</li>');

  const paragraphs = html.split(/\n\s*\n/);
  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<img')) {
      return trimmed;
    }
    return `<p style="margin-bottom: 1rem;">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}
