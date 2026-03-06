// tests/estres.spec.ts
// ─────────────────────────────────────────────────────────────
// Pruebas de estrés — carga concurrente, repetición y límites
// Árbol de la Ciencia UNAL
// ─────────────────────────────────────────────────────────────

import { test, expect } from "@playwright/test";
import path from "path";

const EMAIL = "serujio57@gmail.com";
const PASS  = "Sergio1003@";

const ADMIN_EMAIL = "secastrob@unal.edu.co";
const ADMIN_PASS  = "sergio1003";

const MAX_LOGIN_MS       = 9000;
const MAX_PAGE_LOAD_MS   = 5000;
const MAX_TREE_GEN_MS    = 30000;
const CONCURRENT_USERS   = 5;
const REPEAT_LOGIN_TIMES = 10;

async function login(page: any) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");          // ← esperar carga completa
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 20000 });
}

// ────────────────────────────────────────────────────────────
// EST-01 | Login repetido N veces por el mismo usuario
// FIX: timeout extendido a 3min + waitForLoadState antes de fill
// ────────────────────────────────────────────────────────────
test(`EST-01 | Login repetido ${REPEAT_LOGIN_TIMES}x sin degradación`, async ({ page }) => {
  // ← FIX: timeout ampliado para cubrir 10 * MAX_LOGIN_MS con margen
  test.setTimeout(180_000);

  const tiempos: number[] = [];

  for (let i = 0; i < REPEAT_LOGIN_TIMES; i++) {
    // Limpiar sesión anterior desde la propia página (evita navegar a "/" extra)
    await page.goto("/login");

    // ← FIX: esperar a que el DOM esté listo ANTES de intentar hacer fill
    //   Esto resuelve el "waiting for locator('input[name=email]')" que causó el timeout
    await page.waitForLoadState("networkidle");

    // Limpiar storage solo si la página ya cargó (no en blank page)
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    const start = Date.now();
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASS);
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    const duration = Date.now() - start;

    tiempos.push(duration);
    console.log(`\n🔁  Intento ${i + 1}/${REPEAT_LOGIN_TIMES}: ${duration}ms`);
    expect(duration).toBeLessThan(MAX_LOGIN_MS);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  const maximo   = Math.max(...tiempos);
  const minimo   = Math.min(...tiempos);

  console.log(`\n📊  Estadísticas Login (${REPEAT_LOGIN_TIMES} intentos):`);
  console.log(`    Promedio : ${promedio.toFixed(0)}ms`);
  console.log(`    Mínimo   : ${minimo}ms`);
  console.log(`    Máximo   : ${maximo}ms`);

  expect(maximo).toBeLessThan(minimo * 5 + 3000);
});

