import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const outputDir = path.resolve('visual-report');
fs.mkdirSync(outputDir, { recursive: true });

const chromePath = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const sites = [
  { name: 'main', url: 'http://127.0.0.1:3001' },
  { name: 'branch', url: 'http://127.0.0.1:3000' },
];

const views = [
  { name: 'inicio', selector: null },
  { name: 'sobre', selector: '#nav-link-sobre' },
  { name: 'servicos', selector: '#nav-link-servicos' },
  { name: 'projetos', selector: '#nav-link-projetos' },
  { name: 'blog', selector: '#nav-link-blog' },
  { name: 'contato', selector: '#nav-link-contato' },
  { name: 'admin', selector: '#footer-admin-link' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

const report = { sites: {}, comparisons: {}, fatalErrors: [] };

async function captureSite(site) {
  const siteReport = { consoleErrors: [], views: {}, mobile: {} };
  report.sites[site.name] = siteReport;

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') siteReport.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => siteReport.consoleErrors.push(`PAGEERROR: ${err.message}`));

  for (const view of views) {
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => document.body.innerText.trim().length > 100, { timeout: 15000 });
    await sleep(1200);

    if (view.selector) {
      await page.waitForSelector(view.selector, { timeout: 10000 });
      await page.click(view.selector);
      await sleep(700);
    }

    const overlay = await page.evaluate(() => Boolean(document.querySelector('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')));
    const textLength = await page.evaluate(() => document.body.innerText.trim().length);
    const title = await page.title();
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const shellStyle = await page.evaluate(() => {
      const shell = document.querySelector('.site-shell');
      if (!shell) return null;
      const style = getComputedStyle(shell);
      return { backgroundColor: style.backgroundColor, color: style.color, fontFamily: style.fontFamily };
    });

    const file = `${site.name}-${view.name}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
    siteReport.views[view.name] = { overlay, textLength, title, theme, shellStyle, file };
  }

  await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await sleep(1000);
  const mobileHome = `${site.name}-mobile-inicio.png`;
  await page.screenshot({ path: path.join(outputDir, mobileHome), fullPage: true });
  await page.click('#mobile-menu-toggle-btn');
  await sleep(300);
  const mobileMenu = `${site.name}-mobile-menu.png`;
  await page.screenshot({ path: path.join(outputDir, mobileMenu), fullPage: true });
  siteReport.mobile = { home: mobileHome, menu: mobileMenu };

  await page.close();
}

for (const site of sites) {
  try {
    await captureSite(site);
  } catch (error) {
    report.fatalErrors.push(`${site.name}: ${error?.stack || error}`);
  }
}

function comparePngs(aFile, bFile, diffFile) {
  const a = PNG.sync.read(fs.readFileSync(path.join(outputDir, aFile)));
  const b = PNG.sync.read(fs.readFileSync(path.join(outputDir, bFile)));
  if (a.width !== b.width || a.height !== b.height) {
    return { comparable: false, dimensions: { a: [a.width, a.height], b: [b.width, b.height] } };
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const mismatchedPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  PNG.sync.write(diff).copy ? null : null;
  fs.writeFileSync(path.join(outputDir, diffFile), PNG.sync.write(diff));
  return {
    comparable: true,
    width: a.width,
    height: a.height,
    mismatchedPixels,
    totalPixels: a.width * a.height,
    mismatchRatio: mismatchedPixels / (a.width * a.height),
    diffFile,
  };
}

if (report.fatalErrors.length === 0) {
  for (const view of views) {
    report.comparisons[view.name] = comparePngs(
      `main-${view.name}.png`,
      `branch-${view.name}.png`,
      `diff-${view.name}.png`,
    );
  }
  report.comparisons.mobileInicio = comparePngs('main-mobile-inicio.png', 'branch-mobile-inicio.png', 'diff-mobile-inicio.png');
  report.comparisons.mobileMenu = comparePngs('main-mobile-menu.png', 'branch-mobile-menu.png', 'diff-mobile-menu.png');
}

fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();

if (report.fatalErrors.length > 0) {
  console.error(report.fatalErrors.join('\n'));
  process.exit(1);
}

const badOverlay = Object.values(report.sites).some((site) => Object.values(site.views).some((view) => view.overlay));
if (badOverlay) process.exit(2);

console.log(JSON.stringify(report, null, 2));
