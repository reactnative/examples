// Screenshots the web export for the article (plan 032).
//
// Usage: bun run export:web && bun run screenshot
//
// Serves dist/ on a local port (/ is index.html; any other path must be a
// file in dist/), opens / in Playwright Chromium at 390x844 with device
// scale 2, and saves collapsed.png, then expanded.png after clicking
// "Expand to 50%", to the site's public/images/add-a-bottom-sheet-with-snap-points/.
// Both screenshots are the full window, so the sheet's position shows.
// Before each one, the script waits until the sheet stops moving, and checks
// that its top is at 75% of the window height (the 25% snap point), then at
// 50% (the 50% snap point), and that the label shows that position.
// Needs `bunx playwright install chromium` once.

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, type Page } from 'playwright';

const WIDTH = 390;
const HEIGHT = 844;
// The sheet's container has the accessibility label "Bottom Sheet" by
// default, which the web export renders as aria-label.
const SHEET = '[aria-label="Bottom Sheet"]';

const example = resolve(import.meta.dir, '..');
const dist = join(example, 'dist');
const out = resolve(example, '../../public/images/add-a-bottom-sheet-with-snap-points');

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

// Waits until the sheet's top stops moving between two checks, 100 ms
// apart, and returns it, in CSS px from the top of the window.
async function sheetTop(page: Page): Promise<number> {
  const sheet = page.locator(SHEET).first();
  let top = NaN;
  for (;;) {
    await page.waitForTimeout(100);
    const now = (await sheet.boundingBox())?.y ?? NaN;
    if (now === top) return top;
    top = now;
  }
}

// Waits for the label, then checks that the sheet rests at the snap point:
// its height, from its top to the bottom of the window, is that share of
// the window, within 1 px.
async function expectAt(page: Page, snapPoint: string): Promise<void> {
  await page.getByText(`Position: ${snapPoint}`, { exact: true }).waitFor();
  const top = await sheetTop(page);
  const expected = HEIGHT * (1 - Number.parseFloat(snapPoint) / 100);
  if (Math.abs(top - expected) > 1) {
    throw new Error(`the sheet's top is at ${top} px, not ${expected} px (${snapPoint})`);
  }
  console.log(`the sheet rests at ${snapPoint}: its top is at ${top} of ${HEIGHT} px`);
}

// Waits for two animation frames, so the screen has laid out.
function settle(page: Page): Promise<unknown> {
  return page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

async function save(page: Page, name: string): Promise<void> {
  const path = join(out, name);
  await page.screenshot({ path, animations: 'disabled', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  console.log(`saved ${path} (${WIDTH}x${HEIGHT} CSS px)`);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(server.url.href);

  await page.getByText('Bottom sheet', { exact: true }).waitFor();
  await expectAt(page, '25%');
  await settle(page);
  await save(page, 'collapsed.png');

  await page.getByRole('button', { name: 'Expand to 50%' }).click();
  await expectAt(page, '50%');
  await settle(page);
  await save(page, 'expanded.png');

  if (errors.length > 0) throw new Error(`errors on the page:\n${errors.join('\n')}`);
} finally {
  await browser.close();
  server.stop();
}
