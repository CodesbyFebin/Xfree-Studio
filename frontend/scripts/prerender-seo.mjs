import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const root = process.cwd();
const dist = path.join(root, 'dist');
const site = 'https://xfree-studio.web.app';
const vite = await createServer({ configFile: path.join(root, 'vite.config.ts'), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const [{ SEO_PAGES, SeoPageView }, { Landing }] = await Promise.all([
    vite.ssrLoadModule('/src/seoPages.tsx'),
    vite.ssrLoadModule('/src/Landing.tsx'),
  ]);
  const baseHtml = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
  const homepageMarkup = renderToString(React.createElement(Landing, { openStudio: () => {}, openTrust: () => {} }));

  const schemaFor = (url, title, description, breadcrumbs = []) => {
    const webpage = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url };
    if (breadcrumbs.length) return [webpage, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.url })) }];
    return [webpage, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'XFree Studio', url: site, description: 'A browser-based workspace for Gemini project briefs, local starter projects, and privacy-aware AI choices.' }];
  };

  const htmlFor = (markup, { title, description, path: pagePath, schema, canonical = true }) => {
    const url = `${site}${pagePath}`;
    const tags = [
      `<meta name="description" content="${escapeAttr(description)}" />`,
      canonical ? `<link rel="canonical" href="${url}" />` : '',
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escapeAttr(title)}" />`,
      `<meta property="og:description" content="${escapeAttr(description)}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta name="twitter:card" content="summary" />`,
      `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
      `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    ].filter(Boolean).join('\n  ');
    return baseHtml
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description"[^>]*\/?\s*>/, '')
      .replace('</head>', `  ${tags}\n</head>`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  };

  const pages = [{ path: '/', title: 'XFree App — XFree Studio AI Project Workspace', description: 'Meet the XFree App: XFree Studio brings Gemini project briefs, editable local starters, privacy-aware AI modes, and explainable agent trust concepts into your browser.', markup: homepageMarkup, schema: schemaFor(site, 'XFree App — XFree Studio AI Project Workspace', 'A browser-based workspace for Gemini project briefs, editable local starters, privacy-aware AI modes, and explainable agent trust concepts.') }];

  for (const page of SEO_PAGES) {
    const markup = renderToString(React.createElement(SeoPageView, { page }));
    const crumbs = [
      { name: 'Home', url: site },
      ...page.path.split('/').filter(Boolean).map((segment, index, parts) => ({ name: index === parts.length - 1 ? page.eyebrow.split(' · ').at(-1) : segment.replace(/-/g, ' '), url: `${site}/${parts.slice(0, index + 1).join('/')}` })),
    ];
    pages.push({ path: page.path, title: page.title, description: page.description, markup, schema: schemaFor(`${site}${page.path}`, page.title, page.description, crumbs) });
  }

  const studioMarkup = '<main class="studio-static-intro"><p>XFREESTUDIO / GEMINI WORKSPACE</p><h1>XFree Studio: Gemini project briefs and editable starters</h1><p>Plan a project with Gemini through Firebase AI Logic, choose local, hybrid, or cloud inference, then inspect and edit a local template project.</p><a href="/features/xfree-studio">How XFree Studio works</a></main>';
  pages.push({ path: '/studio', title: 'XFree Studio — Gemini Project Briefs and Local Starters', description: 'Open XFree Studio to plan with Gemini, choose an AI inference mode, and edit a local project starter.', markup: studioMarkup, schema: schemaFor(`${site}/studio`, 'XFree Studio — Gemini Project Briefs and Local Starters', 'Plan with Gemini and work with a local project starter.') });

  for (const page of pages) {
    const relativePath = page.path === '/' ? 'index.html' : path.join(page.path.slice(1), 'index.html');
    const output = path.join(dist, relativePath);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, htmlFor(page.markup, page));
  }

  const sitemap = pages.map((page) => `  <url><loc>${site}${page.path === '/' ? '/' : page.path}</loc></url>`).join('\n');
  await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
  await fs.writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
  await fs.writeFile(path.join(dist, 'llms.txt'), `# XFree Studio\n\n> XFree Studio is a browser-based project workspace. It uses Gemini through Firebase AI Logic for written project briefs and provides separate template-based local starters.\n\n## Product\n\n- [XFree Studio overview](${site}/features/xfree-studio): Capabilities and current product boundaries.\n- [Gemini AI Studio](${site}/features/gemini-ai-studio): Gemini brief generation and Firebase AI Logic.\n- [Hybrid AI](${site}/features/hybrid-ai): Local preference with possible cloud fallback.\n- [Privacy and data flow](${site}/privacy/how-xfree-handles-prompts): Prompt and project handling.\n- [Know Your Agent](${site}/features/know-your-agent): Simulated concept demo and limitations.\n\n## Guides\n\n${SEO_PAGES.filter((page) => page.path.startsWith('/guides/')).map((page) => `- [${page.h1}](${site}${page.path})`).join('\n')}\n\n## App\n\n- [Open XFree Studio](${site}/studio)\n- [GitHub source](https://github.com/CodesbyFebin/Xfree-Studio)\n`);
  console.log(`Pre-rendered ${pages.length - 1} SEO content pages plus the Studio entry, and generated sitemap.xml, robots.txt, and llms.txt.`);
} finally {
  await vite.close();
}

function escapeHtml(value) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
function escapeAttr(value) { return escapeHtml(value).replaceAll('"', '&quot;'); }
