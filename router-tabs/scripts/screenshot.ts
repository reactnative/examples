// Screenshots the web export for the article (plan 032).
//
// Usage: bun run export:web && bun run screenshot
//
// Serves dist/ on a local port (/ is index.html; any other path must be a
// file in dist/), opens / in Playwright Chromium at 390x844 with device
// scale 2, and saves home.png, then detail.png after clicking "Coffee", to
// the site's public/images/build-tabs-and-a-detail-screen-with-expo-router/.
// The app is a single-page export, so the detail screen is reached only by
// that click, never by loading /item/3.
// Each screenshot keeps the full width and is cropped 16 CSS px below the
// last item or detail text, or at the bottom of the tab bar when one is
// shown (on the Home tab, the bottom of the window).
// Needs `bunx playwright install chromium` once.

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, type Page } from 'playwright';

import { items } from '../src/items';

const WIDTH = 390;
const HEIGHT = 844;
const MARGIN = 16;
const OPEN = items[2]; // Coffee, /item/3
const POSITION = `Item 3 of ${items.length}`;
// The texts of the items and of the detail screen.
const CONTENT = [...items.map((item) => item.title), POSITION];

const example = resolve(import.meta.dir, '..');
const dist = join(example, 'dist');
const out = resolve(example, '../../public/images/build-tabs-and-a-detail-screen-with-expo-router');

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
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    if (pathname === '/') return new Response(Bun.file(join(dist, 'index.html')));
    const path = resolve(dist, '.' + pathname);
    const isFile = path.startsWith(dist + sep) && existsSync(path) && statSync(path).isFile();
    if (isFile) return new Response(Bun.file(path));
    console.warn(`404 ${pathname}`);
    return new Response('Not found', { status: 404 });
  },
});

// The bottom, in CSS px, of the lowest element on screen whose content is
// only text, one of the texts (an item or a line of the detail screen),
// plus the margin; or of the tab bar, when it is lower.
function contentBottom(page: Page): Promise<number> {
  return page.evaluate(
    ([texts, margin]) => {
      const shown = (box: DOMRect) =>
        box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.left < window.innerWidth;
      let bottom = 0;
      for (const el of document.querySelectorAll('body *')) {
        const onlyText =
          el.childNodes.length > 0 && [...el.childNodes].every((node) => node.nodeType === Node.TEXT_NODE);
        const box = el.getBoundingClientRect();
        if (onlyText && shown(box) && (texts as string[]).includes(el.textContent ?? '')) {
          bottom = Math.max(bottom, box.bottom + (margin as number));
        }
      }
      for (const el of document.querySelectorAll('[role="tablist"]')) {
        const box = el.getBoundingClientRect();
        if (shown(box)) bottom = Math.max(bottom, box.bottom);
      }
      return bottom;
    },
    [CONTENT, MARGIN] as const,
  );
}

// Waits for two animation frames, so the screen has laid out.
function settle(page: Page): Promise<unknown> {
  return page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

async function save(page: Page, name: string): Promise<void> {
  const bottom = await contentBottom(page);
  if (bottom === 0) throw new Error(`${name}: no item or text on the page`);
  const height = Math.min(Math.ceil(bottom), HEIGHT);
  const path = join(out, name);
  await page.screenshot({ path, animations: 'disabled', clip: { x: 0, y: 0, width: WIDTH, height } });
  console.log(`saved ${path} (${WIDTH}x${height} CSS px) at ${new URL(page.url()).pathname}`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  await page.goto(server.url.href);

  await page.getByText(items[items.length - 1].title, { exact: true }).waitFor();
  await settle(page);
  await save(page, 'home.png');

  await page.getByText(OPEN.title, { exact: true }).click();
  await page.waitForURL((url) => url.pathname === `/item/${OPEN.id}`);
  const position = page.getByText(POSITION, { exact: true });
  await position.waitFor();
  // The stack may slide the detail screen in: wait until its text stops
  // moving between two checks, 100 ms apart.
  let left = NaN;
  for (;;) {
    await page.waitForTimeout(100);
    const now = (await position.boundingBox())?.x ?? NaN;
    if (now === left) break;
    left = now;
  }
  await settle(page);
  await save(page, 'detail.png');
} finally {
  await browser.close();
  server.stop();
}
