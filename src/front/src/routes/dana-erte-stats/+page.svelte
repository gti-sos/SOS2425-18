<script>
	// @ts-nocheck
	import { Button, Alert, Input, Table } from '@sveltestrap/sveltestrap';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { goto } from '$app/navigation';

	let DEVEL_HOST = 'http://localhost:3000';
	let API = '/api/v1/dana-erte-stats';
	if (dev) API = DEVEL_HOST + API;

	let MVRDatas = [];
	let result = '';
	let resultStatus = '';
	let newMonth;
	let newYear;
	let newMunicipality;
	let newCnaeDescr;
	let newWorkCenter;
	let newSector;
	let newTotalWorkers;
	let filtroMonth = '';
	let filtroYear = '';
	let filtroMunicipality = '';
	let filtroSector = '';
	let filtroCnaeDescr = '';
	let filtroWorkCenter = '';
	let filtroWorkerTot = '';
	let filtroFrom = '';
	let filtroTo = '';
	let mensaje = '';
	let tipoMensaje = 'success'; // o "warning" para advertencias

	async function getData() {
		mensaje = '';
		resultStatus = result = '';

		// 1) Creamos un array de parámetros
		const params = [];
		if (filtroMonth) params.push(`request_month=${filtroMonth}`);
		if (filtroYear) params.push(`request_year=${filtroYear}`);
		if (filtroMunicipality)
			params.push(`company_municipality=${encodeURIComponent(filtroMunicipality)}`);
		if (filtroCnaeDescr) params.push(`cnae_descr=${encodeURIComponent(filtroCnaeDescr)}`);
		if (filtroWorkCenter)
			params.push(`work_center_locality=${encodeURIComponent(filtroWorkCenter)}`);
		if (filtroSector) params.push(`sector=${encodeURIComponent(filtroSector)}`);
		if (filtroWorkerTot) params.push(`total_work_sus=${filtroWorkerTot}`);
		// NOTA: si tu backend ya admite from/to, mantenlos aquí; sino omítelos
		if (filtroFrom) params.push(`from=${filtroFrom}`);
		if (filtroTo) params.push(`to=${filtroTo}`);
		console.log('filtroYear:', filtroYear, 'params antes:', params);
		// 2) Montamos la URL final
		const url = params.length ? `${API}?${params.join('&')}` : API;

		// 3) Hacemos el fetch y obtenemos el JSON
		let data;
		try {
			const res = await fetch(url);
			resultStatus = res.status;
			if (!res.ok) {
				mensaje = 'Error al obtener datos';
				tipoMensaje = 'danger';
				console.error(`Error HTTP ${res.status}`);
				MVRDatas = [];
				return;
			}
			data = await res.json();
			result = JSON.stringify(data, null, 2);
		} catch (err) {
			console.error(`ERROR fetching ${url}:`, err);
			mensaje = 'No se pudo conectar con el servidor.';
			tipoMensaje = 'danger';
			MVRDatas = [];
			return;
		}

		// 4) Si el backend NO soporta from/to, filtramos aquí:
		const from = filtroFrom ? Number(filtroFrom) : null;
		const to = filtroTo ? Number(filtroTo) : null;

		if (from !== null || to !== null) {
			MVRDatas = data.filter((item) => {
				const yr = Number(item.request_year);
				if (from !== null && yr < from) return false;
				if (to !== null && yr > to) return false;
				return true;
			});
		} else {
			// Si no filtramos por rango, mostramos todos
			MVRDatas = data;
		}
		// 2) Si hay resultados, muéstralos y limpia mensaje
		if (data.length > 0) {
			MVRDatas = data;
			mensaje = '';
			return;
		}
		// 3) Sólo si no hay resultados Y hay filtros, diagnostica cuál falla
		if (params.length > 0) {
			// 3.1) Carga todos los datos sin filtros
			let allData = [];
			try {
				const resAll = await fetch(API);
				allData = resAll.ok ? await resAll.json() : [];
			} catch {
				// si ni siquiera allData, aviso genérico
				mensaje = 'No existen datos con esos filtros.';
				tipoMensaje = 'warning';
				MVRDatas = [];
				return;
			}

			// 3.2) Comprueba cada filtro, en el orden que quieras
			if (
				filtroMunicipality &&
				!allData.some(
					(d) => d.company_municipality.toLowerCase() === filtroMunicipality.toLowerCase()
				)
			) {
				mensaje = `No existe ningún municipio '${filtroMunicipality}'.`;
				tipoMensaje = 'warning';
			} else if (filtroYear && !allData.some((d) => d.request_year === Number(filtroYear))) {
				mensaje = `No existen datos para el año '${filtroYear}'.`;
				tipoMensaje = 'warning';
			} else if (filtroMonth && !allData.some((d) => d.request_month === Number(filtroMonth))) {
				mensaje = `No existen datos para el mes '${filtroMonth}'.`;
				tipoMensaje = 'warning';
			} else if (
				filtroCnaeDescr &&
				!allData.some((d) => d.cnae_descr.toLowerCase() === filtroCnaeDescr.toLowerCase())
			) {
				mensaje = `No existen datos para la descripción ${filtroCnaeDescr}.`;
				tipoMensaje = 'warning';
			} else if (
				filtroSector &&
				!allData.some((d) => d.sector.toLowerCase() === filtroSector.toLowerCase())
			) {
				mensaje = `No existen datos para el sector ${filtroSector}.`;
				tipoMensaje = 'warning';
			} else if (
				filtroWorkCenter &&
				!allData.some(
					(d) => d.work_center_locality.toLowerCase() === filtroWorkCenter.toLowerCase()
				)
			) {
				mensaje = `No existen datos para la localidad ${filtroWorkCenter}.`;
				tipoMensaje = 'warning';
			} else if (
				filtroWorkerTot &&
				!allData.some((d) => d.total_work_sus === Number(filtroWorkerTot))
			) {
				mensaje = `No existen datos para el numero '${filtroWorkerTot}' de trabajadores.`;
				tipoMensaje = 'warning';
			} else {
				// si todos los filtros existen en some registro pero no juntos:
				mensaje = 'No se encontraron registros que cumplan todos los filtros.';
				tipoMensaje = 'warning';
			}

			MVRDatas = []; // tabla vacía al haber error
			return;
		}

		// 4) Si no había filtros y data.length === 0: no hay nada en la BD
		mensaje = 'No hay registros disponibles.';
		tipoMensaje = 'warning';
		MVRDatas = [];
	}

	async function deleteData(company_municipality, request_year, request_month) {
		resultStatus = result = '';
		try {
			const res = await fetch(
				`${API}/${encodeURIComponent(company_municipality)}/${request_year}/${request_month}`,
				{ method: 'DELETE' }
			);
			resultStatus = res.status;

			if (res.ok) {
				await getData();
				mensaje = 'Registro eliminado correctamente.';
				tipoMensaje = 'success';
			} else {
				mensaje = 'Error al borrar el registro.';
				tipoMensaje = 'danger';
			}
		} catch (err) {
			mensaje = 'Error de conexión al borrar registro.';
			tipoMensaje = 'danger';
		}
	}
	async function deleteDatas() {
		resultStatus = result = '';
		try {
			const res = await fetch(API, { method: 'DELETE' });
			resultStatus = res.status;
			if (res.ok) {
				await getData();
				mensaje = 'Base de datos eliminada correctamente.';
				tipoMensaje = 'success';
			} else {
				mensaje = 'Error al borrar la base de datos.';
				tipoMensaje = 'danger';
			}
		} catch (error) {
			mensaje = 'Error de conexión al borrar la base de datos.';
			tipoMensaje = 'danger';
		}
	}
	async function createData() {
		resultStatus = result = '';
		const fields = [
			newMonth,
			newYear,
			newCnaeDescr,
			newMunicipality,
			newWorkCenter,
			newSector,
			newTotalWorkers
		];
		if (fields.some((v) => v === undefined || v === null || `${v}`.trim() === '')) {
			resultStatus = 400;
			return;
		}
		try {
			const res = await fetch(API, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					request_month: Number(newMonth),
					request_year: Number(newYear),
					cnae_descr: newCnaeDescr,
					company_municipality: newMunicipality,
					work_center_locality: newWorkCenter,
					sector: newSector,
					total_work_sus: Number(newTotalWorkers)
				})
			});
			const status = await res.status;
			resultStatus = status;
			if (status == 201) {
				console.log(`Data created: \n${JSON.stringify(MVRDatas, null, 2)}`);
				getData();
			} else {
				console.log(`ERROR creating data: status received ${status}`);
			}
		} catch (error) {
			console.log(`ERROR: GET from ${API}: ${error}`);
		}
	}
	onMount(async () => {
		getData();
	});
