//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
const express= require("express");

const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;
const PATH_ABS= __dirname;

//CONSTANTES VARIAS
const cool= require("cool-ascii-faces");
//const path= require("path");
//const fs = require('fs');

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
const MADC= require("./samples/MADC/index-MADC.js");
app.get("/samples/MADC", (request, response) => {

    const mun = 'Elx/Elche';
    const avg = MADC.avgByMunName(mun);
    response.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>INDEX-MADC</title>
        </head>
        <body>
            <h1>INDEX-MADC</h1>
            <p id="res">La media del monto de ayuda/subvención concedida para el municipio de ${mun} es de ${avg.toFixed(2)}€</p>    
        </body>
        </html>`);
});

//  GBD

const GBD = require("./samples/GBD/index-GBD.js");

app.get("/samples/GBD", (request, response) => {
    const prov = "Alicante/Alacant";
    const media = parseFloat(GBD.mediaPorProvincia(prov));

    response.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>INDEX-GBD</title>
        </head>
        <body>
            <h1>INDEX-GBD</h1>
            <p id="res">La media de los contratos en la provincia de ${prov} es de: ${media.toFixed(2)}€</p>    
        </body>
        </html>`);
});

//  MVR
const MVR= require("./samples/MVR/index-MVR.js");
app.get("/samples/MVR", (request, response) => {

    const prov = "Castellón/Castelló";
    const avg = MVR.avgByPrueb();
    response.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INDEX-MVR</title>
    <script src="/samples/MVR/index-MVR.js" type="module"></script>
</head>
<body>
    <h1>INDEX-MVR</h1>
    <p id="res">El promedio de total_work_sus para la provincia ${prov} es: ${avg}</p> 
</body>
</html>`)

});


