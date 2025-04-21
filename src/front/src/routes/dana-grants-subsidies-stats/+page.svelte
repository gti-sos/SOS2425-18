<script>
    // @ts-nocheck
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    import { 
        Button, 
        Table, 
        Container,
        Row,
        Col,
        Modal,
        ModalBody,
        ModalHeader,
        ModalFooter,
        Form,
        FormGroup,
        Input,
        Label,
        Card,
        CardBody,
        CardHeader,
        Collapse,
        Alert, 
    
    } from '@sveltestrap/sveltestrap';
    import { fade, slide } from "svelte/transition";
    import { goto, replaceState } from '$app/navigation';
	import query from "express/lib/middleware/query";

    let DEVEL_HOST = "http://localhost:3000";
    let API = "/api/v2/dana-grants-subsidies-stats";
    let queryURL="";
    let aids = [];

    // Estados para modales y colapsables
    let showCreateForm = false;
    let showFilterForm = false;
    let showDeleteAllModal = false;
    let editModalOpen = false;
    let deleteModalOpen = false;
    let currentAid = null;
    let alertMessage = "";
    let alertType = "success";
    let alertVisible = false;

    // Nuevo objeto para crear/editar subvenciones
    let newAid = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        grant_date: `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
        benef_id: "",
        benef_name: "",
        benef_type: "",
        purpose: "",
        grantor: "",
        grant_type: "",
        amt_granted: 0,
        amt_paid: 0,
        reimbursed: 0,
        refunded: 0,
        region_name: "Comunidad Valenciana",
        sec_cod: "",
        sec_descr: "",
        aid_type: "",
        reg_base: "",
        fund_local: 0,
        fund_regional: 0,
        fund_state: 0,
        fund_eu: 0,
        fund_other: 0,
        fund_type: "",
        prov_name: "",
        mun_name: ""
    };

    // Filtros
    let filtroYear = "";
    let filtroMonth = "";
    let filtroGrantDate = "";
    let filtroBenefId = "";
    let filtroBenefName = "";
    let filtroBenefType = "";
    let filtroPurpose = "";
    let filtroGrantor = "";
    let filtroGrantType = "";
    let filtroAmtGranted = "";
    let filtroAmtPaid = "";
    let filtroReimbursed = "";
    let filtroRefunded = "";
    let filtroRegionName = "";
    let filtroSecCod = "";
    let filtroSecDescr = "";
    let filtroAidType = ""
    let filtroRegBase = "";
    let filtroFundLocal = "";
    let filtroFundRegional = "";
    let filtroFundState = "";
    let filtroFundEu = "";
    let filtroFundOther = "";
    let filtroFundType = "";
    let filtroProvName = "";
    let filtroMunName = "";

    let filtroFrom = "";
    let filtroTo = "";
    let filtroLimit = "";
    let filtroPage = "";
    


    if (dev) API = DEVEL_HOST + API;

    async function iniatilizeData(){
        try {
            const res = await fetch(`${API}/loadInitialData`);
            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }
        } catch (error) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
    }
    // Función para obtener las ayudas con filtros opcionales
    async function getAids() {
        let url = API;
        const params = [];

        if (filtroYear)         params.push(`year=${filtroYear}`);
        if (filtroMonth)        params.push(`month=${filtroMonth}`);
        if (filtroGrantDate)    params.push(`grant_date=${encodeURIComponent(filtroGrantDate)}`);
        if (filtroBenefId)      params.push(`benef_id=${encodeURIComponent(filtroBenefId)}`);
        if (filtroBenefName)    params.push(`benef_name=${encodeURIComponent(filtroBenefName)}`);
        if (filtroBenefType)    params.push(`benef_type=${encodeURIComponent(filtroBenefType)}`);
        if (filtroPurpose)      params.push(`purpose=${encodeURIComponent(filtroPurpose)}`);
        if (filtroGrantor)      params.push(`grantor=${encodeURIComponent(filtroGrantor)}`);
        if (filtroGrantType)    params.push(`grant_type=${encodeURIComponent(filtroGrantType)}`);
        if (filtroAmtGranted)   params.push(`amt_granted=${filtroAmtGranted}`);
        if (filtroAmtPaid)      params.push(`amt_paid=${filtroAmtPaid}`);
        if (filtroReimbursed)   params.push(`reimbursed=${filtroReimbursed}`);
        if (filtroRefunded)     params.push(`refunded=${filtroRefunded}`);
        if (filtroRegionName)   params.push(`region_name=${encodeURIComponent(filtroRegionName)}`);
        if (filtroSecCod)       params.push(`sec_cod=${filtroSecCod}`);
        if (filtroSecDescr)     params.push(`sec_descr=${encodeURIComponent(filtroSecDescr)}`);
        if (filtroAidType)      params.push(`aid_type=${encodeURIComponent(filtroAidType)}`);
        if (filtroRegBase)      params.push(`reg_base=${encodeURIComponent(filtroRegBase)}`);
        if (filtroFundLocal)    params.push(`fund_local=${filtroFundLocal}`);
        if (filtroFundRegional) params.push(`fund_regional=${filtroFundRegional}`);
        if (filtroFundState)    params.push(`fund_state=${filtroFundState}`);
        if (filtroFundEu)       params.push(`fund_eu=${filtroFundEu}`);
        if (filtroFundOther)    params.push(`fund_other=${filtroFundOther}`);
        if (filtroFundType)     params.push(`fund_type=${encodeURIComponent(filtroFundType)}`);
        if (filtroProvName)     params.push(`prov_name=${encodeURIComponent(filtroProvName)}`);
        if (filtroMunName)      params.push(`mun_name=${encodeURIComponent(filtroMunName)}`);

        if (filtroFrom)         params.push(`from=${filtroFrom}`);
        if (filtroTo)           params.push(`to=${filtroTo}`);
        if (filtroLimit)        params.push(`limit=${filtroLimit}`);
        if (filtroPage)         params.push(`page=${filtroPage}`);

        queryURL= url;
        if (params.length > 0){
            queryURL= queryURL + "?" + params.join("&");
        }
        
        try {
            const res = await fetch(queryURL);
            if (res.status==404) {
                showAlert("No se ha encontrado ningún recurso que coincida con los datos especificados", "danger");
                aids=[];
                return;
            }
            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }
            const data = await res.json();
            aids = data;
        } catch (error) {
            showAlert("No se pudo conectar con el servidor", "danger");
        }
        //console.log(params);
    }

    // Función para crear una nueva subvención
    async function createAid() {
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify([newAid]),
            });

            if (res.status==401) {
                showAlert("No está autorizado para realizar esta operación", "danger");
                return;
            }

            if (res.status===400) {
                showAlert("El cuerpo de la petición está vacío o mal formado", "danger");
                return;
            }

            if (res.status===409) {
                showAlert("Conflicto por existencia de varios recursos idénticos", "danger");
                return;
            }

            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }

            await getAids();
            showAlert("Subvención creada con éxito", "success");
            resetNewAid();
            showCreateForm = false;
        } catch (error) {
            showAlert("Error de conexión al crear la subvención", "danger");
        }
    }

    // Función para actualizar una subvención
    async function updateAid() {
        try {
            const res = await fetch(`${API}/${currentAid.mun_name}/${currentAid.month}/${currentAid.benef_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentAid),
            });

            if (res.status==401) {
                showAlert("No está autorizado para realizar esta operación", "danger");
                return;
            }

            if (res.status===400) {
                showAlert("El cuerpo de la petición está vacío o mal formado", "danger");
                return;
            }

            if (res.status===404) {
                showAlert(`Recurso no encontrado para {municipio: ${currentAid.mun_name}, mes: ${currentAid.month}, benefId: ${currentAid.benef_id}}`, "danger");
                return;
            }
            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }

            await getAids();
            showAlert("Subvención actualizada con éxito", "success");
            editModalOpen = false;
        } catch (error) {
            showAlert("Error de conexión al actualizar la subvención", "danger");
        }
    }

    // Función para eliminar una subvención
    async function deleteAid() {
        try {
            const res = await fetch(`${API}/${currentAid.mun_name}/${currentAid.month}/${currentAid.benef_id}`, {
                method: "DELETE",
            });

            if (res.status==401) {
                showAlert("No está autorizado para realizar esta operación", "danger");
                return;
            }

            if (res.status==404) {
                showAlert("No se ha encontrado ningún recurso que coincida con los datos especificados", "danger");
                return;
            }

            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }

            await getAids();
            showAlert("Subvención eliminada con éxito", "success");
            deleteModalOpen = false;
        } catch (error) {
            showAlert("Error de conexión al eliminar la subvención", "danger");
        }
    }

    // Función para eliminar todas las subvenciones
    async function deleteAllAids() {
        try {
            const res = await fetch(`${API}`, {
                method: "DELETE",
            });

            if (res.status==401) {
                showAlert("No está autorizado para realizar esta operación", "danger");
                return;
            }
            if (res.status==500) {
                showAlert("Error interno del servidor", "danger");
                return;
            }

            aids = [];
            showAlert("Todas las subvenciones han sido eliminadas", "success");
            showDeleteAllModal = false;
        } catch (error) {
            showAlert("Error de conexión al eliminar las subvenciones", "danger");
        }
    }

    // Función para abrir el modal de eliminación
    function openDeleteModal(aid) {
        currentAid = aid;
        deleteModalOpen = true;
    }

    // Resetear el formulario de nueva subvención
    function resetNewAid() {
        newAid = {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            grant_date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
            benef_id: "",
            benef_name: "",
            benef_type: "",
            purpose: "",
            grantor: "",
            grant_type: "",
            amt_granted: 0,
            amt_paid: 0,
            reimbursed: 0,
            refunded: 0,
            region_name: "Comunidad Valenciana",
            sec_cod: "",
            sec_descr: "",
            aid_type: "",
            reg_base: "",
            fund_local: 0,
            fund_regional: 0,
            fund_state: 0,
            fund_eu: 0,
            fund_other: 0,
            fund_type: "",
            prov_name: "",
            mun_name: ""
        };
    }

    // Mostrar alerta
    function showAlert(message, type) {
        alertMessage = message;
        alertType = type;
        alertVisible = true;
        setTimeout(() => {
            alertVisible = false;
        }, 3000);
    }

    onMount(()=>{
        iniatilizeData();
        getAids();
    });
