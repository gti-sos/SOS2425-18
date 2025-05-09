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

    const treeSymbols = {
        pine: 'path://M16,2L32,40H0L16,2z M16,28.9L22.2,36H9.8L16,28.9z M16,22.8L24.4,32H7.6L16,22.8z M16,16.9L26.6,28H5.4L16,16.9z M16,10.7L28.8,24H3.2L16,10.7z M16,4.5L31,20H1L16,4.5z M12,40V50H20V40z',
        oak: 'path://M16,8 C9.373,8 4,13.373 4,20 C4,24.418 6.345,28.267 10,30.219 L10,40 C10,44.418 13.582,48 18,48 C22.418,48 26,44.418 26,40 L26,30.219 C29.655,28.267 32,24.418 32,20 C32,13.373 26.627,8 20,8 L16,8 z',
        palm: 'path://M20,4 C18,4 16,5 16,8 C16,11 18,16 18,16 C18,16 14,13 12,13 C10,13 8,15 8,17 C8,19 10,22 14,22 C18,22 16,22 16,22 L16,48 L24,48 L24,22 C24,22 22,22 26,22 C30,22 32,19 32,17 C32,15 30,13 28,13 C26,13 22,16 22,16 C22,16 24,11 24,8 C24,5 22,4 20,4 z',
        willow: 'path://M25,2 C23,2 18,8 16,12 C14,8 9,2 7,2 C5,2 2,5 2,8 C2,11 5,15 6,17 C7,19 10,23 12,24 L12,48 L20,48 L20,23 C22,22 25,18 26,16 C27,14 30,10 30,7 C30,4 27,2 25,2 z',
        maple: 'path://M16,2 L8,12 L2,26 L10,26 L6,36 L14,36 L14,48 L18,48 L18,36 L26,36 L22,26 L30,26 L24,12 L16,2 z'
    };

    // Tree label settings
    const labelSetting = {
        show: true,
        position: 'right',
        offset: [10, 0],
        fontSize: 16
    };

    // Make tree charts function
    function makeTreeOption(type, symbol) {
        return {
            title: {
                text: 'Árboles en Parques Nacionales',
                left: 'center'
            },
            legend: {
                data: ['2023', '2024'],
                bottom: 10
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                containLabel: true,
                left: 20
            },
            yAxis: {
                data: ['Pinos', 'Robles', 'Arces', 'Sauces', 'Palmeras'],
                inverse: true,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    margin: 30,
                    fontSize: 14
                },
                axisPointer: {
                    label: {
                        show: true,
                        margin: 30
                    }
                }
            },
            xAxis: {
                splitLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                axisLine: { show: false }
            },
            animationDurationUpdate: 500,
            series: [
                {
                    name: '2023',
                    id: 'bar1',
                    type: type,
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ['80%', '60%'],
                    barCategoryGap: '40%',
                    universalTransition: {
                        enabled: true,
                        delay: function (idx, total) {
                            return (idx / total) * 1000;
                        }
                    },
                    data: [
                        {
                            value: 157,
                            symbol: symbol || treeSymbols.pine
                        },
                        {
                            value: 121,
                            symbol: symbol || treeSymbols.oak
                        },
                        {
                            value: 96,
                            symbol: symbol || treeSymbols.maple
                        },
                        {
                            value: 78,
                            symbol: symbol || treeSymbols.willow
                        },
                        {
                            value: 63,
                            symbol: symbol || treeSymbols.palm
                        }
                    ]
                },
                {
                    name: '2024',
                    id: 'bar2',
                    type: type,
                    barGap: '10%',
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ['80%', '60%'],
                    universalTransition: {
                        enabled: true,
                        delay: function (idx, total) {
                            return (idx / total) * 1000;
                        }
                    },
                    data: [
                        {
                            value: 184,
                            symbol: symbol || treeSymbols.pine
                        },
                        {
                            value: 129,
                            symbol: symbol || treeSymbols.oak
                        },
                        {
                            value: 103,
                            symbol: symbol || treeSymbols.maple
                        },
                        {
                            value: 91,
                            symbol: symbol || treeSymbols.willow
                        },
                        {
                            value: 75,
                            symbol: symbol || treeSymbols.palm
                        }
                    ]
                }
            ]
        };
    }
    
    async function processGraphG13() {
        let HOSTG13 = "https://sos2425-13.onrender.com";
        let APIG13 = HOSTG13 + "/api/v2/national-parks";

        try {
            let data = await fetch(APIG13);
            let res = await data.json();

            res.filter(obj => obj.autonomous_community !== null).forEach(obj => {
                if (!national_parks[obj.autonomous_community]) {
                    national_parks[obj.autonomous_community] = obj.current_area;
                } else {
                    national_parks[obj.autonomous_community] = national_parks[obj.autonomous_community] + obj.current_area;
                }
            });

            // Initialize ECharts with tree data
            const figureDom = document.getElementById('G13');
            const chartDom = figureDom.childNodes[0];
            const myChart = echarts.init(chartDom);
            
            const options = [
                makeTreeOption('pictorialBar'),
                makeTreeOption('bar'),
                makeTreeOption('pictorialBar', 'circle')
            ];
            var optionIndex = 0;
            let option = options[optionIndex];
            setInterval(function () {
                optionIndex = (optionIndex + 1) % options.length;
                myChart.setOption(options[optionIndex]);
            }, 2500);
            
            // Handle resizing
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
            const figureDom= document.getElementById('G20');
            const chartDom = figureDom.childNodes[0];
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
    processGraphG13();
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


<figure id="G13" class="highcharts-figure">
    <div id="container"></div>
    <p class="highcharts-description">
        En este gráfico, se muestra la distribución del total de ayudas y subvenciones
        solicitadas y concedidas (durante el último trimestre del 2024) a las empresas e instituciones
        de Valencia afectadas por la DANA, en función del propósito,
        comparando la distribución del total de multas registradas en Valencia durante el 2023, en función del tipo.
    </p>
</figure>
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
