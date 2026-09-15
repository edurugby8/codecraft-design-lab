/**
 * Capturas del recorrido completo en un tamaño de pantalla.
 *
 *   npm run preview                       (en otra terminal)
 *   node scripts/capturas.mjs desktop|tablet|mobile
 *   REDUCED=1 node scripts/capturas.mjs desktop
 *
 * Las paradas se derivan del propio documento, así que caen justo sobre cada
 * escena aunque cambien las alturas de las secciones.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = process.env.OUT || 'capturas';
const URL = process.env.URL || 'http://localhost:4173/';
const MODE = process.argv[2] || 'desktop';
const REDUCED = process.env.REDUCED === '1';
const viewport = MODE === 'mobile' ? { width: 390, height: 844 }
  : MODE === 'tablet' ? { width: 834, height: 1112 }
  : { width: 1440, height: 900 };
const prefix = REDUCED ? `${MODE}-reducido` : MODE;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  // Playwright localiza el navegador por su cuenta; CHROMIUM sólo hace falta
  // si el entorno guarda los binarios en otra ruta.
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});
const page = await browser.newPage({
  viewport, deviceScaleFactor: 1,
  reducedMotion: REDUCED ? 'reduce' : 'no-preference',
  isMobile: MODE === 'mobile', hasTouch: MODE !== 'desktop',
});

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);
await page.screenshot({ path: `${OUT}/${prefix}-00-entrada.png` });

// El renderizador por software va a pocos fps: hay que darle tiempo a converger.
const ASENTAR = 2600;

const stops = await page.evaluate(() => {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  return [...document.querySelectorAll('[data-beat]')].map((el, i) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    return {
      name: String(i + 1).padStart(2, '0') + '-' + el.dataset.beat,
      y: Math.min(Math.round(top - vh * 0.02) + 40, max),
    };
  });
});

for (const s of stops) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.y);
  await page.waitForTimeout(ASENTAR);
  await page.screenshot({ path: `${OUT}/${prefix}-${s.name}.png` });
}

// Cambio de acabados
const acabados = stops.find((s) => s.name.endsWith('acabados'));
if (acabados) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), acabados.y);
  await page.waitForTimeout(1500);
  const botones = page.locator('.muestra');
  for (const [i, etiqueta] of [[1, 'marfil'], [2, 'volt']]) {
    await botones.nth(i).click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${prefix}-acabado-${etiqueta}.png` });
  }
  await botones.nth(0).click();
  await page.waitForTimeout(1200);
}

// Retroceso: comprobar que no hay saltos ni escenas vacías
for (const s of [...stops].reverse().filter((_, i) => i % 3 === 0)) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.y);
  await page.waitForTimeout(ASENTAR);
  await page.screenshot({ path: `${OUT}/${prefix}-atras-${s.name}.png` });
}

console.log('ERRORES:', errors.length ? errors.slice(0, 10) : 'ninguno');
await browser.close();
