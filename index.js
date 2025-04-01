//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
//const express= require("express");
import express from "express";
import { loadBackend } from "./src/back/index.js";
import { loadBackendMVR } from "./src/back/index-MVR.js";

const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;


app.use(express.json());
app.use("/", express.static("./public"));

app.get('/', (req, res) => {
    res.status(200).send('API is up and running!');
});

loadBackendMVR(app);

loadBackend(app);

// Readme
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});


