<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
</svelte:head>

<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/contr-mun-stats";
    if (dev) API = DEVEL_HOST + API;

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

            // Reordenar manualmente las categorías
            const orderedCategories = ["AGRICULTURA", "CONSTRUCCIÓN", "INDUSTRIA", "SERVICIOS"];
            const orderedValues = orderedCategories.map(sector => sectorMap[sector] || 0);

            // Configurar Highcharts
            Highcharts.chart('spider-container', {
                chart: {
                    polar: true,
                    type: 'area'
                },
                title: {
                    text: 'Distribución de Contratos por Sector',
                    align: 'center'
                },
                xAxis: {
                    categories: orderedCategories,
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
                plotOptions: {
                    series: {
                        fillOpacity: 0.4,    // Transparencia del área
                        marker: {
                            enabled: true    // Mostrar puntos en cada vértice
                        }
                    }
                },
                series: [{
                    name: 'Contratos',
                    data: orderedValues,
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
