import { test, expect } from '@playwright/test';

const adminEmail = 'secastrob@unal.edu.co';
const adminPass = 'sergio1003';

test.describe('Admin', () => {
  test('Ver y gestionar lista de usuarios', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPass);
    await page.click('button:has-text("Iniciar sesión")');

    // 1) Siempre debe ir al dashboard después de login
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // 2) Desde el dashboard, navegar al panel de administración
    //    (si aún no tienes un botón, de momento vamos directo por URL)
    await page.goto('/admin');

    // 3) Asegurarse de que estamos en el panel admin
    await expect(
      page.locator('text=Análisis del Laboratorio').first()
    ).toBeVisible({ timeout: 10000 });

    // 4) Asegurarse de que exista la tabla de solicitudes
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // 5) Verificar si hay al menos una fila de datos (ignorando el header)
    const dataRows = page.locator('tbody tr');
    const rowCount = await dataRows.count();

    if (rowCount > 0) {
      const firstRow = dataRows.first();
      await expect(firstRow).toBeVisible({ timeout: 10000 });

      // Buscar botones de acción (Aprobar / Rechazar) y probar uno
      const approveBtn = firstRow.locator('button[title="Aprobar"]').first();
      if (await approveBtn.count()) {
        await approveBtn.click();
      }
    }
  });
});
