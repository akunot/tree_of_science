// tests/responsividad.spec.ts
// ─────────────────────────────────────────────────────────────
// Pruebas de responsividad — layout en móvil, tablet y desktop
// Árbol de la Ciencia UNAL
// ─────────────────────────────────────────────────────────────

import { test, expect, devices } from "@playwright/test";

const EMAIL = "serujio57@gmail.com";
const PASS  = "SERGIO1003";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

// ── Viewports de referencia ─────────────────────────────────
const VIEWPORTS = {
  mobile:  { width: 375,  height: 812  }, // iPhone SE / 12
  tablet:  { width: 768,  height: 1024 }, // iPad
  desktop: { width: 1280, height: 720  }, // Laptop estándar
  wide:    { width: 1440, height: 900  }, // Desktop amplio
};

// ────────────────────────────────────────────────────────────
// RESP-01 | Login visible y funcional en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-01 | Login — Móvil (375x812)", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Formulario de login visible y operable en móvil", async ({ page }) => {
    await page.goto("/login");

    // Elementos clave deben estar visibles
    await expect(page.locator("text=/Acceso a la Plataforma/i").first()).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Iniciar sesión/i })).toBeVisible();

    // El formulario no debe desbordarse horizontalmente
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10); // margen de 10px

    console.log("\n📱  Login correcto en móvil 375px");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-02 | Login visible y funcional en tablet
// ────────────────────────────────────────────────────────────
test.describe("RESP-02 | Login — Tablet (768x1024)", () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test("Formulario de login visible y operable en tablet", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("text=/Acceso a la Plataforma/i").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Iniciar sesión/i })).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.tablet.width + 10);

    console.log("\n📟  Login correcto en tablet 768px");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-03 | Login visible y funcional en desktop
// ────────────────────────────────────────────────────────────
test.describe("RESP-03 | Login — Desktop (1280x720)", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("Formulario de login visible y operable en desktop", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("text=/Acceso a la Plataforma/i").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Iniciar sesión/i })).toBeVisible();

    console.log("\n🖥️  Login correcto en desktop 1280px");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-04 | Dashboard en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-04 | Dashboard — Móvil", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Dashboard accesible y sin desbordamiento en móvil", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    await expect(page.locator("text=/Bienvenido/i").first()).toBeVisible();
    await expect(page.locator("text=/Árboles Recientes/i").first()).toBeVisible();

    // Sin scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);

    console.log("\n📱  Dashboard OK en móvil");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-05 | Dashboard en tablet
// ────────────────────────────────────────────────────────────
test.describe("RESP-05 | Dashboard — Tablet", () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test("Dashboard accesible en tablet", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    await expect(page.locator("text=/Árboles Recientes/i").first()).toBeVisible();
    await expect(page.locator("text=/Bibliografías/i").first()).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.tablet.width + 10);

    console.log("\n📟  Dashboard OK en tablet");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-06 | Dashboard en desktop y wide
// ────────────────────────────────────────────────────────────
test.describe("RESP-06 | Dashboard — Desktop", () => {
  test.use({ viewport: VIEWPORTS.wide });

  test("Dashboard accesible en desktop amplio", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    await expect(page.locator("text=/Árboles Recientes/i").first()).toBeVisible();
    await expect(page.locator("text=/Bibliografías/i").first()).toBeVisible();

    console.log("\n🖥️  Dashboard OK en desktop 1440px");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-07 | Sección Bibliografía en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-07 | Bibliografía — Móvil", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Sección de bibliografía usable en móvil", async ({ page }) => {
    await login(page);
    await page.goto("/bibliography");

    // El área de carga debe ser visible:
    // 1. Primero intentamos por data-testid="upload"
    // 2. Si no existe, buscamos por textos típicos del área de carga
    const uploadAreaByTestId = page.locator('[data-testid="upload"]').first();

    if (await uploadAreaByTestId.count()) {
      await expect(uploadAreaByTestId).toBeVisible();
    } else {
      const uploadAreaByText = page
        .getByText(/Seleccionar Archivo|Arrastra/i)
        .first();
      await expect(uploadAreaByText).toBeVisible();
    }

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);

    console.log("\n📱  Bibliografía OK en móvil");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-08 | Formulario de generación de árbol en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-08 | Generar árbol — Móvil", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Formulario de generación visible y operable en móvil", async ({ page }) => {
    await login(page);
    await page.goto("/generate");

    // El campo de semilla y el botón deben ser visibles y clickeables
    await expect(page.locator('textarea[name="seed"], input[name="seed"]').first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Generar Árbol/i })).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);

    console.log("\n📱  Generar árbol OK en móvil");
  });
});

// ────────────────────────────────────────────────────────────
// RESP-09 | Menú de navegación accesible en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-09 | Navegación — Móvil", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Menú de navegación accesible en móvil", async ({ page }) => {
    await login(page);
    await page.goto("/dashboard");

    // Verificar si existe un menú hamburguesa o navegación colapsada
    const menuHamburguesa = page.locator(
      '[data-testid="menu-toggle"], button[aria-label*="menu" i], button[aria-label*="navegación" i], .hamburger, [class*="menu-toggle"]'
    ).first();

    const menuVisible = await menuHamburguesa.isVisible().catch(() => false);

    if (menuVisible) {
      // Si hay hamburguesa, debe poder abrirse
      await menuHamburguesa.click();
      const navLinks = page.locator("nav a, [role='navigation'] a");
      await expect(navLinks.first()).toBeVisible();
      console.log("\n📱  Menú hamburguesa funciona en móvil");
    } else {
      // Si no hay hamburguesa, la navegación debe ser visible directamente
      const navLinks = page.locator("nav a, [role='navigation'] a");
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
      console.log(`\n📱  Navegación directa en móvil — ${count} enlaces visibles`);
    }
  });
});

// ────────────────────────────────────────────────────────────
// RESP-10 | Historial — Tabla/lista adaptada en móvil
// ────────────────────────────────────────────────────────────
test.describe("RESP-10 | Historial — Móvil", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("Historial de árboles visible y sin desbordamiento en móvil", async ({ page }) => {
    await login(page);
    await page.goto("/history");
    await page.waitForLoadState("networkidle");

    // La sección de historial debe cargar
    // 1. Intentar localizar por data-testid="history"
    const historialSectionByTestId = page.locator("[data-testid='history']").first();

    if (await historialSectionByTestId.count()) {
      await expect(historialSectionByTestId).toBeVisible();
    } else {
      // 2. Fallback: localizar por textos característicos
      const historialSectionByText = page
        .locator('section')
        .filter({ hasText: /Historial|Mis Árboles/i })
        .first();
      await expect(historialSectionByText).toBeVisible();
    }

    // Sin scroll horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);

    console.log("\n📱  Historial OK en móvil — sin desbordamiento horizontal");
  });
});