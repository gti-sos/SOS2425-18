<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';

  let cryptoData = [];
  let launches = [];
  let cargandoCrypto = true;
  let cargandoSpaceX = true;
  let cargandoCountries = true;
  let cargandoSanciones = true;
  let cargandoTransporte = true;

  let countriesCanvas;
  let countriesChartInstance;
  let sancionesCanvas;
  let sancionesChartInstance;
  let transporteCanvas;
  let transporteChartInstance;

  const provincias = ["Valencia/València", "Alicante/Alacant", "Castellón/Castelló"];

  const normalize = (str) => str?.normalize?.("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

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

    // Countries (Doughnut)
    try {
      const resCountries = await fetch('https://restcountries.com/v3.1/region/europe');
      const countries = await resCountries.json();
      const top = countries.filter(c => c.population && c.name?.common)
        .sort((a, b) => b.population - a.population)
        .slice(0, 5);
      const labels = top.map(c => c.name.common);
      const data = top.map(c => c.population);
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

      const ctx = countriesCanvas.getContext('2d');
      countriesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            label: 'Población',
            data,
            backgroundColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } catch (err) {
      console.error("Error Countries API:", err);
    } finally {
      cargandoCountries = false;
    }

    // Comparativa: Contratos vs Sanciones
    try {
      const res1 = await fetch('https://sos2425-18.onrender.com/api/v2/contr-mun-stats');
      const contratos = await res1.json();

      const res2 = await fetch('https://sos2425-19.onrender.com/api/v1/sanctions-and-points-stats');
      const sanciones = await res2.json();

      const datosContratos = provincias.map(p =>
        contratos.filter(c => normalize(c.prov_name) === normalize(p))
                 .reduce((acc, cur) => acc + (cur.num_contracts || 0), 0)
      );

      const datosSanciones = provincias.map(p =>
        sanciones.filter(s => normalize(s.provincia) === normalize(p))
                 .reduce((acc, cur) => acc + (Number(cur["total_sanciones_con_puntos"]) || 0), 0)
      );

      const ctx = sancionesCanvas.getContext('2d');
      sancionesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: provincias,
          datasets: [
            {
              label: 'Contratos',
              data: datosContratos,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
              label: 'Sanciones con puntos',
              data: datosSanciones,
              backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    } catch (err) {
      console.error("Error integración sanciones:", err);
    } finally {
      cargandoSanciones = false;
    }

    // Comparativa: Contratos vs Transporte Público
    try {
      const res1 = await fetch('https://sos2425-18.onrender.com/api/v2/contr-mun-stats');
      const contratos = await res1.json();

      const res2 = await fetch('https://sos2425-21.onrender.com/api/v1/public-transit-stats');
      const transporte = await res2.json();

      const datosContratos = provincias.map(p =>
        contratos.filter(c => normalize(c.prov_name) === normalize(p))
                 .reduce((acc, cur) => acc + (cur.num_contracts || 0), 0)
      );

      const datosViajes = provincias.map(p =>
        transporte.filter(t => normalize(t.provincia) === normalize(p))
                  .reduce((acc, cur) => acc + (Number(String(cur.total_viajes).replace(",", "")) || 0), 0)
      );

      const ctx = transporteCanvas.getContext('2d');
      transporteChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Contratos vs. Viajes (Transporte Público)',
            data: provincias.map((_, i) => ({ x: datosContratos[i], y: datosViajes[i] })),
            backgroundColor: 'purple'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Contratos' } },
            y: { title: { display: true, text: 'Viajes en transporte público' } }
          }
        }
      });
    } catch (err) {
      console.error("Error integración transporte:", err);
    } finally {
      cargandoTransporte = false;
    }
  });
</script>

<h1>Integración de APIs</h1>

<section>
  <h2>Precios de Criptomonedas</h2>
  {#if cargandoCrypto}
    <p>Cargando...</p>
  {:else}
    <table>
      <thead><tr><th>Cripto</th><th>Precio (USD)</th></tr></thead>
      <tbody>{#each cryptoData as c}<tr><td>{c.name}</td><td>${c.current_price}</td></tr>{/each}</tbody>
    </table>
  {/if}
</section>

<section>
  <h2>Últimos Lanzamientos de SpaceX</h2>
  {#if cargandoSpaceX}
    <p>Cargando...</p>
  {:else}
    <ul>{#each launches as l}<li><strong>{l.name}</strong> – {new Date(l.date_utc).toLocaleDateString()}</li>{/each}</ul>
  {/if}
</section>

<section>
  <h2>Países más poblados de Europa</h2>
  {#if cargandoCountries}<p>Cargando datos...</p>{/if}
  <div style="width: 700px; height: 400px;"><canvas bind:this={countriesCanvas}></canvas></div>
</section>

<section>
  <h2>Comparativa: Contratos vs. Sanciones</h2>
  {#if cargandoSanciones}<p>Cargando comparativa...</p>{/if}
  <div style="width: 700px; height: 400px;"><canvas bind:this={sancionesCanvas}></canvas></div>
</section>

<section>
  <h2>Contratos vs. Viajes en Transporte Público</h2>
  {#if cargandoTransporte}<p>Cargando comparativa...</p>{/if}
  <div style="width: 700px; height: 400px;"><canvas bind:this={transporteCanvas}></canvas></div>
</section>

<style>
  section { margin-bottom: 40px; }
  canvas { width: 100% !important; height: 100% !important; }
  table {
    border-collapse: collapse;
    margin-top: 10px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 12px;
  }
</style>