</script>

<style>
    :global(body) {
        background-color: #f8f9fa;
    }
    
    .table-container {
        padding: 0 13.3333dvw;
    }
    
    .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0 13.3333dvw;
        justify-content: end;
    }

    .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 13.3333dvw;
        justify-content: end;
    }
    
    .form-section {
        margin-bottom: 2rem;
        padding: 0 13.3333dvw;
        display:flex;
        flex-direction: column;
        align-items: end;
    }
    .action-column {
        white-space: nowrap;
    }

    .alert-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
    }
</style>
    <svelte:head>
        <title>Ayudas y Subvenciones</title>
    </svelte:head>

    <Container fluid>
    <!-- Alerta para mensajes -->
        {#if alertVisible}
            <div class="alert-container" transition:fade>
                <Alert color={alertType} isOpen={alertVisible} toggle={() => alertVisible = false}>
                    {alertMessage}
                </Alert>
            </div>
        {/if}
    </Container>
    <h2 class="text-center my-4">Ayudas y subvenciones solicitadas <br>Comunidad Valenciana, 4º Trimestre 2024</h2>

    <!-- Sección para crear nuevo recurso -->
    <div class="form-section">
        <Button color="primary" style="align-self: end;" on:click={() => showCreateForm = !showCreateForm} class="mb-3">
            <i class="bi bi-plus"></i> Crear nueva subvención
        </Button>

        <Collapse style="align-self: normal;" center isOpen={showCreateForm}>
            <Card>
                <CardHeader>
                    <h4>Crear nueva subvención</h4>
                </CardHeader>
                <CardBody>
                    <Form on:submit={createAid}>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="year">Año</Label>
                                    <Input type="number" name="year" id="year" min="1900" bind:value={newAid.year} />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="month">Mes</Label>
                                    <Input type="number" name="month" id="month" min="1" max="12" bind:value={newAid.month} required />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="grant_date">Fecha de concesión</Label>
                                    <Input type="text" name="grant_date" id="grant_date" bind:value={newAid.grant_date}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="benef_id">ID Beneficiario</Label>
                                    <Input type="text" name="benef_id" id="benef_id" bind:value={newAid.benef_id} required />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="benef_name">Nombre Beneficiario</Label>
                                    <Input type="text" name="benef_name" id="benef_name" bind:value={newAid.benef_name} />
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="benef_type">Tipo Beneficiario</Label>
                                    <datalist id="benef_type_list">
                                        <option value="PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA">PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA</option>
                                        <option value="PERSONAS JURÍDICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA">PERSONAS JURÍDICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA</option>
                                        <option value="PERSONAS FÍSICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA">PERSONAS FÍSICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA</option>

                                    </datalist>
                                    <Input type="text" name="benef_type" id="benef_type" list="benef_type_list" placeholder="A12345678" bind:value={newAid.benef_type}>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="purpose">Propósito</Label>
                                    <Input type="text" name="purpose" id="purpose" bind:value={newAid.purpose}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="grantor">Concedente</Label>
                                    <Input type="text" name="grantor" id="grantor" bind:value={newAid.grantor}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="grant_type">Tipo de subvencion</Label>
                                    <datalist id="grant_type_list">
                                        <option value="Concurrencia">Concurrencia</option>
                                        <option value="Directa">Directa</option>
                                    </datalist>    
                                        
                                    <Input type="text" name="grant_type" id="grant_type" list="grant_type_list" bind:value={newAid.grant_type}>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="amt_granted">Importe concedido</Label>
                                    <Input type="number" name="amt_granted" id="amt_granted" min="0" bind:value={newAid.amt_granted}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="amt_paid">Importe pagado</Label>
                                    <Input type="number" name="amt_paid" id="amt_paid" min="0" bind:value={newAid.amt_paid}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="reimbursed">Reembolsado</Label>
                                    <Input type="number" name="reimbursed" id="reimbursed" min="0" bind:value={newAid.reimbursed}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="refunded">Reintegrado</Label>
                                    <Input type="number" name="refunded" id="refunded" min="0" bind:value={newAid.refunded}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="region_name">Región</Label>
                                    <Input type="text" name="region_name" id="region_name" bind:value={newAid.region_name}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="sec_cod">Código sector</Label>
                                    <Input type="text" name="sec_cod" id="sec_cod" bind:value={newAid.sec_cod}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="sec_name">Sector</Label>
                                    <Input type="text" name="sec_name" id="sec_name" bind:value={newAid.sec_name}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="aid_type">Tipo de ayuda</Label>
                                    <datalist id="aid_type_list">
                                        <option value="SUBVENCIÓN y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN">SUBVENCIÓN y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN</option>
                                    </datalist>
                                    
                                    <Input type="text" name="aid_type" id="aid_type" list="aid_type_list" bind:value={newAid.aid_type}>
                                        
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="reg_base">Base reguladora</Label>
                                    <Input type="text" name="reg_base" id="reg_base" bind:value={newAid.reg_base}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_local">Subv. Local</Label>
                                    <Input type="number" name="fund_local" id="fund_local" min="0" bind:value={newAid.fund_local}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_regional">Subv. Regional</Label>
                                    <Input type="number" name="fund_regional" id="fund_regional" min="0" bind:value={newAid.fund_regional}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_state">Subv. Estatal</Label>
                                    <Input type="number" name="fund_state" id="fund_state" min="0" bind:value={newAid.fund_state}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_eu">Subv. Europea</Label>
                                    <Input type="number" name="fund_eu" id="fund_eu" min="0" bind:value={newAid.fund_eu}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_other">Subv. Otros</Label>
                                    <Input type="number" name="fund_other" id="fund_other" min="0" bind:value={newAid.fund_other}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <Row>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="fund_type">Tipo Financiación</Label>
                                    <datalist id="fund_type_list">
                                        <option value="Autonómica">Autonómica</option>
                                        <option value="Estatal">Estatal</option>
                                        <option value="Europea">Europea</option>
                                        <option value="Autonómica/Estatal">Autonómica/Estatal</option>
                                        <option value="Autonómica/Europea">Autonómica/Europea</option>
                                        <option value="Autonómica/Europea">Autonómica/Europea</option>
                                    </datalist>
                                    <Input type="text" name="fund_type" id="fund_type" list="fund_type_list" bind:value={newAid.fund_type}>
                                        
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="prov_name">Provincia</Label>
                                    <datalist id="prov_name_list">
                                        <option value="Alicante">Alicante</option>
                                        <option value="Castellón">Castellón</option>
                                        <option value="Valencia">Valencia</option>
                                    </datalist>
                                    <Input type="text" name="prov_name" id="prov_name" list="prov_name_list" bind:value={newAid.prov_name}/>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="mun_name">Municipio</Label>
                                    <Input type="text" name="mun_name" id="mun_name" bind:value={newAid.mun_name} required/>
                                </FormGroup>
                            </Col>
                        </Row>
                        
                        <div class="d-flex justify-content-end mt-3">
                            <Button color="secondary" class="me-2" on:click={() => showCreateForm = false}>Cancelar</Button>
                            <Button color="primary" type="submit">Guardar</Button>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </Collapse>
    </div>

    <!-- Tabla de subvenciones con filtros -->
    <div class="table-header">
        <div>
            <Button color="outline-primary" id="filtros" on:click={() => showFilterForm = !showFilterForm}>
                <i class="bi bi-funnel"></i> Filtros
            </Button>
        </div>
    </div>

    <!-- Sección de filtros -->
    <Collapse style="padding: 0 13.3333dvw;" isOpen={showFilterForm}>
        <Card class="mb-3">
            <CardHeader>
                <h4>Filtros</h4>
            </CardHeader>
            <CardBody>
                <Form on:submit={getAids}>
                    <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroYear">Año</Label>
                            <Input type="number" name="filtroYear" id="filtroYear" bind:value={filtroYear} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroMonth">Mes</Label>
                            <Input type="number" name="filtroMonth" id="filtroMonth" min="1" max="12" bind:value={filtroMonth} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroGrantDate">Fecha de concesión</Label>
                            <Input type="text" name="filtroGrantDate" id="filtroGrantDate" bind:value={filtroGrantDate} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroBenefId">ID Beneficiario</Label>
                            <Input type="text" name="filtroBenefId" id="filtroBenefId" bind:value={filtroBenefId} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroBenefName">Nombre Beneficiario</Label>
                            <Input type="text" name="filtroBenefName" id="filtroBenefName" bind:value={filtroBenefName} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroBenefType">Tipo Beneficiario</Label>
                            <Input type="text" name="filtroBenefType" id="filtroBenefType" bind:value={filtroBenefType} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroPurpose">Propósito</Label>
                            <Input type="text" name="filtroPurpose" id="filtroPurpose" bind:value={filtroPurpose} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroGrantor">Concedente</Label>
                            <Input type="text" name="filtroGrantor" id="filtroGrantor" bind:value={filtroGrantor} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroGrantType">Tipo subvencion</Label>
                            <Input type="text" name="filtroGrantType" id="filtroGrantType" bind:value={filtroGrantType} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroAmtGranted">Importe concedido</Label>
                            <Input type="number" name="filtroAmtGranted" id="filtroAmtGranted" bind:value={filtroAmtGranted} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroAmtPaid">Importe pagado</Label>
                            <Input type="number" name="filtroAmtPaid" id="filtroAmtPaid" bind:value={filtroAmtPaid} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroReimbursed">Reembolsado</Label>
                            <Input type="number" name="filtroReimbursed" id="filtroReimbursed" bind:value={filtroReimbursed} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroRefunded">Reintegrado</Label>
                            <Input type="number" name="filtroRefunded" id="filtroRefunded" bind:value={filtroRefunded} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroRegionName">Región</Label>
                            <Input type="text" name="filtroRegionName" id="filtroRegionName" bind:value={filtroRegionName} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroSecCod">Código sector</Label>
                            <Input type="text" name="filtroSecCod" id="filtroSecCod" bind:value={filtroSecCod} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroSecDescr">Sector</Label>
                            <Input type="text" name="filtroSecDescr" id="filtroSecDescr" bind:value={filtroSecDescr} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroAidType">Tipo de ayuda</Label>
                            <Input type="text" name="filtroAidType" id="filtroAidType" bind:value={filtroAidType} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroRegBase">Base Reguladora</Label>
                            <Input type="text" name="filtroRegBase" id="filtroRegBase" bind:value={filtroRegBase} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundLocal">Subv. Local</Label>
                            <Input type="number" name="filtroFundLocal" id="filtroFundLocal" bind:value={filtroFundLocal} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundRegional">Subv. Regional</Label>
                            <Input type="number" name="filtroFundRegional" id="filtroFundRegional" bind:value={filtroFundRegional} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundState">Subv. Estatal</Label>
                            <Input type="number" name="filtroFundState" id="filtroFundState" bind:value={filtroFundState} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundEu">Subv. Europea</Label>
                            <Input type="number" name="filtroFundEu" id="filtroFundEu" bind:value={filtroFundEu} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundOther">Subv. Otros</Label>
                            <Input type="number" name="filtroFundOther" id="filtroFundOther" bind:value={filtroFundOther} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroFundType">Tipo de Financiación</Label>
                            <Input type="text" name="filtroFundType" id="filtroFundType" bind:value={filtroFundType} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroProvName">Provincia</Label>
                            <Input type="text" name="filtroProvName" id="filtroProvName" bind:value={filtroProvName} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroMunName">Municipio</Label>
                            <Input type="text" name="filtroMunName" id="filtroMunName" bind:value={filtroMunName} />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={3}>
                          <FormGroup>
                            <Label for="filtroLimit">Nº recursos por página</Label>
                            <Input type="number" name="filtroLimit" id="filtroLimit" bind:value={filtroLimit} />
                          </FormGroup>
                        </Col>
                        <Col md={3}>
                            <FormGroup>
                                <Label for="filtroPage">Página</Label>
                                <Input type="number" name="filtroPage" id="filtroPage" bind:value={filtroPage} />
                            </FormGroup>
                        </Col>
                        <Col md={3}>
                            <FormGroup>
                              <Label for="filtroFrom">Desde (Año)</Label>
                              <Input type="number" name="filtroFrom" id="filtroFrom" bind:value={filtroFrom} />
                            </FormGroup>
                        </Col>
                        <Col md={3}>
                            <FormGroup>
                              <Label for="filtroTo">Hasta (Año)</Label>
                              <Input type="number" name="filtroTo" id="filtroTo" bind:value={filtroTo} />
                            </FormGroup>
                        </Col>
                    </Row>
                    <div class="d-flex justify-content-end mt-3">
                        <Button color="primary" type="submit">Aplicar filtros</Button>
                        <Button color="secondary" class="ms-2" on:click={() => {
                            filtroYear = "";
                            filtroMonth = "";
                            filtroProvName = "";
                            filtroMunName = "";
                            filtroFrom = "";
                            filtroTo = "";
                            filtroLimit = "";
                            filtroPage = "";
                            getAids();
                            goto("/dana-grants-subsidies-stats");
                            
                        }}>Limpiar filtros</Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    </Collapse>

    <!-- Tabla de datos -->
    <div class="table-container">
        <Table striped responsive >
            <thead>
                <tr>
                    <th>Año</th>
                    <th>Mes</th>
                    <th>Fecha Conc.</th>
                    <th>Benef. ID</th>
                    <th>Nombre Benef.</th>
                    <th>Tipo Benef.</th>
                    <th>Propósito</th>
                    <th>Otorgante</th>
                    <th>Imp. Conc.</th>
                    <th>Imp. Pagado</th>
                    <th>Provincia</th>
                    <th>Municipio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each aids as aid}
                    <tr>
                        <td>{aid.year}</td>
                        <td>{aid.month}</td>
                        <td>{aid.grant_date}</td>
                        <td>{aid.benef_id}</td>
                        <td>{aid.benef_name}</td>
                        <td>{aid.benef_type?.toLowerCase()}</td>
                        <td>{aid.purpose}</td>
                        <td>{aid.grantor}</td>
                        <td>{aid.amt_granted}€</td>
                        <td>{aid.amt_paid}€</td>
                        <td>{aid.prov_name}</td>
                        <td>{aid.mun_name}</td>
                        <td class="action-column">
                            <Button color="primary" size="sm" on:click={() => goto(`/dana-grants-subsidies-stats/editar/${aid.mun_name}/${aid.month}/${aid.benef_id}`)}>
                                <i class="bi bi-pencil"></i> Editar
                            </Button>
                            <Button color="danger" size="sm" class="ms-1" on:click={() => openDeleteModal(aid)}>
                                <i class="bi bi-trash"></i> Eliminar
                            </Button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    </div>

    <div class="table-footer">
        <Button color="outline-danger" style="display:flex; justify-content:end;" class="ms-2" on:click={() => showDeleteAllModal = true}>
            <i class="bi bi-trash"></i> Eliminar todo
        </Button>
    </div>

    <!-- Modal para confirmar eliminación -->
    <Modal isOpen={deleteModalOpen} toggle={() => deleteModalOpen = !deleteModalOpen}>
        <ModalHeader toggle={() => deleteModalOpen = !deleteModalOpen}>
            Confirmar eliminación
        </ModalHeader>
        <ModalBody>
            {#if currentAid}
                <div class="alert alert-danger" id="eliminacion-especifica">
                    <p>¿Está seguro de que desea eliminar la subvención para <strong>{currentAid.benef_name}</strong>?</p>
                    <p>Esta acción no se puede deshacer.</p>
                </div>
            {/if}
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" on:click={() => deleteModalOpen = false}>Cancelar</Button>
            <Button color="danger" id="confirmar-eliminacion" on:click={deleteAid}>Eliminar</Button>
        </ModalFooter>
    </Modal>

    <!-- Modal para confirmar eliminación de todos los registros -->
    <Modal isOpen={showDeleteAllModal} toggle={() => showDeleteAllModal = !showDeleteAllModal}>
        <ModalHeader toggle={() => showDeleteAllModal = !showDeleteAllModal}>
            Confirmar eliminación
        </ModalHeader>
        <ModalBody>
            <div class="alert alert-danger" id="eliminacion-masiva">
                <p>¿Está seguro de que desea eliminar <strong>todas</strong> las subvenciones?</p>
                <p>Esta acción eliminará <strong>{aids.length}</strong> registros y no se puede deshacer.</p>
            </div>
            
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" on:click={() => showDeleteAllModal = false}>Cancelar</Button>
            <Button color="danger" on:click={deleteAllAids}>Eliminar todos</Button>
        </ModalFooter>
    </Modal>