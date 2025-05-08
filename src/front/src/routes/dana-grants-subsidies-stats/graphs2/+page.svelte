<!-- App.svelte -->

<script>
    // @ts-nocheck
    import { onMount, onDestroy } from 'svelte';
    import { Alert } from "@sveltestrap/sveltestrap";
    import { dev } from "$app/environment";
    import { browser } from '$app/environment';
    
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;
    let chartContainer;
    let myChart;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";

    if (dev) API = DEVEL_HOST + API;
    
    async function loadECharts() {
        // Solo importamos ECharts en el cliente
        if (browser) {
            // Importación dinámica de ECharts
            const echarts = await import('echarts');
            return echarts;
        }
        return null;
    }

    async function createChart() {
        try {
            // Primero cargar ECharts (solo en el cliente)
            const echarts = await loadECharts();
            if (!echarts) return;
            
            // Luego cargar los datos
            let data = await fetch(API);
            let res = await data.json();
            
            // Procesar datos para el gráfico
            // Aquí puedes adaptar tus datos al formato que necesita ECharts
            const chartData = res.map(item => ({
                value: parseFloat(item.valor) || 0,
                name: item.mun_name
            }));
            
            // Inicializar el gráfico
            myChart = echarts.init(chartContainer);
            
            // Configuración del gráfico de medio donut
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    top: '5%',
                    left: 'center'
                },
                series: [
                    {
                        name: 'Distribución de valores',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '70%'],
                        startAngle: 180,
                        endAngle: 360,
                        data: chartData,
                        label: {
                            show: true,
                            formatter: '{b}: {c}'
                        },
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
            
            // Aplicar la configuración
            myChart.setOption(option);
            
            // Manejar el redimensionamiento
            window.addEventListener('resize', () => {
                if (myChart) {
                    myChart.resize();
                }
            });
            
        } catch(err) {
            console.error("Error:", err);
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

onMount(() => {
    if (browser) {
        createChart();
    }
});

onDestroy(() => {
    destroyChart();
});

    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }

    // Limpieza al desmontar el componente
    function destroyChart() {
        if (browser && myChart) {
            myChart.dispose();
        }
    }
</script>

<style>
    .chart-container {
        height: 500px;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        border: 1px solid #ccc;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f5f5f5;
    }
    
    h1 {
        text-align: center;
        margin-bottom: 20px;
        color: #333;
    }
</style>

<div>
    <h1>Gráfico Medio Donut - Distribución de Valores</h1>
    <div class="chart-container" bind:this={chartContainer}></div>
    {#if alertVisible}
        <Alert color={alertType} isOpen={alertVisible}>{alertMessage}</Alert>
    {/if}
</div>