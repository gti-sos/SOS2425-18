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
        } catch {
            mensaje = "No se pudo cargar el contrato.";
            tipoMensaje = "danger";
        }
    }

    async function guardarCambios() {
        mensaje = "";
        try {
            const res = await fetch(`${API}/${year}/${month}/${prov_cod}/${mun_cod}/${sec_cod}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contrato)
            });

            if (res.ok) {
                mensaje = "Contrato actualizado correctamente.";
                tipoMensaje = "success";
                setTimeout(() => goto("/"), 1500);
            } else {
                mensaje = "Error al actualizar el contrato.";
                tipoMensaje = "danger";
            }
        } catch {
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

    <p>
        <label>Provincia<br />
            <Input bind:value={contrato.prov_name} />
        </label>
    </p>

    <p>
        <label>Municipio<br />
            <Input bind:value={contrato.mun_name} />
        </label>
    </p>

    <p>
        <label>Descripción del sector<br />
            <Input bind:value={contrato.sec_descr} />
        </label>
    </p>

    <p>
        <label>Número de contratos<br />
            <Input type="number" bind:value={contrato.num_contracts} />
        </label>
    </p>

    <p>
        <Button color="success" on:click={guardarCambios}>Guardar cambios</Button>
        <Button color="danger" class="ms-2" on:click={() => goto('/')}>Cancelar</Button>
    </p>
{:else}
    <p>Cargando contrato...</p>
{/if}
