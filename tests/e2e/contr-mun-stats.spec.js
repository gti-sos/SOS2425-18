// tests/e2e/contr-mun-stats.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/contr-mun-stats';


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

  test('Debe mostrar un error si se intenta crear un contrato con campos vacíos', async ({ page }) => {
    const crear = page.locator('section', { hasText: 'Añadir nuevo contrato' });
  
    // Nos aseguramos de que los campos estén vacíos (por si acaso)
    const placeholders = [
      'Año', 'Mes', 'Código provincia', 'Nombre provincia', 'Código municipio',
      'Nombre municipio', 'Código sector', 'Descripción sector', 'Contratos'
    ];
    
    for (const placeholder of placeholders) {
      await crear.getByPlaceholder(placeholder).fill('');
    }
  
    // Hacemos clic en "Crear"
    await crear.getByRole('button', { name: 'Crear' }).click();
  
    // Verificamos que aparece el mensaje de error esperado
    await expect(page.locator('div.alert')).toContainText('Por favor, completa todos los campos.');
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
    await expect(page.locator('div.alert')).toContainText('Contrato creado correctamente.', { timeout: 7000 });
  });

  test('Debe buscar un contrato específico por todos sus identificadores', async ({ page }) => {
    const filtros = page.locator('section', { hasText: 'Buscar contratos' });
  
    await filtros.getByPlaceholder('Año').first().fill(String(testContrato.year));
    await filtros.getByPlaceholder('Mes').first().fill(String(testContrato.month));
    await filtros.getByPlaceholder('Código provincia').first().fill(String(testContrato.prov_cod));
    await filtros.getByPlaceholder('Código municipio').first().fill(String(testContrato.mun_cod));
    await filtros.getByPlaceholder('Código sector').first().fill(testContrato.sec_cod);
  
    await filtros.getByRole('button', { name: 'Buscar' }).click();
  
    const fila = page.locator('table tbody tr').first();
  
    await expect(fila).toContainText(String(testContrato.year));
    await expect(fila).toContainText(String(testContrato.month));
    await expect(fila).toContainText(testContrato.prov_name);
    await expect(fila).toContainText(testContrato.mun_name);
    await expect(fila).toContainText(testContrato.sec_descr);
  });    

  test('Debe filtrar correctamente por múltiples campos', async ({ page }) => {
    const filtros = page.locator('section').filter({ hasText: 'Buscar contratos' });
  
    // Rellenar múltiples campos (usamos nth(0) para asegurarnos que es el filtro)
    await filtros.getByPlaceholder('Año').nth(0).fill(String(testContrato.year));
    await filtros.getByPlaceholder('Mes').nth(0).fill(String(testContrato.month));
    await filtros.getByPlaceholder('Código provincia').nth(0).fill(String(testContrato.prov_cod));
    await filtros.getByPlaceholder('Nombre provincia').nth(0).fill(testContrato.prov_name);
    await filtros.getByPlaceholder('Código municipio').nth(0).fill(String(testContrato.mun_cod));
    await filtros.getByPlaceholder('Nombre municipio').nth(0).fill(testContrato.mun_name);
    await filtros.getByPlaceholder('Código sector').nth(0).fill(testContrato.sec_cod);
    await filtros.getByPlaceholder('Descripción sector').nth(0).fill(testContrato.sec_descr);
    await filtros.getByPlaceholder('Contratos').nth(0).fill(String(testContrato.num_contracts));
  
    // Hacer clic en Buscar
    await filtros.getByRole('button', { name: 'Buscar' }).click();
  
    // Esperar hasta que aparezca exactamente el contenido que buscamos en la tabla
    const fila = page.locator('table tbody tr').filter({ hasText: testContrato.mun_name });
  
    // Añadimos retry al expect con tiempo extendido
    await expect(fila).toBeVisible({ timeout: 10000 });
  });  

  test('Debe buscar correctamente por rango de años', async ({ page }) => {
    // Ir al formulario de filtros
    const filtros = page.locator('section', { hasText: 'Buscar contratos' });
  
    // Rellenar el rango de años
    await filtros.getByPlaceholder('Desde año').fill('2035');
    await filtros.getByPlaceholder('Hasta año').fill('2037');
  
    // Pulsar el botón de búsqueda
    await filtros.getByRole('button', { name: 'Buscar' }).click();
  
    // Esperar que el contrato esperado esté visible
    const filaEsperada = page.locator('table tbody tr').filter({ hasText: testContrato.mun_name });
    await expect(filaEsperada).toBeVisible({ timeout: 7000 });
  });  

  test('Debe aplicar correctamente limit y offset en la búsqueda', async ({ page }) => {
    const filtros = page.locator('section', { hasText: 'Buscar contratos' });
  
    await filtros.getByPlaceholder('Límite de resultados').fill('1');
    await filtros.getByRole('button', { name: 'Buscar' }).click();
  
    const tabla = page.locator('table tbody tr');
    const primerResultadoSinOffset = await tabla.first().innerText();
    await expect(tabla).toHaveCount(1); // solo una fila
  
    await filtros.getByPlaceholder('Desplazamiento').fill('1');
    await filtros.getByRole('button', { name: 'Buscar' }).click();
  
    const segundoResultado = await tabla.first().innerText();
  
    expect(segundoResultado).not.toBe(primerResultadoSinOffset);
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
    await expect(page.locator('div.alert')).toContainText('Ya existe un contrato con esos datos.');
  });

  test('Debe modificar el contrato creado', async ({ page }) => {
    // Buscar la fila que contiene la descripción original del contrato
    const fila = page.locator('tr', { hasText: testContrato.sec_descr });
    await expect(fila).toBeVisible({ timeout: 7000 });
  
    // Hacer clic en el botón "Editar"
    await fila.getByRole('button', { name: 'Editar' }).click();
  
    // Esperar a que cargue la página de edición
    await expect(page.getByRole('heading', { name: 'Editar Contrato' })).toBeVisible();
  
    // Modificar la descripción
    const nuevaDescripcion = 'EditadoPorTest-' + Math.floor(Math.random() * 1000);
    const campoDescripcion = page.getByLabel('Descripción del sector');
    await expect(campoDescripcion).toBeVisible({ timeout: 7000 });
    await campoDescripcion.fill(nuevaDescripcion);
  
    // Guardar cambios
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
  
    // Verificar mensaje de éxito y redirección
    await expect(page.getByText('Contrato actualizado correctamente.')).toBeVisible({ timeout: 7000 });
    await expect(page.getByRole('heading', { name: 'Contrataciones por municipio' })).toBeVisible();
  
    // Verificar que la nueva descripción aparece en alguna fila de la tabla
    await expect(page.locator('tr', { hasText: nuevaDescripcion })).toBeVisible();
  });  

  test('Debe mostrar error si se deja un campo vacío al modificar', async ({ page }) => {
    // Localizamos la fila por el municipio del contrato de prueba y accedemos a editar
    const fila = page.locator('tr', { hasText: testContrato.mun_name });
    await fila.getByRole('button', { name: 'Editar' }).click();
  
    // Esperamos a que aparezca la vista de edición
    await expect(page.getByRole('heading', { name: 'Editar Contrato' })).toBeVisible();
  
    // Borramos el campo "Nombre provincia"
    const campoProvName = page.getByLabel('Nombre de provincia');
    await campoProvName.fill(''); // lo dejamos vacío
  
    // Pulsamos en guardar cambios
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
  
    // Verificamos que aparece el mensaje de error
    await expect(page.locator('div.alert')).toContainText('Todos los campos son obligatorios.');
  });  

  test('Debe volver al listado si se pulsa Cancelar en la edición', async ({ page }) => {
    // Localizamos la fila del contrato de prueba y pulsamos en "Editar"
    const fila = page.locator('tr', { hasText: testContrato.prov_name });
    await fila.getByRole('button', { name: 'Editar' }).click();
  
    // Aseguramos que estamos en la vista de edición
    await expect(page.getByRole('heading', { name: 'Editar Contrato' })).toBeVisible();
  
    // Pulsamos el botón "Cancelar"
    await page.getByRole('button', { name: 'Cancelar' }).click();
  
    // Verificamos que hemos vuelto al listado
    await expect(page.getByRole('heading', { name: 'Contrataciones por municipio' })).toBeVisible();
  });  

  test('Debe eliminar el contrato creado', async ({ page }) => {
    const fila = page.locator('tr', { hasText: testContrato.prov_name });
    await fila.getByRole('button', { name: 'Borrar' }).click();
    await expect(page.locator('div.alert')).toContainText('Recurso eliminado correctamente.');
  });

});
