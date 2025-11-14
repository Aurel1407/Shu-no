const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const url = 'http://localhost:8081/';
  console.log('Opening', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (err) {
    console.error('Navigation error:', err.message);
    await browser.close();
    process.exit(1);
  }

  // Click the check-in date button (id from Booking.tsx)
  try {
    await page.click('#checkin-date');
    await page.waitForTimeout(700); // wait for animation
  } catch (err) {
    console.warn('Unable to click checkin button:', err.message);
  }

  // Slight scroll to ensure popover is visible
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(300);

  const out = 'scripts/visual-test.png';
  await page.screenshot({ path: out, fullPage: true });
  console.log('Saved screenshot to', out);

  await browser.close();
})();
