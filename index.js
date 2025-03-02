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


//  MVR
const MVR= require("./samples/MVR/index-MVR.js");
app.get("/samples/MVR", (request, response) => {

    const prov = "Castellón/Castelló";
    const avg = MVR.avgByPrueb(prov);
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


// Readme
app.get("/about", (request, response) => {
    response.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>readme</title>
</head>
<body>
    <h1>README</h1>
    <p>SOS2425-18 </p>
    <p>Team </p> 
    <p>Miguel Vázquez de la Rubia (https://github.com/Mikyvaz) </p>
    <p>Guillermo Blanco Díaz (https://github.com/GuilleBlanco08) </p>
    <p>Miguel Ángel Domínguez Ciero (https://github.com/migdomcie) </p>
    <p>Project description: Our work consists on analyzing grants and subsidies from the Generalitat Valenciana, employment                                  contracts by municipality, gender, age, and sector, and temporary employment regulation files (ERTE). Trends in aid distribution, employment evolution,
    and the most in-demand occupations are compared, allowing assessment of their impact on different sectors and populations. </p>
    <p>Repository: [gti-sos/SOS2425-18](https://github.com/gti-sos/SOS2425-18) </p>
    <p>URL: https://sos2425-18.onrender.com </p>
    <p>APIs </p>
    <p>TBD </p>
    <p>TBD </p>
    <p>TBD </p>
</body>
</html>`)
})
