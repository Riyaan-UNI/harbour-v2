const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/patan/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',
  });

  const ctx = await browser.newContext({ viewport: { width: 360, height: 720 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try {
      localStorage.setItem('harbour-profile', JSON.stringify({
        id: 'me', name: 'Avery Lam', country: 'HK', university: 'hkust', mascotId: 'otter', photo: '', socials: { instagram: 'avery.hk' },
      }));
    } catch (e) {}
  });
  await page.goto('http://127.0.0.1:5173/', { timeout: 30000 });
  await page.waitForTimeout(1200);
  // Sample profile — first sample person in SAMPLE_PEOPLE
  await page.evaluate(() => { window.location.assign('/app/profile/lina-chen'); });
  await page.waitForSelector('.app-profile-public__plate', { timeout: 20000 });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const wrapper = document.querySelector('.app-profile-public__plate');
    const out = {};
    if (wrapper) {
      const r = wrapper.getBoundingClientRect();
      const cs = getComputedStyle(wrapper);
      out = {
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
        ar: cs.aspectRatio, flex: cs.flex,
        alignSelf: cs.alignSelf, maxW: cs.maxWidth,
      };
    }
    return out;
  });
  console.log('PUBLIC PLATE @360:', JSON.stringify(info));

  await page.screenshot({ path: 'C:/Users/patan/AppData/Local/Temp/sample-360.png', fullPage: false });
  await browser.close();
}

run().catch((e) => {
  console.error('ERR:', e.message);
  process.exit(1);
});