</script>

<svelte:head>
	<title>Ertes de la Dana</title>
</svelte:head>

<section class="mb-4">
	{#if mensaje}
		<Alert color={tipoMensaje} class="mb-3">{mensaje}</Alert>
	{/if}

	<h4>Búsqueda avanzada</h4>
	<div class="d-flex gap-2 align-items-end flex-wrap">
		<Input type="number" placeholder="Mes" bind:value={filtroMonth} />
		<Input type="number" placeholder="Año" bind:value={filtroYear} />
		<Input placeholder="Municipio" bind:value={filtroMunicipality} />
		<Input placeholder="Sector" bind:value={filtroSector} />
		<Input placeholder="Descripción" bind:value={filtroCnaeDescr} />
		<Input placeholder="Localidad" bind:value={filtroWorkCenter} />
		<Input type="number" placeholder="Trabajadores" bind:value={filtroWorkerTot} />
		<Input bind:value={filtroFrom} type="number" placeholder="Desde año" />
		<Input bind:value={filtroTo} type="number" placeholder="Hasta año" />

		<Button color="info" on:click={getData}>Buscar</Button>
		<Button
			color="secondary"
			on:click={() => {
				filtroMonth =
					filtroYear =
					filtroMunicipality =
					filtroSector =
					filtroCnaeDescr =
					filtroWorkCenter =
					filtroWorkerTot =
					filtroFrom =
					filtroTo =
						'';
				getData();
			}}
		>
			Limpiar filtros
		</Button>
	</div>
</section>

<h3>Formulario de creación</h3>

<Table class="table-sm table-bordered small custom-table">
	<thead>
		<tr>
			<th>Mes</th>
			<th>Año</th>
			<th>Descripción de cnae</th>
			<th>Municipio</th>
			<th>Localidad</th>
			<th>Sector</th>
			<th>Trabajadores totales</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><input placeholder="Mes" bind:value={newMonth} /></td>
			<td><input placeholder="Año" bind:value={newYear} /></td>
			<td><input placeholder="Descripción de cnae" bind:value={newCnaeDescr} /></td>
			<td><input placeholder="Municipio" bind:value={newMunicipality} /></td>
			<td><input placeholder="Localidad" bind:value={newWorkCenter} /></td>
			<td><input placeholder="Sector" bind:value={newSector} /></td>
			<td><input placeholder="Trabajadores totales" bind:value={newTotalWorkers} /></td>
			<td>
				<Button color="secondary" on:click={createData}>Crear</Button>
			</td>
		</tr>
		<tr>
			<td colspan="8">
				{#if resultStatus === 201 || resultStatus === 200}
					<p class="text-success">Dato creado correctamente</p>
				{:else if resultStatus && resultStatus === 400}
					<p class="text-danger">Error al crear el dato (faltan campos existentes)</p>
				{:else if resultStatus === 409}
					<p class="text-danger">Dato ya existente</p>
				{/if}
			</td>
		</tr>
	</tbody>
</Table>

<h3>Listado de la base de datos</h3>

<Table class="table-sm table-bordered small custom-table">
	<thead>
		<tr>
			<th>Mes</th>
			<th>Año</th>
			<th>Descripción de cnae</th>
			<th>Municipio</th>
			<th>Localidad</th>
			<th>Sector</th>
			<th>Trabajadores totales</th>
		</tr>
	</thead>
	<tbody>
		{#each MVRDatas as MVRData}
			<tr>
				<td>{MVRData.request_month}</td>
				<td>{MVRData.request_year}</td>
				<td>{MVRData.cnae_descr}</td>
				<td>{MVRData.company_municipality}</td>
				<td>{MVRData.work_center_locality}</td>
				<td>{MVRData.sector}</td>
				<td>{MVRData.total_work_sus}</td>
				<td>
					<Button
						size="sm"
						color="warning"
						on:click={() =>
							goto(
								`/dana-erte-stats/editar/` +
									`${encodeURIComponent(MVRData.company_municipality)}/` +
									`${MVRData.request_year}/` +
									`${MVRData.request_month}`
							)}
					>
						Editar
					</Button>
				</td>
				<td>
					<Button
						color="danger"
						size="sm"
						on:click={() =>
							deleteData(MVRData.company_municipality, MVRData.request_year, MVRData.request_month)}
					>
						Borrar
					</Button>
				</td>
			</tr>
		{/each}
	</tbody>
	<td>
		<Button color="danger" on:click={() => deleteDatas()}>Borrar base de datos</Button>
	</td>
</Table>
