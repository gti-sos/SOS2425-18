<script lang="ts">
    // @ts-nocheck
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Input, Button, Alert } from '@sveltestrap/sveltestrap';
    import { dev } from '$app/environment';
    import { get } from 'svelte/store';
  
    const DEVEL_HOST = 'http://localhost:3000';
    let API = '/api/v1/dana-erte-stats';
    if (dev) API = DEVEL_HOST + API;
  
    let record = null;
    let mensaje = '';
    let tipoMensaje = 'success';
  
    // Obtener parámetros dinámicos: municipality, year y month
    const params = get(page).params;
    const { municipality, year, month } = params;
  
    // Carga del registro a editar
    async function cargarRegistro() {
      mensaje = '';
      try {
        const res = await fetch(
          `${API}/${encodeURIComponent(municipality)}/${year}/${month}`
        );
        if (!res.ok) throw new Error('No encontrado');
        record = await res.json();
      } catch (err) {
        mensaje = 'No se pudo cargar el registro.';
        tipoMensaje = 'danger';
      }
    }
  
    // Guardar cambios via PUT
    async function guardarCambios() {
      mensaje = '';
      // Validación básica
      if (
        !record.request_year || !record.request_month || !record.cnae_descr ||
        !record.company_municipality || !record.work_center_locality ||
        !record.sector || record.total_work_sus == null
      ) {
        mensaje = 'Todos los campos son obligatorios.';
        tipoMensaje = 'danger';
        return;
      }
      try {
        const res = await fetch(
          `${API}/${encodeURIComponent(municipality)}/${year}/${month}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              request_year: Number(record.request_year),
              request_month: Number(record.request_month),
              cnae_descr: record.cnae_descr,
              company_municipality: record.company_municipality,
              work_center_locality: record.work_center_locality,
              sector: record.sector,
              total_work_sus: Number(record.total_work_sus)
            })
          }
        );
        if (res.ok) {
          mensaje = 'Registro actualizado correctamente.';
          tipoMensaje = 'success';
          setTimeout(() => goto('/dana-erte-stats'), 1500);
        } else {
          mensaje = 'Error al actualizar el registro.';
          tipoMensaje = 'danger';
        }
      } catch (error) {
        mensaje = 'No se pudo conectar con el servidor.';
        tipoMensaje = 'danger';
      }
    }
  
    onMount(cargarRegistro);
  </script>
  
  {#if mensaje}
    <Alert color={tipoMensaje}>{mensaje}</Alert>
  {/if}
  
  {#if record}
    <h2>Editar registro: {municipality} ({month}/{year})</h2>
  
    <div class="mb-3">
      <label for="year">Año</label>
      <Input id="year" type="number" bind:value={record.request_year} />
    </div>
    <div class="mb-3">
      <label for="month">Mes</label>
      <Input id="month" type="number" bind:value={record.request_month} />
    </div>
    <div class="mb-3">
      <label for="cnae">CNAE Descripción</label>
      <Input id="cnae" bind:value={record.cnae_descr} />
    </div>
    <div class="mb-3">
      <label for="municipality">Municipio</label>
      <Input id="municipality" bind:value={record.company_municipality} />
    </div>
    <div class="mb-3">
      <label for="locality">Localidad</label>
      <Input id="locality" bind:value={record.work_center_locality} />
    </div>
    <div class="mb-3">
      <label for="sector">Sector</label>
      <Input id="sector" bind:value={record.sector} />
    </div>
    <div class="mb-3">
      <label for="total">Total Trabaj. Susp.</label>
      <Input id="total" type="number" bind:value={record.total_work_sus} />
    </div>
  
    <Button color="primary" on:click={guardarCambios}>Guardar cambios</Button>
    <Button color="secondary" class="ms-2" on:click={() => goto('/dana-erte-stats')}>Cancelar</Button>
  {:else}
    <p>Cargando registro...</p>
  {/if}