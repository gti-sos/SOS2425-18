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
    let mensaje = "";
    let tipoMensaje = "success";
    
    // Filtros
    let filtroYear = "";
    let filtroMonth = "";
    let filtroProvCod = "";
    let filtroProvName = "";
    let filtroMunCod = "";
    let filtroMunName = "";
    let filtroSecCod = "";
    let filtroSecDescr = "";
    let filtroNumContracts = "";
    let filtroFrom = "";
    let filtroTo = "";
    let filtroLimit = "";
    let filtroOffset = "";
    
    // Nuevos contratos
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
        const params = [];

        if (filtroYear)         params.push(`year=${filtroYear}`);
        if (filtroMonth)        params.push(`month=${filtroMonth}`);
        if (filtroProvCod)      params.push(`prov_cod=${filtroProvCod}`);
        if (filtroProvName)     params.push(`prov_name=${encodeURIComponent(filtroProvName)}`);
        if (filtroMunCod)       params.push(`mun_cod=${filtroMunCod}`);
        if (filtroMunName)      params.push(`mun_name=${encodeURIComponent(filtroMunName)}`);
        if (filtroSecCod)       params.push(`sec_cod=${filtroSecCod}`);
        if (filtroSecDescr)     params.push(`sec_descr=${encodeURIComponent(filtroSecDescr)}`);
        if (filtroNumContracts) params.push(`num_contracts=${filtroNumContracts}`);
        if (filtroFrom)         params.push(`from=${filtroFrom}`);
        if (filtroTo)           params.push(`to=${filtroTo}`);
        if (filtroLimit)        params.push(`limit=${filtroLimit}`);
        if (filtroOffset)       params.push(`offset=${filtroOffset}`);

        let queryURL = url;
        if (params.length > 0) queryURL += "?" + params.join("&");

        try {
            const res = await fetch(queryURL);
            if (!res.ok) {
                mostrarError("Error al obtener los datos del servidor.");
                return;
            }

            const data = await res.json();
            contrs = data;

            // Si hay resultados, mostrar normalmente
            if (data.length > 0) return;

            // Si no hay resultados, vamos a analizar cuál filtro falla
            const resAll = await fetch(API); // sin filtros
            const allData = await resAll.json();

            if (filtroYear && !allData.some(d => d.year === Number(filtroYear))) {
                mostrarError(`No existen contratos en el año '${filtroYear}'.`);
            } else if (filtroMonth && !allData.some(d => d.month === Number(filtroMonth))) {
                mostrarError(`No existen contratos en el mes '${filtroMonth}'.`);
            } else if (filtroProvCod && !allData.some(d => d.prov_cod === Number(filtroProvCod))) {
                mostrarError(`No existen contratos con código de provincia '${filtroProvCod}'.`);
            } else if (filtroProvName && !allData.some(d => d.prov_name.toLowerCase() === filtroProvName.toLowerCase())) {
                mostrarError(`No existen contratos en la provincia '${filtroProvName}'.`);
            } else if (filtroMunCod && !allData.some(d => d.mun_cod === Number(filtroMunCod))) {
                mostrarError(`No existen contratos con código de municipio '${filtroMunCod}'.`);
            } else if (filtroMunName && !allData.some(d => d.mun_name.toLowerCase() === filtroMunName.toLowerCase())) {
                mostrarError(`No existen contratos en el municipio '${filtroMunName}'.`);
            } else if (filtroSecCod && !allData.some(d => d.sec_cod === filtroSecCod)) {
                mostrarError(`No existen contratos con código de sector '${filtroSecCod}'.`);
            } else if (filtroSecDescr && !allData.some(d => d.sec_descr.toLowerCase() === filtroSecDescr.toLowerCase())) {
                mostrarError(`No existen contratos con descripción de sector '${filtroSecDescr}'.`);
            } else if (filtroNumContracts && !allData.some(d => d.num_contracts === Number(filtroNumContracts))) {
                mostrarError(`No existen contratos con exactamente '${filtroNumContracts}' contratos.`);
            } else {
                mostrarError("No se encontraron resultados con los filtros aplicados.");
            }

        } catch {
            mostrarError("No se pudo conectar con el servidor.");
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
                limpiarFormulario();
                await getContr(); // primero recargamos los datos
                mostrarExito("Contrato creado correctamente."); // luego mostramos el mensaje
            } else if (res.status === 400) {
                mostrarError("Datos inválidos. Revisa los campos introducidos.");
            } else if (res.status === 409) {
                mostrarError("Ya existe un contrato con esos datos.");
            } else {
                mostrarError("No se pudo crear el contrato.");
            }
        } catch {
            mostrarError("Error al conectar con el servidor.");
        }
    }
    
    async function deleteContr() {
        mensaje = "";
        try {
            const res = await fetch(API, { method: "DELETE" });
            if (res.status === 200) {
                mostrarExito("Todos los contratos han sido eliminados.");
                contrs = [];
            } else {
                mostrarError("No se pudieron eliminar los contratos.");
            }
        } catch {
            mostrarError("Error al conectar con el servidor.");
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
            } else if (res.status === 404) {
                mostrarError("No existe un contrato con esos datos.");
            } else {
                mostrarError("Error al eliminar el contrato.");
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
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
    
    <!-- Búsqueda avanzada con todos los campos -->
<section class="mb-4">
    <h4>Buscar contratos</h4>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem;">
        <Input bind:value={filtroYear} type="number" placeholder="Año" />
        <Input bind:value={filtroMonth} type="number" placeholder="Mes" />
        <Input bind:value={filtroProvCod} type="number" placeholder="Código provincia" />
        <Input bind:value={filtroProvName} placeholder="Nombre provincia" />
        <Input bind:value={filtroMunCod} type="number" placeholder="Código municipio" />
        <Input bind:value={filtroMunName} placeholder="Nombre municipio" />
        <Input bind:value={filtroSecCod} placeholder="Código sector" />
        <Input bind:value={filtroSecDescr} placeholder="Descripción sector" />
        <Input bind:value={filtroNumContracts} type="number" placeholder="Contratos" />
        <Input bind:value={filtroFrom} type="number" placeholder="Desde año" />
        <Input bind:value={filtroTo} type="number" placeholder="Hasta año" />
        <Input bind:value={filtroLimit} type="number" placeholder="Límite de resultados" />
        <Input bind:value={filtroOffset} type="number" placeholder="Desplazamiento" />
        <Button on:click={getContr} color="info">Buscar</Button>
        <Button on:click={deleteContr} color="danger">Eliminar todos</Button>
    </div>
</section>
    
    <!-- Crear nuevo contrato -->
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
    
    <!-- Listado de contratos -->
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
    