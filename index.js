import express from "express";
import cors from "cors";
import request from "request";

import { loadBackendMADC } from "./src/back/index-MADC.js";
import { loadBackendGBD } from "./src/back/index-GBD.js";
import { loadBackendMVR } from "./src/back/index-MVR.js";
import { loadBackendMIX } from './src/back/integrations/index-MIX-ALM.js';

import { handler } from './src/front/build/handler.js';

const app = express();
const PORT = process.env.PORT || 3000;
const PROYECTNAME = `SOS2425-18`;

app.use(express.json());
app.use(cors());

//Proxy para SpaceX
const proxyPath = '/spacex-proxy';
const apiServerHost = 'https://api.spacexdata.com/v4/launches';

app.use(proxyPath, function(req, res) {
    const url = apiServerHost + req.url;
    console.log(' Proxying to:', url);
    req.pipe(request(url)).pipe(res);
});

// --- Proxy para Open‑Meteo ---------------------------------
const weatherProxy = '/weather-proxy';                 // lo que usará tu front
const weatherHost  = 'https://api.open-meteo.com';     // destino real

app.use(weatherProxy, (req, res) => {
  const url = weatherHost + req.url;      // concatena la query string
  console.log('[proxy] →', url);
  req.pipe(request(url)).pipe(res);
});

// Cargar backends
loadBackendMADC(app);
loadBackendGBD(app);
loadBackendMVR(app);
loadBackendMIX(app);

// Cargar backend para integración


// handler Svelte
app.use(handler);

// Rutas estáticas
app.use("/public", express.static("./public/"));
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});
