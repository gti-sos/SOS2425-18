import dataStore from "nedb";
const BASE_API = "/api/v1";

// F05 - GBD
let db_GBD = new dataStore();

let initialContracts = [
    { year: 2024, month: 11, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 40, mun_name: "Castelló de la Plana/Castellón de la Plana", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 21 },
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

// F05-MVR
let dataMVR = [];

function loadBackend(app){
    
    // contr-mun-stats

    app.get(BASE_API + "/contr-mun-stats/loadInitialData", (req, res) => {
        db_GBD.find({}, (err, data) => {
            if (data.length > 0) {
                return res.status(200).json({ message: "Datos ya cargados anteriormente", data });
            } else {
                db_GBD.insert(initialContracts, (err2, newDocs) => {
                    return res.status(201).json({ message: "Datos cargados correctamente", data: newDocs });
                });
            }
        });
    });

    app.get(BASE_API + "/contr-mun-stats", (req, res) => {
        const query = req.query;
        const dbQuery = {};

        for (let key in query) {
            if (key === 'from' || key === 'to') continue;
            dbQuery[key] = isNaN(query[key]) ? query[key] : Number(query[key]);
        }

        if (query.from || query.to) {
            dbQuery.year = {};
            if (query.from) dbQuery.year.$gte = Number(query.from);
            if (query.to) dbQuery.year.$lte = Number(query.to);
        }

        db_GBD.find(dbQuery, (err, data) => {
            res.status(200).json(data);
        });
    });

    app.get(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (req, res) => {
        const { year, month, prov_cod, mun_cod, sec_cod } = req.params;

        db_GBD.findOne({
            year: Number(year),
            month: Number(month),
            prov_cod: Number(prov_cod),
            mun_cod: Number(mun_cod),
            sec_cod: sec_cod
        }, (err, doc) => {
            if (!doc) return res.status(404).json({ error: "Recurso no encontrado." });
            return res.status(200).json(doc);
        });
    });

    app.post(BASE_API + "/contr-mun-stats", (req, res) => {
        const newData = req.body;
        if (!newData || Object.keys(newData).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la petición está vacío o mal formado." });
        }

        db_GBD.findOne({
            year: newData.year,
            month: newData.month,
            prov_cod: newData.prov_cod,
            mun_cod: newData.mun_cod,
            sec_cod: newData.sec_cod
        }, (err, existing) => {
            if (existing) {
                return res.status(409).json({ error: "El recurso ya existe." });
            } else {
                db_GBD.insert(newData, (err2, inserted) => {
                    res.status(201).json({ message: "Recurso creado exitosamente", data: inserted });
                });
            }
        });
    });

    app.put(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (req, res) => {
        const { year, month, prov_cod, mun_cod, sec_cod } = req.params;
        const updatedData = req.body;

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la petición está vacío o mal formado." });
        }

        db_GBD.update({
            year: Number(year),
            month: Number(month),
            prov_cod: Number(prov_cod),
            mun_cod: Number(mun_cod),
            sec_cod: sec_cod
        }, { $set: updatedData }, {}, (err, numReplaced) => {
            if (numReplaced === 0) {
                return res.status(404).json({ error: "Recurso no encontrado." });
            }
            return res.status(200).json({ message: "Recurso actualizado exitosamente" });
        });
    });

    app.delete(BASE_API + "/contr-mun-stats", (req, res) => {
        db_GBD.remove({}, { multi: true }, (err, numRemoved) => {
            res.status(200).json({ message: "Todos los recursos han sido eliminados.", removed: numRemoved });
        });
    });

    app.delete(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (req, res) => {
        const { year, month, prov_cod, mun_cod, sec_cod } = req.params;

        db_GBD.remove({
            year: Number(year),
            month: Number(month),
            prov_cod: Number(prov_cod),
            mun_cod: Number(mun_cod),
            sec_cod: sec_cod
        }, {}, (err, numRemoved) => {
            if (numRemoved === 0) {
                return res.status(404).json({ error: "Recurso no encontrado." });
            }
            res.status(200).json({ message: "Recurso eliminado exitosamente" });
        });
    });

    //dana-erte-stats
    const MVRMainResource = "/dana-erte-stats";

    // Opciones permitidas en el main
    app.all(BASE_API + MVRMainResource, (req, res, next) => {
        if (!["GET", "POST", "DELETE"].includes(req.method)) {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
        next(); // Si es un método permitido, pasa a la siguiente ruta
    });

    // Opciones permitiras en el municipality.
    app.all(BASE_API + MVRMainResource + "/:municipality", (req, res, next) => {
        if (!["GET", "PUT", "DELETE"].includes(req.method)) {
            return res.status(405).json({ error: "Method Not Allowed" });
        }
        next();
    });

    // GET cargar la base de datos inicial.
    app.get(BASE_API + MVRMainResource + "/loadInitialData", (request, response)=> {
        let statusCode = 201;
        console.log("Llamando al GET")
        if (dataMVR.length === 0){
            dataMVR = MVR.data;
            console.log("Array creado");
            return response.status(201).json(dataMVR);
        }
        console.log("Array ya creado");
        return response.status(200).send(JSON.stringify(dataMVR));
    })

    // GET base de datos actual. 
    app.get(BASE_API + MVRMainResource, (request, response)=> {
        response.status(200).send(`La base de datos actual es: ${JSON.stringify(dataMVR)}`);
        });

    //POST
    app.post(BASE_API + MVRMainResource, (request, response) => {
        console.log("Llamando al POST to /loadInitialData");
        const newData = request.body;

        // Validar que se haya recibido algún dato en el body
        if (!newData || Object.keys(newData).length === 0) {
            return response.status(400).json({
                error: "No se han recibido datos en el body"
            });
        }

        // Campos obligatorios según el ejemplo de la base de datos
        const requiredFields = [
            "request_date",
            "request_month",
            "request_year",
            "cnae_descr",
            "company_municipality",
            "company_province",
            "work_center_locality",
            "sector",
            "total_work_sus",
            "men_work_sus",
            "women_work_sus"
        ];

        // Verificar que todos los campos obligatorios estén presentes
        const missingFields = requiredFields.filter(field => newData[field] === undefined || newData[field] === null);
        if (missingFields.length > 0) {
            return response.status(400).json({
                error: `Faltan campos obligatorios en el body: ${missingFields.join(', ')}`
            });
        }

        // Comprobar que no exista ya un recurso con el mismo valor de 'company_municipality'
        const exists = dataMVR.some(item =>
            item.company_municipality.toLowerCase() === newData.company_municipality.toLowerCase()
        );
        if (exists) {
            return response.status(409).json({
                error: `El recurso con municipio '${newData.company_municipality}' ya existe.`
            });
        }

        // Si todo es correcto, se añade el nuevo recurso
        dataMVR.push(newData);
        return response.status(201).json({ message: "Recurso creado correctamente", data: newData });
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
            return response.status(404).json({
                error: `El municipio '${municipality}' no fue encontrado.` });
        }

        return response.status(200).json({ 
            message: `El municipio '${municipality}' ha sido eliminado correctamente`,
            data: dataMVR });
    });

    // GET un municipio en concreto
    app.get(BASE_API + MVRMainResource + "/:municipality", (request, response) => {
        const { municipality } = request.params;
        console.log(`Llamando a GET para obtener todos los datos de ${municipality}...`);

        const filteredData = dataMVR.filter(item => 
            item.company_municipality.toLowerCase() === municipality.toLowerCase()
        );

        if (filteredData.length === 0) {
            return response.status(404).json({ 
                error: `El municipio '${municipality}' no fue encontrado.` 
            });
        }

        return response.status(200).json({ 
            message: `El municipio '${municipality}' fue encontrado en los siguientes datos:`, 
            data: filteredData 
        });
    });


    // PUT que actualice los valores de un municipio concreto
    app.put(BASE_API + MVRMainResource + "/:municipality", (req, res) => {
        const { municipality } = req.params;
        const updatedData = req.body;

        // Validar que el body incluya el campo 'company_municipality'
        // y que coincida (ignorando mayúsculas/minúsculas) con el valor pasado en la URL
        if (!updatedData.company_municipality || 
            updatedData.company_municipality.toLowerCase() !== municipality.toLowerCase()) {
            return res.status(400).json({
                error: "El ID del recurso en el body no coincide con el de la URL."
            });
        }

        // Buscar el recurso por su 'company_municipality'
        const index = dataMVR.findIndex(item =>
            item.company_municipality.toLowerCase() === municipality.toLowerCase()
        );

        // Si no se encuentra el recurso, se devuelve un 404
        if (index === -1) {
            return res.status(404).json({
                error: `El municipio '${municipality}' no fue encontrado.`
            });
        }

        // Se actualiza el recurso con los nuevos datos
        dataMVR[index] = { ...dataMVR[index], ...updatedData };

        // Se responde con un 200 y se devuelve el recurso actualizado (o el array completo)
        return res.status(200).json({
            message: `El municipio '${municipality}' ha sido actualizado correctamente`,
            data: dataMVR
        });
    });
}

export { loadBackend };