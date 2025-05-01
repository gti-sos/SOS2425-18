<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/contr-mun-stats";
    if (dev) API = DEVEL_HOST + API;

    onMount(async () => {
        try {
            const res = await fetch(API);
            const data = await res.json();

            // Procesar datos: Provincia -> Sector -> Contratos
            const groupedData = {};

            // @ts-ignore
            data.forEach(item => {
                // @ts-ignore
                if (!groupedData[item.prov_name]) {
                    // @ts-ignore
                    groupedData[item.prov_name] = {};
                }
                // @ts-ignore
                if (!groupedData[item.prov_name][item.sec_descr]) {
                    // @ts-ignore
                    groupedData[item.prov_name][item.sec_descr] = 0;
                }
                // @ts-ignore
                groupedData[item.prov_name][item.sec_descr] += item.num_contracts;
            });

            const processedData = Object.entries(groupedData).map(([provincia, sectores]) => ({
                name: provincia,
                children: Object.entries(sectores).map(([sector, value]) => ({
                    name: sector,
                    value: value
                }))
            }));

            const chartDom = document.getElementById('sunburstChart');
            // @ts-ignore
            const myChart = echarts.init(chartDom);

            const option = {
                title: {
                    text: 'Distribución de Contratos',
                    left: 'center'
                },
                series: {
                    type: 'sunburst',
                    data: processedData,
                    radius: [0, '90%'],
                    label: {
                        rotate: 'radial',
                        minAngle: 10,     // Oculta etiquetas en sectores pequeños
                        fontSize: 12
                    },
                    levels: [
                        {},  // Raíz
                        {
                            label: {
                                fontSize: 14,
                                color: '#000'
                            }
                        },
                        {
                            label: {
                                fontSize: 10,
                                color: '#333'
                            }
                        }
                    ]
                },
                tooltip: {
                    trigger: 'item',
                    // @ts-ignore
                    formatter: params => `${params.name}: ${params.value} contratos`
                }
            };

            myChart.setOption(option);

        } catch (err) {
            console.error("Error al cargar o procesar los datos:", err);
        }
    });
</script>

<figure>
    <div id="sunburstChart" style="width: 600px; height: 600px; margin: auto;"></div>
</figure>

<style>
    figure {
        margin-top: 2rem;
        text-align: center;
    }
</style>
