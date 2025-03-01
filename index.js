//CONSTANTES DE DESPLIEGUE
const express= require("express");
const path= require("path");

const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;

//CONSTANTES VARIAS
const cool= require("cool-ascii-faces");

app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});

//PETICIONES A URL DINAMICAS
//  COOL-ASCII-FACES
app.get("/", (request, response) =>{
    response.send("HOLA MUNDO!!!");
});

app.get("/cool", (request, response) =>{
    response.send(cool());
});

//  MADC
app.get("/samples/MADC", (request, response) => {
    response.sendFile(`./samples/index-MADC.js`);
});

//  GBD

//  MVR



