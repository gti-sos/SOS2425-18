<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>
<!-- svelte-ignore css_unused_selector -->
<style>
    .highcharts-figure {
        min-width: 310px;
        max-width: 800px;
        margin: 2em auto;
        text-align: center;
    }

    .highcharts-figure #container{ 
        display: flex;
        justify-content: center;
        align-items: center;
        height: 500px;
    }

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
	import Highcharts from "highcharts";

    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let weatherData = {
        Valencia: { Oct: 0, Nov: 0, Dec: 0 },
        Castellon: { Oct: 0, Nov: 0, Dec: 0 },
        Alicante: { Oct: 0, Nov: 0, Dec: 0 }
    };

    let grantsData = {
        Oct: 0,
        Nov: 0,
        Dec: 0
    };

    let ruralHousesClosed = {
        Oct: 0,
        Nov: 0,
        Dec: 0
    };

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";

    if (dev) API = DEVEL_HOST + API;

    const colores = {
        subvenciones: '#4572A7',               // Azul
        precipitacion: {
            Valencia: '#89A54E',               // Verde
            Castellon: '#71588F',              // Morado
            Alicante: '#4198AF'                // Azul claro
        },
        casasRurales: '#DB843D'                // Naranja
    };

    async function loadWeatherData() {
        const API_TOKEN = "f021e49420f744c1bd443454251105";
        const HOSTWeatherApi = "http://api.weatherapi.com/v1";
        const APIWeatherApi = HOSTWeatherApi + "/history.json";
        
        try {
            // Para cada ciudad y mes, hacemos una petición
            const cities = ["Valencia", "Castellon de la Plana", "Alicante"];
            const months = [
                { name: "Oct", start: "2024-10-01", end: "2024-10-31" },
                { name: "Nov", start: "2024-11-01", end: "2024-11-30" },
                { name: "Dec", start: "2024-12-01", end: "2024-12-31" }
            ];
            
            for (const city of cities) {
                for (const month of months) {
                    const cityKey = city === "Castellon de la Plana" ? "Castellon" : city;
                    const response = await fetch(`${APIWeatherApi}?key=${API_TOKEN}&q=${city},ES&dt=${month.start}&end_dt=${month.end}`);
                    const data = await response.json();
                    
                    // Procesar los datos y sumar la precipitación total para el mes
                    let totalPrecipitation = 0;
                    if (data.forecast && data.forecast.forecastday) {
                        data.forecast.forecastday.forEach(day => {
                            totalPrecipitation += day.day.totalprecip_mm;
                        });
                    }
                    
                    weatherData[cityKey][month.name] = totalPrecipitation;
                }
            }
            
            return true;
        } catch (error) {
            console.error("Error al cargar datos del clima:", error);
            showAlert("Error al cargar datos meteorológicos", "danger");
            return false;
        }
    }

    async function loadGrantsData() {
        try {
            const response = await fetch(API);
            const data = await response.json();
            
            // Procesamos los datos para obtener el número de subvenciones por mes
            // Asumimos que los datos tienen una estructura con fecha y cantidad de subvenciones
            
            // Esto es una simulación - ajústalo según la estructura real de tus datos
            data.forEach(item => {
                const date = new Date(item.date);
                const month = date.getMonth();
                
                // Octubre es el mes 9 (0-indexed)
                if (month === 9) grantsData.Oct += item.count || 1;
                else if (month === 10) grantsData.Nov += item.count || 1;
                else if (month === 11) grantsData.Dec += item.count || 1;
            });
            
            return true;
        } catch (error) {
            console.error("Error al cargar datos de subvenciones:", error);
            showAlert("Error al cargar datos de subvenciones", "danger");
            return false;
        }
    }

    async function loadRuralHousesData() {
        try {
            const ruralHousesUrl = "https://dadesobertes.gva.es/dataset/35fd1c5b-72b6-49d7-97dd-be2394155f07/resource/4f8d72d0-7b7c-4793-84db-97ad6c657692/download/listartalojamientorural_19600101.json";
            const response = await fetch(ruralHousesUrl);
            const houses = await response.json();
            
            // Filtramos las casas dadas de baja en los últimos 3 meses de 2024
            houses.forEach(house => {
                if (house.cod_estado === "B" && house.fecha_baja) {
                    const bajaDate = new Date(house.fecha_baja);
                    const month = bajaDate.getMonth();
                    const year = bajaDate.getFullYear();
                    
                    if (year === 2024) {
                        if (month === 9) ruralHousesClosed.Oct++;
                        else if (month === 10) ruralHousesClosed.Nov++;
                        else if (month === 11) ruralHousesClosed.Dec++;
                    }
                }
            });
            
            return true;
        } catch (error) {
            console.error("Error al cargar datos de casas rurales:", error);
            showAlert("Error al cargar datos de alojamientos rurales", "danger");
            return false;
        }
    }

    async function createChart() {
        try {
            
            // Configuración del gráfico
            Highcharts.chart('container', {
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: 'Subvenciones DANA vs Precipitaciones vs Casas Rurales de Baja',
                    align: 'center'
                },
                subtitle: {
                    text: 'Último cuatrimestre 2024',
                    align: 'center'
                },
                xAxis: [{
                    categories: ['Octubre', 'Noviembre', 'Diciembre'],
                    crosshair: true
                }],
                yAxis: [
                    { // Eje principal para las subvenciones
                        title: {
                            text: 'Número de subvenciones',
                            style: {
                                color: colores.subvenciones 
                            }
                        },
                        labels: {
                            format: '{value}',
                            style: {
                                color: colores.subvenciones 
                            }
                        }
                    }, 
                    { // Eje secundario para las precipitaciones
                        title: {
                            text: 'Precipitación (mm)',
                            style: {
                                color: { color: colores.precipitacion.Valencia }
                            }
                        },
                        labels: {
                            format: '{value} mm',
                            style: {
                                color: { color: colores.precipitacion.Valencia }
                            }
                        },
                        opposite: true
                    },
                    { // Tercer eje para casas rurales dadas de baja
                        title: {
                            text: 'Casas rurales dadas de baja',
                            style: {
                                color: { color: colores.casasRurales }
                            }
                        },
                        labels: {
                            format: '{value}',
                            style: {
                                color: { color: colores.casasRurales }
                            }
                        },
                        opposite: true
                    }
                ],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 80,
                    verticalAlign: 'top',
                    y: 55,
                    floating: true,
                    backgroundColor: 'rgba(255,255,255,0.8)'
                },
                series: [
                    {
                        name: 'Subvenciones DANA',
                        type: 'column',
                        data: [grantsData.Oct, grantsData.Nov, grantsData.Dec],
                        tooltip: {
                            valueSuffix: ' subvenciones'
                        }
                    },
                    {
                        name: 'Precipitación Valencia',
                        type: 'spline',
                        yAxis: 1,
                        data: [weatherData.Valencia.Oct, weatherData.Valencia.Nov, weatherData.Valencia.Dec],
                        tooltip: {
                            valueSuffix: ' mm'
                        }
                    },
                    {
                        name: 'Precipitación Castellón',
                        type: 'spline',
                        yAxis: 1,
                        data: [weatherData.Castellon.Oct, weatherData.Castellon.Nov, weatherData.Castellon.Dec],
                        tooltip: {
                            valueSuffix: ' mm'
                        }
                    },
                    {
                        name: 'Precipitación Alicante',
                        type: 'spline',
                        yAxis: 1,
                        data: [weatherData.Alicante.Oct, weatherData.Alicante.Nov, weatherData.Alicante.Dec],
                        tooltip: {
                            valueSuffix: ' mm'
                        }
                    },
                    {
                        name: 'Casas rurales dadas de baja',
                        type: 'scatter',
                        color: 'rgba(223, 83, 83, .8)',
                        yAxis: 2,
                        data: [ruralHousesClosed.Oct, ruralHousesClosed.Nov, ruralHousesClosed.Dec],
                        marker: {
                            radius: 6
                        },
                        tooltip: {
                            valueSuffix: ' casas'
                        }
                    }
                ]
            });
            
            return true;
        } catch (error) {
            console.error("Error al crear el gráfico:", error);
            showAlert("Error al crear el gráfico combinado", "danger");
            return false;
        }
    }

    async function processGraphWeatherAndRuralHouses() {
        const figureDom = document.getElementById('WeatherAndRuralHouses');
        if (figureDom) {
            figureDom.innerHTML = '<div class="loading-spinner"><p>Cargando datos...</p><div class="spinner"></div></div>';
        }

        try {
            // Cargamos los datos de las diferentes fuentes
            await Promise.all([
                loadWeatherData(),
                loadGrantsData(),
                loadRuralHousesData()
            ]);
            
            // Creamos el gráfico con los datos cargados
            await createChart();
            
            if (figureDom) {
                figureDom.querySelector('.loading-spinner')?.remove();
            }
            
            showAlert("Gráfico cargado correctamente", "success");
        } catch (err) {
            if (figureDom) {
                figureDom.innerHTML = '<div class="error-message">Error al cargar los datos</div>';
            }
            showAlert("No se pudo cargar el gráfico", "danger");
            console.error("Error en WeatherAndRuralHouses:", err);
        }
    }

    onMount(() => {
        // Ejecutar el procesamiento del gráfico al cargar la página
        processGraphWeatherAndRuralHouses().catch(err => {
            console.error("Error al iniciar el proceso:", err);
            showAlert("Error al iniciar el proceso de carga de datos", "danger");
        });
    });

    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }
</script>

<figure id="WeatherAndRuralHouses" class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        Este gráfico muestra la relación entre el número de subvenciones otorgadas tras la DANA, 
        la precipitación mensual registrada en las tres provincias de la Comunidad Valenciana, 
        y las casas rurales dadas de baja durante el último cuatrimestre de 2024.
    </p>
</figure>

{#if alertVisible}
<Alert color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
    {alertMessage}
</Alert>
{/if}