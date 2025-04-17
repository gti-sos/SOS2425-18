<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { Input, Button, Alert } from '@sveltestrap/sveltestrap';
    import { dev } from '$app/environment';
    import { get } from 'svelte/store';

    const DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v1/contr-mun-stats";
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

        if (!contrato.prov_name || !contrato.mun_name || !contrato.sec_descr || contrato.num_contracts === "" || contrato.num_contracts === null) {
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

    <label>Provincia</label>
    <Input bind:value={contrato.prov_name} />

    <label>Municipio</label>
    <Input bind:value={contrato.mun_name} />

    <label>Descripción del sector</label>
    <Input bind:value={contrato.sec_descr} />

    <label>Número de contratos</label>
    <Input type="number" bind:value={contrato.num_contracts} />

    <Button class="mt-3" color="primary" on:click={guardarCambios}>Guardar cambios</Button>
    <Button class="mt-3 ms-2" color="secondary" on:click={() => goto('/contr-mun-stats')}>Cancelar</Button>
{:else}
    <p>Cargando contrato...</p>
{/if}