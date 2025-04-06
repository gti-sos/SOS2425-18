// Inicialización del array con los datos de ejemplo (cada registro en una sola línea)
import dataStore from "nedb";

const BASE_API = "/api/v1";

let db = new dataStore();

let inicialData = [
  {
      request_date: "22/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Alicante",
      company_province: "Alicante",
      work_center_locality: "Alicante",
      sector: "SERVICIOS",
      total_work_sus: 1,
      men_work_sus: 1,
      women_work_sus: 0 
  },
  {
      request_date: "12/09/2024",
      request_month: 12,
      request_year: 2024,
      cnae_descr: "Educación secundaria técnica y profesional",
      company_municipality: "Elche",
      company_province: "Alicante",
      work_center_locality: "Elche",
      sector: "SERVICIOS",
      total_work_sus: 3,
      men_work_sus: 2,
      women_work_sus: 1
  },
  {
      request_date: "14/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de muebles de oficina y de establecimientos comerciales",
      company_municipality: "Benicarló",
      company_province: "Castelló",
      work_center_locality: "Benicarló",
      sector: "INDUSTRIA",
      total_work_sus: 63,
      men_work_sus: 52,
      women_work_sus: 11
  },
  {
      request_date: "14/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de carrocerías para vehículos de motor, fabricación de remolques y semirremolques",
      company_municipality: "Peñíscola",
      company_province: "Castelló",
      work_center_locality: "Peñíscola",
      sector: "INDUSTRIA",
      total_work_sus: 87,
      men_work_sus: 55,
      women_work_sus: 32
  },
  {
      request_date: "18/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte por taxi",
      company_municipality: "Castellón de la Plana",
      company_province: "Castelló",
      work_center_locality: "Castellón De La Plana",
      sector: "SERVICIOS",
      total_work_sus: 1,
      men_work_sus: 1,
      women_work_sus: 0
  },
  {
      request_date: "21/11/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Moncófar",
      company_province: "Castelló",
      work_center_locality: "Moncófar",
      sector: "SERVICIOS",
      total_work_sus: 2,
      men_work_sus: 2,
      women_work_sus: 0
  },
  {
      request_date: "17/12/2024",
      request_month: 12,
      request_year: 2024,
      cnae_descr: "Transporte de mercancías por carretera",
      company_municipality: "Moncófar",
      company_province: "Castelló",
      work_center_locality: "Moncófar",
      sector: "SERVICIOS",
      total_work_sus: 2,
      men_work_sus: 2,
      women_work_sus: 0
  },
  {
      request_date: "31/10/2024",
      request_month: 10,
      request_year: 2024,
      cnae_descr: "Servicios integrales a edificios e instalaciones",
      company_municipality: "Cuart de Poblet",
      company_province: "Valencia",
      work_center_locality: "Aldaya",
      sector: "SERVICIOS",
      total_work_sus: 0,
      men_work_sus: 0,
      women_work_sus: 0
  },
  {
      request_date: "11/04/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Fabricación de otros componentes, piezas y accesorios para vehículos de motor",
      company_municipality: "Ribarroja del Turia",
      company_province: "Valencia",
      work_center_locality: "Riba-Roja De Túria",
      sector: "INDUSTRIA",
      total_work_sus: 86,
      men_work_sus: 53,
      women_work_sus: 33
  },
  {
      request_date: "11/04/2024",
      request_month: 11,
      request_year: 2024,
      cnae_descr: "Actividades de las empresas de trabajo temporal",
      company_municipality: "Madrid",
      company_province: "Madrid",
      work_center_locality: "Aldaya; Almussafes; Gandía",
      sector: "SERVICIOS",
      total_work_sus: 79,
      men_work_sus: 60,
      women_work_sus: 19
  }
];

