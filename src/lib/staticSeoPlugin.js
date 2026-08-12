import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { PUBLIC_METADATA, SITE_URL } from './publicMetadata.js';

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const meta = (name, value, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}" />`;

function replaceMetadata(html, page) {
  let output = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta\s+name=["']title["'][^>]*>/i, meta('title', page.title))
    .replace(/<meta\s+name=["']description["'][^>]*>/i, meta('description', page.description))
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${page.canonical}" />`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, meta('og:url', page.canonical, true))
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, meta('og:title', page.title, true))
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, meta('og:description', page.description, true))
    .replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, meta('twitter:url', page.canonical))
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, meta('twitter:title', page.title))
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, meta('twitter:description', page.description));
  return output.replace(/<meta\s+name=["']robots["'][^>]*>\s*/i, '');
}

function makePrivate(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>Sign in | EXECLEAD.AI</title>')
    .replace(/<meta\s+name=["']description["'][^>]*>/i, meta('description', 'Sign in to access your private EXECLEAD.AI workspace.'))
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/i, '')
    .replace('</head>', `${meta('robots', 'noindex, nofollow, noarchive')}\n  </head>`);
}

const destination = (outDir, route) => route === '/' ? path.join(outDir, 'index.html') : path.join(outDir, route.slice(1), 'index.html');

export function staticSeoPlugin() {
  let root = process.cwd();
  let outDir = 'dist';
  return {
    name: 'execlead-static-seo',
    enforce: 'post',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(root, config.build.outDir);
    },
    closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const shell = fs.readFileSync(indexPath, 'utf8');
      const genericPattern = /\bon EXECLEAD\.AI\.\s*EXECLEAD\.?$|^[A-Za-z ]+ page$/i;
      const genericPages = Object.values(PUBLIC_METADATA).filter((page) => genericPattern.test(page.description.trim()));
      if (genericPages.length) {
        throw new Error(`Generic public SEO descriptions remain: ${genericPages.map((page) => page.path).join(', ')}`);
      }

      for (const page of Object.values(PUBLIC_METADATA)) {
        const file = destination(outDir, page.path);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, replaceMetadata(shell, page));
      }

      const appSource = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8');
      const declaredRoutes = [...appSource.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map((match) => match[1]);
      for (const route of new Set(declaredRoutes)) {
        if (!route.startsWith('/') || route.includes(':') || route.includes('*') || PUBLIC_METADATA[route]) continue;
        const file = destination(outDir, route);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, makePrivate(shell));
      }

      const llms = [
        '# EXECLEAD.AI',
        '',
        '> EXECLEAD.AI is an Executive Leadership Operating System™ helping organizations develop executive readiness, judgment, and strategic leadership.',
        '',
        '## Public pages',
        '',
        ...Object.values(PUBLIC_METADATA).map((page) => `- [${page.title.replace(/ \| EXECLEAD\.AI.*$/, '')}](${page.canonical}): ${page.description}`),
        '',
      ].join('\n');
      fs.writeFileSync(path.join(outDir, 'llms.txt'), llms);
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...Object.values(PUBLIC_METADATA).map((page) => `  <url><loc>${page.canonical}</loc></url>`),
        '</urlset>',
        '',
      ].join('\n');
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}