<script>
    // @ts-nocheck
    let API = "http://localhost:3000/api/v1/contr-mun-stats"
    import { onMount } from "svelte";

    let contrs = [];
    let result = "";
    let resultStatus = "";

    async function getContr(){
        resultStatus = result = "";
        try {
            const res = await fetch(API,{method:"GET"});

            const data = await res.json();
            result = JSON.stringify(data,null,2);
            contrs = data;
            console.log(`Response received:\n${JSON.stringify(contrs, null, 2)}`);
        } catch (error){
            console.log(`ERROR: GET from ${API}: ${error}`);
        }
    }

    onMount(async () => {
        getContr();
    })

</script>

<h2>Contra-mun-stats list</h2>
<table>
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
                <td>
                    
                </td>
            </tr>
        {/each}
    </tbody>
</table>