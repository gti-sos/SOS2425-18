// Inicialización del array con los datos de ejemplo (cada registro en una sola línea)
import dataStore from "nedb";

const BASE_API = "/api/v2";

let db = new dataStore();

let inicialData = [
    { request_month: 11, request_year: 2024, cnae_descr: 'Transporte de mercancías por carretera', company_municipality: 'Alicante', work_center_locality: 'Alicante', sector: 'SERVICIOS', total_work_sus: 1, total_man_sus: 1, total_woman_sus: 0 },
    { request_month: 12, request_year: 2024, cnae_descr: 'Educación secundaria técnica y profesional', company_municipality: 'Elche', work_center_locality: 'Elche', sector: 'SERVICIOS', total_work_sus: 3, total_man_sus: 2, total_woman_sus: 1 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de muebles de oficina y de establecimientos comerciales', company_municipality: 'Benicarló', work_center_locality: 'Benicarló', sector: 'INDUSTRIA', total_work_sus: 63, total_man_sus: 52, total_woman_sus: 11 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de carrocerías para vehículos de motor, fabricación de remolques y semirremolques', company_municipality: 'Peñíscola', work_center_locality: 'Peñíscola', sector: 'INDUSTRIA', total_work_sus: 87, total_man_sus: 55, total_woman_sus: 32 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Transporte por taxi', company_municipality: 'Castellón de la Plana', work_center_locality: 'Castellón De La Plana', sector: 'SERVICIOS', total_work_sus: 1, total_man_sus: 1, total_woman_sus: 0 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Transporte de mercancías por carretera', company_municipality: 'Moncófar', work_center_locality: 'Moncófar', sector: 'SERVICIOS', total_work_sus: 2, total_man_sus: 2, total_woman_sus: 0 },
    { request_month: 12, request_year: 2024, cnae_descr: 'Transporte de mercancías por carretera', company_municipality: 'Moncófar', work_center_locality: 'Moncófar', sector: 'SERVICIOS', total_work_sus: 2, total_man_sus: 2, total_woman_sus: 0 },
    { request_month: 10, request_year: 2024, cnae_descr: 'Servicios integrales a edificios e instalaciones', company_municipality: 'Cuart de Poblet', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 0, total_man_sus: 0, total_woman_sus: 0 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de otros componentes, piezas y accesorios para vehículos de motor', company_municipality: 'Ribarroja del Turia', work_center_locality: 'Riba-Roja De Túria', sector: 'INDUSTRIA', total_work_sus: 86, total_man_sus: 53, total_woman_sus: 33 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Actividades de las empresas de trabajo temporal', company_municipality: 'Madrid', work_center_locality: 'Aldaya; Almussafes; Gandía', sector: 'SERVICIOS', total_work_sus: 79, total_man_sus: 60, total_woman_sus: 19 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Comercio al por menor de prendas de vestir en establecimientos especializados', company_municipality: 'Málaga', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 4, total_man_sus: 0, total_woman_sus: 4 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de otros muebles', company_municipality: 'Cuart de Poblet', work_center_locality: 'Quart De Poblet', sector: 'INDUSTRIA', total_work_sus: 345, total_man_sus: 0, total_woman_sus: 0 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de otros componentes, piezas y accesorios para vehículos de motor', company_municipality: 'Almussafes', work_center_locality: 'Almazora; Almussafes; Bétera; Ibi; Meliana; Museros; Náquera; Paterna; Riba-Roja De Túria', sector: 'INDUSTRIA', total_work_sus: 464, total_man_sus: 345, total_woman_sus: 119 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otras actividades de apoyo a las empresas n.c.o.p.', company_municipality: 'Paterna', work_center_locality: 'Massanassa', sector: 'SERVICIOS', total_work_sus: 6, total_man_sus: 0, total_woman_sus: 6 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Restaurantes y puestos de comidas', company_municipality: 'Aldaya', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 25, total_man_sus: 7, total_woman_sus: 18 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Restaurantes y puestos de comidas', company_municipality: 'Sant Cugat del Vallès', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 24, total_man_sus: 10, total_woman_sus: 14 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otras actividades de apoyo a las empresas n.c.o.p.', company_municipality: 'Valencia', work_center_locality: 'Almussafes; Picassent; Valencia', sector: 'SERVICIOS', total_work_sus: 48, total_man_sus: 46, total_woman_sus: 2 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Elaboración de otros productos alimenticios n.c.o.p.', company_municipality: 'Redondela', work_center_locality: 'Catarroja', sector: 'INDUSTRIA', total_work_sus: 45, total_man_sus: 16, total_woman_sus: 29 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otros servicios personales n.c.o.p.', company_municipality: 'Cabanillas del Campo', work_center_locality: 'Almussafes', sector: 'SERVICIOS', total_work_sus: 771, total_man_sus: 566, total_woman_sus: 205 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Elaboración de productos cárnicos y de volatería', company_municipality: 'Torrent', work_center_locality: 'Torrent', sector: 'INDUSTRIA', total_work_sus: 297, total_man_sus: 211, total_woman_sus: 86 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Comercio al por menor de prendas de vestir en establecimientos especializados', company_municipality: 'Zaragoza', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 44, total_man_sus: 18, total_woman_sus: 26 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Limpieza general de edificios', company_municipality: 'Barcelona', work_center_locality: 'Almussafes', sector: 'SERVICIOS', total_work_sus: 268, total_man_sus: 221, total_woman_sus: 47 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Fabricación de maquinaria para las industrias del plástico y del caucho', company_municipality: 'Albal', work_center_locality: 'Albal', sector: 'INDUSTRIA', total_work_sus: 305, total_man_sus: 182, total_woman_sus: 123 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Comercio al por mayor de prendas de vestir y calzado', company_municipality: 'Sant Feliu de Llobregat', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 9, total_man_sus: 0, total_woman_sus: 9 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otros servicios de comidas', company_municipality: 'Leganés', work_center_locality: 'Algemesí; Paiporta; Paterna; Valencia', sector: 'SERVICIOS', total_work_sus: 45, total_man_sus: 3, total_woman_sus: 42 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Comercio al por mayor de frutas y hortalizas', company_municipality: 'Algemesí', work_center_locality: 'Algemesí', sector: 'SERVICIOS', total_work_sus: 368, total_man_sus: 0, total_woman_sus: 0 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otros servicios de comidas', company_municipality: 'Castelldefels', work_center_locality: 'Torrent', sector: 'SERVICIOS', total_work_sus: 289, total_man_sus: 31, total_woman_sus: 258 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Otras actividades de apoyo a las empresas n.c.o.p.', company_municipality: 'Pozuelo de Alarcón', work_center_locality: 'Aldaya', sector: 'SERVICIOS', total_work_sus: 19, total_man_sus: 11, total_woman_sus: 8 },
    { request_month: 11, request_year: 2024, cnae_descr: 'Comercio al por menor de muebles, aparatos de iluminación y otros artículos de uso doméstico en establecimientos especializados', company_municipality: 'Prat de Llobregat, El', work_center_locality: 'Alfafar', sector: 'SERVICIOS', total_work_sus: 33, total_man_sus: 10, total_woman_sus: 23 },
    { request_month: 1, request_year: 2025, cnae_descr: 'Actividades de programación informática', company_municipality: 'Almussafes', work_center_locality: 'Almussafes', sector: 'SERVICIOS', total_work_sus: 91, total_man_sus: 69, total_woman_sus: 22 }
];



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


db.find({}, (err, docs) => {
    if (err) {
      console.error("Error al leer DB en startup:", err);
    } else if (docs.length === 0) {
      db.insert(inicialData, (err2, newDocs) => {
        if (err2) {
          console.error("Error insertando datos iniciales:", err2);
        } else {
          console.log(`Sembrados ${newDocs.length} registros en MVR.`);
        }
      });
    } else {
      console.log("MVR ya tenía datos, no se resembran.");
    }
  });

function loadBackendMVR(app) {
    // F05-MVR
    let dataMVR = [];
    

    //dana-erte-stats
    const MVRMainResource = "/dana-erte-stats";
    app.get(BASE_API + MVRMainResource + "/docs", (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/42354753/2sB2j4hC4D");
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
