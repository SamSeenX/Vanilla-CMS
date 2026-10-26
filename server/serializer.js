export function parseMarkdownFile(fileContent) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: fileContent.trim() };
  }

  const rawYaml = match[1];
  const body = match[2].trim();
  const data = {};

  rawYaml.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) return;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value.toLowerCase() === 'true') {
      value = true;
    } else if (value.toLowerCase() === 'false') {
      value = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      value = Number(value);
    }

    data[key] = value;
  });

  return { data, content: body };
}

export function stringifyMarkdownFile(data, content) {
  const yamlLines = ['---'];
  const orderedKeys = ['id', 'title', 'tagline', 'description', 'category', 'publishedDate', 'readingTime'];

  const allKeys = Array.from(new Set([...orderedKeys, ...Object.keys(data)]));

  allKeys.forEach(key => {
    if (data[key] === undefined || data[key] === null) return;
    const val = data[key];
    if (typeof val === 'string') {
      if (val.includes(':') || val.includes('#') || val.includes('"') || val.includes('\n')) {
        yamlLines.push(`${key}: "${val.replace(/"/g, '\\"')}"`);
      } else {
        yamlLines.push(`${key}: ${val}`);
      }
    } else {
      yamlLines.push(`${key}: ${val}`);
    }
  });

  yamlLines.push('---');
  yamlLines.push('');
  yamlLines.push(content ? content.trim() : '');
  yamlLines.push('');

  return yamlLines.join('\n');
}

export function generateSlug(title) {
  return (title || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
