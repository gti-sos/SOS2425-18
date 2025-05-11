<svelte:head>
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

    let loadingCastLeon= false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";

    if (dev) API = DEVEL_HOST + API;

    //CastillaLeon

    let aidsCastLeon= {};
    let aids2={};

    // @ts-ignore

    async function processGraphCastLeon() {
    let HOSTCastLeon = "https://analisis.datosabiertos.jcyl.es/";
    let APICastLeon12 = HOSTCastLeon + "/api/explore/v2.1/catalog/datasets/ayudas-y-subvenciones/records?limit=20&refine=tipo_ayuda%3A%22Ayuda%20%2F%20Subvenci%C3%B3n%22&refine=fecha_publicacion%3A%222024%2F12%22";
    let APICastLeon11 = HOSTCastLeon + "/api/explore/v2.1/catalog/datasets/ayudas-y-subvenciones/records?limit=20&refine=tipo_ayuda%3A%22Ayuda%20%2F%20Subvenci%C3%B3n%22&refine=fecha_publicacion%3A%222024%2F11%22";
    let APICastLeon10 = HOSTCastLeon + "/api/explore/v2.1/catalog/datasets/ayudas-y-subvenciones/records?limit=20&refine=tipo_ayuda%3A%22Ayuda%20%2F%20Subvenci%C3%B3n%22&refine=fecha_publicacion%3A%222024%2F10%22";
    loadingCastLeon = true;

    const figureDom = document.getElementById('CastLeon');
    if (figureDom) {
        figureDom.innerHTML = '<div class="loading-spinner"><p>Cargando datos de CastLeon...</p><div class="spinner"></div></div>';
    }

    try {
        // Realizar todas las peticiones en paralelo para mejorar rendimiento
        const [dataApiResponse, dataCL12Response, dataCL11Response, dataCL10Response] = await Promise.allSettled([
            fetch(API),
            fetch(APICastLeon12),
            fetch(APICastLeon11),
            fetch(APICastLeon10)
        ]);
        
        // Manejar errores de las peticiones individuales
        const errors = [];
        if (dataApiResponse.status === 'rejected') errors.push("Error en API principal");
        if (dataCL12Response.status === 'rejected') errors.push("Error en API CastLeon diciembre");
        if (dataCL11Response.status === 'rejected') errors.push("Error en API CastLeon noviembre");
        if (dataCL10Response.status === 'rejected') errors.push("Error en API CastLeon octubre");
        if (errors.length > 0) {
            throw new Error(errors.join(", "));
        }

        /*
        let retryData= false;
        if (dataCL12Response.status === "fulfilled") {
            const response = dataCL12Response.value;
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Respuesta no es JSON:", text);
                retryData= true;
            }


        }
        */
        // Procesar respuestas exitosas
        const res = await dataApiResponse.value.json();
        //let res_=null;
        //if(retryData===true){
        //    let data_= await fetch("https://analisis.datosabiertos.jcyl.es/"+ "/api/explore/v2.1/catalog/datasets/ayudas-y-subvenciones/records?limit=20&refine=tipo_ayuda%3A%22Ayuda%20%2F%20Subvenci%C3%B3n%22&refine=fecha_publicacion%3A%222024%2F12%22");
        //    let res_= await data_.json();
        //}
        const res1 = /*res_? res_:*/ await dataCL12Response.value.json();
        const res2 = await dataCL11Response.value.json();
        const res3 = await dataCL10Response.value.json();

        
        
        let resCastLeon = [];
        res1.results.forEach(obj => resCastLeon.push(obj));
        res2.results.forEach(obj => resCastLeon.push(obj));
        res3.results.forEach(obj => resCastLeon.push(obj));

        resCastLeon.forEach(obj => {
            let month = Number(obj.fecha_publicacion.split("-")[1]);
            if (!aidsCastLeon[month]) {
                aidsCastLeon[month] = 1;
            } else {
                aidsCastLeon[month] = aidsCastLeon[month] + 1;
            }
        });

        res.filter(obj => obj.month !== null).forEach(obj => {
            if (!aids2[obj.month]) {
                aids2[obj.month] = 1;
            } else {
                aids2[obj.month] = aids2[obj.month] + 1;
            }
        });
        
        // Prepare data for Chart.js
        const months = [];

        // Clear the loading message
        figureDom.innerHTML = '<canvas></canvas>';
        const chartDom = figureDom.childNodes[0];
        const ctx = chartDom.getContext('2d');
        
        // Initialize Chart.js with stacked bar chart
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Castilla y León Ayudas/Subvenciones',
                        data: aidsCastLeon,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Valencia Ayudas/Subvenciones',
                        data: aids2,
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparativa de Ayudas/Subvenciones (CastLeon vs Valencia)',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Handle resizing
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    } catch (err) {
        if (figureDom) {
            figureDom.innerHTML = '<div class="error-message">Error al cargar los datos de Castilla y León</div>';
        }
        showAlert("No se pudo cargar el gráfico de Castilla y León", "danger");
        console.error("Error en CastLeon:", err);
    } finally {
        loadingCastLeon = false;
    }
}

onMount(() => {
    // Ejecutar cada función de forma independiente    
    processGraphCastLeon().catch(err => console.error("Error al iniciar CastLeon:", err));
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

<figure id="CastLeon" class="charts-figure">
    <div id="container"></div>
    <p class="charts-description">
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
