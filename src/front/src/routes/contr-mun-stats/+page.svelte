<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { Button, Alert, Input } from '@sveltestrap/sveltestrap';
    import { goto } from "$app/navigation";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v1/contr-mun-stats";
    if (dev) API = DEVEL_HOST + API;

    let contrs = [];
    let filtro = "";
    let mensaje = "";
    let tipoMensaje = "success";

    let newContrYear = "";
    let newContrMonth = "";
    let newContrProv_cod = "";
    let newContrProv_name = "";
    let newContrMun_cod = "";
    let newContrMun_name = "";
    let newContrSec_cod = "";
    let newContrSec_descr = "";
    let newContrNum_contracts = "";

    function limpiarFormulario() {
        newContrYear = "";
        newContrMonth = "";
        newContrProv_cod = "";
        newContrProv_name = "";
        newContrMun_cod = "";
        newContrMun_name = "";
        newContrSec_cod = "";
        newContrSec_descr = "";
        newContrNum_contracts = "";
    }

    function mostrarExito(msg) {
        mensaje = msg;
        tipoMensaje = "success";
    }

    function mostrarError(msg) {
        mensaje = msg;
        tipoMensaje = "danger";
    }

    async function getContr() {
        mensaje = "";
        let url = API;
        if (filtro.trim()) {
            url += `?mun_name=${encodeURIComponent(filtro.trim())}`; // <-- Cambiado aquí
        }
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error al obtener los datos.");
            contrs = await res.json();
        } catch (error) {
            mostrarError("No se pudieron cargar los datos.");
        }
    }

    async function createContr() {
        mensaje = "";
        if (
            !newContrYear || !newContrMonth || !newContrProv_cod || !newContrProv_name ||
            !newContrMun_cod || !newContrMun_name || !newContrSec_cod || !newContrSec_descr ||
            !newContrNum_contracts
        ) {
            mostrarError("Por favor, completa todos los campos.");
            return;
        }

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: Number(newContrYear),
                    month: Number(newContrMonth),
                    prov_cod: Number(newContrProv_cod),
                    prov_name: newContrProv_name,
                    mun_cod: Number(newContrMun_cod),
                    mun_name: newContrMun_name,
                    sec_cod: newContrSec_cod,
                    sec_descr: newContrSec_descr,
                    num_contracts: Number(newContrNum_contracts)
                })
            });

            if (res.status === 201) {
                mostrarExito("Contrato creado correctamente.");
                limpiarFormulario();
                getContr();
            } else if (res.status === 409) {
                mostrarError("Ya existe un contrato con esos datos.");
            } else {
                mostrarError("Error al crear el contrato.");
            }
        } catch (error) {
            mostrarError("No se pudo crear el contrato.");
        }
    }

    async function deleteContr() {
        mensaje = "";
        try {
            const res = await fetch(API, { method: "DELETE" });
            if (res.status === 200) {
                mostrarExito("Todos los contratos han sido eliminados.");
                getContr();
                limpiarFormulario();
            } else {
                mostrarError("Error al eliminar todos los contratos.");
            }
        } catch {
            mostrarError("No se pudo eliminar la información.");
        }
    }

    async function deleteOneContr(contr) {
        mensaje = "";
        try {
            const res = await fetch(`${API}/${contr.year}/${contr.month}/${contr.prov_cod}/${contr.mun_cod}/${contr.sec_cod}`, {
                method: "DELETE"
            });
            if (res.status === 200) {
                mostrarExito("Contrato eliminado correctamente.");
                getContr();
            } else {
                mostrarError("Error al eliminar el contrato.");
            }
        } catch (error) {
            mostrarError("No se pudo eliminar el contrato.");
        }
    }

    function editarContr(contr) {
        goto(`/contr-mun-stats/editar/${contr.year}/${contr.month}/${contr.prov_cod}/${contr.mun_cod}/${contr.sec_cod}`);
    }

    onMount(getContr);
</script>

<h2 class="mb-4">Contrataciones por municipio</h2>

{#if mensaje}
    <Alert color={tipoMensaje}>{mensaje}</Alert>
{/if}

<!-- 🔍 Búsqueda por municipio -->
<section class="mb-4">
    <label><strong>Filtrar por nombre de municipio</strong></label>
    <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
        <Input bind:value={filtro} placeholder="Ej: València" />
        <Button on:click={getContr} color="info">Buscar</Button>
        <Button on:click={deleteContr} color="danger">Eliminar todos</Button>
    </div>
</section>

<!-- ➕ Crear nuevo contrato -->
<section class="mb-4">
    <h4>Añadir nuevo contrato</h4>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem;">
        <Input bind:value={newContrYear} placeholder="Año" />
        <Input bind:value={newContrMonth} placeholder="Mes" />
        <Input bind:value={newContrProv_cod} placeholder="Código provincia" />
        <Input bind:value={newContrProv_name} placeholder="Nombre provincia" />
        <Input bind:value={newContrMun_cod} placeholder="Código municipio" />
        <Input bind:value={newContrMun_name} placeholder="Nombre municipio" />
        <Input bind:value={newContrSec_cod} placeholder="Código sector" />
        <Input bind:value={newContrSec_descr} placeholder="Descripción sector" />
        <Input bind:value={newContrNum_contracts} placeholder="Contratos" />
        <Button on:click={createContr} color="success">Crear</Button>
    </div>
</section>

<!-- 📋 Listado -->
<section>
    <h4>Listado de contratos</h4>
    <table class="table table-sm table-bordered mt-2">
        <thead class="table-light">
            <tr>
                <th>Año</th>
                <th>Mes</th>
                <th>Cód. Provincia</th>
                <th>Provincia</th>
                <th>Cód. Municipio</th>
                <th>Municipio</th>
                <th>Cód. Sector</th>
                <th>Sector</th>
                <th>Contratos</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each contrs as contr}
                <tr>
                    <td>{contr.year}</td>
                    <td>{contr.month}</td>
                    <td>{contr.prov_cod}</td>
                    <td>{contr.prov_name}</td>
                    <td>{contr.mun_cod}</td>
                    <td>{contr.mun_name}</td>
                    <td>{contr.sec_cod}</td>
                    <td>{contr.sec_descr}</td>
                    <td>{contr.num_contracts}</td>
                    <td>
                        <Button size="sm" color="warning" on:click={() => editarContr(contr)}>Editar</Button>
                        <Button size="sm" color="danger" class="ms-1" on:click={() => deleteOneContr(contr)}>Borrar</Button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
