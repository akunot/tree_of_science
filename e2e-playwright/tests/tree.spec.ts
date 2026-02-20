import { test, expect } from '@playwright/test';

const validEmail = 'serujio57@gmail.com';
const validPass = 'SERGIO1003';

test.describe('Árboles de la Ciencia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await page.fill('input[type="email"]', validEmail);
    await page.fill('input[type="password"]', validPass);
    await page.click('button:has-text("Iniciar sesión")');
    await page.waitForURL('**/dashboard');
  });

  test('Generar árbol con semilla y verificar visualización', async ({ page }) => {
    await page.goto('/generate');
    await expect(
      page.getByRole('heading', { name: 'Generar Árbol de la Ciencia' })
    ).toBeVisible();

    // Rellenar los tres campos requeridos
    await page.fill('textarea[name="seed"]', 'Inteligencia artificial en medicina');
    await page.fill('input[name="title"]', 'Árbol IA en Medicina');

    // Seleccionar una bibliografía por su nombre (debe existir y ser procesable por Sap)
    await page.selectOption('select', { label: 'isi.txt' });

    await page.click('button:has-text("Generar Árbol de la Ciencia")');

    // Si aparece un mensaje de error, el test debe reflejarlo
    const errorAlert = page.locator('text=Error al generar el árbol').first();
    if (await errorAlert.count()) {
      // Para depurar en E2E: mostramos el texto del error
      const msg = await errorAlert.textContent();
      throw new Error(`Falló la generación del árbol: ${msg}`);
    }

    // Esperar a que nos lleve al detalle del árbol
    await page.waitForURL('**/tree/*', { timeout: 30000 });

    // Validar que se ve algo del detalle (por ejemplo, el título del árbol de ciencia)
    await expect(
      page.locator('text=Árbol de Ciencia').first()
    ).toBeVisible({ timeout: 30000 });
  });

  test('Historial: abrir árbol reciente y descargar JSON', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Árboles Recientes').first()).toBeVisible();

    // Asegurarse de que hay al menos un árbol reciente
    const firstTreeLink = page
      .locator('section:has-text("Árboles Recientes") button[title="Ver árbol"]')
      .first();
    const hasTree = await firstTreeLink.count();
    if (!hasTree) {
      test.skip(true, 'No hay árboles recientes para probar descarga JSON');
    }

    // Ir al detalle del árbol (botón "Ver árbol" dentro del link)
    await firstTreeLink.click();
    await page.waitForURL('**/tree/*', { timeout: 15000 });

    // Intentar descarga JSON y comprobar respuesta de descarga
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("JSON")'),
    ]);
    const path = await download.path();
    expect(path).not.toBeNull();
  });

  test('Eliminar árbol con confirmación', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Árboles Recientes').first()).toBeVisible();

    // Guardar título del primer árbol (si existe)
    const firstTreeTitle = page.locator('section:has-text("Árboles Recientes") h4').first();
    const hasTree = await firstTreeTitle.count();
    if (!hasTree) {
      test.skip(true, 'No hay árboles recientes para probar eliminación');
    }
    const titleText = (await firstTreeTitle.textContent()) || '';

    // Interceptar el diálogo nativo de confirmación
    let dialogMessage = '';
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Click en el botón "Eliminar árbol"
    await page.click('button[title="Eliminar árbol"]');

    // Verificar que se mostró el mensaje de confirmación
    expect(dialogMessage).toContain('¿Está seguro de que desea eliminar el árbol');

    // Esperar a que se invalide la query y desaparezca ese árbol
    await expect(page.locator(`text=${titleText}`)).toHaveCount(0);
  });
});
