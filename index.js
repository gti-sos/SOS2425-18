//CONSTANTES DE DESPLIEGUE Y DEPENDENCIAS GENERALES
const express= require("express");
const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;
const cool= require("cool-ascii-faces");

const BASE_API = "/api/v1";
app.use("/", express.static("./public"));
app.use(express.json());


//PETICIONES A URL DINAMICAS
//  COOL-ASCII-FACES
app.get("/", (request, response) =>{
    response.send("HOLA MUNDO!!!");
});

app.get("/cool", (request, response) =>{
    response.send(cool());
});

// MADC
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

//  F05 - MADC
const MADCmainResource= "dana-grants-subsidies-stats";

//loadInitialData
let MADCinitialData= [];

app.get(`${BASE_API}/${MADCmainResource}/loadInitialData`, (request, response) => {
    let statusCode= 200;
    let resp;
    if(MADCinitialData.length===0){
        MADCinitialData= MADC.aidExampleArray;
        statusCode= 201;
        resp= response.status(statusCode).json({"message": "has creado bien el array mostro"});
    }
    resp= response.status(statusCode).json({"message": "ya estaba creado el array"});
    return resp;
});

//RETRIEVE
app.get(`${BASE_API}/${MADCmainResource}`, (request, response) => {
    let statusCode= 200;
    return response.status(statusCode).json(MADCinitialData);
});

/*app.get(`${BASE_API}/${MADCmainResource}/:munName`, (request, response) => {
    let statusCode= 200;
    const {mun}= request.params;

    let array= MADCinitialData.filter(aid=> aid.mun_name===mun);
    return response.status(statusCode).json(array);
});

//CREATE
app.post(`${BASE_API}/${MADCmainResource}`, (request, response) => {
});

//UPDATE
app.put(`${BASE_API}/${MADCmainResource}`, (request, response) => {
});

//DELETE
app.delete(`${BASE_API}/${MADCmainResource}`, (request, response) => {
});

app.delete(`${BASE_API}/${MADCmainResource}`, (request, response) => {
});*/

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

app.get(BASE_API + "/contr-mun-stats", (request, response) => {
    return response.status(200).json(contr_mun_stats);
});

app.get(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (request, response) => {
    const { year, month, prov_cod, mun_cod, sec_cod } = request.params;

    // Convertir valores a número para evitar problemas de tipo
    const yearNum = Number(year);
    const monthNum = Number(month);
    const provCodNum = Number(prov_cod);
    const munCodNum = Number(mun_cod);

    // Buscar el recurso en el array
    const resource = contr_mun_stats.find(stat =>
        stat.year === yearNum &&
        stat.month === monthNum &&
        stat.prov_cod === provCodNum &&
        stat.mun_cod === munCodNum &&
        stat.sec_cod.toLowerCase() === sec_cod.toLowerCase()
    );

    if (!resource) {
        return response.status(404).json({ error: "Recurso no encontrado." });
    }

    return response.status(200).json(resource);
});

app.post(BASE_API + "/contr-mun-stats", (request, response) => {
    let newData = request.body;

    if (!newData || Object.keys(newData).length === 0) {
        return response.status(400).json({ error: "El cuerpo de la petición está vacío o mal formado." });
    }

    const exists = contr_mun_stats.some(stat => 
        stat.year === newData.year &&
        stat.month === newData.month &&
        stat.prov_cod === newData.prov_cod &&
        stat.mun_cod === newData.mun_cod &&
        stat.sec_cod === newData.sec_cod
    );

    if (exists) {
        return response.status(409).json({ error: "El recurso ya existe." });
    }

    contr_mun_stats.push(newData);
    return response.status(201).json({ message: "Recurso creado exitosamente", data: newData });
});

app.post(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (request, response) => {
    return response.status(405).json({ error: "Método no permitido. No puedes crear un recurso en una ruta específica." });
});

app.put(BASE_API + "/contr-mun-stats", (request, response) => {
    return response.status(405).json({ error: "Método no permitido. No puedes actualizar toda la colección." });
});

app.put(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (request, response) => {
    const { year, month, prov_cod, mun_cod, sec_cod } = request.params;
    let updatedData = request.body;

    // Convertir valores a número para evitar problemas de tipo
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const provCodNum = parseInt(prov_cod);
    const munCodNum = parseInt(mun_cod);

    // Buscar el índice del recurso en el array
    const index = contr_mun_stats.findIndex(stat =>
        stat.year === yearNum &&
        stat.month === monthNum &&
        stat.prov_cod === provCodNum &&
        stat.mun_cod === munCodNum &&
        stat.sec_cod === sec_cod
    );

    // Si no se encuentra, devolver error 404
    if (index === -1) {
        return response.status(400).json({ error: "Recurso no encontrado." });
    }

    // Validar que el cuerpo de la petición no esté vacío
    if (!updatedData || Object.keys(updatedData).length === 0) {
        return response.status(400).json({ error: "El cuerpo de la petición está vacío o mal formado." });
    }

    // Actualizar los datos del recurso encontrado
    contr_mun_stats[index] = { ...contr_mun_stats[index], ...updatedData };

    return response.status(200).json({ message: "Recurso actualizado exitosamente", data: contr_mun_stats[index] });
});

