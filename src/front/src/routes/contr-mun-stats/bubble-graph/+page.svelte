<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<script>
    import { onMount } from "svelte";
    import { dev } from "$app/environment";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/contr-mun-stats";

    if (dev) API = DEVEL_HOST + API;

    let chartInstance;

    onMount(async () => {
        try {
            const res = await fetch(API);
            const data = await res.json();

            console.log("Datos cargados:", data);

            if (!data.length) {
                console.error("No hay datos disponibles para mostrar.");
                return;
            }

            const bubbleData = data.map(item => ({
                x: item.year,
                y: item.month,
                r: Math.sqrt(item.num_contracts)  // Escala del radio
            }));

            const ctx = document.getElementById('bubbleChart').getContext('2d');

            chartInstance = new Chart(ctx, {
                type: 'bubble',
                data: {
                    datasets: [{
                        label: 'Contratos por Año y Mes',
                        data: bubbleData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)'
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Año'
                            },
                            ticks: {
                                precision: 0
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Mes'
                            },
                            min: 1,
                            max: 12,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const index = context.dataIndex;
                                    const contrato = data[index];
                                    return `${contrato.mun_name}: ${contrato.num_contracts} contratos`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error("Error al cargar los datos o crear el gráfico:", err);
        }
    });
</script>

<canvas id="bubbleChart" width="600" height="400"></canvas>

<style>
    canvas {
        display: block;
        margin: 2rem auto;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
    }
</style>
