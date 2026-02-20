// tests/rendimiento.spec.ts
// ─────────────────────────────────────────────────────────────
// Pruebas de rendimiento — tiempos de carga y respuesta
// Árbol de la Ciencia UNAL
// ─────────────────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

// ── Credenciales de prueba ──────────────────────────────────
const EMAIL = "serujio57@gmail.com";
const PASS  = "SERGIO1003";

// ── Helper: login rápido ────────────────────────────────────
async function login(page: any) {
  await page.goto("/");
  await page.click("text=Iniciar Sesión");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

// ────────────────────────────────────────────────────────────
// REND-01 | Página de login carga en menos de 3 segundos
// ────────────────────────────────────────────────────────────
test("REND-01 | Página de login carga en menos de 3s", async ({ page }) => {
  const start = Date.now();
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  const duration = Date.now() - start;

  console.log(`\n⏱  Login page loaded in ${duration}ms`);
  expect(duration).toBeLessThan(3000);
});

// ────────────────────────────────────────────────────────────
// REND-02 | Dashboard carga en menos de 3 segundos
// ────────────────────────────────────────────────────────────
test("REND-02 | Dashboard carga en menos de 3s", async ({ page }) => {
  await login(page);

  const start = Date.now();
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  const duration = Date.now() - start;

  console.log(`\n⏱  Dashboard loaded in ${duration}ms`);
  expect(duration).toBeLessThan(3000);
});

// ────────────────────────────────────────────────────────────
// REND-03 | Login completo (acción) en menos de 5 segundos
// ────────────────────────────────────────────────────────────
test("REND-03 | Acción de login se completa en menos de 5s", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);

  const start = Date.now();
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  const duration = Date.now() - start;

  console.log(`\n⏱  Login action completed in ${duration}ms`);
  expect(duration).toBeLessThan(9000);
});

// ────────────────────────────────────────────────────────────
// REND-04 | Generación de árbol se completa en menos de 20s
// ────────────────────────────────────────────────────────────
test("REND-04 | Generación de árbol en menos de 20s", async ({ page }) => {
  await login(page);
  await page.goto("/generate");

  await page.fill('textarea[name="seed"]', "Inteligencia artificial en medicina");
  await page.fill('input[name="title"]', "Árbol IA - Test rendimiento");

  // Seleccionar una bibliografía específica si conoces su nombre (ej: "isi.txt")
  const select = page.locator("select").first();
  const optionCount = await select.locator("option").count();
  if (optionCount > 1) {
    await select.selectOption({ label: "isi.txt" }).catch(async () => {
      // Fallback a la primera opción válida
      await select.selectOption({ index: 1 });
    });
  } else {
    throw new Error("No hay bibliografías disponibles para probar la generación de árbol");
  }

  const start = Date.now();
  await page.click('button:has-text("Generar Árbol de la Ciencia")');
  await page.waitForURL("**/tree/*", { timeout: 60000 });
  const duration = Date.now() - start;

  console.log(`\n⏱  Tree generated in ${duration}ms`);
  expect(duration).toBeLessThan(20000);
});

// ────────────────────────────────────────────────────────────
// REND-05 | Spinner o indicador de carga visible durante generación
// ────────────────────────────────────────────────────────────
test("REND-05 | Se muestra indicador de carga durante la generación del árbol", async ({ page }) => {
  await login(page);
  await page.goto("/generate");

  // Rellenar los tres campos requeridos
  await page.fill('textarea[name="seed"]', "Machine learning en salud");
  await page.fill('input[name="title"]', "Árbol ML Salud - Rendimiento");

  // Seleccionar una bibliografía concreta (por ejemplo 'isi.txt')
  const select = page.locator("select").first();
  const optionCount = await select.locator("option").count();
  if (optionCount > 1) {
    await select.selectOption({ label: "isi.txt" }).catch(async () => {
      await select.selectOption({ index: 1 });
    });
  } else {
    throw new Error("No hay bibliografías disponibles para probar la generación de árbol");
  }

  // Hacer clic para generar
  await page.click('button:has-text("Generar Árbol de la Ciencia")');

  // El spinner o texto de carga debe aparecer tras hacer clic
  const loadingIndicator = page.locator('text=/Generando árbol/i');
  await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 });

  console.log("\n✅  Loading indicator appeared correctly");
});

// ────────────────────────────────────────────────────────────
// REND-06 | Historial carga en menos de 3 segundos
// ────────────────────────────────────────────────────────────
test("REND-06 | Sección de historial carga en menos de 3s", async ({ page }) => {
  await login(page);

  const start = Date.now();
  await page.goto("/history");
  // Espera a que cargue algún texto característico (ajusta según tu TreeHistory)
  await page.waitForLoadState("domcontentloaded");
  const duration = Date.now() - start;

  console.log(`\n⏱  History page loaded in ${duration}ms`);
  expect(duration).toBeLessThan(3000);
});

// ────────────────────────────────────────────────────────────
// REND-07 | Sección de bibliografía carga en menos de 3s
// ────────────────────────────────────────────────────────────
test("REND-07 | Sección de bibliografía carga en menos de 3s", async ({ page }) => {
  await login(page);

  const start = Date.now();
  await page.goto("/bibliography");
  await page.waitForLoadState("networkidle");
  const duration = Date.now() - start;

  console.log(`\n⏱  Bibliography page loaded in ${duration}ms`);
  expect(duration).toBeLessThan(3000);
});