app.delete(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (request, response) => {
    const { year, month, prov_cod, mun_cod, sec_cod } = request.params;

    // Convertir a número los valores numéricos para evitar errores
    const yearNum = Number(year);
    const monthNum = Number(month);
    const provCodNum = Number(prov_cod);
    const munCodNum = Number(mun_cod);

    // Buscar el índice del recurso en el array
    const index = contr_mun_stats.findIndex(stat =>
        stat.year === yearNum &&
        stat.month === monthNum &&
        stat.prov_cod === provCodNum &&
        stat.mun_cod === munCodNum &&
        stat.sec_cod.toLowerCase() === sec_cod.toLowerCase()
    );

    if (index === -1) {
        return response.status(404).json({ error: "Recurso no encontrado." });
    }

    // Eliminar el recurso del array
    contr_mun_stats.splice(index, 1);

    return response.status(200).json({ message: "Recurso eliminado exitosamente" });
});

app.delete(BASE_API + "/contr-mun-stats", (request, response) => {
    contr_mun_stats = [];  // Vaciar el array
    return response.status(200).json({ message: "Todos los recursos han sido eliminados." });
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

const MVRMainResource = "/dana-erte-stats";

let dataMVR = [];

// GET base de datos actual. 
app.get(BASE_API + MVRMainResource, (request, response)=> {
    response.send(`La base de datos actual es: ${JSON.stringify(dataMVR)}`);
    });

// GET cargar la base de datos inicial.
app.get(BASE_API + MVRMainResource + "/loadInitialData", (request, response)=> {
    let statusCode = 201;
    console.log("Llamando al GET")
    if (dataMVR.length === 0){
        dataMVR = MVR.data;
        console.log("Array creado");
    }
    console.log("Array ya creado");
    response.send(JSON.stringify(dataMVR));
})


//POST
app.post(BASE_API + MVRMainResource + "/loadInitialData",(request, response) => {
    console.log("Llamando al POST to /loadInitialData");
    //console.log(`<${request.body}>`)
    let newData = request.body;
    
    dataMVR.push(newData);
    response.sendStatus(201);

});

// DELETE la base de datos
app.delete(BASE_API + MVRMainResource, (request, response) => {
    console.log("Eliminando la base de datos...");
    dataMVR = [];
    return response.status(200).json({ message: `La base de datos ha sido eliminada.`, dataMVR});
});


// DELETE un municipio en concreto. 
app.delete(BASE_API + MVRMainResource + "/:municipality", (request, response) => {
    const { municipality } = request.params;
    const initialLength = dataMVR.length;
    console.log(`Llamando a DELETE para eliminar ${municipality} de la base de datos...`, request.params);


    dataMVR = dataMVR.filter(item => item.company_municipality.toLowerCase() !== municipality.toLowerCase());
    if (dataMVR.length === initialLength) {
        return response.status(404).json({ error: `El municipio '${municipality}' no fue encontrado.` });
    }

    response.status(200).json({ message: `El municipio '${municipality}' ha sido eliminado correctamente`,data: dataMVR });
});

// GET un municipio en concreto
app.get(BASE_API + MVRMainResource + "/:municipality", (request, response)=> {
    const { municipality } = request.params;
    const initialLength = dataMVR.length;
    console.log(`Llamando a GET para obtener todos los datos de ${municipality}...`)


    filteredData = dataMVR.filter(item => item.company_municipality.toLowerCase() === municipality.toLowerCase());
    if (filteredData.length === initialLength) {
        return response.status(404).json({ error: `El municipio '${municipality}' no fue encontrado.` });
    }

    response.status(200).json({ message: `El municipio '${municipality}' fue encontrado en los siguientes datos: `, data: filteredData });


});

// PUT que actualice los valores de un municipio concreto
app.put(BASE_API + MVRMainResource + "/:municipality", (request, response) => {
    const { municipality } = request.params;
    const updatedData = request.body; // Datos enviados en la solicitud
    console.log(`Llamando a PUT para actualizar ${municipality}...`);

    let found = false;
    dataMVR = dataMVR.map(item => {
        if (item.company_municipality.toLowerCase() === municipality.toLowerCase()) {
            found = true;
            return { ...item, ...updatedData }; // Actualiza solo los campos enviados
        }
        return item;
    });

    if (!found) {
        return response.status(404).json({ error: `El municipio '${municipality}' no fue encontrado.` });
    }

    response.status(200).json({ message: `El municipio '${municipality}' ha sido actualizado correctamente`, data: dataMVR });
});


// Readme
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});
