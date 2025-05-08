
export default function loadBackendMIX(app) {
    app.get('/api/v2/mix-autonomy-dana', async (req, res) => {
        try {
          const g11 = await fetch('https://sos2425-11.onrender.com/api/v1/autonomy-dependence-applications');
          const g11Data = await g11.json();
      
          const dana = await fetch('https://sos2425-18.onrender.com/api/v2/dana-erte-stats');
          const danaData = await dana.json();
      
          const comunidadMap = {
            "Alicante": "Comunitat Valenciana",
            "Elche": "Comunitat Valenciana",
            "Benicarló": "Comunitat Valenciana",
            "Peñíscola": "Comunitat Valenciana",
            "Castellón de la Plana": "Comunitat Valenciana",
            "Moncófar": "Comunitat Valenciana",
            "Cuart de Poblet": "Comunitat Valenciana",
            "Ribarroja del Turia": "Comunitat Valenciana",
            "Almussafes": "Comunitat Valenciana",
            "Aldaya": "Comunitat Valenciana",
            "Algemesí": "Comunitat Valenciana",
            "Paterna": "Comunitat Valenciana",
            "Valencia": "Comunitat Valenciana",
            "Massanassa": "Comunitat Valenciana",
            "Picassent": "Comunitat Valenciana",
            "Albal": "Comunitat Valenciana",
            "Alfafar": "Comunitat Valenciana",
            "Quart De Poblet": "Comunitat Valenciana",
            "Riba-Roja De Túria": "Comunitat Valenciana",
          
            "Madrid": "Comunidad de Madrid",
            "Pozuelo de Alarcón": "Comunidad de Madrid",
            "Leganés": "Comunidad de Madrid",
          
            "Barcelona": "Cataluña",
            "Castelldefels": "Cataluña",
            "Sant Feliu de Llobregat": "Cataluña",
            "Prat de Llobregat, El": "Cataluña",
            "Sant Cugat del Vallès": "Cataluña",
          
            "Málaga": "Andalucía",
            "Zaragoza": "Aragón",
            "Redondela": "Galicia",
            "Cabanillas del Campo": "Castilla - La Mancha"
          };
          
      
          // Agrupar tus datos por comunidad
          const agrupados = {};
      
          for (const d of danaData) {
            const municipio = d.company_municipality;
            const comunidad = comunidadMap[municipio];
      
            if (!comunidad) continue;
      
            if (!agrupados[comunidad]) {
              agrupados[comunidad] = { total_ertes: 0, total_trabajadores: 0 };
            }
      
            agrupados[comunidad].total_ertes += 1;
            agrupados[comunidad].total_trabajadores += (d.total_work_sus || 0);
          }
      
          // Mezclar con los datos externos
          const resultado = g11Data.map(e => {
            const internos = agrupados[e.place] || { total_ertes: 0, total_trabajadores: 0 };
            return {
              comunidad: e.place,
              año: e.year,
              población: e.population,
              población_dependiente: e.dependent_population,
              solicitudes_dependencia: e.request,
              total_ertes: internos.total_ertes,
              total_trabajadores_ertes: internos.total_trabajadores
            };
          });
      
          res.json(resultado);
        } catch (err) {
          res.status(500).json({ error: 'Fallo al integrar APIs', detalle: err.message });
        }
      });
    }      
export { loadBackendMIX };