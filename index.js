//CONSTANTES DE DESPLIEGUE
const express= require("express");
const app= express();
const PORT= process.env.PORT || 3000;
const PROYECTNAME= `SOS2425-18`;
const ROOT_PATH= "SOS2425-18"

//CONSTANTES VARIAS
const cool= require("cool-ascii-faces");

app.listen(PORT, ()=>{
    console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});

//PETICIONES A URL DINAMICAS
//  COOL-ASCII-FACES
app.get("/cool", (request, response) =>{
    response.send(cool());
});

//  MADC
app.use("/samples/MADC", express.static(ROOT_PATH+"/samples/MADC"));


