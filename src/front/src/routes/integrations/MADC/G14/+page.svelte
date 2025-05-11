<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .echarts-figure,
    .apexcharts-figure,
    .highcharts-figure,
    .charts-figure {
        min-width: 310px;
        max-width: 800px;
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

    //G14
    let employment_data={};
    let aids1={};

    // @ts-ignore

    // Función principal que carga y muestra el gráfico

async function processGraphG14() {
    let HOSTG14 = "https://sos2425-14.onrender.com";
    let APIG14 = HOSTG14 + "/api/v1/employment-data";
    loadingG14 = true;
    
    const figureDom = document.getElementById('G14');
    if (figureDom) {
        figureDom.innerHTML = '<div class="loading-spinner"><p>Cargando datos de G14...</p><div class="spinner"></div></div>';
    }

    try {
        // Realizar peticiones en paralelo para mejor rendimiento
        const [dataResponse, dataG14Response] = await Promise.allSettled([
            fetch(API),
            fetch(APIG14)
        ]);
        
        // Verificar si alguna petición falló
        if (dataResponse.status === 'rejected') {
            throw new Error("Error al obtener datos de API principal");
        }
        
        if (dataG14Response.status === 'rejected') {
            throw new Error("Error al obtener datos de G14");
        }
        
        // Procesar respuestas
        const res = await dataResponse.value.json();
        const resG14 = await dataG14Response.value.json();
        const pobComValenc2024_100mil = (1991259 + 2710808 + 615188)/100000;

        // Filtrar y contar subvenciones con propósito de Empleo por mes
        res.filter(obj => obj.purpose === "Fomento del Empleo").forEach(obj => {
            if (!aids1[obj.month]) {
                aids1[obj.month] = 1;
            } else {
                aids1[obj.month] = aids1[obj.month] + 1;
            }
        });
        
        aids1 = Object.entries(aids1).sort((key, value) => key).map(([key, value]) => {
            let obj = {};
            obj[key] = value;
            return obj;
        });
        
        resG14.filter(obj => obj.autonomous_community === "Comunitat Valenciana").forEach(obj => {
            if (!employment_data[obj.year]) {
                employment_data[obj.year] = {
                    year: obj.year,
                    employment_rate: obj.employment_rate,
                    unemployment_rate: obj.unemployment_rate
                };
            }
        });

        // Convertir employment_data a array ordenado por año
        employment_data = Object.entries(employment_data).sort((key, value) => key).map(([key, value]) => {
            let obj = {}
            obj[value.year] = {employment_rate: value.employment_rate, unemployment_rate: value.unemployment_rate};
            return obj;
        });

        // Preparar datos para el gráfico
        const years = Object.values(employment_data).map(value => Object.keys(value)[0]);
        const subvRates = [0].concat(Object.values(aids1).map(value => Object.values(value)[0]/pobComValenc2024_100mil));
        
        const employmentRates = employment_data.map(item => {
            const data = Object.values(item)[0];
            return data.employment_rate;
        });

        const unemploymentRates = employment_data.map(item => {
            const data = Object.values(item)[0];
            return data.unemployment_rate;
        });
        

        figureDom.innerHTML = '<div id="G14" class="apexcharts-figure"></div>';
        // Inicializando ApexCharts con los datos procesados
        const chartDom = figureDom.childNodes[0];
        
        const options = {
            series: [
                {
                    name: 'Tasa de Subvenciones de Fomento del Empleo (por cada 100 mil habitantes)',
                    type: 'column',
                    data: subvRates
                }, 
                {
                    name: 'Tasa de Desempleo',
                    type: 'area',
                    data: unemploymentRates
                },
            ],
            chart: {
                height: 350,
                type: 'line',
                stacked: false,
            },
            stroke: {
                width: [0, 2, 5],
                curve: 'smooth'
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            fill: {
                opacity: [0.85, 0.25, 1],
                gradient: {
                    inverseColors: false,
                    shade: 'light',
                    type: "vertical",
                    opacityFrom: 0.85,
                    opacityTo: 0.55,
                    stops: [0, 100, 100, 100]
                }
            },
            labels: years,
            markers: {
                size: 0
            },
            xaxis: {
                type: 'category'
            },
            annotations: {
                xaxis: [
                    {
                        x: years[years.length - 3],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000'
                            },
                            text: 'Oct.2024'
                        }
                    },
                    {
                        x: years[years.length - 2],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000'
                            },
                            text: 'Nov.2024'
                        }
                    },
                    {
                        x: years[years.length - 1],
                        borderColor: '#FF4560',
                        backgroundColor: '#68c1ff',
                        label: {
                            style: {
                                color: '#000',
                                backgroundColor: '#68c1ff'
                            },
                            text: 'Dic.2024'
                        }
                    }
                ]
            },
            yaxis: {
                title: {
                    text: 'Valor',
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (y) {
                        if (typeof y !== "undefined") {
                            return y.toFixed(2);
                        }
                        return y;
                    }
                }
            },
            title: {
                text: 'Evolución Subvenciones de Fomento de Empleo Comunidad Valenciana\ncon\nEvolución de Tasas de Desempleo (G14)',
                align: 'center'
            }
        };

        const chart = new ApexCharts(chartDom, options);
        chart.render();
        
        // Manejar el redimensionamiento
        window.addEventListener('resize', function() {
            chart.render();
        });
    } catch (err) {
        if (figureDom) {
            figureDom.innerHTML = '<div class="error-message">Error al cargar los datos de G14</div>';
        }
        showAlert("No se pudo cargar el gráfico G14", "danger");
        console.error("Error en G14:", err);
    } finally {
        loadingG14 = false;
    }
}

onMount(() => {
    // Ejecutar cada función de forma independiente
    // Si una falla, las demás seguirán ejecutándose
    processGraphG14().catch(err => console.error("Error al iniciar G14:", err));
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

<figure id="G14" class="apexcharts-figure">
    <div id="container"></div>
    <p class="apexcharts-description">
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
