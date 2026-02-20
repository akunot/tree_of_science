import { test, expect } from '@playwright/test';

const validEmail = 'serujio57@gmail.com';
const validPass = 'SERGIO1003';

test('Login exitoso con credenciales válidas', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await expect(page.locator('text=Acceso a la Plataforma').first()).toBeVisible();

    await page.fill('input[name="email"]', validEmail);
    await page.fill('input[name="password"]', validPass);
    await page.click('button:has-text("Iniciar sesión")');

    // Este usuario válido es de tipo "normal" → debe ir al dashboard
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Validar que estamos en el dashboard
    await expect(
      page.locator('text=Bienvenido de vuelta').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('Login fallido con credenciales inválidas', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
      await page.fill('input[name="email"]', validEmail);
      await page.fill('input[name="password"]', 'ContraseñaIncorrecta');
    await page.click('button:has-text("Iniciar sesión")');
      await expect(page.locator('text=/credenciales|error al iniciar sesión|Error al iniciar sesión/i').first()).toBeVisible({ timeout: 7000 });
    await expect(page).not.toHaveURL('**/dashboard');
  });

  test('Rutas protegidas redirigen a pantalla pública sin sesión', async ({ page, context }) => {
    // Asegurar que NO haya sesión previa
    await context.clearCookies();

    // Ir a nuestra app para poder acceder a localStorage/sessionStorage
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // Sin sesión, acceder a rutas protegidas debe mandarnos a /login
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 15000 });

    await page.goto('/generate');
    await page.waitForURL('**/login', { timeout: 15000 });

    await page.goto('/bibliography');
    await page.waitForURL('**/login', { timeout: 15000 });
  });
