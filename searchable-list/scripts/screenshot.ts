// Screenshots the web export for the article (plan 022).
//
// Usage: bun run export:web && bun run screenshot
//
// Serves dist/ on a local port (unknown paths get index.html), opens it in
// Playwright Chromium at 390x844 with device scale 2, and saves list.png,
// then filtered.png after typing "nav", to the site's
// public/images/build-a-searchable-list-with-flatlist/.
// Each screenshot keeps the full width and is cropped 16 CSS px below the
// last visible row, or below the "No matches" text.
// Needs `bunx playwright install chromium` once.

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, type Page } from 'playwright';

import { libraries } from '../src/data';

const WIDTH = 390;
const MARGIN = 16;
// The texts of the list's rows and of its empty state.
const CONTENT = [...libraries.map((item) => item.name), 'No matches'];

const example = resolve(import.meta.dir, '..');
const dist = join(example, 'dist');
const out = resolve(example, '../../public/images/build-a-searchable-list-with-flatlist');

// The screenshots belong to the site's article, so this script runs only in
// the site's repo; the public copy of the examples has no `_posts/`.
if (!existsSync(resolve(example, '../../_posts'))) {
  console.error('This script writes into the site repo (public/images/); it does not run in a copy of the example.');
  process.exit(1);
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html is missing: run `bun run export:web` first.');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 0,
  fetch(request) {
    const path = resolve(dist, '.' + decodeURIComponent(new URL(request.url).pathname));
    const isFile = path.startsWith(dist + sep) && existsSync(path) && statSync(path).isFile();
    return new Response(Bun.file(isFile ? path : join(dist, 'index.html')));
  },
});

// The bottom, in CSS px, of the lowest element whose only content is one of
// the texts: a row (its padding and border included) or the empty state.
function contentBottom(page: Page): Promise<number> {
  return page.evaluate((texts) => {
    let bottom = 0;
    for (const el of document.querySelectorAll('body *')) {
      const only = el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE;
      if (only && texts.includes(el.textContent ?? '')) {
        bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
      }
    }
    return bottom;
  }, CONTENT);
}

async function save(page: Page, name: string): Promise<void> {
  const bottom = await contentBottom(page);
  if (bottom === 0) throw new Error(`${name}: no row or empty state on the page`);
  const height = Math.ceil(bottom + MARGIN);
  const path = join(out, name);
  await page.screenshot({ path, animations: 'disabled', clip: { x: 0, y: 0, width: WIDTH, height } });
  console.log(`saved ${path} (${WIDTH}x${height} CSS px)`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: 844 },
    deviceScaleFactor: 2,
  });
  await page.goto(server.url.href);

  const search = page.getByPlaceholder('Search');
  await search.waitFor();
  await page.getByText('MMKV').waitFor();
  await save(page, 'list.png');

  await search.pressSequentially('nav');
  await page.getByText('Reanimated').waitFor({ state: 'detached' });
  await save(page, 'filtered.png');
} finally {
  await browser.close();
  server.stop();
}
