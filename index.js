//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
//const express= require("express");
import express from "express";
import { loadBackend } from "./src/back/index.js";
import { loadBackendMADC } from "./src/back/index-MADC.js";
import { loadBackendGBD } from "./src/back/index-GBD.js";

const app= express();
const PORT= process.env.PORT || 3000;
app.use(express.json());
const PROYECTNAME= `SOS2425-18`;

app.use("/", express.static("./public"));


loadBackend(app);
loadBackendMADC(app);
loadBackendGBD(app);

// Readme
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});


