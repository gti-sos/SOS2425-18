<script>
// @ts-nocheck


	import { onMount } from 'svelte';
	import { dev } from '$app/environment';

	let DEVEL_HOST = 'http://localhost:3000';
	let API = '/api/v2/dana-erte-stats/';
	if (dev) API = DEVEL_HOST + API;
	let MVRDatas = [];
	let result = '';
	let resultStatus = '';

  async function getData() {
    try {
      const res = await fetch(API);
      MVRDatas = await res.json();
      renderChart();
    } catch (err) {
      console.error(`ERROR: GET desde ${API}`, err);
    }
    console.log(`Esta es la API:`, MVRDatas);
  }

  function renderChart() {
    // 1️ Rango de fechas: de 10/2024 a 1/2025
    const start = new Date(2024, 9, 1);   // Octubre = mes 9
    const end   = new Date(2025, 1, 31);  // Enero = mes 0

    // 2️ Filtramos y ordenamos
    const filtered = MVRDatas
      .filter(d => {
        const date = new Date(d.request_year, d.request_month - 1);
        return date >= start && date <= end;
      })
      .sort((a, b) => {
        const da = new Date(a.request_year, a.request_month - 1);
        const db = new Date(b.request_year, b.request_month - 1);
        return da - db;
      });

    // 3️ Eje X: “10/2024”, “11/2024”, …, “1/2025”
    const categories = filtered.map(d => `${d.request_month}/${d.request_year}`);

    // 4️ Cada serie de datos
    const totalAll   = filtered.map(d => d.total_work_sus);
    const totalMen   = filtered.map(d => d.total_man_sus);
    const totalWomen = filtered.map(d => d.total_woman_sus);

    // 5️ Llamada a Highcharts con 3 líneas
    // @ts-ignore
    Highcharts.chart('container', {
        chart: {
        type: 'area'
    },
      title: {
        text: 'Evolución mensual de trabajadores',
        align: 'left'
      },
      subtitle: {
        text: 'De 10/2024 a 1/2025, desglosado por género',
        align: 'left'
      },
      yAxis: {
        title: {
          text: 'Número de empleados'
        }
      },
      xAxis: {
        categories,
        accessibility: {
          rangeDescription: `Rango: ${categories[0]} a ${categories[categories.length - 1]}`
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },
      plotOptions: {
        series: {
          label: { connectorAllowed: false }
        }
      },
      series: [
        { name: 'Total trabajadores',  data: totalAll   },
        { name: 'Hombres',              data: totalMen   },
        { name: 'Mujeres',              data: totalWomen }
      ],
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom'
            }
          }
        }]
      }
    });
  }

  onMount(getData);
</script>

<svelte:head>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/series-label.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>

<figure class="highcharts-figure">
  <div id="container"></div>
  <p class="highcharts-description">
    Gráfica de líneas: total, hombres y mujeres por mes (10/2024–1/2025).
  </p>
</figure>

<style>
	.highcharts-figure,
	.highcharts-data-table table {
		min-width: 360px;
		max-width: 800px;
		margin: 1em auto;
	}

	.highcharts-data-table table {
		font-family: Verdana, sans-serif;
		border-collapse: collapse;
		border: 1px solid #ebebeb;
		margin: 10px auto;
		text-align: center;
		width: 100%;
		max-width: 500px;
	}

	.highcharts-data-table caption {
		padding: 1em 0;
		font-size: 1.2em;
		color: #555;
	}

	.highcharts-data-table th {
		font-weight: 600;
		padding: 0.5em;
	}

	.highcharts-data-table td,
	.highcharts-data-table th,
	.highcharts-data-table caption {
		padding: 0.5em;
	}

	.highcharts-data-table thead tr,
	.highcharts-data-table tbody tr:nth-child(even) {
		background: #f8f8f8;
	}

	.highcharts-data-table tr:hover {
		background: #f1f7ff;
	}

	.highcharts-description {
		margin: 0.3rem 10px;
	}
</style>
