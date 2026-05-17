import express from 'express';
import puppeteer from 'puppeteer';

const router = express.Router();

router.get('/example', async (req, res) => {
  const html = `<!doctype html><html><body><h1>FL Smartech Spaces</h1><p>Sample PDF</p></body></html>`;
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.pdf({ format: 'A4' });
  await browser.close();
  res.type('application/pdf');
  res.send(buffer);
});

export default router;
