// tests/e2e/dana-grants-subsidies-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/dana-grants-subsidies-stats';

const nuevaSubvencion = {
  year: 2024,
  month: 12,
  grant_date: "31/12/2024",
  benef_id: "B73614928",
  benef_name: "GREEN AVOCADO TECH S.L.",
  benef_type: "startup_innovación",
  purpose: "Desarrollo de un sistema de IA para optimizar el riego en plantaciones de aguacates",
  grantor: "Consejería de Transformación Económica",
  grant_type: "Iniciativa FuturoVerde",
  amt_granted: 42500,
  amt_paid: 25000,
  reimbursed: 0,
  refunded: 0,
  region_name: "Comunidad Valenciana",
  sec_cod: 72,
  sec_descr: "Agrotecnología sostenible",
  aid_type: "Innovación verde",
  reg_base: "Decreto 18/2025, de 8 de febrero",
  fund_local: 8500,
  fund_regional: 12000,
  fund_state: 15000,
  fund_eu: 7000,
  fund_other: 0,
  fund_type: "PlanTechVerde",
  prov_name: "Alicante",
  mun_name: "Denia"
};

const nombreActualizado = "AGUACATE MARRON TECH S.L.";

async function rellenarFormulario(page, datos) {
  for (const [key, value] of Object.entries(datos)) {
    const input = await page.locator(`#${key}`);
    if (await input.count()) {
      await input.fill(value.toString());
    }
  }
}

async function filtrarPorBenefId(page, id) {
  await page.locator('#filtros').click();
  await page.locator('#filtroBenefId').fill(id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
}

test.describe('Gestión de subvenciones - CRUD', () => {
  test('Crear subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h2')).toContainText('Ayudas y subvenciones solicitadas');

    await page.getByText('Crear nueva subvención').click();

    await rellenarFormulario(page, nuevaSubvencion);
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.locator('.alert-success')).toContainText('Subvención creada con éxito');
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_name })).toBeVisible();
  });

  test('Buscar y verificar subvención creada', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    const filas = page.locator('tbody tr');
    await expect(filas).toHaveCount(1);
    await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_id })).toBeVisible();
  });

  test('Editar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    const fila = page.locator(`tr:has-text("${nuevaSubvencion.benef_name}")`);
    await fila.getByRole('button', { name: 'Editar' }).click();

    await expect(page).toHaveURL(new RegExp(`/editar/${nuevaSubvencion.mun_name}/${nuevaSubvencion.month}/${nuevaSubvencion.benef_id}`));
    const inputNombre = page.locator('#edit-benef_name');
    await inputNombre.fill(nombreActualizado);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.locator('.alert-success')).toContainText('Subvención actualizada con éxito');
    await expect(page).toHaveURL(BASE_URL);

    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);
    await expect(page.getByRole('cell', { name: nombreActualizado })).toBeVisible();
  });

  test('Eliminar subvención', async ({ page }) => {
    await page.goto(BASE_URL);
    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);

    //await page.locator('#confirmar-eliminacion').waitFor({ state: 'visible' });
    const fila = page.locator(`tr:has-text("${nombreActualizado}")`);
    await fila.getByRole('button', { name: 'Eliminar' }).click();

    await page.locator('.modal-footer button:has-text("Eliminar")').click();


    await expect(page.locator('.alert-success')).toContainText('Subvención eliminada con éxito');
    await page.locator('#filtros').click();

    await filtrarPorBenefId(page, nuevaSubvencion.benef_id);
    await expect(page.locator('.alert-danger')).toContainText('No se ha encontrado ningún recurso');
  });
});
