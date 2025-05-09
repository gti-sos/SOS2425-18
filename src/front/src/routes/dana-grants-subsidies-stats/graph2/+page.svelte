<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
</svelte:head>

<!-- svelte-ignore css_unused_selector -->
<style>
    .echarts-figure,
    .echarts-data-table table {
        min-width: 310px;
        max-width: 800px;
        margin: 1em auto;
    }

    #container {
        height: 500px;
    }

    .echarts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
    }

    .echarts-data-table caption {
        padding: 1em 0;
        font-size: 1.2em;
        color: #555;
    }

    .echarts-data-table th {
        font-weight: 600;
        padding: 0.5em;
        margin-bottom: 4em;
    }

    .echarts-data-table td,
    .echarts-data-table th,
    .echarts-data-table caption {
        padding: 0.5em;
    }

    .echarts-data-table thead tr,
    .echarts-data-table tbody tr:nth-child(even) {
        background: #f8f8f8;
    }

    .echarts-data-table tr:hover {
        background: #f1f7ff;
    }

    .echarts-description {
        margin: 0 10px;
    }

</style>

<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { Alert } from "@sveltestrap/sveltestrap";
    import { dev } from "$app/environment";
    
    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats/All";
    if (dev) API = DEVEL_HOST + API;

    let aids={};
    // @ts-ignore

    async function processGraphs(){
        try{
            let data = await fetch(API);
            let res = await data.json();
            console.log(res);

            res.filter(obj=> obj.benef_type!==null).forEach(obj =>{
                if (!aids[obj.benef_type]) {
                    aids[obj.benef_type] =  1;
                } else {
                    aids[obj.benef_type] = aids[obj.benef_type] + 1;
                }
            });
            aids= Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1));
            aids = Object.entries(aids).map(([key, value]) => ({ name: key, value: value}));
            console.log(aids);

            // Inicializando ECharts con los datos predefinidos
            const chartDom = document.getElementById('container');
            const myChart = echarts.init(chartDom);
            
            const option = {
                title: {
                    text: 'Distribución de Subvenciones por Tipo de Beneficiario',
                    left: 'center',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}<br/><strong>{d}%</strong> ({c} ayudas)'
                },
                legend: {
                    top: '10%',
                    left: 'center'
                },
                series: [
                    {
                        name: 'Distribución de Subvenciones por Tipo de Beneficiario',
                        type: 'pie',
                        radius: ['35%', '70%'],
                        center: ['50%', '70%'],
                        startAngle: 180,
                        endAngle: 360,
                        labelLine: {
                            show: true
                        },
                        label: {
                            show: true,
                            formatter: '{b}: {c}'
                        },
                        data: aids,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            option && myChart.setOption(option);
            
            // Manejar el redimensionamiento
            window.addEventListener('resize', function() {
                myChart.resize();
            });
        } catch(err) {
            showAlert("No se pudo cargar el gráfico", "danger");
            console.error(err);
        }
    }

    onMount(() => {
        processGraphs();
    });

    // @ts-ignore
    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }
</script>

<figure class="echarts-figure">
    <div id="container"></div>
    <p class="echarts-description">
        En este gráfico, se muestra la distribución del total de ayudas y subvenciones
        solicitadas y concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de la Comunidad Valenciana afectadas por la DANA, en función del tipo de beneficiario.
    </p>
</figure>

{#if alertVisible}
<Alert color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
    {alertMessage}
</Alert>
{/if}
