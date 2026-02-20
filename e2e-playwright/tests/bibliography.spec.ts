import { test, expect } from '@playwright/test';
import path from 'path';

const validEmail = 'serujio57@gmail.com';
const validPass = 'SERGIO1003';

test.describe('Bibliografía', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await page.fill('input[type="email"]', validEmail);
    await page.fill('input[type="password"]', validPass);
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL('**/dashboard');
  });

  test('Subida de archivo TXT y ver en la lista', async ({ page }) => {
    await page.goto('/bibliography');
    await expect(page.locator('text=Bibliografía').first()).toBeVisible();
    // El archivo de prueba está en e2e-playwright/tests/fixtures/sample.txt
    const filePath = path.resolve(__dirname, 'fixtures', 'sample.txt');
    await expect(page.locator('input[type="file"]').first()).toBeHidden();
    await page.setInputFiles('input[type="file"]', filePath);
    await expect(page.locator('text=sample.txt').first()).toBeVisible({ timeout: 15000 });
  });
});
