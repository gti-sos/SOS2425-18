// Inicialización del array con los datos de ejemplo (cada registro en una sola línea)
// src/back/index-MVR.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dataStore from 'nedb';
import { parse } from 'csv-parse/sync';

const BASE_API = "/api/v2";

let db = new dataStore();

// recreamos __filename y __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 1) Construye la ruta al CSV (subimos dos niveles desde src/back hasta la raíz)
const csvFilePath = path.resolve(
    __dirname,
    '../../datasets/expedientes_erte_modificado_final_solo_español.csv'
  );
  
  // 2) Lee y parsea el CSV
  const raw = fs.readFileSync(csvFilePath, 'latin1');   // ISO-8859-1 para los acentos
  const records = parse(raw, {
    delimiter: ';',         // tu separador es ;
    columns: true,          // toma la primera línea como cabeceras
    skip_empty_lines: true
  });
  
  // 3) Mapea a la estructura que necesitas
  const inicialData = records.map(r => ({
    request_month:      Number(r['mes_sol']),
    request_year:       Number(r['año_sol']),
    cnae_descr:         r['desc_cnae'],
    company_municipality: r['empresa_municipio'],
    work_center_locality: r['localidades_centro_trab'],
    sector:             r['desc_sector'],
    total_work_sus:     Number(r['total_trab_sus']),
    total_man_sus:      Number(r['trab_hombres_sus']),
    total_woman_sus:    Number(r['trab_mujeres_sus'])
  }));
  
  // 4) Sembrado en NeDB si está vacío
  db.find({}, (err, docs) => {
    if (!err && docs.length === 0) {
      db.insert(inicialData, (e, newDocs) => {
        console.log(`Sembrados ${newDocs.length} registros desde CSV.`);
      });
    }
  });
  

// Ejemplo de la carpeta "samples" ----------------------------------------------------------------
// Valor geográfico por el cual se filtrarán las filas (puede modificarse según se necesite)
let selectedProvince = "Valencia";


function avgByPrueb(selectedProvince) {
    // Filtrar el array para obtener solo las filas que tengan el valor seleccionado en "company_province"
    let filteredData = inicialData.filter(item => item.company_province === selectedProvince);

    // Extraer los valores numéricos del campo "total_work_sus"
    let totalWorkSusValues = filteredData.map(item => item.total_work_sus);

    // Calcular la suma de los valores usando reduce
    let sum = totalWorkSusValues.reduce((acc, value) => acc + value, 0);

    // Calcular la media
    let average = sum / totalWorkSusValues.length;
    return average;
}
avgByPrueb(selectedProvince);

// L06 --------------------------------------------------------------------------------------------

