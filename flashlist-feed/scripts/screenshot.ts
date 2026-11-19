// Screenshots the web export for the article (plan 032).
//
// Usage: bun run export:web && bun run screenshot
//
// Serves dist/ on a local port (unknown paths get index.html), opens it in
// Playwright Chromium at 390x844 with device scale 2, scrolls the list until
// the "Section 2" header is in the middle of the window, and saves feed.png,
// then selected.png after clicking "Item 1.18" and "Item 2.2", to the site's
// public/images/render-a-long-list-with-flashlist/.
// Each screenshot keeps the full width and is cropped 16 CSS px below the
// last row, or at the bottom of the window when the rows fill it (they do:
// the list has 200 items).
// Needs `bunx playwright install chromium` once.

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, type Page } from 'playwright';

import { feed } from '../src/data';

const WIDTH = 390;
const HEIGHT = 844;
const MARGIN = 16;
// The texts of the list's headers and rows.
const CONTENT = feed.map((item) => item.title);
// The selected title color in src/Feed.tsx (#0b57d0).
const SELECTED_COLOR = 'rgb(11, 87, 208)';
const SELECT = ['Item 1.18', 'Item 2.2'];

const example = resolve(import.meta.dir, '..');
const dist = join(example, 'dist');
const out = resolve(example, '../../public/images/render-a-long-list-with-flashlist');

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
// the texts: a header or a row (its padding and border included).
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

// Waits until each title is shown in the selected color.
function waitForSelected(page: Page, titles: string[]): Promise<unknown> {
  return page.waitForFunction(
    ([titles, color]) =>
      (titles as string[]).every((title) =>
        [...document.querySelectorAll('body *')].some(
          (el) => el.textContent === title && el.childNodes.length === 1 && getComputedStyle(el).color === color,
        ),
      ),
    [titles, SELECTED_COLOR] as const,
  );
}

// Waits for two animation frames, so the list has laid out its rows.
function settle(page: Page): Promise<unknown> {
  return page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

async function save(page: Page, name: string): Promise<void> {
  const bottom = await contentBottom(page);
  if (bottom === 0) throw new Error(`${name}: no row on the page`);
  const height = Math.min(Math.ceil(bottom + MARGIN), HEIGHT);
  const path = join(out, name);
  await page.screenshot({ path, animations: 'disabled', clip: { x: 0, y: 0, width: WIDTH, height } });
  console.log(`saved ${path} (${WIDTH}x${height} CSS px)`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  await page.goto(server.url.href);

  const header = page.getByText('Section 2', { exact: true });
  await header.waitFor();
  const top = await header.evaluate((el) => el.getBoundingClientRect().top);
  await page.getByTestId('feed').evaluate((el, by) => el.scrollBy(0, by), Math.round(top - HEIGHT / 2));
  await page.getByText('Item 2.10', { exact: true }).waitFor();
  await settle(page);
  await save(page, 'feed.png');

  for (const title of SELECT) await page.getByText(title, { exact: true }).click();
  await waitForSelected(page, SELECT);
  await settle(page);
  await save(page, 'selected.png');
} finally {
  await browser.close();
  server.stop();
}
