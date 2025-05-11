// src/routes/api/v2/mix-autonomy-dana.js

import fetch from 'node-fetch';

export default function loadBackendMIX(app) {
  app.get('/api/v2/mix-autonomy-dana', async (req, res) => {
    try {
      // 1) Consumimos ambas APIs
      const [g11Res, danaRes] = await Promise.all([
        fetch('https://sos2425-11.onrender.com/api/v1/autonomy-dependence-applications'),
        fetch('https://sos2425-18.onrender.com/api/v2/dana-erte-stats')
      ]);
      const g11Data = await g11Res.json();
      const danaData = await danaRes.json();

      // 2) Mapa de municipio → place de G11
      const comunidadMap = {
        // Comunidad Valenciana
        "Alicante":                   "Comunidad Valenciana",
        "Elche":                      "Comunidad Valenciana",
        "Benicarló":                  "Comunidad Valenciana",
        "Peñíscola":                  "Comunidad Valenciana",
        "Castellón de la Plana":      "Comunidad Valenciana",
        "Moncófar":                   "Comunidad Valenciana",
        "Cuart de Poblet":            "Comunidad Valenciana",
        "Ribarroja del Turia":        "Comunidad Valenciana",
        "Almussafes":                 "Comunidad Valenciana",
        "Algemesí":                   "Comunidad Valenciana",
        "Paterna":                    "Comunidad Valenciana",
        "Valencia":                   "Comunidad Valenciana",
        "Albal":                      "Comunidad Valenciana",
        "Alfafar":                    "Comunidad Valenciana",
        "Quart De Poblet":            "Comunidad Valenciana",
        "Riba-Roja De Túria":         "Comunidad Valenciana",
        "Torrent":                    "Comunidad Valenciana",
        // Madrid
        "Madrid":                     "Madrid, Comunidad de",
        "Leganés":                    "Madrid, Comunidad de",
        "Pozuelo de Alarcón":         "Madrid, Comunidad de",
        // Cataluña
        "Barcelona":                  "Cataluña",
        "Castelldefels":              "Cataluña",
        "Sant Feliu de Llobregat":    "Cataluña",
        "Prat de Llobregat, El":      "Cataluña",
        "Sant Cugat del Vallès":      "Cataluña",
        // Andalucía
        "Málaga":                     "Andalucía",
        // Aragón
        "Zaragoza":                   "Aragón",
        // Galicia
        "Redondela":                  "Galicia",
        // Castilla - La Mancha
        "Cabanillas del Campo":       "Castilla - La Mancha"
      };

      // 3) Agrupamos ERTEs por comunidad y año
      const agrupados = {};
      danaData.forEach(d => {
        const place = comunidadMap[d.company_municipality];
        if (!place) return; // descartamos municipios sin mapeo

        const key = `${place}::${d.request_year}`;
        if (!agrupados[key]) {
          agrupados[key] = { total_ertes: 0, total_trabajadores: 0 };
        }
        agrupados[key].total_ertes += 1;
        agrupados[key].total_trabajadores += (d.total_work_sus || 0);
      });

      // 4) Mezclamos con G11: para cada entrada de dependencia inyectamos ERTEs
      const resultado = g11Data.map(e => {
        const key = `${e.place}::${e.year}`;
        const stats = agrupados[key] || { total_ertes: 0, total_trabajadores: 0 };
        return {
          comunidad:              e.place,
          año:                    e.year,
          población:              e.population,
          población_dependiente:  e.dependent_population,
          solicitudes_dependencia:e.request,
          total_ertes:            stats.total_ertes,
          total_trabajadores_ertes: stats.total_trabajadores
        };
      });

      // 5) Respondemos JSON
      res.json(resultado);
    } catch (err) {
      console.error('Error integrando G11 + DANA:', err);
      res.status(500).json({
        error: 'Fallo al integrar APIs',
        detalle: err.message
      });
    }
  });
}

export { loadBackendMIX };
