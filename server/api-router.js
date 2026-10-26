import { parseMarkdownFile, stringifyMarkdownFile } from './serializer.js';

export async function handleApiRoute(req, res, fsCtrl, body) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  const jsonResponse = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (path === '/api/status' && method === 'GET') {
    const valid = await fsCtrl.validateTarget();
    return jsonResponse({ valid, targetDir: fsCtrl.targetDir });
  }

  if (path === '/api/articles' && method === 'GET') {
    const slugs = await fsCtrl.listArticles();
    const articles = [];
    for (const slug of slugs) {
      try {
        const raw = await fsCtrl.readArticle(slug);
        const parsed = parseMarkdownFile(raw);
        articles.push({ slug, ...parsed.data });
      } catch {
        // Skip unreadable files
      }
    }
    return jsonResponse({ articles });
  }

  if (path.startsWith('/api/articles/') && method === 'GET') {
    const slug = path.replace('/api/articles/', '');
    try {
      const raw = await fsCtrl.readArticle(slug);
      const parsed = parseMarkdownFile(raw);
      return jsonResponse({ slug, metadata: parsed.data, content: parsed.content });
    } catch {
      return jsonResponse({ error: 'Article not found' }, 404);
    }
  }

  if (path === '/api/articles' && method === 'POST') {
    try {
      const { slug, metadata, content } = JSON.parse(body || '{}');
      if (!slug || !metadata) {
        return jsonResponse({ error: 'Slug and metadata are required' }, 400);
      }
      const serialized = stringifyMarkdownFile(metadata, content);
      await fsCtrl.writeArticle(slug, serialized);
      return jsonResponse({ success: true, slug });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (path.startsWith('/api/articles/') && method === 'DELETE') {
    const slug = path.replace('/api/articles/', '');
    try {
      await fsCtrl.deleteArticle(slug);
      return jsonResponse({ success: true, slug });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  if (path === '/api/config' && method === 'GET') {
    const config = await fsCtrl.readConfig();
    return jsonResponse({ config });
  }

  if (path === '/api/config' && method === 'POST') {
    try {
      const { config } = JSON.parse(body || '{}');
      await fsCtrl.writeConfig(config || {});
      return jsonResponse({ success: true });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  return jsonResponse({ error: 'Route not found' }, 404);
}
