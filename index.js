import express from "express";
import cors from "cors";
import { loadBackendMADC } from "./src/back/index-MADC.js";
import { loadBackendGBD } from "./src/back/index-GBD.js";
import { loadBackendMVR } from "./src/back/index-MVR.js";
import { handler } from './src/front/build/handler.js';

const app = express();
const PORT = process.env.PORT || 3000;
const PROYECTNAME = `SOS2425-18`;
const isProduction = process.env.RENDER === "true" || process.env.NODE_ENV === "production";

app.use(express.json());
app.use(cors());

// APIs
loadBackendMADC(app);
loadBackendGBD(app);
loadBackendMVR(app);

// /about
app.use("/about", express.static("./about/"));

// SOLO en producción (Render) muestra landing page en "/"
if (isProduction) {
  app.use("/", express.static("./public"));
}

// Svelte
app.use(handler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Proyecto ${PROYECTNAME} desplegado en puerto ${PORT}`);
});
