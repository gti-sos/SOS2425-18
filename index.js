//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
const express= require("express");
const BASE_API = "/api/v1";

const app= express();
app.use(express.json());
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;
const PATH_ABS= __dirname;

//CONSTANTES VARIAS
const cool= require("cool-ascii-faces");
const path= require("path");
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

// contr-mun-stats

let contr_mun_stats = [];

app.get(BASE_API+"/contr-mun-stats/loadInitialData",(request, response)=>{
    if (contr_mun_stats.length == 0)
    {
        contr_mun_stats = [
            { year: 2024, month: 11, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 40, mun_name: "Castelló de la Plana/Castellón de la Plana", sec_cod: "A", sec_descr: "Agricultura", num_contracts: 21 },
            { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 561 },
            { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 227 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 2 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 1 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 119, mun_name: "Sant Joan d'Alacant", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 9 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 902, mun_name: "Pilar de la Horadada", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 11 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 58, mun_name: "Cox", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 16 },
            { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 230, mun_name: "Silla", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 10 },
            { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 31, mun_name: "Benidorm", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 102 }
        ];

        return response.status(201).json({message: "Datos cargados correctamente", data: contr_mun_stats});
    }
    return response.status(200).json({message: "Datos ya cargados anteriormente", data: contr_mun_stats});
});

app.get(BASE_API + "/contr-mun-stats", (req, res) => {
    let filteredData = contr_mun_stats;

    if (req.query.mun_name) {
        filteredData = filteredData.filter(item => item.mun_name === req.query.mun_name);
    }
    
    if (req.query.year) {
        filteredData = filteredData.filter(item => item.year == req.query.year);
    }

    if (req.query.from && req.query.to) {
        const fromYear = parseInt(req.query.from);
        const toYear = parseInt(req.query.to);
        filteredData = filteredData.filter(item => item.year >= fromYear && item.year <= toYear);
    }

    res.status(200).json(filteredData);
});

app.get(BASE_API + "/contr-mun-stats/:mun_name/:year", (req, res) => {
    const munName = req.params.mun_name;
    const year = parseInt(req.params.year);

    const result = contr_mun_stats.find(item => item.mun_name === munName && item.year === year);

    if (!result) {
        return res.status(404).json({ error: "Not Found" });
    }

    res.status(200).json(result);
});

app.post(BASE_API + "/contr-mun-stats", (req, res) => {
    const newData = req.body;

    if (!newData.mun_name || !newData.year || !newData.num_contracts) {
        return res.status(400).json({ error: "Bad Request: Missing required fields" });
    }

    // Verificar si ya existe ese contrato
    if (contr_mun_stats.some(item => item.mun_name === newData.mun_name && item.year === newData.year)) {
        return res.status(409).json({ error: "Conflict: Resource already exists" });
    }

    contr_mun_stats.push(newData);
    res.status(201).json({ message: "Resource created successfully", data: newData });
});

app.put(BASE_API + "/contr-mun-stats/:mun_name/:year", (req, res) => {
    const munName = req.params.mun_name;
    const year = parseInt(req.params.year);
    const index = contr_mun_stats.findIndex(item => item.mun_name === munName && item.year === year);

    if (index === -1) {
        return res.status(404).json({ error: "Not Found" });
    }

    contr_mun_stats[index] = { ...contr_mun_stats[index], ...req.body };
    res.status(200).json({ message: "Resource updated successfully", data: contr_mun_stats[index] });
});

app.delete(BASE_API + "/contr-mun-stats/:mun_name/:year", (req, res) => {
    const munName = req.params.mun_name;
    const year = parseInt(req.params.year);
    const initialLength = contr_mun_stats.length;
    contr_mun_stats = contr_mun_stats.filter(item => !(item.mun_name === munName && item.year === year));

    if (contr_mun_stats.length === initialLength) {
        return res.status(404).json({ error: "Not Found" });
    }

    res.status(200).json({ message: "Resource deleted successfully" });
});

app.delete(BASE_API + "/contr-mun-stats", (req, res) => {
    contr_mun_stats = [];
    res.status(200).json({ message: "All resources deleted successfully" });
});

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
app.use("/about", express.static("./about/"));
