// contr-mun-stats con persistencia usando NeDB

import dataStore from "nedb";
const BASE_API = "/api/v1";

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
    { year: 2024, month: 12, prov_cod: 3, prov_name: "Alicante/Alacant", mun_cod: 31, mun_name: "Benidorm", sec_cod: "S", sec_descr: "SERVICIOS", num_contracts: 102 }
];

function loadBackendGBD(app) {
    app.get(BASE_API + "/contr-mun-stats/loadInitialData", (req, res) => {
        db_GBD.find({}, (err, data) => {
            if (data.length > 0) {
                data.forEach(c => delete c._id);
                return res.status(200).json({ message: "Datos ya cargados anteriormente", data });
            } else {
                db_GBD.insert(initialData, (err2, newDocs) => {
                    newDocs.forEach(c => delete c._id);
                    return res.status(201).json({ message: "Datos cargados correctamente", data: newDocs.map(({ _id, ...rest }) => rest) });
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
            data.forEach(c => delete c._id);
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

    app.get(BASE_API+"/contr-mun-stats/docs", (request,response)=>{
        response.redirect("https://documenter.getpostman.com/view/42117294/2sB2cPjR4S");
    })
}

export { loadBackendGBD };
