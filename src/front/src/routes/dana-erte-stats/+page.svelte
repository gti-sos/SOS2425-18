<script>
    // @ts-nocheck
    import { Button, Alert, Input, Table } from '@sveltestrap/sveltestrap';
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    
    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v1/dana-erte-stats";
    if (dev)
        API = DEVEL_HOST + API;

    let MVRDatas = [];
    let result = "";
    let resultStatus = "";
    let newDate;
    let newMonth;
    let newMunicipality;

async function getData() {
    resultStatus = result = "";
    
    try {
        const res = await fetch(API, {method: "GET"});
        const data = await res.json();
        result = JSON.stringify(data, null, 2);
        MVRDatas = data;
        console.log(`Response received: \n${JSON.stringify(MVRDatas, null, 2)}`);
    } catch(error){
        console.log(`ERROR: GET from ${API}: ${error}`)
    }
    
}
async function deleteData(company_municipality) {
    resultStatus = result = "";
    
    try {
        const res = await fetch(API+"/"+company_municipality, {method: "DELETE"});
        const status = await res.status;
        resultStatus = status;
        if(status == 200){
            console.log(`Data deleted ${company_municipality}`);
            getData();

        }else{
            console.log(`ERROR deleting data ${company_municipality}: status received ${status}`);

        }
    } catch(error){
        console.log(`ERROR: GET from ${API}: ${error}`)
    }
    
    
}
async function createData() {
    resultStatus = result = "";
    
    try {
        const res = await fetch(API, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {request_date: newDate,
                request_month: newMonth,
                request_year: 2024,
                cnae_descr: "Transporte de mercancías por carretera",
                company_municipality: newMunicipality,
                company_province: "Castelló",
                work_center_locality: "Moncófar",
                sector: "SERVICIOS",
                total_work_sus: 2,
                men_work_sus: 2,
                women_work_sus: 0
            })
        
        });
        const status = await res.status;
        resultStatus = status;
        if(status == 201){
            console.log(`Data created: \n${JSON.stringify(MVRDatas, null, 2)}`);

        }else{
            console.log(`ERROR creating data: status received ${status}`);

        }
    } catch(error){
        console.log(`ERROR: GET from ${API}: ${error}`)
    }
    
}
    onMount(async () => {
        getData();
    })

</script>

<h1>
    Hola, estoy provando mi página svelte.
</h1>

<Table>
    <thead>
        <tr>
            <th>request_date</th>
            <th>request_month</th>
            <th>company_municipality</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th> 
        </tr>
      
    </thead>
    <tbody>
        <tr>
            <td>
                <input bind:value={newDate}>
            </td>
            <td>
                <input bind:value={newMonth}>
            </td> 
            <td>
                <input bind:value={newMunicipality}>

            </td>
            <td>
                <Button color="secondary" on:click={createData}>Create data</Button>
            </td>
            
        </tr>
        


        {#each MVRDatas as MVRData}
        <tr>
            <td>
                {MVRData.request_date}
            </td>
            <td>
                {MVRData.request_month}
            </td>
            <td>
                {MVRData.company_municipality}
            </td>
            <td>
                <Button color="danger" on:click={() => deleteData(MVRData.company_municipality)}>Delete data</Button>
            </td>
        </tr>
        {/each}
    </tbody>
</Table>