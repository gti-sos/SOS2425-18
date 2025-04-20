// tests/e2e/contr-mun-stats.spec.js
import { test, defineConfig, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/dana-grants-subsidies-stats';

// Datos de la nueva subvención
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
  amt_granted: 42500.00,
  amt_paid: 25000.00,
  reimbursed: 0.00,
  refunded: 0.00,
  region_name: "Comunidad Valenciana",
  sec_cod: 72,
  sec_descr: "Agrotecnología sostenible",
  aid_type: "Innovación verde",
  reg_base: "Decreto 18/2025, de 8 de febrero",
  fund_local: 8500.00,
  fund_regional: 12000.00,
  fund_state: 15000.00,
  fund_eu: 7000.00,
  fund_other: 0.00,
  fund_type: "PlanTechVerde",
  prov_name: "Alicante",
  mun_name: "Denia"
};

// Nombre actualizado para la edición
const nombreActualizado = "AGUACATE MARRON TECH S.L.";

// Test para crear, actualizar y eliminar un recurso de ayuda

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

test('Creación de subvención', async ({ page }) => {

  // 1. Navegar a la página principal
  await page.goto(BASE_URL);
  await expect(page.locator('h1.text-center')).toHaveText('Ayudas y subvenciones solicitadas Comunidad Valenciana, 4º Trimestre 2024');
  
  // 2. Abrir el formulario para crear una nueva subvención
  await page.getByText('Crear nueva subvención').click();

  // 3. Rellenar el formulario con los datos de la nueva subvención
  await page.locator('#year').fill(nuevaSubvencion.year.toString());
  await page.locator('#month').fill(nuevaSubvencion.month.toString());
  await page.locator('#grant_date').fill(nuevaSubvencion.grant_date);
  await page.locator('#benef_id').fill(nuevaSubvencion.benef_id);
  await page.locator('#benef_name').fill(nuevaSubvencion.benef_name);
  await page.locator('#benef_type').fill(nuevaSubvencion.benef_type);
  await page.locator('#purpose').fill(nuevaSubvencion.purpose);
  await page.locator('#grantor').fill(nuevaSubvencion.grantor);
  await page.locator('#grant_type').fill(nuevaSubvencion.grant_type);
  await page.locator('#amt_granted').fill(nuevaSubvencion.amt_granted.toString());
  await page.locator('#amt_paid').fill(nuevaSubvencion.amt_paid.toString());
  await page.locator('#reimbursed').fill(nuevaSubvencion.reimbursed.toString());
  await page.locator('#refunded').fill(nuevaSubvencion.refunded.toString());
  await page.locator('#region_name').fill(nuevaSubvencion.region_name);
  await page.locator('#sec_cod').fill(nuevaSubvencion.sec_cod.toString());
  await page.locator('#sec_name').fill(nuevaSubvencion.sec_descr);
  await page.locator('#aid_type').fill(nuevaSubvencion.aid_type);
  await page.locator('#reg_base').fill(nuevaSubvencion.reg_base);
  await page.locator('#fund_local').fill(nuevaSubvencion.fund_local.toString());
  await page.locator('#fund_regional').fill(nuevaSubvencion.fund_regional.toString());
  await page.locator('#fund_state').fill(nuevaSubvencion.fund_state.toString());
  await page.locator('#fund_eu').fill(nuevaSubvencion.fund_eu.toString());
  await page.locator('#fund_other').fill(nuevaSubvencion.fund_other.toString());
  await page.locator('#fund_type').fill(nuevaSubvencion.fund_type);
  await page.locator('#prov_name').fill(nuevaSubvencion.prov_name);
  await page.locator('#mun_name').fill(nuevaSubvencion.mun_name);
});

test('Comprobación creación subvención', async ({ page }) => {
  // 4. Guardar la nueva subvención
  await page.getByRole('button', { name: 'Guardar'}).click();

  // 5. Verificar que la subvención se ha creado correctamente (aparece la alerta de éxito)
  await expect(page.locator('.alert-success')).toContainText('Subvención creada con éxito');

  // 6. Verificar que la subvención aparece en la tabla
  await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_name })).toBeVisible();
});

test('Comprobación creación subvención (búsqueda)', async ({ page }) => {
  // 7. Filtrar para encontrar nuestra subvención específica
  await page.getByText('Filtros').click();
  await page.locator('#filtroBenefId').fill(nuevaSubvencion.benef_id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();

  // 8. Verificar que solo aparece nuestra subvención
  const filas = page.locator('tbody tr');
  await expect(filas).toHaveCount(1);
  await expect(page.getByRole('cell', { name: nuevaSubvencion.benef_id })).toBeVisible();
});

test('Edición subvención', async ({ page }) => {
  // 9. Hacer clic en el botón de editar
  await page.getByRole('button', { name: 'Editar' }).click();

  // 10. Verificar que se ha cargado el formulario de edición con los datos correctos
  await expect(page).toHaveURL(new RegExp(`/dana-grants-subsidies-stats/editar/${nuevaSubvencion.mun_name}/${nuevaSubvencion.month}/${nuevaSubvencion.benef_id}`));
  await expect(page.locator('#edit-benef_name')).toHaveValue(nuevaSubvencion.benef_name);

  // 11. Actualizar el nombre del beneficiario
  await page.locator('#edit-benef_name').clear();
  await page.locator('#edit-benef_name').fill(nombreActualizado);

  // 12. Guardar los cambios
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
});

test('Comprobación edición subvención', async ({ page }) => {

  // 13. Verificar que la subvención se ha actualizado correctamente
  await expect(page.locator('.alert-success')).toContainText('Subvención actualizada con éxito');

  // 14. Verificar que se ha redirigido a la página principal y aplicar filtro
  await expect(page).toHaveURL('/dana-grants-subsidies-stats');
  await page.getByText('Filtros').click();
  await page.locator('#filtroBenefId').fill(nuevaSubvencion.benef_id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();

  // 15. Verificar que la subvención actualizada aparece en la tabla
  await expect(page.getByRole('cell', { name: nombreActualizado })).toBeVisible();
});

test('Eliminación subvención', async ({ page }) => {

  // 16. Hacer clic en el botón de eliminar

  const aidRow = await page.locator(`tr:has-text("${nuevaSubvencion.benef_name}")`);

  // Dentro de esa fila, selecciona el botón "Eliminar"
  const deleteButton = aidRow.locator('button', { hasText: 'Eliminar' });
  
  // Haz clic en el botón "Eliminar"
  await deleteButton.click();
  
  // 17. Confirmar la eliminación en el modal
  await page.getByRole('button', { name: 'Eliminar'}).click();

});

test('Comprobación eliminación subvención', async ({ page }) => {

  // 18. Verificar que la subvención se ha eliminado correctamente
  await expect(page.locator('.alert-success')).toContainText('Subvención eliminada con éxito');

  // 19. Verificar que la subvención ya no aparece en la tabla
  await page.getByText('Filtros').click();
  await page.locator('#filtroBenefId').fill(nuevaSubvencion.benef_id);
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  
  // Esperamos que aparezca un mensaje indicando que no se encontraron recursos
  await expect(page.locator('.alert-danger')).toContainText('No se ha encontrado ningún recurso');
});