function loadBackendMVR(app) {
    // F05-MVR
    let dataMVR = [];
    

    //dana-erte-stats
    const MVRMainResource = "/dana-erte-stats";
    app.get(BASE_API + MVRMainResource + "/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42354753/2sB2cRE4zz#2b4141cf-9fb6-4e16-a593-95fa982a0907");
    });
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
    app.get(BASE_API + MVRMainResource + "/loadInitialData", (request, response) => {
        console.log("Llamando al GET");
        db.find({}, (err, dataStats) => {
            if (err) {
                console.error("Error al buscar la base de datos:", err);
                return response.status(500).send("Error al acceder a la base de datos");
            }

            if (dataStats.length < 1) {
                db.insert(inicialData, (err, newDocs) => {
                    if (err) {
                        console.error("Error al insertar datos iniciales", err);
                        return response.status(500).send("Error al insertar datos");
                    } else {
                        console.log("Datos iniciales insertados:", newDocs);
                        return response.status(201).json(newDocs.map((c) => {
                            delete c._id;
                            return c;
                        }));
                    }
                });
            } else {
                console.log("Contactos ya presentes en la DB.");
                return response.status(200).json(dataStats.map((c) => {
                    delete c._id;
                    return c;
                }));
            }
        });
    });


    // GET base de datos actual. 
    app.get(BASE_API + MVRMainResource, (req, res) => {
        const { limit, offset, from, to, ...filters } = req.query;

        // 1) Conversión y saneamiento de limit/offset
        let parsedLimit = parseInt(limit);
        let parsedOffset = parseInt(offset);
        if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 100;
        if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;
        if (parsedLimit > 100) parsedLimit = 100;

        // 2) Convertimos a número los filters que sean numéricos
        for (let key in filters) {
            if (!isNaN(filters[key])) filters[key] = Number(filters[key]);
        }

        // 3) Creamos las cláusulas de rango si vienen from/to
        const rangeClauses = [];
        if (from) {
            const fy = parseInt(from, 10);
            if (!isNaN(fy)) {
                // año mayor o año igual y mes >= 1 → incluimos todo ese año
                rangeClauses.push({
                    $or: [
                        { request_year: { $gt: fy } },
                        { request_year: fy, request_month: { $gte: 1 } }
                    ]
                });
            }
        }
        if (to) {
            const ty = parseInt(to, 10);
            if (!isNaN(ty)) {
                // año menor o año igual y mes <= 12 → incluimos todo ese año
                rangeClauses.push({
                    $or: [
                        { request_year: { $lt: ty } },
                        { request_year: ty, request_month: { $lte: 12 } }
                    ]
                });
            }
        }

        // 4) Montamos el objeto de consulta final
        //    Si hay cláusulas de rango las juntamos con AND
        let queryObj = { ...filters };
        if (rangeClauses.length) {
            queryObj = { $and: [queryObj, ...rangeClauses] };
        }

        // 5) Ejecutamos la consulta
        console.log("QUERY:\n filters =", filters, "\n from =", from, "to =", to);
        console.log("RANGE CLAUSES:", rangeClauses);
        console.log("FINAL QUERY OBJ:", JSON.stringify(queryObj, null, 2));

        db.find(queryObj)
            .skip(parsedOffset)
            .limit(parsedLimit)
            .exec((err, docs) => {
                if (err) {
                    console.error("Error al filtrar la DB:", err);
                    return res.status(500).send("Error interno del servidor");
                }
                const cleanDocs = docs.map(({ _id, ...rest }) => rest);
                return res.status(200).json(cleanDocs);
            });
    });




    //POST
    app.post(BASE_API + MVRMainResource, (request, response) => {
        console.log("Llamando al POST");
        const newData = request.body;

        // Validar que se haya recibido algún dato en el body
        if (!newData || Object.keys(newData).length === 0) {
            return response.status(400).json({
                error: "No se han recibido datos en el body"
            });
        }

        // Campos obligatorios 
        const requiredFields = [
            "request_month",
            "request_year",
            "cnae_descr",
            "company_municipality",
            "work_center_locality",
            "sector",
            "total_work_sus",
            "total_man_sus",
            "total_woman_sus"
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
        db.findOne({ company_municipality: newData.company_municipality }, (err, doc) => {
            if (err) {
                console.error("Error al buscar en la DB:", err);
                return response.status(500).send("Error interno del servidor");
            }
            if (doc) {
                return response.status(409).json({
                    error: `El recurso con municipio '${newData.company_municipality}' ya existe.`
                });
            }

            // Insertar el nuevo registro
            db.insert(newData, (err, insertedDoc) => {
                if (err) {
                    console.error("Error al insertar el nuevo recurso:", err);
                    return response.status(500).send("Error al insertar datos");
                }
                return response.status(201).json({
                    message: "Recurso creado correctamente",
                    data: (({ _id, ...rest }) => rest)(insertedDoc)
                });
            });
        });
    });



    // DELETE la base de datos
    app.delete(BASE_API + MVRMainResource, (request, response) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                console.error("Error al eliminar la DB:", err);
                return response.status(500).send("Error interno del servidor");
            }
            return response.status(200).json({
                message: `La base de datos ha sido eliminada. Registros eliminados: ${numRemoved}`
            });
        });
    });


