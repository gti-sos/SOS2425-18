import dataStore from "nedb";
const BASE_API = "/api/v1";

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

function loadBackendGBD(app){
    
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
}

export { loadBackendGBD };