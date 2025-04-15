<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    
    let DEVEL_HOST = "http://localhost:3000";
    
    let API = "/api/v1/contr-mun-stats"
    
    if (dev)
        API = DEVEL_HOST + API;

    import { onMount } from "svelte";
    import { Button,Table } from '@sveltestrap/sveltestrap';

    let contrs = [];
    let result = "";
    let resultStatus = "";

    let newContrYear;
    let newContrMonth;
    let newContrProv_cod;
    let newContrProv_name;
    let newContrMun_cod;
    let newContrMun_name;
    let newContrSec_cod;
    let newContrSec_descr;
    let newContrNum_contracts;

    async function getContr(){
        resultStatus = result = "";
        try {
            const res = await fetch(API,{method:"GET"});

            const data = await res.json();
            result = JSON.stringify(data,null,2);
            contrs = data;
            console.log(`Respuesta recibida:\n${JSON.stringify(contrs, null, 2)}`);
        } catch (error){
            console.log(`ERROR: GET from ${API}: ${error}`);
        }
    }

    async function createContr(){
        resultStatus = result = "";
        try {
            const res = await fetch(API,{
                method:"POST",
                headers:{
                    "Content-Type" : "application/json"
                },
                body:JSON.stringify({
                    "year": newContrYear,
                    "month": newContrMonth,
                    "prov_cod": newContrProv_cod,
                    "prov_name": newContrProv_name,
                    "mun_cod": newContrMun_cod,
                    "mun_name": newContrMun_name,
                    "sec_cod": newContrSec_cod,
                    "sec_descr": newContrSec_descr,
                    "num_contracts": newContrNum_contracts
                })
            });

            const status = await res.status;
            resultStatus = status;

            if(status == 201){
                console.log(`Contacto creado`);
                getContr();
            }else{
                console.log(`ERROR al crear el contrato\n$(status)`);
            }
        } catch (error){
            console.log(`ERROR: POST de ${API}: ${error}`);
        }
    }

    async function deleteContr(){
        resultStatus = result = "";
        try {
            const res = await fetch(API,{method:"DELETE"});
            const data = await res.json(); // <- Aquí se define data
            result = JSON.stringify(data,null,2);
            const status = res.status;
            resultStatus = status;

            if(status == 200){
                if(status == 200){
                    console.log(`Todos los recursos eliminados`);
                    getContr();
                    newContrYear = "";
                    newContrMonth = "";
                    newContrProv_cod = "";
                    newContrProv_name = "";
                    newContrMun_cod = "";
                    newContrMun_name = "";
                    newContrSec_cod = "";
                    newContrSec_descr = "";
                    newContrNum_contracts = "";
                }

            } else {
                console.log(`ERROR al borrar los recursos\n${status}`);
            }

        } catch (error){
            console.log(`ERROR: DELETE from ${API}: ${error}`);
        }
    }

    onMount(async () => {
        getContr();
    })

</script>

<h2>Contra-mun-stats list</h2>
<Table>
    <thead>
        <tr>
            <th>Año</th>
            <th>Mes</th>
            <th>Código de provincia</th>
            <th>Nombre de provincia</th>
            <th>Código de municipio</th>
            <th>Nombre de municipio</th>
            <th>Código de sector</th>
            <th>Descripción de sector</th>
            <th>Número de contratos</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input bind:value={newContrYear}></td>
            <td><input bind:value={newContrMonth}></td>
            <td><input bind:value={newContrProv_cod}></td>
            <td><input bind:value={newContrProv_name}></td>
            <td><input bind:value={newContrMun_cod}></td>
            <td><input bind:value={newContrMun_name}></td>
            <td><input bind:value={newContrSec_cod}></td>
            <td><input bind:value={newContrSec_descr}></td>
            <td><input bind:value={newContrNum_contracts}></td>
            <td>
                <Button color="secondary" on:click={createContr}>Crear contrato</Button>
                <Button color="danger" on:click={deleteContr}>Borrar todo</Button>
            </td>
        </tr>        
        {#each contrs as contr}
            <tr>
                <td>
                    {contr.year}
                </td>
                <td>
                    {contr.month}
                </td>
                <td>
                    {contr.prov_cod}
                </td>
                <td>
                    {contr.prov_name}
                </td>
                <td>
                    {contr.mun_cod}
                </td>
                <td>
                    {contr.mun_name}
                </td>
                <td>
                    {contr.sec_cod}
                </td>
                <td>
                    {contr.sec_descr}
                </td>
                <td>
                    {contr.num_contracts}
                </td>
            </tr>
        {/each}
    </tbody>
</Table>