// DELETE un registro concreto (municipio + año + mes)
app.delete(BASE_API + MVRMainResource + "/:municipality/:year/:month", (request, response) => {
      const { municipality, year, month } = request.params;
  
      console.log(
        `Llamando a DELETE para eliminar registro de '${municipality}' en ${month}/${year}...`,
        request.params
      );
  
      // Validar year y month
      const yr = parseInt(year, 10);
      const mo = parseInt(month, 10);
      if (isNaN(yr) || isNaN(mo)) {
        return response.status(400).json({
          error: "Los parámetros year y month deben ser números válidos."
        });
      }
  
      // Eliminamos sólo ese registro (multi: false)
      db.remove(
        {
          company_municipality: new RegExp(`^${municipality}$`, "i"),
          request_year: yr,
          request_month: mo
        },
        { multi: false },
        (err, numRemoved) => {
          if (err) {
            console.error("Error al eliminar el registro:", err);
            return response.status(500).send("Error interno del servidor");
          }
          if (numRemoved === 0) {
            return response.status(404).json({
              error: `No existe un registro para '${municipality}' en ${month}/${year}.`
            });
          }
          return response.status(200).json({
            message: `Registro de '${municipality}' (${month}/${year}) eliminado correctamente.`,
            data: { numRemoved }
          });
        }
      );
    }
  );
  

    // GET un municipio en concreto

    // GET de un dato en concreto
    app.get(
        BASE_API + MVRMainResource + "/:municipality/:year/:month",
        (req, res) => {
            const { municipality, year, month } = req.params;
            console.log(
                `Llamando a GET para obtener el recurso de '${municipality}' en ${month}/${year}...`
            );

            // Convertir año y mes a enteros
            const yr = parseInt(year, 10);
            const mo = parseInt(month, 10);

            // Validaciones básicas
            if (isNaN(yr) || isNaN(mo)) {
                return res.status(400).json({
                    error: "Los parámetros year y month deben ser números válidos."
                });
            }

            db.findOne(
                {
                    company_municipality: new RegExp(`^${municipality}$`, "i"),
                    request_year: yr,
                    request_month: mo
                },
                (err, doc) => {
                    if (err) {
                        console.error("Error al buscar el municipio:", err);
                        return res.status(500).send("Error interno del servidor");
                    }
                    if (!doc) {
                        return res.status(404).json({
                            error: `No se encontró registro para ${municipality} en ${month}/${year}.`
                        });
                    }

                    // Opcional: eliminar la clave _id si no deseas exponerla
                    const { _id, ...cleanDoc } = doc;

                    // Devuelve el objeto limpio
                    return res.status(200).json(cleanDoc);
                }
            );
        }
    );





    // PUT que actualice los valores de un municipio concreto
    app.put(BASE_API + MVRMainResource + "/:municipality/:year/:month", (req, res) => {
        const { municipality, year, month } = req.params;
        const updatedData = req.body;

        // ---- Validaciones ----
        // 1) Municipio en body y URL
        if (
            !updatedData.company_municipality ||
            updatedData.company_municipality.toLowerCase() !== municipality.toLowerCase()
        ) {
            return res.status(400).json({
                error: "El municipio en el body no coincide con el de la URL."
            });
        }

        // 2) Año en body y URL
        if (
            updatedData.request_year == null ||
            parseInt(updatedData.request_year, 10) !== parseInt(year, 10)
        ) {
            return res.status(400).json({
                error: "El campo request_year en el body no coincide con el de la URL."
            });
        }

        // 3) Mes en body y URL
        if (
            updatedData.request_month == null ||
            parseInt(updatedData.request_month, 10) !== parseInt(month, 10)
        ) {
            return res.status(400).json({
                error: "El campo request_month en el body no coincide con el de la URL."
            });
        }

        // ---- Actualización ----
        db.update(
            {
                company_municipality: new RegExp(`^${municipality}$`, "i"),
                request_year: parseInt(year, 10),
                request_month: parseInt(month, 10)
            },
            { $set: updatedData },
            {},
            (err, numReplaced) => {
                if (err) {
                    console.error("Error al actualizar:", err);
                    return res.status(500).send("Error interno del servidor");
                }
                if (numReplaced === 0) {
                    return res.status(404).json({
                        error: `No se encontró registro para ${municipality} en ${month}/${year}.`
                    });
                }
                // Recuperar el registro actualizado
                db.find(
                    {
                        company_municipality: new RegExp(`^${municipality}$`, "i"),
                        request_year: parseInt(year, 10),
                        request_month: parseInt(month, 10)
                    },
                    (err, docs) => {
                        if (err) {
                            console.error("Error al obtener el registro actualizado:", err);
                            return res.status(500).send("Error interno del servidor");
                        }
                        const responseData = docs.map(({ _id, ...rest }) => rest);
                        return res.status(200).json({
                            message: `Registro de ${municipality} (${month}/${year}) actualizado correctamente.`,
                            data: responseData
                        });
                    }
                );
            }
        );
    }
    );
}


export { loadBackendMVR };