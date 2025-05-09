<script>
    import { onMount } from 'svelte';
  
    let loadingCombined = true;
    let containerChart;
  
    onMount(async () => {
      try {
        // 1. Descarga paralela de las tres APIs
        const [contractsRaw, erteRaw, grantsRaw] = await Promise.all([
          fetch('/api/v2/contr-mun-stats').then(r => r.json()),
          fetch('/api/v2/dana-erte-stats').then(r => r.json()),
          fetch('/api/v2/dana-grants-subsidies-stats/All').then(r => r.json())
        ]);
  
        // 2. Agrupación por año-mes
        const byContracts = {};
        contractsRaw.forEach(d => {
          if (d.year && d.month != null) {
            const key = `${d.year}-${String(d.month).padStart(2,'0')}`;
            byContracts[key] = (byContracts[key] || 0) + d.num_contracts;
          }
        });
  
        const byErte = {};
        erteRaw.forEach(d => {
          if (d.request_year && d.request_month != null) {
            const key = `${d.request_year}-${String(d.request_month).padStart(2,'0')}`;
            byErte[key] = (byErte[key] || 0) + Number(d.total_work_sus);
          }
        });
  
        const byGrants = {};
        grantsRaw.forEach(d => {
          if (d.year && d.month != null) {
            const key = `${d.year}-${String(d.month).padStart(2,'0')}`;
            byGrants[key] = (byGrants[key] || 0) + 1; // contar solicitudes
          }
        });
  
        // 3. Define el rango fijo de meses
        const months = ["2024-10","2024-11","2024-12","2025-01"];
        // 4. Filtra solo los meses con al menos un dato
        const categories = months.filter(key =>
          (byContracts[key] || 0) > 0 ||
          (byErte[key]      || 0) > 0 ||
          (byGrants[key]    || 0) > 0
        );
  
        // 5. Prepara los arrays de datos
        const contractsData = categories.map(k => byContracts[k] || 0);
        const erteData      = categories.map(k => byErte[k]      || 0);
        const grantsData    = categories.map(k => byGrants[k]    || 0);
  
        // 6. Renderiza el gráfico
        Highcharts.chart(containerChart, {
          title: { text: 'E4 – Contratos vs ERTEs vs Solicitudes de Subvención' },
          xAxis: {
            categories,
            title: { text: 'Periodo (YYYY-MM)' }
          },
          yAxis: {
            title: { text: 'Número' }
          },
          tooltip: {
            shared: true,
            headerFormat: '<b>{point.key}</b><br/>'
          },
          plotOptions: {
            series: { borderRadius: '25%' }
          },
          series: [
            {
              type: 'column',
              name: 'Contratos',
              data: contractsData
            },
            {
              type: 'column',
              name: 'ERTE',
              data: erteData
            },
            {
              type: 'line',
              name: 'Solicitudes subvención',
              data: grantsData,
              marker: {
                lineWidth: 2,
                lineColor: Highcharts.getOptions().colors[2],
                fillColor: 'white'
              }
            },
            {
              type: 'pie',
              name: 'Totales',
              data: [
                {
                  name: 'Contratos',
                  y: contractsData.reduce((a, b) => a + b, 0),
                  color: Highcharts.getOptions().colors[0]
                },
                {
                  name: 'ERTE',
                  y: erteData.reduce((a, b) => a + b, 0),
                  color: Highcharts.getOptions().colors[1]
                },
                {
                  name: 'Subvención',
                  y: grantsData.reduce((a, b) => a + b, 0),
                  color: Highcharts.getOptions().colors[2]
                }
              ],
              center: [100, 60],
              size: 100,
              innerSize: '60%',
              showInLegend: false,
              dataLabels: { enabled: false }
            }
          ]
        });
      } catch (err) {
        console.error('Error al dibujar E4 por año-mes:', err);
      } finally {
        loadingCombined = false;
      }
    });
  </script>
  
  <svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/series-label.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
  </svelte:head>
  
  <section>
    <figure class="highcharts-figure">
      {#if loadingCombined}
        <p style="text-align:center">Cargando datos…</p>
      {/if}
      <div bind:this={containerChart} id="container"></div>
      <p class="highcharts-description">
        Contratos, ERTEs y solicitudes de subvención desde oct-2024 hasta ene-2025 (solo meses con datos).
      </p>
    </figure>
  </section>
  
  <style>
    .highcharts-figure {
      min-width: 310px;
      max-width: 800px;
      margin: 1em auto;
    }
    #container {
      height: 400px;
    }
    .highcharts-description {
      margin: 0.3rem 10px;
    }
  </style>
  