<script>
// @ts-nocheck

  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let cryptoData = [];
  let launches = [];
  let cargandoCrypto = true;
  let cargandoSpaceX = true;
  let cargandoCountries = true;
  let cargandoMerged = true;

  let countriesCanvas;
  let countriesChartInstance;
  let mergedCanvas;
  let mergedChartInstance;

  onMount(async () => {
    // CoinGecko
    try {
      const resCrypto = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1');
      cryptoData = await resCrypto.json();
    } catch (err) {
      console.error("Error CoinGecko:", err);
    } finally {
      cargandoCrypto = false;
    }

    // SpaceX
    try {
      const resSpaceX = await fetch('http://localhost:3000/spacex-proxy/past');
      const data = await resSpaceX.json();
      launches = data.slice(-3).reverse();
    } catch (err) {
      console.error("Error SpaceX:", err);
    } finally {
      cargandoSpaceX = false;
    }

    // Countries
    try {
      const resCountries = await fetch('https://restcountries.com/v3.1/region/europe');
      const countries = await resCountries.json();
      const topCountries = countries.filter(c => c.population && c.name && c.name.common).sort((a, b) => b.population - a.population).slice(0, 5);
      const nombres = topCountries.map(c => c.name.common);
      const poblaciones = topCountries.map(c => c.population);
      const ctx = countriesCanvas.getContext('2d');
      countriesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: nombres,
          datasets: [{
            label: 'Población',
            data: poblaciones,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    } catch (err) {
      console.error("Error Countries API:", err);
    } finally {
      cargandoCountries = false;
    }

    // Comparativa contratos vs sanciones
    try {
      const resContratos = await fetch('https://sos2425-18.onrender.com/api/v2/contr-mun-stats');
      const datosContratos = await resContratos.json();

      const resSanciones = await fetch('https://sos2425-19.onrender.com/api/v1/sanctions-and-points-stats');
      const datosSanciones = await resSanciones.json();

      const provincias = ["Valencia/València", "Alicante/Alacant", "Castellón/Castelló"];

      const datosContratosAgrupados = provincias.map(p => {
        return datosContratos
          .filter(c => c.prov_name?.toLowerCase() === p.toLowerCase())
          .reduce((acc, cur) => acc + (cur.num_contracts || 0), 0);
      });

      const datosSancionesAgrupados = provincias.map(p => {
        return datosSanciones
          .filter(s => s.provincia?.toLowerCase() === p.toLowerCase())
          .reduce((acc, cur) => acc + (parseFloat(cur["total_sanciones_con_puntos"]) || 0), 0);
      });

      const ctx = mergedCanvas.getContext('2d');
      mergedChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: provincias,
          datasets: [
            {
              label: 'Contratos',
              data: datosContratosAgrupados,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
              label: 'Sanciones con puntos',
              data: datosSancionesAgrupados,
              backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (err) {
      console.error("Error en integración comparativa:", err);
    } finally {
      cargandoMerged = false;
    }
  });
</script>

<h1>Integración de APIs</h1>

<section>
  <h2>Precios de Criptomonedas (CoinGecko)</h2>
  {#if cargandoCrypto}
    <p>Cargando datos de criptomonedas...</p>
  {:else}
    <table>
      <thead>
        <tr><th>Criptomoneda</th><th>Precio (USD)</th></tr>
      </thead>
      <tbody>
        {#each cryptoData as coin}
          <tr><td>{coin.name}</td><td>${coin.current_price}</td></tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<section>
  <h2>Últimos Lanzamientos de SpaceX</h2>
  {#if cargandoSpaceX}
    <p>Cargando datos de SpaceX...</p>
  {:else}
    <ul>
      {#each launches as launch}
        <li>
          <strong>Misión:</strong> {launch.name}<br>
          <strong>Fecha:</strong> {new Date(launch.date_utc).toLocaleDateString()}<br>
          <strong>Estado:</strong> {launch.success ? 'Exito' : 'Fallo'}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<section>
  <h2>Países más poblados de Europa</h2>
  {#if cargandoCountries}<p>Cargando datos y generando gráfica...</p>{/if}
  <div style="width: 100%; max-width: 700px; height: 400px;">
    <canvas bind:this={countriesCanvas}></canvas>
  </div>
</section>

<section>
  <h2>Comparativa: Contratos vs. Sanciones (por Provincia)</h2>
  {#if cargandoMerged}
    <p>Cargando datos comparativos...</p>
  {/if}
  <div style="width: 100%; max-width: 800px; height: 400px;">
    <canvas bind:this={mergedCanvas}></canvas>
  </div>
</section>

<style>
  table {
    border-collapse: collapse;
    margin-top: 10px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 12px;
    text-align: left;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    background: #f4f4f4;
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
  }
  section {
    margin-bottom: 40px;
  }
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>
