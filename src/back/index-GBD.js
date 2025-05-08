// contr-mun-stats con persistencia usando NeDB

import dataStore from "nedb";
const BASE_API = "/api/v2";

let db_GBD = new dataStore();

let initialData = [
    { year: 2024, month: 11, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 40, mun_name: "Castelló de la Plana/Castellón de la Plana", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 21 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 561 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 227 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 2 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 1 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 119, mun_name: "Sant Joan d'Alacant", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 9 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 902, mun_name: "Pilar de la Horadada", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 11 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 58, mun_name: "Cox", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 16 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 230, mun_name: "Silla", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 10 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 31, mun_name: "Benidorm", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 102 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 5, mun_name: "Albatera", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 37 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 561 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 227 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 2 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 76, mun_name: "Guardamar del Segura", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 1 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 119, mun_name: "Sant Joan d'Alacant", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 9 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 902, mun_name: "Pilar de la Horadada", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 11 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 58, mun_name: "Cox", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 9 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 65, mun_name: "Elx/Elche", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 16 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 230, mun_name: "Silla", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 10 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 202, mun_name: "Pobla de Vallbona, la", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 2 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 31, mun_name: "Benidorm", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 102 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 88, mun_name: "Monforte del Cid", sec_cod: "A", sec_descr: "AGRICULTURA", num_contracts: 8 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 22, mun_name: "Alfafar", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 4 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 35, mun_name: "Almussafes", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 35 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 93, mun_name: "Novelda", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 4 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 79, mun_name: "Ibi", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 26 },
    { year: 2024, month: 12, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 40, mun_name: "Castelló de la Plana/Castellón de la Plana", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 107 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 65, mun_name: "Elx/Elche", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 141 },
    { year: 2024, month: 12, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 135, mun_name: "Vila-real", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 2 },
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 94, mun_name: "Nucia, la", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 1 },
    { year: 2024, month: 12, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 89, mun_name: "Peníscola/Peñíscola", sec_cod: "C", sec_descr: "CONSTRUCCIÓN", num_contracts: 8 },
    { year: 2024, month: 12, prov_cod: 12, prov_name: "Castellón/Castelló", mun_cod: 5, mun_name: "Alcora, l'", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 6 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 65, mun_name: "Beniparrell", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 2 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "I", sec_descr: "INDUSTRIA", num_contracts: 5 },
    { year: 2024, month: 12, prov_cod: 46, prov_name: "Valencia/València", mun_cod: 250, mun_name: "València", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 194 }
];

function loadBackendGBD(app) {
    // Cargar datos iniciales si la base de datos está vacía
    db_GBD.find({}, (err, data) => {
        if (err) {
            console.error("Error al acceder a la base de datos NeDB:", err);
        } else if (data.length === 0) {
            db_GBD.insert(initialData, (err2, newDocs) => {
                if (err2) {
                    console.error("Error al insertar datos iniciales:", err2);
                }
            });
        } else {
            console.log("La base de datos ya contiene información, no se insertan datos iniciales.");
        }
    });

    app.get(BASE_API + "/contr-mun-stats/loadInitialData", (req, res) => {
        db_GBD.find({}, (err, docs) => {
          if (err) {
            return res.status(500).json({ error: "Error al acceder a la base de datos." });
          }
      
          if (docs.length === 0) {
            db_GBD.insert(initialData, (err2, newDocs) => {
              if (err2) {
                return res.status(500).json({ error: "Error al insertar los datos iniciales." });
              }
      
              const insertedClean = newDocs.map(({ _id, ...rest }) => rest);
              return res.status(201).json({
                message: "Datos iniciales insertados correctamente.",
                data: insertedClean
              });
            });
          } else {
            const cleanDocs = docs.map(({ _id, ...rest }) => rest);
            return res.status(200).json({
              message: "Los datos ya estaban presentes.",
              data: cleanDocs
            });
          }
        });
      });       

    app.get(BASE_API+"/contr-mun-stats/docs", (request,response)=>{
        response.redirect("https://documenter.getpostman.com/view/42117294/2sB2cPjR4S");
    })

    app.get(BASE_API + "/contr-mun-stats", (req, res) => {
        const query = req.query;
        const dbQuery = {};
    
        // Filtros dinámicos
        for (let key in query) {
            if (["from", "to", "limit", "offset"].includes(key)) continue;
             // 5. Para cada otra clave, añadimos una propiedad al objeto dbQuery:
            //    - Si el valor no es numérico, lo dejamos como string
            //    - Si puede convertirse a número, lo convertimos
            dbQuery[key] = isNaN(query[key]) ? query[key] : Number(query[key]);
        }
    
        // Filtro por rango de año
        if (query.from || query.to) {
            dbQuery.year = {};
            if (query.from) dbQuery.year.$gte = Number(query.from);
            if (query.to) dbQuery.year.$lte = Number(query.to);
        }
    
        // Paginación
        const limit = parseInt(query.limit) || 0;     
        const offset = parseInt(query.offset) || 0;
    
        db_GBD.find(dbQuery).skip(offset).limit(limit).exec((err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error al recuperar los datos." });
            }
            data.forEach(d => delete d._id);
            res.status(200).json(data);
        });
    });    

    app.get(BASE_API + "/contr-mun-stats/:mun_name", (req, res) => {
        const mun_name = decodeURIComponent(req.params.mun_name);
        const from = Number(req.query.from);
        const to = Number(req.query.to);

        const query = { mun_name: mun_name };

        if (!isNaN(from) || !isNaN(to)) {
            query.year = {};
            if (!isNaN(from)) query.year.$gte = from;
            if (!isNaN(to)) query.year.$lte = to;
        }

        db_GBD.find(query, (err, data) => {
            data.forEach(c => delete c._id);
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
            delete doc._id;
            return res.status(200).json(doc);
        });
    });

    app.post(BASE_API + "/contr-mun-stats", (req, res) => {
        const newData = req.body;
    
        // Validación de campos
        const requiredFields = ["year", "month", "prov_cod", "prov_name", "mun_cod", "mun_name", "sec_cod", "sec_descr", "num_contracts"];
        const hasAllFields = requiredFields.every(field => newData.hasOwnProperty(field) && newData[field] !== undefined && newData[field] !== null && newData[field] !== "");
    
        if (!hasAllFields) {
            return res.status(400).json({ error: "Faltan campos obligatorios o alguno está vacío." });
        }
    
        // Buscar si ya existe
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
                    delete inserted._id;
                    res.status(201).json({ message: "Recurso creado exitosamente", data: inserted });
                });
            }
        });
    });
    

    app.post(BASE_API + "/contr-mun-stats/:year/:month/:prov_cod/:mun_cod/:sec_cod", (req, res) => {
        return res.status(405).json({ error: "Método no permitido en esta ruta." });
    });

    app.put(BASE_API + "/contr-mun-stats", (req, res) => {
        return res.status(405).json({ error: "Método no permitido en esta ruta." });
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

    app.get(BASE_API+"/data",(request,response)=>{
        console.log("New GET to /data");
        let data = [];

        function getRandomInt(){
            return Math.floor((Math.random()*1000));
        }

        for(let i=0;i<200;i++)
            data[i] = getRandomInt();

        response.json(data);
        
    });

}

export { loadBackendGBD };
