export function setupToolbar(textarea, onMediaClick, onUpdate) {
  function wrapSelection(before, after = before, defaultText = 'text') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end) || defaultText;
    const replacement = `${before}${sel}${after}`;

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + sel.length;
    textarea.focus();
    onUpdate();
  }

  function insertLinePrefix(prefix) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    const replacement = `${prefix} `;

    textarea.value = textarea.value.substring(0, lineStart) + replacement + textarea.value.substring(lineStart);
    textarea.focus();
    onUpdate();
  }

  document.getElementById('tool-bold')?.addEventListener('click', () => wrapSelection('**', '**', 'bold text'));
  document.getElementById('tool-italic')?.addEventListener('click', () => wrapSelection('*', '*', 'italic text'));
  document.getElementById('tool-h2')?.addEventListener('click', () => insertLinePrefix('##'));
  document.getElementById('tool-h3')?.addEventListener('click', () => insertLinePrefix('###'));
  document.getElementById('tool-quote')?.addEventListener('click', () => insertLinePrefix('>'));
  document.getElementById('tool-list')?.addEventListener('click', () => insertLinePrefix('*'));
  document.getElementById('tool-code')?.addEventListener('click', () => wrapSelection('`', '`', 'code'));
  document.getElementById('tool-link')?.addEventListener('click', () => wrapSelection('[', '](https://example.com)', 'link text'));
  document.getElementById('tool-media')?.addEventListener('click', onMediaClick);
}

export function insertMediaTag(textarea, url, name, onUpdate) {
  const start = textarea.selectionStart;
  const tag = `\n![${name || 'Image'}](${url})\n`;
  textarea.value = textarea.value.substring(0, start) + tag + textarea.value.substring(start);
  textarea.selectionStart = textarea.selectionEnd = start + tag.length;
  textarea.focus();
  onUpdate();
}
