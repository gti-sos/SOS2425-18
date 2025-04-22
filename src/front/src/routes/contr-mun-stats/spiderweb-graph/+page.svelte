<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/contr-mun-stats";
    if (dev) API = DEVEL_HOST + API;

    let sectorData = [];

    async function getAndProcessData() {
        try {
            const res = await fetch(API);
            const data = await res.json();

            // Agrupar por sector y sumar contratos
            const sectorMap = {};
            data.forEach(item => {
                if (sectorMap[item.sec_descr]) {
                    sectorMap[item.sec_descr] += item.num_contracts;
                } else {
                    sectorMap[item.sec_descr] = item.num_contracts;
                }
            });

            // Convertimos a arrays para Highcharts
            const categories = Object.keys(sectorMap);
            const values = Object.values(sectorMap);

            // Dibujar gráfico
            Highcharts.chart('spider-container', {
                chart: {
                    polar: true,
                    type: 'line'
                },
                title: {
                    text: 'Distribución de Contratos por Sector',
                    align: 'center'
                },
                xAxis: {
                    categories: categories,
                    tickmarkPlacement: 'on',
                    lineWidth: 0
                },
                yAxis: {
                    gridLineInterpolation: 'polygon',
                    lineWidth: 0,
                    min: 0
                },
                tooltip: {
                    shared: true,
                    pointFormat: '<span>{series.name}: <b>{point.y}</b><br/>'
                },
                series: [{
                    name: 'Contratos',
                    data: values,
                    pointPlacement: 'on'
                }]
            });

        } catch (error) {
            console.error("Error fetching or processing data:", error);
        }
    }

    onMount(getAndProcessData);
</script>

<figure class="highcharts-figure">
    <div id="spider-container"></div>
</figure>

<style>
    .highcharts-figure {
        max-width: 600px;
        margin: 2rem auto;
    }
</style>