// Ejemplo de la carpeta "samples" ----------------------------------------------------------------
    // Valor geográfico por el cual se filtrarán las filas (puede modificarse según se necesite)
    let selectedProvince = "Valencia";
  
  
  function avgByPrueb(selectedProvince){
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


function loadBackendMVR(app){
    // F05-MVR
    let dataMVR = [];

    //dana-erte-stats
    const MVRMainResource = "/dana-erte-stats";
    app.get(BASE_API+ MVRMainResource + "/docs", (req, res)=>{
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
                        return response.status(201).json(newDocs.map((c) =>{
                            delete c._id;
                            return c;
                        }));
                    }
                });
            } else {
                console.log("Contactos ya presentes en la DB.");
                return response.status(200).json(dataStats.map((c) =>{
                    delete c._id;
                    return c;
                }));
            }
        });
    });
    

    // GET base de datos actual. 
    app.get(BASE_API + MVRMainResource, (req, res) => {
        const { limit, offset, ...filters } = req.query;
    
        // Conversión segura a número
        let parsedLimit = parseInt(limit);
        let parsedOffset = parseInt(offset);
    
        // Valores por defecto
        if (isNaN(parsedLimit) || parsedLimit < 0) parsedLimit = 0;
        if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;
    
        // Restricción de paginación segura: máximo 100 resultados
        if (parsedLimit > 100) parsedLimit = 100;
    
        // Conversión de filtros numéricos si aplican
        for (let key in filters) {
            if (!isNaN(filters[key])) {
                filters[key] = Number(filters[key]);
            }
        }
    
        db.find(filters)
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


    // DELETE un municipio en concreto.
    app.delete(BASE_API + MVRMainResource + "/:municipality", (request, response) => {
        const { municipality } = request.params;
        const initialLength = dataMVR.length;
        console.log(`Llamando a DELETE para eliminar ${municipality} de la base de datos...`, request.params);

        // `^${municipality}$` indica el principio y final del string. es decir, coincidirá madrid con madrid, pero no con madrid_centro. La "i" es para pasar todo a minúscula
        db.remove({ company_municipality: new RegExp(`^${municipality}$`, "i") }, { multi: true }, (err, numRemoved) => {
            if (err) {
                console.error("Error al eliminar el municipio:", err);
                return response.status(500).send("Error interno del servidor");
            }
            if (numRemoved === 0) {
                return response.status(404).json({
                error: `El municipio '${municipality}' no fue encontrado.`
                });
            }
            return response.status(200).json({
                message: `El municipio '${municipality}' ha sido eliminado correctamente.`,
                data: { numRemoved }
            });
            });
        });

    // GET un municipio en concreto
    app.get(BASE_API + MVRMainResource + "/:municipality", (request, response) => {
        const { municipality } = request.params;
        console.log(`Llamando a GET para obtener todos los datos de ${municipality}...`);

        db.find({company_municipality : new RegExp(`^${municipality}$`, "i")}, (err, docs) => {
            if (err) {
                console.error("Error al buscar el municipio: ", err);
                return response.status(500).send("Error interno del servidor");
            }
            if(docs.length === 0){
                return response.status(404).json({ 
                    error: `El municipio '${municipality}' no fue encontrado.` 
                });
            }
            return response.status(200).json({ 
                message: `El municipio '${municipality}' fue encontrado en los siguientes datos:`, 
                data: docs 
            });

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

    // Actualizar el registro
        db.update(
            { company_municipality: new RegExp(`^${municipality}$`, "i") },
            { $set: updatedData },
            {},
            (err, numReplaced) => {
                if (err) {
                console.error("Error al actualizar el municipio:", err);
                return res.status(500).send("Error interno del servidor");
                }
                if (numReplaced === 0) {
                return res.status(404).json({
                    error: `El municipio '${municipality}' no fue encontrado.`
                });
                }
            // Recuperar el registro actualizado
                db.find({ company_municipality: new RegExp(`^${municipality}$`, "i") }, (err, docs) => {
                if (err) {
                    console.error("Error al obtener el municipio actualizado:", err);
                    return res.status(500).send("Error interno del servidor");
                }
                return res.status(200).json({
                    message: `El municipio '${municipality}' ha sido actualizado correctamente.`,
                    data: docs.map(({ _id, ...rest }) => rest)
                });
                });
            }
            );
        });

    }


export {loadBackendMVR};
