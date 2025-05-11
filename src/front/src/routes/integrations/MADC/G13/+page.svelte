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
    //import Highcharts from 'highcharts';

    import * as echarts from 'echarts';

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

    //G13
    let national_parks={};

    // @ts-ignore

    // Símbolos personalizados para representar diferentes tipos de árboles
    const parkSymbols = {
        palmTree: 'path://M20 36 L20 12 L16 8 L24 8 L20 12 M12 12 L16 4 M20 0 L20 4 M24 12 L28 4', // Palmera
        woodenBridge: 'path://M8 20 L8 36 M40 20 L40 36 M4 20 C4 16 44 16 44 20 C44 24 4 24 4 20', // Puente de madera
        pineTree: 'path://M20 36 L20 24 L12 24 L16 18 L8 18 L16 10 L4 10 L20 0 L36 10 L24 10 L32 18 L24 18 L28 24 L20 24', // Pino
        oak: 'path://M20 36 L20 16 C12 16 6 8 12 2 C18 -4 22 -4 28 2 C34 8 28 16 20 16', // Roble frondoso
        bonsai: 'path://M18 36 C20 28 16 32 20 24 C24 16 28 24 24 20 C20 16 16 20 20 12 C24 4 16 8 12 16 C8 24 16 28 18 36', // Bonsái
        starCluster: 'path://M12 12 L16 8 L20 12 L16 16 Z M28 8 L32 4 L36 8 L32 12 Z M24 24 L28 20 L32 24 L28 28 Z M8 28 L12 24 L16 28 L12 32 Z', // Grupo de estrellas
        waterfall: 'path://M12 4 L36 4 L36 12 C32 16 40 20 36 24 C32 28 40 32 36 36 L12 36 L12 28 C16 24 8 20 12 16 C16 12 8 8 12 4', // Cascada
        stream: 'path://M4 16 C8 12 12 20 16 16 C20 12 24 20 28 16 C32 12 36 20 40 16 C44 12 48 20 52 16', // Arroyo serpenteante
        stump: 'path://M16 36 C8 36 8 28 12 20 C16 12 24 12 28 20 C32 28 32 36 24 36 C16 36 16 36 16 36 M12 28 C16 32 24 32 28 28 M12 24 C16 20 24 20 28 24', // Tocón de árbol
        pond: 'path://M20 8 C12 8 4 12 4 20 C4 28 12 32 20 32 C28 32 36 28 36 20 C36 12 28 8 20 8', // Estanque
        logPile: 'path://M4 36 C4 32 44 32 44 36 M4 28 C4 24 44 24 44 28 M4 20 C4 16 44 16 44 20', // Pila de troncos
        boulder: 'path://M8 32 C4 24 8 16 16 12 C24 8 32 12 36 20 C40 28 36 36 28 36 C20 36 12 40 8 32', // Roca grande
        rockPile: 'path://M12 36 L8 28 L16 24 L24 28 L28 20 L20 16 L24 8 L32 12 L36 20 L32 28 L24 32 L16 36 L12 36', // Montón de rocas
        stonehenge: 'path://M8 36 L8 16 L12 12 L20 16 L20 36 M28 36 L28 16 L36 12 L44 16 L44 36', // Monolitos estilo Stonehenge
        moon: 'path://M16 8 C8 16 8 32 16 40 C32 40 40 24 32 12 C28 24 16 24 16 8', // Luna creciente
        crystals: 'path://M12 36 L16 16 L20 36 M24 36 L28 12 L32 36 M36 36 L40 20 L44 36', // Formación de cristales
        sunRays: 'path://M24 24 C20 20 20 16 24 12 C28 8 32 8 36 12 C40 16 40 20 36 24 C32 28 28 28 24 24 M24 8 L24 0 M36 8 L42 2 M40 24 L48 24 M36 36 L42 42 M24 40 L24 48 M12 36 L6 42 M8 24 L0 24 M12 12 L6 6', // Sol con rayos
        fallenLog: 'path://M4 28 C4 24 12 24 16 28 C20 32 28 32 32 28 C36 24 44 24 44 28 C44 32 36 32 32 28 C28 24 20 24 16 28 C12 32 4 32 4 28', // Tronco caído
        raindrops: 'path://M12 20 C8 28 16 28 12 20 M24 12 C20 20 28 20 24 12 M36 24 C32 32 40 32 36 24', // Gotas de lluvia
    };
    let etiquetas=[];

    // Configuración de etiquetas (nombres) que se muestran al lado de cada barra
    const labelSetting = {
        show: true,
        position: 'right',
        offset: [10, 0],
        fontSize: 16,
        formatter: '{c} ha'
    };

    // Función que crea la configuración del gráfico
    function makeParkOption(type, symbol) {
        return {
            title: {
                text: 'Distribución Área Total Parques Nacionales España por CCAA (G13)',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                containLabel: true,
                left: 50
            },
            yAxis: {
                data: etiquetas,
                inverse: true,
                axisLabel: { fontSize: 14, margin: 30 }
            },
            xAxis: {
                show: false // Ocultamos el eje X
            },
            series: [
                {
                    name: 'Actualidad',
                    type: type,
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ['80%', '60%'],
                    data: national_parks
                }
            ]
        };
    }

    async function loadInitialData(apiUrl) {
    for (let i = 0; i < 5; i++) {
        try {
            const res = await fetch(apiUrl, { method: 'GET' });
            if (res.ok) {
                return true;
            }
        } catch (e) {
            console.warn(`Intento ${i+1}: esperando que ${apiUrl} esté disponible...`);
        }
        // Espera 1 segundo entre reintentos
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`El API ${apiUrl} no está disponible después de múltiples intentos`);
}

    // Función principal que carga y muestra el gráfico
    async function processGraphG13() {
    let HOSTG13= "https://sos2425-13.onrender.com";
    let APIG13 = HOSTG13 +"/api/v2/national-parks";
    loadingG13 = true;

    const figureDom = document.getElementById('G13');
    if (figureDom) {
        figureDom.innerHTML = '<div class="loading-spinner"><p>Cargando datos de G13...</p><div class="spinner"></div></div>';
    }

    try {
        //await fetch(APIG13+"/loadInitialData");
        const basicSymbols = ['circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'];

        let data = await fetch(APIG13);
        let res = await data.json();

        res.forEach(obj =>{
            if (!national_parks[obj.autonomous_community]) {
                national_parks[obj.autonomous_community] =  obj.current_area;
            } else {
                national_parks[obj.autonomous_community] = national_parks[obj.autonomous_community] + obj.current_area;
            }
        });
        
        let ind=0;
        national_parks = Object.entries(national_parks).map(([key, value])=>{
            let obj={};
            obj["name"] = key;
            obj["value"] = value;
            obj["symbol"] = basicSymbols[ind % basicSymbols.length];
            ind++;
            return obj;
        });
        etiquetas = national_parks.map(obj=> obj.name);

        figureDom.innerHTML = '<canvas></canvas>';

        // Seleccionamos el contenedor del gráfico
        const chartDom = figureDom.childNodes[0];
        const myChart = await echarts.init(chartDom);

        // Creamos diferentes estilos de gráfico
        const options = [
            makeParkOption('pictorialBar'), // Con íconos personalizados
        ];

        // Mostramos los gráficos uno tras otro cada 2.5 segundos
        let optionIndex = 0;
        myChart.setOption(options[optionIndex]);

        // Ajustamos el tamaño del gráfico si cambia el tamaño de la ventana
        window.addEventListener('resize', () => {
            myChart.resize();
        });
    } catch (err) {
        if (figureDom) {
            figureDom.innerHTML = '<div class="error-message">Error al cargar los datos de G13</div>';
        }
        showAlert("No se pudo cargar el gráfico G13", "danger");
        console.error("Error en G13:", err);
    } finally {
        loadingG13 = false;
    }
}

onMount(() => {
    // Ejecutar cada función de forma independiente
    // Si una falla, las demás seguirán ejecutándose
    processGraphG13().catch(err => console.error("Error al iniciar G13:", err));
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

<figure id="G13" class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
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