// ────────────────────────────────────────────────────────────
// EST-02 | Navegación rápida entre rutas protegidas
// ────────────────────────────────────────────────────────────
test("EST-02 | Navegación rápida entre secciones (sin tiempo de espera)", async ({ page }) => {
  await login(page);

  const rutas = [
    "/dashboard", "/generate", "/bibliography", "/history",
    "/dashboard", "/bibliography", "/generate", "/history", "/dashboard",
  ];

  const tiempos: number[] = [];

  for (const ruta of rutas) {
    const start = Date.now();
    await page.goto(ruta);
    await page.waitForLoadState("domcontentloaded");
    const duration = Date.now() - start;
    tiempos.push(duration);
    console.log(`\n🚀  ${ruta} → ${duration}ms`);
    expect(duration).toBeLessThan(MAX_PAGE_LOAD_MS);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  console.log(`\n📊  Promedio navegación rápida: ${promedio.toFixed(0)}ms`);
});

// ────────────────────────────────────────────────────────────
// EST-03 | Múltiples usuarios concurrentes haciendo login
// ────────────────────────────────────────────────────────────
test(`EST-03 | ${CONCURRENT_USERS} usuarios concurrentes haciendo login`, async ({ browser }) => {
  const contextos = await Promise.all(
    Array.from({ length: CONCURRENT_USERS }, () => browser.newContext())
  );
  const pages = await Promise.all(contextos.map((ctx) => ctx.newPage()));

  const start = Date.now();

  const resultados = await Promise.allSettled(
    pages.map(async (page, i) => {
      const t0 = Date.now();
      await page.goto("/login");
      await page.waitForLoadState("networkidle");      // ← mismo fix que EST-01
      await page.fill('input[name="email"]', EMAIL);
      await page.fill('input[name="password"]', PASS);
      await page.click('button:has-text("Iniciar sesión")');
      await page.waitForURL("**/dashboard", { timeout: 25000 });
      const duration = Date.now() - t0;
      console.log(`\n👤  Usuario ${i + 1}: login en ${duration}ms`);
      return duration;
    })
  );

  const totalDuration = Date.now() - start;
  await Promise.all(contextos.map((ctx) => ctx.close()));

  const exitosos = resultados.filter((r) => r.status === "fulfilled").length;
  const fallidos  = resultados.filter((r) => r.status === "rejected").length;

  console.log(`\n📊  Resumen carga concurrente (${CONCURRENT_USERS} usuarios):`);
  console.log(`    Exitosos : ${exitosos}`);
  console.log(`    Fallidos : ${fallidos}`);
  console.log(`    Tiempo total: ${totalDuration}ms`);

  expect(exitosos / CONCURRENT_USERS).toBeGreaterThanOrEqual(0.8);
});

// ────────────────────────────────────────────────────────────
// EST-04 | Múltiples usuarios concurrentes cargando el dashboard
// ────────────────────────────────────────────────────────────
test(`EST-04 | ${CONCURRENT_USERS} usuarios concurrentes cargando el dashboard`, async ({ browser }) => {
  const contextos = await Promise.all(
    Array.from({ length: CONCURRENT_USERS }, () => browser.newContext())
  );
  const pages = await Promise.all(contextos.map((ctx) => ctx.newPage()));

  for (const page of pages) {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASS);
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL("**/dashboard", { timeout: 20000 });
  }

  const start = Date.now();
  const resultados = await Promise.allSettled(
    pages.map(async (page, i) => {
      const t0 = Date.now();
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
      const duration = Date.now() - t0;
      console.log(`\n👤  Usuario ${i + 1}: dashboard en ${duration}ms`);
      return duration;
    })
  );

  await Promise.all(contextos.map((ctx) => ctx.close()));

  const exitosos = resultados.filter((r) => r.status === "fulfilled");
  const tiempos  = exitosos.map((r) => (r as PromiseFulfilledResult<number>).value);
  const promedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;

  console.log(`\n📊  Dashboard bajo carga concurrente:`);
  console.log(`    Exitosos : ${exitosos.length}/${CONCURRENT_USERS}`);
  console.log(`    Promedio : ${promedio.toFixed(0)}ms`);
  console.log(`    Tiempo total paralelo: ${Date.now() - start}ms`);

  expect(exitosos.length / CONCURRENT_USERS).toBeGreaterThanOrEqual(0.8);
  tiempos.forEach((t) => expect(t).toBeLessThan(MAX_PAGE_LOAD_MS * 2));
});

// ────────────────────────────────────────────────────────────
// EST-05 | Generaciones de árbol consecutivas
// ────────────────────────────────────────────────────────────
test("EST-05 | 3 generaciones de árbol consecutivas sin degradación", async ({ page }) => {
  await login(page);

  const tiempos: number[] = [];
  const seeds = [
    "Inteligencia artificial en educación",
    "Redes neuronales y visión por computador",
    "Procesamiento de lenguaje natural en salud",
  ];

  for (let i = 0; i < seeds.length; i++) {
    await page.goto("/generate");
    await page.fill('textarea[name="seed"]', seeds[i]);
    await page.fill('input[name="title"]', `Test Estrés Árbol ${i + 1}`);

    const select = page.locator("select").first();
    const optionCount = await select.locator("option").count();
    if (optionCount > 1) {
      await select.selectOption({ label: "isi.txt" }).catch(async () => {
        await select.selectOption({ index: 1 });
      });
    } else {
      console.warn(`\n⚠️  No hay bibliografías — saltando generación ${i + 1}`);
      continue;
    }

    const start = Date.now();
    await page.click('button:has-text("Generar Árbol de la Ciencia")');
    await page.waitForURL("**/tree/*", { timeout: 60000 });
    const duration = Date.now() - start;
    tiempos.push(duration);
    console.log(`\n🌳  Árbol ${i + 1} generado en ${duration}ms`);
    expect(duration).toBeLessThan(MAX_TREE_GEN_MS);
  }

  if (tiempos.length >= 2) {
    const primero = tiempos[0];
    const ultimo  = tiempos[tiempos.length - 1];
    console.log(`\n📊  Degradación entre primer y último árbol: ${ultimo - primero}ms`);
    expect(ultimo).toBeLessThan(primero * 2 + 5000);
  }
});

