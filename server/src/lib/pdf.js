import puppeteer from 'puppeteer';

export async function htmlToPdfBuffer(html) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return buffer;
}

export async function htmlToPdfFile(html, path) {
  const buffer = await htmlToPdfBuffer(html);
  await import('fs').then(({ promises: fs }) => fs.writeFile(path, buffer));
  return path;
}
