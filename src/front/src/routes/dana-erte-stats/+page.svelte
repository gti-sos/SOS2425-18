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
    onMount(async () => {
        getData();
    })

</script>

<h1>
    Hola, estoy provando mi página svelte.
    <Button color="secondary">Hola</Button>
</h1>

<Table>
    <thead>
        <tr>
            <th>request_date</th>
            <th>request_month</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th> 
        </tr>
      
    </thead>
    <tbody>
        {#each MVRDatas as MVRData}
        <tr>
            <td>
                {MVRData.request_date}
            </td>
            <td>
                {MVRData.request_month}
            </td>
            <td>

            </td>
        </tr>
        {/each}
    </tbody>
</Table>