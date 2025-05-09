<script>
	import { onMount, tick } from 'svelte';
	import Chart from 'chart.js/auto';

	let canvasMix;
	let container;
	let cargandoMix = true;
	let canvasBubble;
  let cargando = true;
	let cargandoBubble = true;
	let bubbleChart;
	let mixChart;
	let canvasTemp;
	const coords = {
		Valencia: { lat: 39.4699, lon: -0.3763 },
		Madrid: { lat: 40.4168, lon: -3.7038 },
		Alicante: { lat: 38.3452, lon: -0.481 },
		'Castellón de la Plana': { lat: 39.9831, lon: -0.0331 },
		'Cuart de Poblet': { lat: 39.0334, lon: -0.4334 },
		Benicarló: { lat: 40.4167, lon: 0.4333 },
		Zaragoza: { lat: 41.6488, lon: -0.8891 },
		'El Prat de Llobregat': { lat: 41.3275, lon: 2.094 },
		Leganés: { lat: 40.327, lon: -3.7635 },
		'Sant Cugat del Vallès': { lat: 41.4678, lon: 2.0833 },
		Almussafes: { lat: 39.2833, lon: -0.4167 },
		Castelldefels: { lat: 41.277, lon: 1.9706 },
		'Sant Feliu de Llobregat': { lat: 41.3833, lon: 2.05 },
		'Ribarroja del Turia': { lat: 39.55, lon: -0.5667 },
		'Cabanillas del Campo': { lat: 40.6383, lon: -3.2353 },
		Barcelona: { lat: 41.3851, lon: 2.1734 },
		Paterna: { lat: 39.5, lon: -0.4333 },
		Elche: { lat: 38.2699, lon: -0.7126 },
		Algemesí: { lat: 39.1833, lon: -0.4333 },
		Aldaya: { lat: 39.4667, lon: -0.4667 },
		'Pozuelo de Alarcón': { lat: 40.432, lon: -3.8136 },
		Albal: { lat: 39.3833, lon: -0.4167 },
		Redondela: { lat: 42.2833, lon: -8.6167 },
		Moncófar: { lat: 39.8, lon: -0.1333 },
		Torrent: { lat: 39.437, lon: -0.4656 },
		Peñíscola: { lat: 40.3581, lon: 0.4 },
		Málaga: { lat: 36.7213, lon: -4.4214 },
		Massanassa: { lat: 39.4, lon: -0.4167 },
		Picassent: { lat: 39.3667, lon: -0.45 },
		Meliana: { lat: 39.5333, lon: -0.3333 },
		Museros: { lat: 39.55, lon: -0.3333 },
		Náquera: { lat: 39.65, lon: -0.4167 },
		Bétera: { lat: 39.5833, lon: -0.4667 },
		Ibi: { lat: 38.6167, lon: -0.5667 },
		Almazora: { lat: 39.95, lon: -0.05 },
		Catarroja: { lat: 39.4, lon: -0.4167 }
	};
	let loading = true;
	/* referencias a los canvas ------------------------------------------------ */
	let canvasPop; // gráfico integración ERTE + Población

	/* banderas de carga ------------------------------------------------------- */
	let loadingPop = true;
	let containerTemp; // el <div> donde montaremos el chart
	let cargandoTemp = true;
	let containerFusion; // sustituye containerUniv+containerErte
	let cargandoFusion = true;
  

	onMount(async () => {
		/* ---------- G11 + Dana (Chart.js) ---------- */
		try {
			const data = await fetch('/api/v2/mix-autonomy-dana').then((r) => r.json());
			await tick(); // canvas montado
			const ctx = canvasMix.getContext('2d');

			mixChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: data.map((d) => d.comunidad),
					datasets: [
						{
							label: 'Solicitudes Dependencia',
							data: data.map((d) => d.solicitudes_dependencia),
							backgroundColor: 'rgba(255,159,64,.6)'
						},
						{
							label: 'Trabajadores ERTE',
							data: data.map((d) => d.total_trabajadores_ertes),
							backgroundColor: 'rgba(54,162,235,.6)'
						}
					]
				},
				options: { responsive: true }
			});
		} catch (e) {
			console.error('Error G11‑Dana:', e);
		} finally {
			cargandoMix = false;
		}

		/* ---------- G17 (Heatmap Highcharts) ------- */

		try {
			const H = window.Highcharts;
			if (!H) throw new Error('Highcharts no cargado');

			// 1) Traemos ambas APIs en paralelo
			const [univRaw, erteRaw] = await Promise.all([
				fetch('https://sos2425-17.onrender.com/api/v2/university-demands').then((r) => r.json()),
				fetch('https://sos2425-18.onrender.com/api/v2/dana-erte-stats').then((r) => r.json())
			]);

			// 2) Limpiamos
			const grads = univRaw.map((r) => ({
				loc: r.location,
				year: +r.academicYear,
				value: Number(r.graduated) || 0
			}));
			const ertes = erteRaw.map((r) => ({
				loc: r.company_municipality,
				year: +r.request_year,
				value: Number(r.total_work_sus)
			}));

			// 3) Categorías (limita top 10 municipios si quieres)
			const totByLoc = {};
			ertes.forEach((d) => (totByLoc[d.loc] = (totByLoc[d.loc] || 0) + d.value));
			const locs = Object.entries(totByLoc)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10)
				.map(([loc]) => loc);

			const years = [...new Set([...grads, ...ertes].map((d) => d.year))].sort();

			// 4) Montamos data[]
			const gradMap = {};
			grads.forEach((d) => (gradMap[`${d.loc}::${d.year}`] = d.value));

			const data = [];
			ertes.forEach((d) => {
				if (!locs.includes(d.loc)) return;
				const x = locs.indexOf(d.loc);
				const y = years.indexOf(d.year);
				const g = gradMap[`${d.loc}::${d.year}`] || 0;
				data.push({ x, y, z: d.value, value: g, loc: d.loc, year: d.year });
			});

			// 5) Pintamos el bubble+colorAxis
			await tick();
			H.chart(containerFusion, {
				chart: { type: 'bubble', plotBorderWidth: 1 },
				title: { text: 'Graduados vs ERTEs por municipio y año' },
				xAxis: {
					categories: locs,
					title: { text: 'Municipio' },
					labels: { rotation: -45 }
				},
				yAxis: {
					categories: years.map(String),
					title: { text: 'Año' }
				},
				colorAxis: {
					min: 0,
					max: Math.max(...data.map((p) => p.value)),
					minColor: '#EFEFFF',
					maxColor: H.getOptions().colors[0]
				},
				tooltip: {
					formatter() {
						return `<b>${this.point.loc}</b><br>
                  Año: <b>${this.point.year}</b><br>
                  ERTEs: <b>${this.point.z}</b><br>
                  Graduados: <b>${this.point.value}</b>`;
					}
				},
				series: [
					{
						name: 'ERTE vs Graduados',
						data,
						colorKey: 'value',
						marker: { lineColor: 'black', lineWidth: 1 },
						dataLabels: {
							enabled: true,
							formatter() {
								return this.point.z;
							}
						}
					}
				]
			});
		} catch (e) {
			console.error('Error fusión Graduados-ERTEs:', e);
		} finally {
			cargandoFusion = false;
		}
		try {
			// -------- G20 traffic-accidents ---------
			/* 1. Fetch y quedarnos solo con el último año -------------------- */
			const raw = await fetch('https://sos2425-20.onrender.com/api/v1/traffic-accidents').then(
				(r) => r.json()
			);

			const lastYear = Math.max(...raw.map((r) => Number(r.year)));
			const recent = raw.filter((r) => Number(r.year) === lastYear);

			/* 2. Preparamos dataset estilo BubbleChart.js -------------------- */
			const palette = [
				'#4dc9f6',
				'#f67019',
				'#f53794',
				'#537bc4',
				'#acc236',
				'#166a8f',
				'#00a950',
				'#58595b',
				'#8549ba',
				'#e6194b',
				'#3cb44b',
				'#ffe119',
				'#4363d8',
				'#f58231',
				'#911eb4',
				'#46f0f0',
				'#f032e6'
			];

			const dataSet = recent.map((r, idx) => ({
				label: r.autonomous_community,
				data: [
					{
						x: r.fatal_accidents,
						y: r.deceased,
						r: Math.max(4, r.vehicles_without_mot)
					}
				],
				backgroundColor: palette[idx % palette.length] + '80', // 50 % opacidad
				borderColor: palette[idx % palette.length],
				borderWidth: 1
			}));

			/* 3. Esperamos a que el canvas exista y pintamos ----------------- */
			await tick();
			const ctx = canvasBubble.getContext('2d');

			bubbleChart = new Chart(ctx, {
				type: 'bubble',
				data: { datasets: dataSet },
				options: {
					responsive: true,
					plugins: {
						title: {
							display: true,
							text: `Accidentes mortales ${lastYear} – G20`
						},
						tooltip: {
							callbacks: {
								label: (ctx) => {
									const { x, y, r } = ctx.raw;
									return [
										`Accidentes mortales : ${x}`,
										`Fallecidos          : ${y}`,
										`Vehíc. sin ITV      : ${r}`
									];
								}
							}
						}
					},
					scales: {
						x: {
							title: { display: true, text: 'Accidentes mortales' },
							beginAtZero: true
						},
						y: {
							title: { display: true, text: 'Fallecidos' },
							beginAtZero: true
						}
					}
				}
			});
		} catch (err) {
			console.error('Error G20:', err);
		} finally {
			cargandoBubble = false;
		}
		try {
			// ---------- G12 Annual Evolutions -----------

			/* 1 ‑ FETCH completa */
			const raw = await fetch('https://sos2425-12.onrender.com/api/v1/annual-evolutions').then(
				(r) => r.json()
			);

			/* 2 ‑ Último año disponible */
			const lastYear = Math.max(...raw.map((r) => +r.year));
			const recent = raw.filter((r) => +r.year === lastYear);

			/* 3 ‑ Agrupar energía vendida por tecnología */
			const byTech = {};
			recent.forEach((r) => {
				byTech[r.technology] = (byTech[r.technology] || 0) + +r.energy_sold;
			});

			const categories = Object.keys(byTech);
			const values = categories.map((k) => byTech[k]);

			/* 4 ‑ Pintar radar (Highcharts) */
			await tick(); // ①  Asegura que <div bind:this={container}> YA existe
			if (!container) throw new Error('container aún indefinido');
			console.log('container:', container); // debe mostrar <div …>
			console.log('Highcharts:', window.Highcharts); // ≠ undefined

			Highcharts.chart(container, {
				chart: { polar: true, type: 'area' },
				title: { text: `G12 – Energía vendida por tecnología (${lastYear})` },
				xAxis: { categories, tickmarkPlacement: 'on', lineWidth: 0 },
				yAxis: { gridLineInterpolation: 'polygon', min: 0, title: { text: 'GWh' } },
				tooltip: { pointFormat: '<b>{point.y:.1f} GWh</b>' },
				series: [
					{
						name: `Energía vendida ${lastYear} (GWh)`,
						data: values,
						pointPlacement: 'on',
						color: '#FF4DA6',
						fillOpacity: 0.35
					}
				]
			});
		} catch (err) {
			console.error('Error G12:', err);
		} finally {
			cargando = false;
		}
		try {
			// ---------- G15 ------------------

			const H = window.Highcharts;
			if (!H) throw new Error('Highcharts no cargado');

			// 1) Bajamos todos los datos de temperatura
			const raw = await fetch('/api/temps').then((r) => r.json());

			// 2) “Limpiamos” el array para quedarnos con lo que nos interesa
			//    province → fila, year → columna, average_temperature → valor
			const cleaned = raw.map((r) => ({
				prov: r.province,
				year: +r.year,
				temp: +r.average_temperature
			}));

			// 3) Calculamos listas únicas ordenadas de provincias y años
			const provinces = [...new Set(cleaned.map((d) => d.prov))].sort();
			const years = [...new Set(cleaned.map((d) => d.year))].sort();

			// 4) Montamos la matriz [x, y, value] que necesita Highcharts
			//    x = índice de provincia, y = índice de año
			const matrix = [];
			cleaned.forEach((d) => {
				const x = provinces.indexOf(d.prov);
				const y = years.indexOf(d.year);
				if (x > -1 && y > -1) {
					matrix.push([x, y, d.temp]);
				}
			});

			// 5) Esperamos a que exista el <div> en el DOM…
			await tick();

			// 6) Pintamos el heatmap
			// 6) Pintamos el treemap
			Highcharts.chart(containerTemp, {
				chart: { type: 'treemap', marginTop: 40, marginBottom: 80 },
				title: { text: 'Temperatura media por provincia y año (Treemap)' },
				tooltip: {
					formatter() {
						// los datos que inyectemos en point.options
						const { prov, year } = this.point.options;
						return `<b>${prov}</b><br>Año: <b>${year}</b><br>Temp media: <b>${this.point.value}°C</b>`;
					}
				},
				series: [
					{
						type: 'treemap',
						layoutAlgorithm: 'sliceAndDice',
						data: cleaned.map((d) => ({
							name: `${d.prov} ${d.year}`,
							value: d.temp,
							prov: d.prov, // inyectamos la provincia
							year: d.year // inyectamos el año
						})),
						dataLabels: {
							enabled: true,
							format: '{point.value}°C'
						}
					}
				]
			});
		} catch (e) {
			console.error('Error G-TempStats:', e);
		} finally {
			cargandoTemp = false;
		}

		try {
			// ---------- E1 Temperatura + Ertes ---------------

			/* 1. Descarga ERTEs 2024 (o filtra como quieras) */
			const erte = await fetch('/api/v2/dana-erte-stats?request_year=2024').then((r) => r.json());

			/* 2. Agrupa trabajadores por municipio */
			const byCity = {};
			erte.forEach((d) => {
				const city = d.company_municipality;
				byCity[city] = (byCity[city] || 0) + Number(d.total_work_sus);
			});

			/* 3. Selecciona las 5 ciudades con más ERTEs */
			const top = Object.entries(byCity)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5); // [ [city,cnt], … ]

			const labels = top.map(([city]) => city);
			const workers = top.map(([_, cnt]) => cnt);

			/* 4. Obtén temperatura actual de cada ciudad vía proxy */
			const temps = [];
			for (const city of labels) {
				const coord = coords[city];
				if (!coord) {
					temps.push(null);
					continue;
				}

				const q = `/weather-proxy/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current_weather=true`;
				const meteo = await fetch(q).then((r) => r.json());
				temps.push(meteo.current_weather.temperature);
			}

			/* 5. Dibuja gráfico combinado */
			await tick();
			new Chart(canvasTemp.getContext('2d'), {
				type: 'scatter',
				data: {
					datasets: [
						{
							label: 'ERTE (número trabajadores)',
							data: labels.map((city, i) => ({ x: city, y: workers[i] })),
							pointStyle: 'circle',
							pointRadius: 6
						},
						{
							label: 'Temperatura (°C)',
							data: labels.map((city, i) => ({ x: city, y: temps[i] })),
							pointStyle: 'triangle',
							pointRadius: 6
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						title: { display: true, text: 'E1 – ERTE vs Temp actual (scatter)' }
					},
					scales: {
						x: {
							type: 'category',
							labels: labels,
							title: { display: true, text: 'Ciudad' }
						},
						y: {
							title: { display: true, text: 'Valor' }
						}
					}
				}
			});
		} catch (e) {
			console.error('Error integración ERTE‑Tiempo:', e);
		} finally {
			loading = false;
		}
		try {
			// -------------- E2 DIVISA + ERTE -----------------

			/* 1. Descarga ERTE‑2024 de tu propia API */
			const erte = await fetch('/api/v2/dana-erte-stats?request_year=2024').then((r) => r.json());

			/* 2. Agrupa el nº de trabajadores suspendidos por municipio */
			const byCity = {};
			erte.forEach((d) => {
				const city = d.company_municipality;
				byCity[city] = (byCity[city] || 0) + Number(d.total_work_sus);
			});

			/* 3. Selecciona las 5 ciudades con más ERTEs */
			const top = Object.entries(byCity)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5); // [ [city, cnt], … ]

			const labels = top.map(([city]) => city); // ‑‑ eje X
			const workers = top.map(([_, cnt]) => cnt); // ‑‑ barras

			/* 4. Obtén el tipo de cambio EUR→USD (API externa, sin proxy) */
			const fx = await fetch('https://open.er-api.com/v6/latest/EUR').then((r) => r.json());
			const eurUsd = fx.rates.USD; // <‑‑ integración

			/* 5. Convierte cada valor de ERTE a “coste” en USD              */
			const costUSD = workers.map((cnt) => +(cnt * eurUsd).toFixed(2));

			/* 6. Dibuja el gráfico combinado                               */
			await tick(); // canvas listo
			c3.generate({
				bindto: '#chart-erte-usd',
				data: {
					columns: [
						['ERTE', ...workers],
						['Coste USD', ...costUSD]
					],
					type: 'bar',
					groups: [['ERTE', 'Coste USD']] // para barras apiladas; quita si prefieres barras lado a lado
				},
				axis: {
					x: {
						type: 'category',
						categories: labels,
						tick: { rotate: -45, multiline: false }
					},
					y: { label: 'Valor' }
				},
				title: {
					text: 'E2 – ERTE vs Tipo de cambio EUR (C3.js bar)'
				}
			});
		} catch (e) {
			console.error('Error integración ERTE‑FX:', e);
		} finally {
			loading = false;
		}
		try {
			// ------------------- POBLACIONES y ERTES ---------------------

			/* 1 ‑ Descarga ERTE 2024 (tu API) **************************************** */
			const erte = await fetch('/api/v2/dana-erte-stats?request_year=2024').then((r) => r.json());

			/* 2 ‑ Agrupa nº de suspensiones por municipio **************************** */
			const byCity = {};
			erte.forEach((r) => {
				const city = r.company_municipality;
				byCity[city] = (byCity[city] || 0) + +r.total_work_sus;
			});

			/* 3 ‑ Top 5 ciudades con más ERTE **************************************** */
			const top5 = Object.entries(byCity)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5); // [ [city, total], … ]

			const labels = top5.map(([city]) => city);
			const workers = top5.map(([_, tot]) => tot);

			/* 4 ‑ Para cada ciudad → población (API GeoNames‑OpenDataSoft) *********** */
			const pops = [];
			for (const city of labels) {
				const encoded = encodeURIComponent(city);
				const url =
					`https://public.opendatasoft.com/api/records/1.0/search/?` +
					`dataset=geonames-all-cities-with-a-population-1000` +
					`&q=${encoded}&rows=1`;

				const res = await fetch(url).then((r) => r.json());
				const pop = res.records?.[0]?.fields?.population ?? null; // puede no existir
				pops.push(pop);
			}

			/* 5 ‑ Ratio ERTE / población (·1000 para valores > 0) ******************** */
			const ratios = pops.map((pop, i) => (pop ? (workers[i] * 1000) / pop : 0));

			/* 6 ‑ Gráfico P O L A R  A R E A  (Ratio) ******************************** */
			await tick(); // asegúrate de que <canvas> existe

			/* colores pastel aleatorios para las 5 secciones */
			const colors = ['#4dabf7', '#ff6b6b', '#ffd43b', '#9775fa', '#51cf66'];
			const ctx = canvasPop.getContext('2d');
			new Chart(ctx, {
				type: 'polarArea',
				data: {
					labels,
					datasets: [
						{
							label: 'Trabajadores ERTE por cada 1 000 hab.',
							data: ratios,
							backgroundColor: colors
						}
					]
				},
				options: {
					responsive: true,
					plugins: {
						title: {
							display: true,
							text: 'E3 – ERTE (2024) vs población de la ciudad'
						},
						tooltip: {
							callbacks: {
								afterLabel: (ctx) => `Población: ${pops[ctx.dataIndex]?.toLocaleString() || '¿?'}`
							}
						}
					},
					scales: {
						r: { ticks: { backdropColor: 'transparent' } }
					}
				}
			});
		} catch (e) {
			console.error('Error E3 (ERTE + GeoNames):', e);
		} finally {
			loadingPop = false;
		}
	});
