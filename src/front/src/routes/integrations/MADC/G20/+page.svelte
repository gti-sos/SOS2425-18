<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .echarts-figure,
    .apexcharts-figure,
    .highcharts-figure,
    .charts-figure {
        min-width: 310px;
        margin: 2em auto;
        text-align: center;
    }

    .echarts-figure #container,
    .apexcharts-figure #container,
    .highcharts-figure #container,
    .charts-figure #container{ 
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .echarts-figure .echarts,
    .apexcharts-figure .apexcharts-canvas {
        margin: 0 auto;
    }

    .echarts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #ebebeb;
        margin: 10px auto;
        text-align: center;
        width: 100%;
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

    .echarts-description,
    .apexcharts-description,
    .highcharts-description {
        margin: 0 10px;
        text-align: center;
    }

    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        width: 100%;
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #09f;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-message {
        color: #d9534f;
        text-align: center;
        padding: 20px;
        font-weight: bold;
    }
</style>


<script>
// @ts-nocheck

    import { onMount } from "svelte";
    import { Alert } from "@sveltestrap/sveltestrap";
    import { dev } from "$app/environment";
    //import ApexCharts from 'svelte-axpecharts';
    import Highcharts from 'highcharts';
    //import 

    // @ts-ignore
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let loadingG13= false;
    let loadingG14= false;
    let loadingG20= false;

    let loadingCastLeon= false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";

    if (dev) API = DEVEL_HOST + API;
    
    //G20
    let fines={};
    let finValencia={};
    let aids={};

async function processGraphG20() {
    let HOSTG20 = "https://sos2425-20.onrender.com";
    let APIG20 = HOSTG20 + "/api/v2/fines";
    loadingG20 = true;

    const figureDom = document.getElementById('G20');
    if (figureDom) {
        figureDom.innerHTML = '<div class="loading-spinner"><p>Cargando datos de G20...</p><div class="spinner"></div></div>';
    }

    try {
        // Realizar peticiones en paralelo
        const [dataResponse, dataG20Response] = await Promise.allSettled([
            fetch(API),
            fetch(APIG20)
        ]);
        
        // Verificar si alguna petición falló
        if (dataResponse.status === 'rejected') {
            throw new Error("Error al obtener datos de API principal");
        }
        
        if (dataG20Response.status === 'rejected') {
            throw new Error("Error al obtener datos de G20");
        }
        
        // Procesar respuestas
        const res = await dataResponse.value.json();
        const res1 = await dataG20Response.value.json();

        res.filter(obj => obj.purpose !== null).forEach(obj => {
            if (!aids[obj.purpose]) {
                aids[obj.purpose] = 1;
            } else {
                aids[obj.purpose] = aids[obj.purpose] + 1;
            }
        });

        aids = Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1));
        aids = Object.entries(aids).map(([key, value]) => ({ name: key, value: value }));
        let aidsPurposesAndfinesTypes = [];

        fines = res1.filter(fin => fin.city === "Valencia");
        fines = Object.entries(fines[0]).filter(([key, value]) => key !== "year" && key !== "city").map(([key, value]) => ({ name: key, value }));
        aidsPurposesAndfinesTypes = [...aids, ...fines].map(el => el.name);
        
        figureDom.innerHTML = '<div id="echarts-container" style="width: 100%; height: 550px;"></div>';
        
        // Inicializando ECharts con los datos procesados
        const chartDom = figureDom.childNodes[0];
        const myChart = echarts.init(chartDom);
        
        const option = {
            title: {
                text: 'Distribución de Subvenciones en Valencia por Propósito\ncon\n Distribución de Multas en Valencia por Tipo (G20)',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {d}% ({c})'
            },
            legend: {
                aidsPurposesAndfinesTypes,
                orient: 'horizontal',
                bottom: '0%',
                left: 'center',
                type: 'scroll',
                itemsPerPage: 10,
                pageButtonItemGap: 5,
                pageButtonGap: 5,
                pageButtonPosition: 'end'  
            },
            series: [
                {
                    name: ' Distribución de Multas en Valencia por Tipo',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],
                    label: {
                        position: 'inner',
                        fontSize: 14
                    },
                    labelLine: {
                        show: false
                    },
                    data: fines
                },
                {
                    name: 'Subvenciones por Propósito',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    labelLine: {
                        length: 30
                    },
                    label: {
                        formatter: '{b|{b}：}{d}% ({c})',
                        backgroundColor: '#F6F8FC',
                        borderColor: '#8C8D8E',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            a: {
                                color: '#6E7079',
                                lineHeight: 22,
                                align: 'center'
                            },
                            hr: {
                                borderColor: '#8C8D8E',
                                width: '100%',
                                borderWidth: 1,
                                height: 0
                            },
                            b: {
                                color: '#4C5058',
                                fontWeight: 'bold',
                                lineHeight: 33
                            },
                            per: {
                                color: '#fff',
                                backgroundColor: '#4C5058',
                                padding: [3, 4],
                                borderRadius: 4
                            },
                            d: {
                                fontWeight: 'bold'
                            }
                        }
                    },
                    data: aids
                }
            ]
        };

        option && myChart.setOption(option);
        
        // Manejar el redimensionamiento
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    } catch (err) {
        if (figureDom) {
            figureDom.innerHTML = '<div class="error-message">Error al cargar los datos de G20</div>';
        }
        showAlert("No se pudo cargar el gráfico G20", "danger");
        console.error("Error en G20:", err);
    } finally {
        loadingG20 = false;
    }
}

onMount(() => {
    // Ejecutar cada función de forma independiente
    // Si una falla, las demás seguirán ejecutándose
    processGraphG20().catch(err => console.error("Error al iniciar G20:", err));
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

<figure id="G20" class="echarts-figure">
    <div id="container"></div>
    <p class="echarts-description">
        En este gráfico, se muestra la distribución del total de ayudas y subvenciones
        solicitadas y concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de Valencia afectadas por la DANA, en función del propósito,
        comparando la distribución del total de multas registradas en Valencia durante el 2023, en función del tipo.
    </p>
</figure>

{#if alertVisible}
<Alert color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
    {alertMessage}
</Alert>
{/if}
