import dataStore from "nedb";
//import * as MADC from "../../samples/MADC/index-MADC.js";
import * as fs from "fs";

let objData=[];
async function readAllDataMADC(ruta) {
    const CAMPOS = {
        "year": "integer", "month": "integer", "grant_date": "string", 'benef_id': "string",
        "benef_name": "string", "benef_type": "string", "purpose": "string", "grantor": "string",
        "grant_type": "string", "amt_granted": "float", "amt_paid": "float", "reimbursed": "float",
        "refunded": "float", "region_name": "string", "sec_cod": "integer",
        "sec_descr": "string", "aid_type": "string", "reg_base": "string", "fund_local": "float",
        "fund_regional": "float", "fund_state": "float", "fund_eu": "float", "fund_other": "float",
        "fund_type": "string", "prov_name": "string", "mun_name": "string"
    };
    let data = await fs.promises.readFile(ruta, 'utf8');

    data = data.split(`\n`).map(line => {
        
        line = line.split(`;`);
        let obj = {};
        Object.keys(CAMPOS).forEach((key, i) => {
            let elem = line[i] ? line[i].trim().replace(/"/g, '') : null;

            if (elem !== null) {
                if (CAMPOS[key] === "float") {
                    elem = parseFloat(elem);
                } else if (CAMPOS[key] === "integer") {
                    elem = parseInt(elem);
                } else {
                    if (elem.includes("/") && elem.split("/").length < 3) {
                        elem = (key === "mun_name") ? elem.split("/")[1] : elem.split("/")[0];
                    }
                }
            }
            obj[key] = (elem === '' || elem === null) ? null : elem;
        });
        return obj;
    }).filter(aid => aid.benef_id !== null);
    return data;
}
objData= await readAllDataMADC("./datasets/Ejemplo-Ayudas-Subvenciones-DANA-4TR(;).csv");
let pueblosdistintos= new Set(objData.map(e=> e.reg_base));

const BASE_API = "/api/v1";
let db_MADC = new dataStore();

function loadBackendMADC(app){

    const MADCmainResource= "dana-grants-subsidies-stats";

    app.get(`${BASE_API}/${MADCmainResource}/loadInitialData`, (request, response) => {
        let statusCode= 200;

        db_MADC.find({}, (err, data)=>{
            if(data.length===0){
                db_MADC.insert(objData);
                statusCode= 201;
                return response.status(statusCode).json({"message": "Inicialización de datos realizada correctamente", "statusCode": statusCode});
            }
            return response.status(statusCode).json({"message": "Inicialización de datos consecutiva realizada correctamente", "statusCode": statusCode});
        })
        
    });
    
    //RETRIEVE
    /*app.get(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode= 200;

        db_MADC.find({}, (err, data)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data!==0){
                    data= data.map(aid=>{
                        delete aid._id;
                        return aid;
                    });
                    return response.status(statusCode).json(data);
                }else{
                    statusCode=404;
                    return response.status(statusCode).json({"error": "Recurso no encontrado", "statusCode": statusCode})
                }
            }
        });
        
    });*/
    
    app.get(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode= 200;
        const munName= request.params.munName;
        let q= {};

        //year;month;grant_date;benef_id;benef_name;benef_type;

        // purpose;grantor;grant_type;amt_granted;amt_paid;reimbursed;
        // refunded;region_name;sec_cod;sec_descr;aid_type;reg_base;

        // fund_local;fund_regional;fund_state;fund_eu;fund_other;fund_type;
        // prov_name;mun_name
        if(request.query.year) q.year= parseInt(request.query.year);
        if(request.query.month) q.month= parseInt(request.query.month);
        if(request.query.grant_date) q.grant_date= request.query.grant_date;
        if(request.query.benef_id) q.benef_id= request.query.benef_id;
        if(request.query.benef_name) q.benef_name= request.query.benef_name;
        if(request.query.benef_type) q.benef_type= request.query.benef_type;

        if(request.query.purpose) q.purpose= request.query.purpose;
        if(request.query.grantor) q.grantor= request.query.grantor;
        if(request.query.grant_type) q.grant_type= request.query.grant_type;
        if(request.query.amt_granted) q.amt_granted= parseFloat(request.query.amt_granted);
        if(request.query.amt_paid) q.amt_paid= parseFloat(request.query.amt_paid);
        if(request.query.reimbursed) q.reimbursed= parseFloat(request.query.reimbursed);

        if(request.query.refunded) q.refunded= parseFloat(request.query.refunded);
        if(request.query.region_name) q.region_name= request.query.region_name;
        if(request.query.sec_cod) q.sec_cod= parseInt(request.query.sec_cod);
        if(request.query.sec_descr) q.sec_descr= request.query.sec_descr;
        if(request.query.aid_type) q.aid_type= request.query.aid_type;
        if(request.query.reg_base) q.reg_base= request.query.reg_base;

        if(request.query.fund_local) q.fund_local= parseFloat(request.query.fund_local);
        if(request.query.fund_regional) q.fund_regional= parseFloat(request.query.fund_regional);
        if(request.query.fund_state) q.fund_state= parseFloat(request.query.fund_state);
        if(request.query.fund_eu) q.fund_eu= parseFloat(request.query.fund_eu);
        if(request.query.fund_other) q.fund_other= parseFloat(request.query.fund_other);
        if(request.query.fund_type) q.fund_type= parseFloat(request.query.fund_type);

        if(request.query.prov_name) q.prov_name= request.query.prov_name;
        if(request.query.mun_name) q.mun_name= request.query.mun_name;

        /*if (request.query.from) q.year.$gte = parseInt(request.query.from);
        if (request.query.to) q.year.$lte = parseInt(request.query.to);

        if (request.query.fromDate) q.grant_date.$gte = request.query.fromDate;
        if (request.query.toDate) q.grant_date.$lte = request.query.toDate;
        
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 10;
        const offset = (page - 1) * limit;

        */

        db_MADC.find(q, (err, data)=>{
            console.log(data);
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data.length!==0){
                    data= data.map(aid=>{
                        delete aid._id;
                        return aid;
                    });
                    return response.status(statusCode).json(data);
                }else{
                    statusCode= 404;
                    return response.status(statusCode).json({"error": `Recurso no encontrado para el municipio de ${q.mun_name}`, "statusCode": statusCode})
                }
            }
            
        });   
    });
    
    app.get(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode= 200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
    
        db_MADC.findOne({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, (err, data)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data){
                    delete data._id;
                    return response.status(statusCode).json(data);
                }else{
                    statusCode= 404;
                    return response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
                }
            }
            
        }); 
    });
    
    //CREATE
    app.post(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        const newData= request.body;
        let statusCode=201;
        let token= true;
        if(token===false){
            statusCode=401;
            return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
        }

        if(!newData || request.headers['content-type'] !== 'application/json' || !isJSONToPost(newData, 26)){
            statusCode=400;
            return response.status(statusCode).json({"error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode})
        }else{
            newData.forEach(aidPost => {
                db_MADC.findOne({mun_name: `${aidPost.mun_name}`, month: aidPost.month, benef_id: `${aidPost.benef_id}`}, (err, data)=>{
                    if(err){
                        statusCode= 500;
                        return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode}); 
                    }else{
                        if(data){
                            statusCode=409;
                            return response.status(statusCode).json({"error": `Conflicto por existencia de varios recursos idénticos`, "statusCode": statusCode});
                        }else{
                            newData.forEach(aid=>{
                                delete aid._id;
                                db_MADC.insert(aid);
                            });
                            return response.sendStatus(statusCode);
                        }
                    }
                })
            });
        }
    
    });
    
    app.post(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode=405;
        return response.status(statusCode).json({"error": "Método no permitido. No puedes crear un recurso en una ruta específica" , "statusCode": statusCode});
    });
    
    //UPDATE
    app.put(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode=405;
        return response.status(statusCode).json({"error": "Método no permitido. No puedes actualizar toda la colección" , "statusCode": statusCode});
    });

    app.put(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        const newData= request.body;
        let statusCode= 200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
        let token= true;
        if(token===false){
            statusCode=401;
            return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
        }

        if(!newData || request.headers['content-type'] !== 'application/json' || !isJSONToPost(newData, 26) ||
            !((munName=== newData.mun_name) && (month=== newData.month && (benefId=== newData.benef_id)))){
            statusCode=400;
            return response.status(statusCode).json({"error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode})
         }else{
            db_MADC.update({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, {$set: newData}, (err, numberUpdated)=>{
                if(err){
                    statusCode= 500;
                    return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode}); 
                }else {
                    if (numberUpdated<1){
                        statusCode = 404;
                        return response.status(statusCode).json({ "error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode });
                    }else {                    
                    return response.sendStatus(statusCode);
                    }
                }
            });
        }
    });

    //DELETE
    app.delete(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        db_MADC.remove({}, {multi: true}, (err, numRemoved)=>{
            let statusCode=200;
            if(err){
                statusCode=500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                return response.status(statusCode).json({"message": "Borrado de datos realizado", "statusCode": statusCode});
            }
        });
        
    });
    
    app.delete(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode=200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
    
        db_MADC.remove({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, {}, (err, numRemoved)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(numRemoved<1){
                    statusCode= 404;
                    return response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`});
                }else if(token===false){
                    statusCode=401;
                    return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
                }else{
                    return response.status(statusCode).json({"message": `Borrado de datos realizado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
                }
            }
        });
    }); 
    
    function isJSONToPost(reqData, num) {
        let res;
        if(Array.isArray(reqData)){
            reqData.forEach(aidPost=>{
                if (Object.keys(aidPost).length === num) {
                    res = true;
                } else {
                    return false;
                }
            });
        }else{
            if (Object.keys(reqData).length === num) {
                res = true;
            } else {
                return false;
            }
        }
        return res;
    }      
}
export {readAllDataMADC, objData, pueblosdistintos, loadBackendMADC};