</script>

<svelte:head>
	<script src="https://code.highcharts.com/highcharts.js"></script>
	<script src="https://code.highcharts.com/modules/heatmap.js"></script>
	<script src="https://code.highcharts.com/highcharts-more.js"></script>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css" rel="stylesheet" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>
	<script src="https://code.highcharts.com/modules/treemap.js"></script>

	<!-- para polar/area -->
</svelte:head>

<p>Comprobando si esta página se carga…</p>

<section>
	<h2>Gráfica integrada G11 + Dana</h2>
	{#if cargandoMix}<p>Cargando…</p>{/if}
	<div style="max-width:800px;height:400px;margin:auto">
		<canvas bind:this={canvasMix}></canvas>
	</div>
</section>

<section>
	<h2>Graduados vs ERTEs por municipio y año</h2>
	{#if cargandoFusion}
		<p>Cargando datos…</p>
	{/if}
	<div bind:this={containerFusion} style="max-width:900px; height:450px; margin:auto"></div>
</section>

<section>
  <h2>G20 – Accidentes (Bubble)</h2>
  <div style="max-width:850px;height:500px;margin:auto">
    <!-- 1. El canvas SIEMPRE existe -->
    <canvas bind:this={canvasBubble}></canvas>
    <!-- 2. Solo mostramos el texto de carga mientras cargamos -->
    {#if cargandoBubble}
      <p style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)">
        Cargando datos…
      </p>
    {/if}
  </div>
</section>

<section>
  <h2>G12 – Annual Evolutions</h2>
  <div style="max-width:750px;height:500px;margin:auto;position:relative">
    <div bind:this={container} style="width:100%;height:100%"></div>
    {#if cargando}
      <p style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">
        Cargando datos…
      </p>
    {/if}
  </div>
</section>

<section>
	<h2>G-TempStats – Temperatura media por año y provincia</h2>
	{#if cargandoTemp}
		<p>Cargando datos…</p>
	{/if}
	<div bind:this={containerTemp} style="max-width:800px;height:500px;margin:auto"></div>
</section>

<section>
	<h2>E1 - Integración ERTE + Temperatura actual</h2>
	<div style="max-width:800px;height:450px;margin:auto">
		<canvas bind:this={canvasTemp}></canvas>
	</div>
	{#if loading}
		<p style="text-align:center">Cargando datos…</p>
	{/if}
</section>
<section>
	<h2>E2 – ERTE vs Tipo de cambio EUR (C3.js bar)</h2>
	{#if loading}
		<p>Cargando datos…</p>
	{/if}
	<div id="chart-erte-usd" style="max-width:700px; height:450px; margin:auto"></div>
</section>
<section>
	<h2>E3 – ERTE + Población (GeoDB / GeoNames)</h2>

	<div style="max-width:700px;height:450px;margin:auto">
		{#if loadingPop}
			<p>Cargando datos…</p>
		{/if}
		<canvas bind:this={canvasPop}></canvas>
	</div>
</section>



<style>
	canvas {
		width: 100% !important;
		height: 100% !important;
		background: #fafafa;
		border: 1px solid #ccc;
	}
</style>
