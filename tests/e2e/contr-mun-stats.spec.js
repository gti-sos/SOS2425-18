// tests/e2e/contr-mun-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/contr-mun-stats';

const testContrato = {
  year: 2036,
  month: 8,
  prov_cod: 91,
  prov_name: 'NuevaProvincia',
  mun_cod: 777,
  mun_name: 'NuevoMunicipio',
  sec_cod: 'Z',
  sec_descr: 'NuevoSector',
  num_contracts: 88
};

test.describe('Gestión de Contratos por Municipio', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Debe mostrar el título principal', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contrataciones por municipio' })).toBeVisible();
  });

  test('Debe mostrar mensaje de error si se buscan filtros inexistentes', async ({ page }) => {
    await page.getByPlaceholder('Año').first().fill('3000');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByText("No existen contratos en el año '3000'.")).toBeVisible();
  });

  test('Debe crear un nuevo contrato válido', async ({ page }) => {
    const crear = page.locator('section', { hasText: 'Añadir nuevo contrato' });

    await crear.getByPlaceholder('Año').fill(String(testContrato.year));
    await crear.getByPlaceholder('Mes').fill(String(testContrato.month));
    await crear.getByPlaceholder('Código provincia').fill(String(testContrato.prov_cod));
    await crear.getByPlaceholder('Nombre provincia').fill(testContrato.prov_name);
    await crear.getByPlaceholder('Código municipio').fill(String(testContrato.mun_cod));
    await crear.getByPlaceholder('Nombre municipio').fill(testContrato.mun_name);
    await crear.getByPlaceholder('Código sector').fill(testContrato.sec_cod);
    await crear.getByPlaceholder('Descripción sector').fill(testContrato.sec_descr);
    await crear.getByPlaceholder('Contratos').fill(String(testContrato.num_contracts));

    await crear.getByRole('button', { name: 'Crear' }).click();

    // Esperar mensaje de éxito
    await expect(page.locator('div.alert')).toContainText('Contrato creado correctamente.', { timeout: 7000 });

    // Verificar que el nuevo contrato aparece en la tabla
    const fila = page.locator('table tbody tr').filter({ hasText: testContrato.mun_name });
    await expect(fila.first()).toBeVisible({ timeout: 7000 });
  });

  test('Debe mostrar error al intentar crear un contrato duplicado', async ({ page }) => {
    const crear = page.locator('section', { hasText: 'Añadir nuevo contrato' });

    await crear.getByPlaceholder('Año').fill(String(testContrato.year));
    await crear.getByPlaceholder('Mes').fill(String(testContrato.month));
    await crear.getByPlaceholder('Código provincia').fill(String(testContrato.prov_cod));
    await crear.getByPlaceholder('Nombre provincia').fill(testContrato.prov_name);
    await crear.getByPlaceholder('Código municipio').fill(String(testContrato.mun_cod));
    await crear.getByPlaceholder('Nombre municipio').fill(testContrato.mun_name);
    await crear.getByPlaceholder('Código sector').fill(testContrato.sec_cod);
    await crear.getByPlaceholder('Descripción sector').fill(testContrato.sec_descr);
    await crear.getByPlaceholder('Contratos').fill(String(testContrato.num_contracts));

    await crear.getByRole('button', { name: 'Crear' }).click();

    // Esperar mensaje de duplicado
    await expect(page.locator('div.alert')).toContainText('Ya existe un contrato con esos datos.', { timeout: 7000 });
  });

  test('Debe eliminar un contrato específico', async ({ page }) => {
    const fila = page.locator('table tbody tr').filter({ hasText: testContrato.mun_name });
    await expect(fila.first()).toBeVisible({ timeout: 7000 });

    await fila.first().getByRole('button', { name: 'Borrar' }).click();

    await expect(page.locator('div.alert')).toContainText('Recurso eliminado correctamente.', { timeout: 5000 });
  });

});
