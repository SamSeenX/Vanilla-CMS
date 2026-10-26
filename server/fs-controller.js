import fs from 'fs/promises';
import path from 'path';

export class FileSystemController {
  constructor(targetDir) {
    this.targetDir = path.resolve(targetDir);
    this.contentDir = path.join(this.targetDir, 'content', 'items');
    this.configPath = path.join(this.targetDir, 'scripts', 'site-config.js');
  }

  async validateTarget() {
    try {
      const stats = await fs.stat(this.contentDir);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  sanitizeSlug(slug) {
    return path.basename(slug).replace(/[^a-zA-Z0-9\-_]/g, '');
  }

  async listArticles() {
    try {
      const entries = await fs.readdir(this.contentDir, { withFileTypes: true });
      const mdFiles = entries
        .filter(e => e.isFile() && e.name.endsWith('.md'))
        .map(e => e.name.replace(/\.md$/, ''));
      return mdFiles;
    } catch {
      return [];
    }
  }

  async readArticle(slug) {
    const cleanSlug = this.sanitizeSlug(slug);
    const filePath = path.join(this.contentDir, `${cleanSlug}.md`);
    return await fs.readFile(filePath, 'utf8');
  }

  async writeArticle(slug, content) {
    const cleanSlug = this.sanitizeSlug(slug);
    const filePath = path.join(this.contentDir, `${cleanSlug}.md`);
    await fs.mkdir(this.contentDir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    return cleanSlug;
  }

  async deleteArticle(slug) {
    const cleanSlug = this.sanitizeSlug(slug);
    const filePath = path.join(this.contentDir, `${cleanSlug}.md`);
    await fs.unlink(filePath);
    return true;
  }

  async readConfig() {
    try {
      const raw = await fs.readFile(this.configPath, 'utf8');
      const getVal = (name) => {
        const match = raw.match(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*['"\`]([^'"\`]+)['"\`]`));
        return match ? match[1] : '';
      };
      return {
        siteUrl: getVal('SITE_URL'),
        siteDomain: getVal('SITE_DOMAIN'),
        siteName: getVal('SITE_NAME'),
        siteDescription: getVal('SITE_DESCRIPTION'),
        siteAuthor: getVal('SITE_AUTHOR')
      };
    } catch {
      return {};
    }
  }

  async writeConfig(config) {
    let raw = await fs.readFile(this.configPath, 'utf8');
    const updateVal = (name, val) => {
      const regex = new RegExp(`(export\\s+const\\s+${name}\\s*=\\s*['"\`])[^'"\`]*(['"\`];?)`);
      if (regex.test(raw)) {
        raw = raw.replace(regex, `$1${val}$2`);
      }
    };
    if (config.siteUrl) updateVal('SITE_URL', config.siteUrl);
    if (config.siteDomain) updateVal('SITE_DOMAIN', config.siteDomain);
    if (config.siteName) updateVal('SITE_NAME', config.siteName);
    if (config.siteDescription) updateVal('SITE_DESCRIPTION', config.siteDescription);
    if (config.siteAuthor) updateVal('SITE_AUTHOR', config.siteAuthor);

    await fs.writeFile(this.configPath, raw, 'utf8');
    return true;
  }
}
