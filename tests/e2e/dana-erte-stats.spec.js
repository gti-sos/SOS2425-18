// tests/e2e/dana-erte-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/dana-erte-stats';

const testRecord = {
  request_month: 5,
  request_year: 2030,
  cnae_descr: 'Test CNAE',
  company_municipality: 'TestVille',
  work_center_locality: 'TestCenter',
  sector: 'TEST',
  total_work_sus: 42,
  total_man_sus: 32,
  total_woman_sus: 10 
};
// helpers
const buscaSection = page =>
  page.locator('section.mb-4');

const crearTable = page =>
  page.locator('h3:has-text("Formulario de creación") + table');

const listaTable = page =>
  page.locator('h3:has-text("Listado de la base de datos") + table');

test.describe('Gestión de ERTEs de la Dana', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Debe mostrar advertencia si busco un año inexistente', async ({ page }) => {
    await page.getByPlaceholder('Año').first().fill('2222');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByText("No existen datos para el año '2222'.")).toBeVisible();

    page.on('console', msg => console.log(msg.text()));

  });

  
  test('Debe crear un nuevo registro válido', async ({ page }) => {
    const tbl = crearTable(page);
    await tbl.getByPlaceholder('Mes',                  { exact: true }).fill(String(testRecord.request_month));
    await tbl.getByPlaceholder('Año',                  { exact: true }).fill(String(testRecord.request_year));
    await tbl.getByPlaceholder('Descripción de cnae',  { exact: true }).fill(testRecord.cnae_descr);
    await tbl.getByPlaceholder('Municipio',            { exact: true }).fill(testRecord.company_municipality);
    await tbl.getByPlaceholder('Localidad',            { exact: true }).fill(testRecord.work_center_locality);
    await tbl.getByPlaceholder('Sector',               { exact: true }).fill(testRecord.sector);
    await tbl.getByPlaceholder('Trabajadores totales', { exact: true }).fill(String(testRecord.total_work_sus));
    await tbl.getByPlaceholder('Trabajadores hombres', { exact: true }).fill(String(testRecord.total_man_sus));
    await tbl.getByPlaceholder('Trabajadores mujeres', { exact: true }).fill(String(testRecord.total_woman_sus));

    await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/api/v2/dana-erte-stats') &&
        resp.request().method() === 'POST' &&
        resp.status() === 201
      ),
      tbl.getByRole('button', { name: 'Crear' }).click(),
    ]);

    await expect(
      page.locator('p.text-success', { hasText: 'Dato creado correctamente' })
    ).toBeVisible();
  });
  
  test('Debe buscar el registro recién creado por todos sus campos de filtro', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Mes',      { exact: true }).fill(String(testRecord.request_month));
    await busca.getByPlaceholder('Año',      { exact: true }).fill(String(testRecord.request_year));
    await busca.getByPlaceholder('Municipio',{ exact: true }).fill(testRecord.company_municipality);
    await busca.getByPlaceholder('Sector',   { exact: true }).fill(testRecord.sector);
    await busca.getByRole('button', { name: 'Buscar' }).click();

    const fila = listaTable(page).locator('tbody tr').first();
    await expect(fila).toContainText(String(testRecord.request_month));
    await expect(fila).toContainText(String(testRecord.request_year));
    await expect(fila).toContainText(testRecord.company_municipality);
    await expect(fila).toContainText(testRecord.sector);
  });

  test('Debe filtrar por rango de años', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Desde año', { exact: true }).fill('2029');
    await busca.getByPlaceholder('Hasta año', { exact: true }).fill('2031');
    await busca.getByRole('button', { name: 'Buscar' }).click();

    const fila = listaTable(page)
      .locator('tbody tr')
      .filter({ hasText: testRecord.company_municipality });
    await expect(fila).toBeVisible({ timeout: 1000 });
  });


  test('Debe mostrar error si dejo un campo vacío al editar', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Municipio', { exact: true }).fill(testRecord.company_municipality);
    await busca.getByRole('button', { name: 'Buscar' }).click();

    const fila = listaTable(page).locator('tbody tr', { hasText: testRecord.company_municipality });
    await Promise.all([
      page.waitForURL(/\/dana-erte-stats\/editar\/.+/),
      fila.getByRole('button', { name: 'Editar' }).click(),
    ]);

    await expect(page.getByRole('heading', { name: /Editar registro/ })).toBeVisible();
    await page.getByLabel('Municipio').fill('');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.locator('div.alert')).toContainText('Todos los campos son obligatorios.');
  });

  test('Debe cancelar la edición y volver al listado', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Municipio', { exact: true }).fill(testRecord.company_municipality);
    await busca.getByRole('button', { name: 'Buscar' }).click();

    const fila = listaTable(page).locator('tbody tr', { hasText: testRecord.company_municipality });
    await Promise.all([
      page.waitForURL(/\/dana-erte-stats\/editar\/.+/),
      fila.getByRole('button', { name: 'Editar' }).click(),
    ]);

    await expect(page.getByRole('heading', { name: /Editar registro/ })).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page).toHaveURL(BASE_URL);
    await expect(listaTable(page).locator('tbody tr').first()).toBeVisible();
  });


  test('Debe mostrar el título de la página', async ({ page }) => {
    await expect(page).toHaveTitle('Ertes de la Dana');
  });


  test('Debe limpiar filtros y restaurar todos los registros', async ({ page }) => {
    const busca = buscaSection(page);
  
    // 1) Filtro por un municipio inexistente
    await busca.getByPlaceholder('Municipio', { exact: true }).fill('NoExiste');
    await busca.getByRole('button', { name: 'Buscar' }).click();
    await expect(
      page.getByText("No existe ningún municipio 'NoExiste'.")
    ).toBeVisible();
  
    // 2) Limpiar filtros
    await busca.getByRole('button', { name: 'Limpiar filtros' }).click();
  
    // 3) Comprobar que hay al menos una fila en la tabla
    const filas = listaTable(page).locator('tbody tr');
    const count = await filas.count();
    expect(count).toBeGreaterThan(0);
  });
  
  


  
  
  

  test('Debe buscar por localidad del centro de trabajo', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Localidad', { exact: true }).fill(testRecord.work_center_locality);
    await busca.getByRole('button', { name: 'Buscar' }).click();
    const fila = listaTable(page).locator('tbody tr').first();
    await expect(fila).toContainText(testRecord.work_center_locality);
  });

 
  

  test('Debe navegar a la página de edición correcta (extra)', async ({ page }) => {
    const busca = buscaSection(page);
    await busca.getByPlaceholder('Municipio', { exact: true }).fill(testRecord.company_municipality);
    await busca.getByRole('button', { name: 'Buscar' }).click();

    const fila = listaTable(page).locator('tbody tr', { hasText: testRecord.company_municipality });
    await expect(fila).toBeVisible({ timeout: 5000 });

    await Promise.all([
      page.waitForURL(/\/dana-erte-stats\/editar\/.+/),
      fila.getByRole('button', { name: 'Editar' }).click(),
    ]);
    await expect(
      page.getByRole('heading', { name: new RegExp(`Editar registro: ${testRecord.company_municipality}`) })
    ).toBeVisible();
  });


  test('Debe borrar toda la base de datos y mostrar alerta de vaciado', async ({ page }) => {
    // Pulsar y esperar DELETE + GET (refresco)
    await Promise.all([
      page.waitForResponse(resp =>
        resp.url().endsWith('/api/v2/dana-erte-stats') &&
        resp.request().method() === 'DELETE' &&
        resp.status() === 200
      ),
      page.waitForResponse(resp =>
        resp.url().endsWith('/api/v2/dana-erte-stats') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200
      ),
      page.getByRole('button', { name: 'Borrar base de datos' }).click(),
    ]);
  
    // Verificar que aparece la alerta de éxito
    await expect(page.getByRole('alert'))
      .toContainText('Base de datos eliminada correctamente.');
  });
  
  



});
