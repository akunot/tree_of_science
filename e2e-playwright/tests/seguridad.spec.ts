// tests/seguridad.spec.ts
// ─────────────────────────────────────────────────────────────
// Pruebas de seguridad — rutas protegidas, XSS, localStorage
// Árbol de la Ciencia UNAL
// ─────────────────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

const EMAIL = "serujio57@gmail.com";
const PASS  = "Sergio1003@";

async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

// ────────────────────────────────────────────────────────────
// SEG-01 | Rutas protegidas redirigen a login sin sesión
// ────────────────────────────────────────────────────────────
test("SEG-01 | Rutas protegidas redirigen a login sin sesión activa", async ({ page, context }) => {
  // Limpiar toda sesión previa
  await context.clearCookies();
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  // Intentar acceder a rutas protegidas directamente
  const rutasProtegidas = ["/dashboard", "/generate", "/bibliography", "/history"];

  for (const ruta of rutasProtegidas) {
    await page.goto(ruta);
    await page.waitForURL("**/login", { timeout: 15000 });
    console.log(`\n🔒  ${ruta} → redirige correctamente a /login`);
    expect(page.url()).toContain("login");
  }
});

// ────────────────────────────────────────────────────────────
// SEG-02 | Rutas de admin redirigen si no eres administrador
// ────────────────────────────────────────────────────────────
test("SEG-02 | Rutas de admin bloquean a usuario regular", async ({ page }) => {
  await login(page);

  const rutasAdmin = ["/admin", "/admin/users", "/admin/requests", "/admin/invitations"];

  for (const ruta of rutasAdmin) {
    await page.goto(ruta);

    // Para usuario normal, debe mostrarse la pantalla de "Acceso Denegado"
    const accesoDenegadoTexto = page.locator("text=/Acceso Denegado/i");
    const botonIrDashboard = page.locator('button:has-text("Ir al Dashboard")');

    const blocked =
      (await accesoDenegadoTexto.count()) > 0 &&
      (await botonIrDashboard.count()) > 0;

    console.log(`\n🔒  ${ruta} → acceso bloqueado (${blocked ? "OK" : "⚠️ revisar"})`);
    expect(blocked).toBe(true);
  }
});

// ────────────────────────────────────────────────────────────
// SEG-03 | No se ejecuta HTML/JS inyectado en título del árbol
// ────────────────────────────────────────────────────────────
test("SEG-03 | XSS — HTML inyectado en título no se ejecuta", async ({ page }) => {
  await login(page);
  await page.goto("/generate");

  const payloadXSS = '<img src=x onerror=alert(1)>';

  await page.fill('textarea[name="seed"]', "test seed xss");
  await page.fill('input[name="title"]', payloadXSS);

  // Escuchar si aparece un diálogo de alert (señal de XSS exitoso)
  let alertDisparado = false;
  page.on("dialog", async (dialog) => {
    alertDisparado = true;
    await dialog.dismiss();
  });

  await page.click('button:has-text("Generar Árbol de la Ciencia")');

  // Esperar resultado (árbol generado o error)
  await page.waitForTimeout(5000);

  console.log(`\n🛡️  Alert XSS disparado: ${alertDisparado}`);
  expect(alertDisparado).toBe(false);

  // Verificar que si aparece el título, es como texto plano (no como imagen/elemento HTML)
  const imagenInyectada = page.locator('img[src="x"]');
  expect(await imagenInyectada.count()).toBe(0);
});

// ────────────────────────────────────────────────────────────
// SEG-04 | XSS en campo de semilla conceptual
// ────────────────────────────────────────────────────────────
test("SEG-04 | XSS — Script inyectado en semilla no se ejecuta", async ({ page }) => {
  await login(page);
  await page.goto("/generate");

  const payloadScript = '<script>document.body.innerHTML="HACKED"</script>';

  let alertDisparado = false;
  page.on("dialog", async (dialog) => {
    alertDisparado = true;
    await dialog.dismiss();
  });

  await page.fill('textarea[name="seed"]', payloadScript);
  await page.click('button:has-text("Generar Árbol de la Ciencia")');
  await page.waitForTimeout(3000);

  // La página no debe haber sido modificada por el script
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("HACKED");
  expect(alertDisparado).toBe(false);

  console.log("\n🛡️  Script inyectado en semilla no fue ejecutado");
});

// ────────────────────────────────────────────────────────────
// SEG-05 | No se guardan tokens JWT en localStorage
// ────────────────────────────────────────────────────────────
test("SEG-05 | Tokens JWT no están expuestos en localStorage", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  // Inspeccionar todo lo almacenado en localStorage
  const localStorageDump = await page.evaluate(() => ({ ...localStorage }));
  console.log("\n📦  localStorage tras login:", localStorageDump);

  // Los tokens de acceso y refresco NO deben estar en localStorage
  // (deben estar en cookies httpOnly si la implementación es segura)
  const keys = Object.keys(localStorageDump).join(" ").toLowerCase();
  const tieneTokenExpuesto = /access|refresh|jwt|bearer/.test(keys);

  if (tieneTokenExpuesto) {
    console.warn("⚠️  ADVERTENCIA: Se encontró un token en localStorage. Considera usar cookies httpOnly.");
  } else {
    console.log("✅  No se encontraron tokens expuestos en localStorage");
  }

  // Actualmente los tokens se guardan en localStorage; este test actúa como advertencia.
  // Cuando migres a cookies httpOnly, cambia esta expectativa a false.
  expect(tieneTokenExpuesto).toBe(false);

});

// ────────────────────────────────────────────────────────────
// SEG-06 | No se guarda la contraseña en localStorage
// ────────────────────────────────────────────────────────────
test("SEG-06 | Contraseña no se almacena en localStorage ni sessionStorage", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button:has-text("Iniciar sesión")');
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  const [localData, sessionData] = await page.evaluate(() => [
    JSON.stringify({ ...localStorage }),
    JSON.stringify({ ...sessionStorage }),
  ]);

  console.log("\n📦  localStorage:", localData);
  console.log("📦  sessionStorage:", sessionData);

  // La contraseña real nunca debe aparecer en el storage
  expect(localData).not.toContain(PASS);
  expect(sessionData).not.toContain(PASS);
  console.log("\n✅  Contraseña no encontrada en ningún storage del navegador");
});