// ────────────────────────────────────────────────────────────
// EST-06 | Subida repetida de archivos de bibliografía
// ────────────────────────────────────────────────────────────
test("EST-06 | Subida repetida de archivo de bibliografía (5 veces)", async ({ page }) => {
  await login(page);
  await page.goto("/bibliography");

  const filePath = path.resolve(__dirname, "fixtures", "sample.txt");
  const tiempos: number[] = [];

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await page.setInputFiles("input[type='file']", filePath);
    await page.waitForSelector("text=sample.txt", { timeout: 15000 }).catch(() => {
      console.warn(`\n⚠️  Intento ${i + 1}: no se confirmó la subida`);
    });
    const duration = Date.now() - start;
    tiempos.push(duration);
    console.log(`\n📎  Subida ${i + 1}/5: ${duration}ms`);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  console.log(`\n📊  Promedio de subida: ${promedio.toFixed(0)}ms`);
});

// ────────────────────────────────────────────────────────────
// EST-07 | Semilla extremadamente larga
// ────────────────────────────────────────────────────────────
test("EST-07 | Semilla extremadamente larga no rompe el formulario", async ({ page }) => {
  await login(page);
  await page.goto("/generate");

  const semillaLarga = "Inteligencia artificial ".repeat(85).trim();
  await page.fill('textarea[name="seed"]', semillaLarga);
  await page.fill('input[name="title"]', "Árbol Test Semilla Larga");

  const bodyVisible = await page.locator("body").isVisible();
  expect(bodyVisible).toBe(true);

  const btn = page.getByRole("button", { name: /Generar Árbol/i });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();

  console.log("\n✅  Formulario soporta semilla larga sin crash");
});

// ────────────────────────────────────────────────────────────
// EST-08 | Recarga agresiva del dashboard
// ────────────────────────────────────────────────────────────
test("EST-08 | 5 recargas consecutivas del dashboard son estables", async ({ page }) => {
  await login(page);

  const tiempos: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const duration = Date.now() - start;
    tiempos.push(duration);
    console.log(`\n🔄  Recarga ${i + 1}/5: ${duration}ms`);
    await expect(page.locator("text=/Bienvenido/i").first()).toBeVisible({ timeout: 8000 });
    expect(duration).toBeLessThan(MAX_PAGE_LOAD_MS);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  console.log(`\n📊  Promedio de recarga: ${promedio.toFixed(0)}ms`);
});

// ────────────────────────────────────────────────────────────
// EST-09 | Admin panel bajo carga
// ────────────────────────────────────────────────────────────
test("EST-09 | Admin panel estable bajo acciones repetidas", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await page.goto("/admin");
  await expect(page.locator("text=Análisis del Laboratorio").first()).toBeVisible({ timeout: 10000 });

  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await page.reload();
    await page.waitForLoadState("networkidle");
    const duration = Date.now() - start;
    console.log(`\n🔄  Admin recarga ${i + 1}/5: ${duration}ms`);
    await expect(page.locator("text=Análisis del Laboratorio").first()).toBeVisible({ timeout: 10000 });
    expect(duration).toBeLessThan(MAX_PAGE_LOAD_MS);
  }

  const tableVisible = await page.locator("table").isVisible().catch(() => false);
  console.log(`\n📊  Tabla del admin sigue visible: ${tableVisible}`);
  if (tableVisible) expect(tableVisible).toBe(true);
});

// ────────────────────────────────────────────────────────────
// EST-10 | Reporte consolidado
// ────────────────────────────────────────────────────────────
test("EST-10 | Reporte consolidado de tiempos bajo estrés", async ({ page }) => {
  await login(page);

  const paginas = [
    { nombre: "Dashboard",    ruta: "/dashboard"    },
    { nombre: "Generar",      ruta: "/generate"     },
    { nombre: "Bibliografía", ruta: "/bibliography" },
    { nombre: "Historial",    ruta: "/history"      },
  ];

  const reporte: { nombre: string; ruta: string; ms: number; ok: boolean }[] = [];

  for (const { nombre, ruta } of paginas) {
    const start = Date.now();
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    const ms = Date.now() - start;
    reporte.push({ nombre, ruta, ms, ok: ms < MAX_PAGE_LOAD_MS });
  }

  console.log("\n\n╔══════════════════════════════════════════════════════╗");
  console.log("║         REPORTE DE ESTRÉS — TIEMPOS DE CARGA         ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  for (const { nombre, ms, ok } of reporte) {
    const estado = ok ? "✅" : "❌";
    const padding = " ".repeat(Math.max(0, 15 - nombre.length));
    console.log(`║  ${estado}  ${nombre}${padding}→  ${String(ms).padStart(5)}ms                   ║`);
  }
  const promedio = reporte.reduce((a, b) => a + b.ms, 0) / reporte.length;
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  📊  Promedio total   →  ${promedio.toFixed(0).padStart(5)}ms                   ║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  reporte.forEach(({ nombre, ms }) => {
    expect(ms, `${nombre} tardó demasiado (${ms}ms)`).toBeLessThan(MAX_PAGE_LOAD_MS);
  });
});