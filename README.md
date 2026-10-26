# Vanilla-CMS

> **Zero-Dependency Visual Markdown Editor & Companion Dashboard for VanillaSSG**

Vanilla-CMS is an independent, lightweight local companion tool designed to edit, preview, and organize content for [VanillaSSG](https://github.com/SamSeenX/Vanilla-SSG-by-SamSeen) websites.

---

## Highlights

- **Zero Runtime Contamination**: Completely decoupled from your static site codebase. It leaves no dependencies, build scripts, or bloated node_modules in your site repo.
- **Pure Native Node.js**: Built using built-in Node standard modules (`node:http`, `node:fs/promises`, `node:path`) with zero server frameworks.
- **Visual File Tree & Split-Pane Editor**: Browse articles in `content/items/*.md`, edit frontmatter metadata visually, and write Markdown with real-time preview.
- **Enforced Sub-200-Line Architecture**: Every file in this codebase stays strictly under 200 lines to ensure seamless AI maintainability and human readability.

---

## Quick Start

```bash
# Clone the CMS companion
git clone https://github.com/SamSeenX/Vanilla-CMS.git
cd Vanilla-CMS

# Launch the visual dashboard targeting your site directory
node server/index.js /path/to/my-vanilla-ssg-site
```

Visit `http://localhost:4321` in your browser.

---

## License

MIT © [SamSeen](https://github.com/SamSeenX)
