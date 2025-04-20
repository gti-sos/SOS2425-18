//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
//const express= require("express");
import express from "express";
import cors from "cors";
import { loadBackendMADC } from "./src/back/index-MADC.js";
//import { objData, pueblosdistintos, readAllDataMADC } from "./src/back/index-MADC.js";

import { loadBackendGBD } from "./src/back/index-GBD.js";
import { loadBackendMVR } from "./src/back/index-MVR.js";

//import svelte-handler
import { handler } from './src/front/build/handler.js';

const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;


app.use(express.json());
app.use(cors());
//app.use("/", express.static("./public"));

loadBackendMADC(app);
loadBackendGBD(app);
loadBackendMVR(app);

app.use(handler);

// Readme
app.use("/public", express.static("./public/"));
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});


