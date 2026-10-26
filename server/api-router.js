import { parseMarkdownFile, stringifyMarkdownFile } from './serializer.js';

export async function handleApiRoute(req, res, fsCtrl, body) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  const json = (data, status = 200) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (path === '/api/status' && method === 'GET') {
    const valid = await fsCtrl.validateTarget();
    return json({ valid, targetDir: fsCtrl.targetDir });
  }

  if (path === '/api/articles' && method === 'GET') {
    const slugs = await fsCtrl.listArticles();
    const articles = [];
    for (const slug of slugs) {
      try {
        const raw = await fsCtrl.readArticle(slug);
        const parsed = parseMarkdownFile(raw);
        articles.push({ slug, ...parsed.data });
      } catch {}
    }
    return json({ articles });
  }

  if (path.startsWith('/api/articles/') && method === 'GET') {
    const slug = path.replace('/api/articles/', '');
    try {
      const raw = await fsCtrl.readArticle(slug);
      const parsed = parseMarkdownFile(raw);
      return json({ slug, metadata: parsed.data, content: parsed.content });
    } catch {
      return json({ error: 'Article not found' }, 404);
    }
  }

  if (path === '/api/articles' && method === 'POST') {
    try {
      const { slug, metadata, content } = JSON.parse(body || '{}');
      if (!slug || !metadata) return json({ error: 'Slug and metadata required' }, 400);
      const serialized = stringifyMarkdownFile(metadata, content);
      await fsCtrl.writeArticle(slug, serialized);
      return json({ success: true, slug });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  if (path.startsWith('/api/articles/') && method === 'DELETE') {
    const slug = path.replace('/api/articles/', '');
    try {
      await fsCtrl.deleteArticle(slug);
      return json({ success: true, slug });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  if (path === '/api/media' && method === 'GET') {
    const media = await fsCtrl.listMedia();
    return json({ media });
  }

  if (path === '/api/media/upload' && method === 'POST') {
    try {
      const { fileName, dataUrl } = JSON.parse(body || '{}');
      if (!fileName || !dataUrl) return json({ error: 'Missing fileName or dataUrl' }, 400);
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const url = await fsCtrl.saveMedia(fileName, buffer);
      return json({ success: true, url });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  if (path === '/api/build' && method === 'POST') {
    const result = await fsCtrl.runBuild();
    return json(result);
  }

  if (path === '/api/config' && method === 'GET') {
    const config = await fsCtrl.readConfig();
    return json({ config });
  }

  if (path === '/api/config' && method === 'POST') {
    try {
      const { config } = JSON.parse(body || '{}');
      await fsCtrl.writeConfig(config || {});
      return json({ success: true });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  return json({ error: 'Route not found' }, 404);
}
