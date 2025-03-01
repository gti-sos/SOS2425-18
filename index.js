//CONSTANTES DE DESPLIEGUE
const express= require("express");
const path= require("path");
const fs = require('fs');

const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;
const PATH_ABS= __dirname;

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
    const content = fs.readFileSync(path.join(PATH_ABS, 'samples', 'MADC', 'index-MADC.js'), 'utf8');
    response.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>INDEX-MADC</title>
        </head>
        <body>
            <h1>INDEX-MADC</h1>
            <p id="res">${MADC}</p>    
            <script>
                ${content}
                // Mostrar el resultado en el HTML
                document.getElementById('resultado').innerText = avg;
            </script>
        </body>
        </html>`);
});

//  GBD

//  MVR



