<!-- App.svelte -->

<script>
    import { onMount, onDestroy } from 'svelte';
    import { Alert } from "@sveltestrap/sveltestrap";
    import { dev } from "$app/environment";
    import { browser } from '$app/environment';
    
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";
    let API1 = "/api/v2/municipalities";

    if (dev) API = DEVEL_HOST + API;
    if (dev) API1 = DEVEL_HOST + API1;

    let mapContainer;
    let d3;
    let svg;
    
    // Datos de provincias españolas
    const municipalitiesData = [];
    
    // Función para generar un color basado en el valor
    function getColor(valor) {
      return valor > 1000 ? '#800026' :
             valor > 500 ? '#BD0026' :
             valor > 200 ? '#E31A1C' :
             valor > 100 ? '#FC4E2A' :
             valor > 50 ? '#FD8D3C' :
                          '#FEB24C';
    }

    async function loadD3() {
        // Solo importamos D3 en el cliente
        if (browser) {
            // Importación dinámica de D3
            d3 = await import('d3');
            return true;
        }
        return false;
    }

    async function processGraphs() {
        try {
            // Primero cargar D3 (solo en el cliente)
            const d3Loaded = await loadD3();
            if (!d3Loaded) return;
            
            // Luego cargar los datos
            let data = await fetch(API);
            let res = await data.json();

            let data1 = await fetch(API1);
            let res1 = await data1.json();

            res1.forEach(mun => {
                let obj = {};
                obj["prov_name"] = mun.prov_name;
                obj["mun_name"] = mun.mun_name;
                obj["lat_etrs89"] = mun.lat_etrs89;
                obj["long_etrs89"] = mun.long_etrs89;
                obj["valor"] = res.filter(aid => aid.mun_name === mun.mun_name).reduce((sum, current) => sum + (parseFloat(current.valor) || 0), 0);

                municipalitiesData.push(obj); 
            });

            console.log(municipalitiesData);

            // Configuración del mapa
            const width = mapContainer.clientWidth;
            const height = 600;
            
            // Crear SVG
            svg = d3.select(mapContainer)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .style("background", "#f5f5f5");
                
            // Proyección para la península ibérica
            const projection = d3.geoMercator()
                .center([-3.5, 40.2]) // Centrado en España
                .scale(2000)
                .translate([width / 2, height / 2]);
                
            // Cargar GeoJSON de España
            const response = await fetch("https://raw.githubusercontent.com/deldersveld/topojson/master/countries/spain/spain-comunidad-with-canary-islands.json");
            const spainData = await response.json();
            
            // Convertir TopoJSON a GeoJSON
            const spainFeatures = d3.feature(spainData, spainData.objects.ESP_adm1).features;
            
            // Crear el path para dibujar el mapa
            const path = d3.geoPath().projection(projection);
            
            // Dibujar el mapa base
            svg.selectAll("path")
                .data(spainFeatures)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#e0e0e0")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5);
                
            // Añadir burbujas
            svg.selectAll("circle")
                .data(municipalitiesData)
                .enter()
                .append("circle")
                .attr("cx", d => projection([d.long_etrs89, d.lat_etrs89])[0])
                .attr("cy", d => projection([d.long_etrs89, d.lat_etrs89])[1])
                .attr("r", d => Math.sqrt(d.valor) * 0.10)
                .attr("fill", d => getColor(d.valor))
                .attr("stroke", d => getColor(d.valor))
                .attr("stroke-width", d => d.valor * 0.05)
                .attr("opacity", 0.7)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("opacity", 1);
                    
                    // Añadir tooltip
                    svg.append("text")
                        .attr("class", "tooltip")
                        .attr("x", projection([d.long_etrs89, d.lat_etrs89])[0])
                        .attr("y", projection([d.long_etrs89, d.lat_etrs89])[1] - 10)
                        .attr("text-anchor", "middle")
                        .text(`${d.mun_name}: ${d.valor}`)
                        .style("font-size", "12px")
                        .style("font-weight", "bold")
                        .style("fill", "#333");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("opacity", 0.7);
                    svg.selectAll(".tooltip").remove();
                });
                
            // Añadir leyenda
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 120}, ${height - 150})`);
                
            const grades = [0, 50, 100, 200, 500, 1000];
            
            legend.append("text")
                .attr("x", 0)
                .attr("y", -10)
                .text("Valor por provincia")
                .style("font-size", "14px")
                .style("font-weight", "bold");
                
            grades.forEach((grade, i) => {
                legend.append("rect")
                    .attr("x", 0)
                    .attr("y", i * 20)
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", getColor(grade + 1));
                    
                legend.append("text")
                    .attr("x", 24)
                    .attr("y", i * 20 + 14)
                    .text(`${grade}${grades[i + 1] ? ` - ${grades[i + 1]}` : '+'}`)
                    .style("font-size", "12px");
            });

        } catch(err) {
            console.error("Error:", err);
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }

    onMount(() => {
        if (browser) {
            processGraphs();
        }
    });

    onDestroy(() => {
        destroyMap();
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
    function destroyMap() {
        if (browser && svg) {
            svg.remove();
        }
    }
</script>

<style>
    .map-container {
        height: 600px;
        width: 100%;
        max-width: 1200px;
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
    <h1>Mapa de Burbujas - Provincias de España</h1>
    <div class="map-container" bind:this={mapContainer}></div>
    {#if alertVisible}
        <Alert color={alertType} isOpen={alertVisible}>{alertMessage}</Alert>
    {/if}
</div>
