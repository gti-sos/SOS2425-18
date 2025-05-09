<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
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
        height: 650px;
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

    let national_parks={};
    
    let fines={};
    let finValencia={};

    // @ts-ignore

    async function processGraphG13(){
        let HOSTG13= "https://sos2425-13.onrender.com";
        let APIG13 = HOSTG13 +"/api/v2/national-parks";

        try{
            let data = await fetch(APIG13);
            let res = await data.json();

            res.filter(obj=> obj.autonomous_community!==null).forEach(obj =>{
                if (!national_parks[obj.autonomous_community]) {
                    national_parks[obj.autonomous_community] =  obj.current_area;
                } else {
                    national_parks[obj.autonomous_community] = national_parks[obj.autonomous_community] + obj.current_area;
                }
            });
            
            Highcharts.mapChart('container-G13', {
                chart: {
                    map: 'countries/es/es-all'
                },
                title: {
                    text: 'Distribución de superficie de parques nacionales por provincia'
                },
                colorAxis: {
                    min: 0,
                    minColor: '#EEEEFF',
                    maxColor: '#000022'
                },
                series: [{
                    data: [
                        ['es-md', 33960], // Madrid
                        ['es-as', 25000], // Asturias
                        ['es-cn', 18990], // Canarias
                        ['es-an', 54252], // Andalucía
                        // otros datos
                    ],
                    name: 'Superficie (hectáreas)',
                    states: {
                        hover: {
                            color: '#BADA55'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }]
            });
            
            // Manejar el redimensionamiento
            window.addEventListener('resize', function() {
                myChart.resize();
            });
        } catch(err) {
            showAlert("No se pudo cargar el gráfico", "danger");
            console.error(err);
        }
    }

    async function processGraphG20(){
        let HOSTG20= "https://sos2425-20.onrender.com";
        let APIG20 = HOSTG20 +"/api/v2/fines";

        try{
            let data = await fetch(API);
            let res = await data.json();
             
            let data1 = await fetch(APIG20);
            let res1 = await data1.json();

            res.filter(obj=> obj.purpose!==null).forEach(obj =>{
                if (!aids[obj.purpose]) {
                    aids[obj.purpose] =  1;
                } else {
                    aids[obj.purpose] = aids[obj.purpose] + 1;
                }
            });

            
            aids= Object.fromEntries(Object.entries(aids).filter(([key, value]) => value > 1));
            aids= Object.entries(aids).map(([key, value]) => ({ name: key, value: value}));
            let aidsPurposesAndfinesTypes= [];
            console.log(aids);

            fines= res1.filter(fin=> fin.city==="Valencia");
            fines= Object.entries(fines[0]).filter(([key, value])=> key!=="year" && key!=="city").map(([key, value]) => ({ name: key, value }));
            console.log(fines);
            //console.log(aidsPurposesAndfinesTypes);
            aidsPurposesAndfinesTypes= [...aids, ...fines].map(el=> el.name);
            //console.log(aidsPurposesAndfinesTypes);
            
            // Inicializando ECharts con los datos predefinidos
            const chartDom = document.getElementById('container-G20');
            const myChart = echarts.init(chartDom);
            
            const option = {
                title:{
                    text: 'Distribución de Subvenciones en Valencia por Propósito\ncon\n Distribución de Multas en Valencia por Tipo (G20)',
                    left: 'center'
                },
                tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {d}% ({c})'
            },
            legend: {
                aidsPurposesAndfinesTypes,
                orient: 'horizontal', // Orientación horizontal
                bottom: '0%',         // Posición en la parte inferior
                left: 'center',       // Centrado horizontalmente
        
                // Dividir en múltiples columnas
                type: 'scroll',       // Permitir desplazamiento si hay muchos elementos
                itemsPerPage: 10, // Si usas type: 'scroll'
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
        } catch(err) {
            showAlert("No se pudo cargar el gráfico", "danger");
            console.error(err);
        }
    }

    onMount(() => {
        //processGraphG13();
        processGraphG20();
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


<figure class="highcharts-figure">
    <div id="container-G13"></div>
    <p class="highcharts-description">
        En este gráfico, se muestra la distribución del total de ayudas y subvenciones
        solicitadas y concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de Valencia afectadas por la DANA, en función del propósito,
        comparando la distribución del total de multas registradas en Valencia durante el 2023, en función del tipo.
    </p>
</figure>
<figure class="echarts-figure">
    <div id="container-G20"></div>
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
