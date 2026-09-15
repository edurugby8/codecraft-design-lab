/**
 * Recorrido funcional de la demo: navegación, arrastre, teclado, acabados,
 * control de movimiento, «Volver a explorar» y desplazamiento nativo.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';
mkdirSync('capturas', { recursive: true });
const fallos = [];
const ok = (nombre) => console.log('  ✓', nombre);
const fallo = (nombre, detalle) => { fallos.push(nombre); console.log('  ✗', nombre, '→', detalle); };

const browser = await chromium.launch({
  // Playwright localiza el navegador por su cuenta; CHROMIUM sólo hace falta
  // si el entorno guarda los binarios en otra ruta.
  executablePath: process.env.CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'],
});

async function nuevaPagina(opts = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...opts });
  page.on('pageerror', (e) => fallo('error de página', e.message));
  await page.addInitScript(() => { window.__debug = true; });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  return page;
}

// ─────────────────────────────────────────────────────────── escritorio
console.log('\nESCRITORIO');
{
  const page = await nuevaPagina();

  // Navegación por anclas
  await page.click('.nav__lista a[href="#acabados"]');
  await page.waitForTimeout(2500);
  const enAcabados = await page.evaluate(() => {
    const el = document.getElementById('acabados');
    return el.getBoundingClientRect().top < window.innerHeight * 0.5;
  });
  enAcabados ? ok('la navegación lleva a la sección') : fallo('navegación', 'no llegó a #acabados');

  // Selector de acabados
  const antes = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--acento').trim());
  await page.click('.muestra:nth-child(1) >> nth=0').catch(() => {});
  await page.locator('.muestra').nth(2).click();
  await page.waitForTimeout(1600);
  const despues = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--acento').trim());
  const nombre = await page.locator('.acabados__nombre').innerText();
  const pulsado = await page.locator('.muestra[aria-pressed="true"]').innerText();
  antes !== despues ? ok(`el acento cambia (${antes} → ${despues})`) : fallo('acento', 'no cambió');
  nombre.includes('Volt') ? ok(`la variante se anuncia: ${nombre}`) : fallo('variante', nombre);
  pulsado.includes('VOLT') ? ok('el estado seleccionado es claro') : fallo('aria-pressed', pulsado);

  // Arrastre del producto
  await page.evaluate(() => document.getElementById('producto').scrollIntoView());
  await page.waitForTimeout(2500);
  const rotAntes = await page.evaluate(() => window.__stageDebug?.().dragY ?? null);
  const caja = await page.locator('.manipulador').boundingBox();
  await page.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await page.mouse.down();
  await page.mouse.move(caja.x + caja.width / 2 + 220, caja.y + caja.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(900);
  const rotDespues = await page.evaluate(() => window.__stageDebug?.().dragY ?? null);
  Math.abs(rotDespues - rotAntes) > 0.3
    ? ok(`el arrastre gira el producto (${rotAntes?.toFixed(2)} → ${rotDespues?.toFixed(2)})`)
    : fallo('arrastre', `${rotAntes} → ${rotDespues}`);

  // Restablecer vista
  await page.locator('.producto__acciones .boton').click();
  await page.waitForTimeout(1400);
  const trasReset = await page.evaluate(() => window.__stageDebug?.().dragY ?? null);
  Math.abs(trasReset) < 0.05 ? ok('«Restablecer vista» devuelve la vista') : fallo('reset', String(trasReset));

  // Teclado
  await page.locator('.manipulador').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  const conTeclado = await page.evaluate(() => window.__stageDebug?.().dragY ?? null);
  Math.abs(conTeclado) > 0.2 ? ok('las flechas giran el producto') : fallo('teclado', String(conTeclado));
  await page.keyboard.press('Home');
  await page.waitForTimeout(1200);

  // La rueda no está secuestrada
  const y0 = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(500);
  const y1 = await page.evaluate(() => window.scrollY);
  Math.abs(y1 - y0 - 600) < 120
    ? ok(`la rueda desplaza lo normal (${y1 - y0} px de 600)`)
    : fallo('rueda', `${y1 - y0} px en vez de 600`);

  // Control de movimiento
  await page.locator('.control').click();
  await page.waitForTimeout(600);
  const quieto = await page.evaluate(() => ({
    attr: document.documentElement.dataset.movimiento,
    motion: window.__stageDebug?.().motion,
    pressed: document.querySelector('.control')?.getAttribute('aria-pressed'),
  }));
  quieto.attr === 'quieto' && quieto.motion === 0 && quieto.pressed === 'true'
    ? ok('el control detiene el movimiento automático')
    : fallo('pausa', JSON.stringify(quieto));
  await page.locator('.control').click();
  await page.waitForTimeout(400);

  // Volver a explorar
  await page.evaluate(() => document.getElementById('cierre').scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(2000);
  await page.locator('.cierre__acciones .boton--solido').click();
  await page.waitForTimeout(3500);
  const arriba = await page.evaluate(() => window.scrollY);
  arriba < 60 ? ok('«Volver a explorar» vuelve al principio') : fallo('reinicio', `scrollY=${arriba}`);

  // Foco visible
  await page.keyboard.press('Tab');
  const foco = await page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
  foco ? ok(`el tabulador alcanza la interfaz (${String(foco).slice(0, 40)})`) : fallo('foco', 'sin foco');

  await page.close();
}

// ─────────────────────────────────────────────────────────── movimiento reducido
console.log('\nMOVIMIENTO REDUCIDO');
{
  const page = await nuevaPagina({ reducedMotion: 'reduce' });
  const control = await page.evaluate(() => {
    const el = document.querySelector('.control');
    return { etiqueta: el?.tagName, texto: el?.textContent?.trim() };
  });
  control.etiqueta === 'P' && /sistema/i.test(control.texto)
    ? ok('el control explica que el movimiento ya está detenido')
    : fallo('control', JSON.stringify(control));

  const estado = await page.evaluate(() => ({
    reducido: document.documentElement.dataset.reducido,
    movimiento: document.documentElement.dataset.movimiento,
    intro: window.__stageDebug?.().intro,
    ocultos: [...document.querySelectorAll('[data-reveal]')].filter(
      (el) => !el.classList.contains('esta-visible')).length,
  }));
  estado.reducido === 'si' ? ok('se detecta la preferencia') : fallo('prefers-reduced-motion', JSON.stringify(estado));
  estado.movimiento === 'quieto' ? ok('el movimiento automático está detenido') : fallo('movimiento', estado.movimiento);
  estado.intro === 1 ? ok('la entrada se muestra ya resuelta') : fallo('entrada', String(estado.intro));
  estado.ocultos === 0 ? ok('todo el texto es visible sin animación') : fallo('revelados', `${estado.ocultos} ocultos`);

  // El contenido sigue completo y las escenas siguen cambiando
  await page.evaluate(() => document.getElementById('acabados').scrollIntoView());
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => window.__stageDebug?.());
  Math.abs(d.scale - 1.1) < 0.12 ? ok('las escenas siguen adoptando su composición') : fallo('pose', JSON.stringify(d));
  await page.close();
}

// ─────────────────────────────────────────────────────────── móvil
console.log('\nMÓVIL');
{
  const page = await nuevaPagina({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  });

  // El gesto vertical debe seguir desplazando la página
  const caja = await page.locator('.manipulador').boundingBox().catch(() => null);
  await page.evaluate(() => document.getElementById('producto').scrollIntoView());
  await page.waitForTimeout(2200);
  const y0 = await page.evaluate(() => window.scrollY);
  const c = await page.locator('.manipulador').boundingBox();
  await page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2);
  await page.waitForTimeout(200);
  const estilo = await page.evaluate(() => getComputedStyle(document.querySelector('.manipulador')).touchAction);
  estilo === 'pan-y' ? ok('la capa de arrastre deja pasar el scroll vertical (touch-action: pan-y)')
                     : fallo('touch-action', estilo);
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(400);
  const y1 = await page.evaluate(() => window.scrollY);
  y1 > y0 ? ok('la página se desplaza con normalidad') : fallo('scroll móvil', `${y0} → ${y1}`);

  // Nada se sale por los lados
  const desborde = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  desborde <= 1 ? ok('sin desbordamiento horizontal') : fallo('desbordamiento', `${desborde}px`);

  // El puntero decorativo no existe en táctil
  const puntero = await page.evaluate(() => {
    const el = document.querySelector('.puntero');
    return el ? getComputedStyle(el).display : 'ausente';
  });
  puntero === 'none' || puntero === 'ausente'
    ? ok('el puntero decorativo no aparece en táctil') : fallo('puntero', puntero);
  await page.close();
}

// ─────────────────────────────────────────────────────────── sin WebGL
console.log('\nSIN WEBGL');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (tipo, ...resto) {
      if (String(tipo).includes('webgl') || String(tipo).includes('experimental')) return null;
      return orig.call(this, tipo, ...resto);
    };
  });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const estado = await page.evaluate(() => ({
    alternativa: !!document.querySelector('.sin-webgl svg'),
    aviso: document.querySelector('.sin-webgl__aviso')?.textContent?.slice(0, 40),
    lienzo: !!document.querySelector('.lienzo canvas'),
    titular: document.querySelector('.titular')?.textContent,
    secciones: document.querySelectorAll('[data-escena]').length,
  }));
  estado.alternativa ? ok('se muestra la ilustración alternativa') : fallo('alternativa', JSON.stringify(estado));
  !estado.lienzo ? ok('no se intenta crear el lienzo 3D') : fallo('lienzo', 'se creó igualmente');
  estado.secciones >= 7 ? ok(`el contenido sigue completo (${estado.secciones} secciones)`) : fallo('contenido', String(estado.secciones));
  await page.screenshot({ path: 'capturas/sin-webgl.png' });
  await page.close();
}

await browser.close();
console.log(fallos.length ? `\nFALLOS (${fallos.length}): ${fallos.join(', ')}` : '\nTodo correcto.');
process.exit(fallos.length ? 1 : 0);
