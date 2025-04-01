import dataStore from "nedb";
import * as MADC from "../../samples/MADC/index-MADC.js";

const BASE_API = "/api/v1";

let db_MADC = new dataStore();

function loadBackendMADC(app){
    
    // dana-grants-subsidies-stats

    const MADCmainResource= "dana-grants-subsidies-stats";

    app.get(`${BASE_API}/${MADCmainResource}/loadInitialData`, (request, response) => {
        let statusCode= 200;

        db_MADC.find({}, (err, data)=>{
            if(data.length===0){
                db_MADC.insert(MADC.aidExampleArray);
                statusCode= 201;
                return response.status(statusCode).json({"message": "Inicialización de datos realizada correctamente", "statusCode": statusCode});
            }
            return response.status(statusCode).json({"message": "Inicialización de datos consecutiva realizada correctamente", "statusCode": statusCode});
        })
        
    });
    
    //RETRIEVE
    app.get(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode= 200;

        db_MADC.find({}, (err, data)=>{
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
        });
        
    });
    
    app.get(`${BASE_API}/${MADCmainResource}/:munName`, (request, response) => {
        let statusCode= 200;
        const munName= request.params.munName;

        db_MADC.find({mun_name:`${munName}`}, (err, data)=>{
            if(data.length!==0){
                data= data.map(aid=>{
                    delete aid._id;
                    return aid;
                });
                return response.status(statusCode).json(data);
            }else{
                statusCode= 404;
                return response.status(statusCode).json({"error": `Recurso no encontrado para el municipio de ${munName}`, "statusCode": statusCode})
            }
        });   
    });
    
    app.get(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode= 200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
    
        db_MADC.find({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, (err, data)=>{
            if(data.length!==0){
                data= data.map(aid=>{
                    delete aid._id;
                    return aid;
                });
                return response.status(statusCode).json(data);
            }else{
                statusCode= 404;
                return response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
            }
        }); 
    });
    
    /*//CREATE
    app.post(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        const newData= request.body;
        let statusCode=201;
        let res;
        let token= true;
        if(!newData || Object.keys(newData).length===0 || typeof newData !== "object"){
            statusCode=400;
            res= response.status(statusCode).json({"error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode})
        }else{
            let exists = false;
            newData.forEach(aidPost => {
                const duplicates = MADCinitialData.filter(aid =>
                    aid.mun_name === aidPost.mun_name &&
                    aid.month === aidPost.month &&
                    aid.benef_id === aidPost.benef_id
                );
    
                if (duplicates.length > 0) {
                    exists = true;
                }});
    
            if(token===false){
                statusCode=401;
                res= response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
            }else if(exists){
                statusCode=409;
                res= response.status(statusCode).json({"error": `Conflicto por existencia de varios recursos idénticos`, "statusCode": statusCode});
            }else{
                newData.forEach(aid=> MADCinitialData.push(aid));
                res= response.sendStatus(statusCode);
            }
        }
        return res;
    
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
        let res;
        let token= true;
    
        let ind= MADCinitialData.findIndex(aid => aid.mun_name === munName &&
            aid.month === month &&
            aid.benef_id === benefId);
    
        if (ind === -1) {
            statusCode = 404;
            res = response.status(statusCode).json({ "error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode });
        } else {
            let aid = MADCinitialData[ind];
            let dataCorresp= benefId === aid.benef_id;
            if (!dataCorresp || (!newData || Object.keys(newData).length === 0)) {
                statusCode = 400;
                res = response.status(statusCode).json({ "error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode });
            }else{
                aid = { ...aid, ...newData };
                let exists = false;
                const duplicates = MADCinitialData.filter(aidPut =>
                    aidPut.mun_name === aid.mun_name &&
                    aidPut.month === aid.month &&
                    aidPut.benef_id === aid.benef_id);
    
                if (duplicates.length + 1 > 1) {
                    exists = true;
                }
    
                if(token===false){
                    statusCode=401;
                    res= response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
                }
                else if(exists){
                    statusCode=409;
                    res= response.status(statusCode).json({ "error": `Conflicto por existencia de varios recursos idénticos`, "statusCode": statusCode });
                }else{
                    res= response.sendStatus(statusCode);
                    MADCinitialData[ind]= aid;
                }    
            } 
        }
        return res;
    });
    
    //DELETE
    app.delete(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        MADCinitialData=[];
        let statusCode=200;
        return response.status(statusCode).json({"message": "Borrado de datos realizado", "statusCode": statusCode});
    });
    
    app.delete(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode=200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
        let res;
    
        let ind= MADCinitialData.findIndex(aid => aid.mun_name === munName &&
            aid.month === month &&
            aid.benef_id === benefId);
    
        if(ind ===-1){
            statusCode= 404;
            res= response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`});
        }else{
            if(token===false){
                statusCode=401;
                res= response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
            }else{
                res= response.status(statusCode).json({"message": `Borrado de datos realizado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
            }
        }
    });
    // contr-mun-stats
    */
}
export { loadBackendMADC };