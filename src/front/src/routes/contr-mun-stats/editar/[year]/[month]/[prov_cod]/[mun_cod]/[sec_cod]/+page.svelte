<script lang="ts">
    // @ts-nocheck
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Input, Button, Alert } from '@sveltestrap/sveltestrap';
    import { dev } from '$app/environment';
    import { get } from 'svelte/store';

    const DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/contr-mun-stats";
    if (dev) API = DEVEL_HOST + API;

    let contrato = null;
    let mensaje = "";
    let tipoMensaje = "success";

    const params = get(page).params;
    const { year, month, prov_cod, mun_cod, sec_cod } = params;

    async function cargarContrato() {
        mensaje = "";
        try {
            const res = await fetch(`${API}/${year}/${month}/${prov_cod}/${mun_cod}/${sec_cod}`);
            if (!res.ok) throw new Error("No encontrado");
            contrato = await res.json();
        } catch (err) {
            mensaje = "No se pudo cargar el contrato.";
            tipoMensaje = "danger";
        }
    }

    async function guardarCambios() {
        mensaje = "";

        if (!contrato.year || !contrato.month || !contrato.prov_cod || !contrato.prov_name ||
            !contrato.mun_cod || !contrato.mun_name || !contrato.sec_cod || !contrato.sec_descr ||
            !contrato.num_contracts) {
            mensaje = "Todos los campos son obligatorios.";
            tipoMensaje = "danger";
            return;
        }

        try {
            const res = await fetch(`${API}/${year}/${month}/${prov_cod}/${mun_cod}/${sec_cod}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(contrato)
            });

            if (res.ok) {
                mensaje = "Contrato actualizado correctamente.";
                tipoMensaje = "success";
                setTimeout(() => goto("/contr-mun-stats"), 1500);
            } else {
                mensaje = "Error al actualizar el contrato.";
                tipoMensaje = "danger";
            }
        } catch (error) {
            mensaje = "No se pudo conectar con el servidor.";
            tipoMensaje = "danger";
        }
    }

    onMount(cargarContrato);
</script>

{#if mensaje}
    <Alert color={tipoMensaje}>{mensaje}</Alert>
{/if}

{#if contrato}
    <h2>Editar Contrato</h2>

    <label for="year">Año</label>
    <Input id="year" type="number" bind:value={contrato.year} />

    <label for="month">Mes</label>
    <Input id="month" type="number" bind:value={contrato.month} />

    <label for="prov_cod">Código de provincia</label>
    <Input id="prov_cod" type="number" bind:value={contrato.prov_cod} />

    <label for="prov_name">Nombre de provincia</label>
    <Input id="prov_name" bind:value={contrato.prov_name} />

    <label for="mun_cod">Código de municipio</label>
    <Input id="mun_cod" type="number" bind:value={contrato.mun_cod} />

    <label for="mun_name">Nombre de municipio</label>
    <Input id="mun_name" bind:value={contrato.mun_name} />

    <label for="sec_cod">Código de sector</label>
    <Input id="sec_cod" bind:value={contrato.sec_cod} />

    <label for="sec_descr">Descripción del sector</label>
    <Input id="sec_descr" bind:value={contrato.sec_descr} />

    <label for="num_contracts">Número de contratos</label>
    <Input id="num_contracts" type="number" bind:value={contrato.num_contracts} />

    <Button class="mt-3" color="primary" on:click={guardarCambios}>Guardar cambios</Button>
    <Button class="mt-3 ms-2" color="secondary" on:click={() => goto('/contr-mun-stats')}>Cancelar</Button>
{:else}
    <p>Cargando contrato...</p>
{/if}
