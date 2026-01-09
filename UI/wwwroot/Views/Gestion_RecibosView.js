//@ts-check
import { Catalogo_Cambio_Divisa_ModelComponent } from "../FrontModel/DBODataBaseModel.js";
import { Transaction_Contratos } from "../FrontModel/Model.js";
import { StyleScrolls, StylesControlsV2, StylesControlsV3 } from "../WDevCore/StyleModules/WStyleComponents.js";
import { WForm } from "../WDevCore/WComponents/WForm.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../WDevCore/WModules/WComponentsTools.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { contratosSearcher } from "../modules/SerchersModules.js";
import { Recibos_ModelComponent } from "../FrontModel/ModelComponents/Recibos_ModelComponent.js";
import { Recibos } from "../FrontModel/Recibos.js";
import { WOrtograficValidation } from "../WDevCore/WModules/WOrtograficValidation.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { Transactional_Configuraciones } from "../Admin/ADMINISTRATIVE_ACCESSDataBaseModel.js";
import { ContractData, FinancialModule } from "../modules/FinancialModule.js";
import { Detail_Prendas, Tbl_Cuotas } from "../FrontModel/Model.js";
import { Catalogo_Cambio_Divisa } from "../FrontModel/Catalogo_Cambio_Divisa.js";
import { ParcialesData } from "../FrontModel/ParcialData.js";
import { DateTime } from "../WDevCore/WModules/Types/DateTime.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { ModalVericateAction } from "../WDevCore/WComponents/ModalVericateAction.js";
import { WAlertMessage } from "../WDevCore/WComponents/WAlertMessage.js";

class Gestion_RecibosView extends HTMLElement {
    // @ts-ignore
    constructor(props) {
        super();
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.valoracionesContainer = WRender.Create({ className: "valoraciones-container" });
        this.proyeccion = WRender.Create({ className: "proyeccion-container" });
        this.append(this.CustomStyle);
        //this.Contrato = new Transaction_Contratos();
        this.valoracionesDataset = [];
        this.selectedClientDetail = WRender.Create({ tagName: "label", className: "selected-client" });
        this.proyeccionDetail = WRender.Create({
            className: "info-proyeccion-contrato",
            children: [{ tagName: 'label', innerText: "SELECCIONE FECHA", className: "proyeccion-container-detail" }]
        });
        /**@type {Array<Catalogo_Cambio_Divisa>} */
        this.tasasCambio = [];
        this.ContractData = new ContractData();
        this.Draw();
        this.Recibo = this.ContractData.Recibo;

    }
    Draw = async () => {
        this.Configs = await new Transactional_Configuraciones().getConfiguraciones_Configs();
        // @ts-ignore
        this.vencimientoConfig = parseInt(this.Configs?.find(c => c.Nombre == "VENCIMIENTO_CONTRATO").Valor);
        this.valoracionesContainer.innerHTML = "";
        this.tasasCambio = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
        this.ContractData.tasasCambio = this.tasasCambio
        this.SetOption();
        if (!this.contratosSearcher) {
            this.contratosSearcher = contratosSearcher(this.selectContrato);
        }
        this.Manager.NavigateFunction("buscar-contrato", this.contratosSearcher);
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
    };
    /**
     * @param {Transaction_Contratos} selectContrato
     */
    async generateRecibo(selectContrato) {
        this.ContractData.cuotasPendientes = selectContrato.Tbl_Cuotas
            .sort((a, b) => a.Id_cuota - b.Id_cuota)
            .filter(c => c.Estado?.toUpperCase() == "PENDIENTE");
        this.ContractData.cuotasPagadas = selectContrato.Tbl_Cuotas
            .sort((a, b) => a.Id_cuota - b.Id_cuota)
            .filter(c => c.Estado?.toUpperCase() == "CANCELADO");

        this.ContractData.countPagadas = this.ContractData.cuotasPagadas.length;
        this.ContractData.countPendientes = this.ContractData.cuotasPendientes.length;

        this.CuotaActual = this.ContractData.cuotasPendientes[0];
        this.CuotasPagadas = selectContrato.Tbl_Cuotas?.filter(c => c.Estado?.toUpperCase() == "CANCELADO");
        this.RecibosPagados = selectContrato.Recibos?.filter(c => c.Estado?.toUpperCase() == "CANCELADO") ?? [];
        this.UltimaCuotaPagada = this.CuotasPagadas[this.CuotasPagadas.length - 1];
        this.UltimaReciboPagado = selectContrato.Recibos[0];


        this.ContractData.parciales = await new ParcialesData({
            Numero_contrato: selectContrato.Numero_contrato,
            Id_cuota: this.CuotaActual.Id_cuota
        }).GetParcialesData();

        this.ContractData.Contrato = selectContrato;
        // console.log( this.Contrato); 
        FinancialModule.UpdateContractData(selectContrato, this.ContractData);
        this.CuotaActual.Interes = this.ContractData.InteresCorriente

        /**@type {Transactional_Configuraciones?} */
        const reestructureConfig = this.Configs?.find(c => c.Nombre == "PUEDE_REESTRUCTURAR");
        this.ContractData = FinancialModule.BuildContractData(this.ContractData, reestructureConfig);
        this.reciboModel = Recibos_ModelComponent.BuildRecibosModel(this.ContractData);

        //console.log(ContractData);
        if (this.ContractData.canReestructure) {
            this.reciboModel.Reestructurar.hidden = false;
            this.reciboModel.Reestructurar_value.max = this.ContractData.max;
        }
        this.reciboForm = new WForm({
            ModelObject: this.reciboModel,
            AutoSave: false,
            EditObject: this.Recibo,
            Groups: [
                {
                    Name: "Datos de recibo:", Propertys: [

                        "Mora_cordobas",
                        "Interes_demas_cargos_pagar_cordobas",
                        "Mora_interes_cordobas",
                        "Abono_capital_cordobas",
                        "Cuota_pagar_cordobas",
                        "Total_cordobas",
                        "Mora_dolares",
                        "Interes_demas_cargos_pagar_dolares",
                        "Mora_interes_dolares",
                        "Abono_capital_dolares",
                        "Cuota_pagar_dolares",
                        "Total_dolares",
                        "Perdida_de_documento_monto",
                        "Reestructurar_monto",
                    ]
                },
                {
                    Name: "Opciones", Propertys: [
                        "Fecha_roc",
                        "Paga_cordobas",
                        "Paga_dolares",
                        "Temporal",
                        "Cancelar",
                        "Perdida_de_documento",
                        "Solo_abono",
                        "Solo_interes_mora",
                        "Reestructurar",
                        "Total_apagar_dolares",
                        "Moneda",
                        "Reestructurar_value",
                        "Is_cambio_cordobas",
                        "Monto_dolares",
                        "Monto_cordobas",
                        "Cambio_cordobas",
                        "Cambio_dolares",
                        "Total_apagar_cordobas"
                    ]
                },
                //{Name: "Datos de recibo:", Propertys: []}
            ],
            //Options: false,
            // @ts-ignore
            id: "reciboForm",
            // @ts-ignore
            SaveFunction: async (/**@type {Recibos} */ recibo, form) => {

                if (!this.reciboForm?.Validate()) {
                    WAlertMessage.Warning("Agregue datos para poder continuar");
                    return;
                }
                const nuevoRecibo = new Recibos(this.reciboForm?.FormObject);
                // @ts-ignore
                console.log(nuevoRecibo);
                const response = await recibo.Save(); //this.reciboModel?.Save() // this.reciboModel?.GuardarValoraciones(this.valoracionesTable?.Dataset);
                if (response.status == 200) {
                    //location.href = "/PagesViews/Ver_Recibos";
                    if (response.message == "Factura temporal") {
                        this.printRecibo(response.body);
                        return;
                    }
                    this.append(ModalVericateAction(() => {
                        location.href = "/PagesViews/Ver_Recibos?id_Recibo=" + response.body.Id_factura;
                        //location.href = "/PagesViews/Print_Recibo?id_Recibo=" + response.body.Id_recibo;
                    }, response.message, false));
                } else if (response.status == 400) {
                    this.append(ModalVericateAction(() => {
                        location.href = "/PagesViews/Gestion_Recibos";
                    }, response.message, false));
                }
            }, CustomStyle: this.CustomFormStyle()
        });

        this.contratoDetail = WRender.Create({ className: "info-header-contrato" });
        this.TabContainerTables = WRender.Create({ className: "TabContainerTables", id: 'TabContainerTables' });
        this.ManagerTables = new ComponentsManager({ MainContainer: this.TabContainerTables });
        this.valoracionesContainer.innerHTML = "";

        this.valoracionesContainer.append(
            this.selectedClientDetail,
            this.reciboForm,
            this.contratoDetail,
            this.TabContainerTables
        );
        this.calculoRecibo(selectContrato, this.tasasCambio, this.reciboForm, this.ContractData);
    }


    /**
     * @param {Array<Detail_Prendas>} Detail_Prendas
     * @returns {String}
     */
    GetCategoriaContrato = (Detail_Prendas) => {
        const isVehiculo = Detail_Prendas.find(p => p.Catalogo_Categoria.descripcion == "vehiculos");
        if (isVehiculo) return isVehiculo?.Catalogo_Categoria.descripcion;

        const isElectronico = Detail_Prendas.find(p => p.Catalogo_Categoria.descripcion == "electronico");
        if (isElectronico) return isElectronico?.Catalogo_Categoria.descripcion;

        return Detail_Prendas[0].Catalogo_Categoria.descripcion;
    };
    /**
     *
     * @param {Number} Valoracion_compra_cordobas
     * @param {Number} Valoracion_compra_dolares
     * @param {Number} Valoracion_empeño_cordobas
     * @param {Number} Valoracion_empeño_dolares
     * @returns {string}
     */
    valoracionResumen(Valoracion_compra_cordobas, Valoracion_compra_dolares, Valoracion_empeño_cordobas, Valoracion_empeño_dolares) {
        return `Compra C$: ${Valoracion_compra_cordobas} - Compra $: ${Valoracion_compra_dolares} - Empeño C$: ${Valoracion_empeño_cordobas} - Empeño $: ${Valoracion_empeño_dolares}`;
    }
    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Buscar Contrato',
            onclick: () => {
                window.location.reload();
                //this.Manager.NavigateFunction("buscar-contrato", this.contratosSearcher)
            }
        }));
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Ver Recibos',
            onclick: () => {
                window.location.href = "/PagesViews/Ver_Recibos";
            }
        }));
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Recibo',
            onclick: () => {
                if (this.ContractData.Contrato.Numero_contrato == undefined) {
                    WAlertMessage.Connect({ Message: "Seleccione un contrato", Type: "warning" });
                    return;
                }
                this.Manager.NavigateFunction("valoraciones", this.valoracionesContainer);
            }
        }));
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Tertiary', innerText: 'Proyección de pago',
            onclick: () => {
                if (this.ContractData.Contrato.Numero_contrato == undefined) {
                    WAlertMessage.Connect({ Message: "Seleccione un contrato", Type: "warning" });
                    return;
                }
                this.setProyeccion();
                this.Manager.NavigateFunction("proyeccion", this.proyeccion);
            }
        }));

    }
    setProyeccion() {
        //TODO CREAR CONFIGURACION DE MORA
        const cloneContrato = new Transaction_Contratos(this.ContractData.Contrato);
        const proyeccionContractData = FinancialModule.BuildContractData(new ContractData(cloneContrato),
            this.Configs?.find(c => c.Nombre == "PUEDE_REESTRUCTURAR"));

        // @ts-ignore
        proyeccionContractData.tasasCambio = this.tasasCambio
        const reciboModel = Recibos_ModelComponent.BuildRecibosModel(proyeccionContractData);

        FinancialModule.UpdateContractData(proyeccionContractData.Contrato, proyeccionContractData)
        //reciboModel.fecha.hidden = false;
        reciboModel.Temporal.hidden = true;
        reciboModel.Reestructurar.hidden = true;
        reciboModel.Reestructurar_monto.hidden = true;
        reciboModel.Reestructurar_value.hidden = true;
        reciboModel.Perdida_de_documento.hidden = true;
        reciboModel.Solo_abono.hidden = true;
        reciboModel.Solo_interes_mora.hidden = true;
        reciboModel.Is_cambio_cordobas.hidden = true;
        reciboModel.Perdida_de_documento_monto.hidden = true;
        reciboModel.Cancelar.hidden = false;
        reciboModel.Fecha_roc.hidden = true;
        // reciboModel.paga_cordobas.type = "OPERATION";
        //reciboModel.paga_dolares.type = "OPERATION";
        reciboModel.Paga_cordobas.disabled = true;
        reciboModel.Paga_dolares.disabled = true;
        reciboModel.Total_apagar_dolares.hidden = true;
        reciboModel.Total_apagar_cordobas.hidden = true;
        reciboModel.Monto_dolares.hidden = true;
        reciboModel.Monto_cordobas.hidden = true;
        reciboModel.Cambio_dolares.hidden = true;
        reciboModel.Cambio_cordobas.hidden = true;
        reciboModel.Moneda.hidden = true;
        this.proyeccion.innerHTML = "";

        const proyeccionForm = new WForm({
            ModelObject: reciboModel,
            AutoSave: false,
            Options: false,
            // @ts-ignore
            id: "proyeccionForm",
            DivColumns: "repeat(6, 15%)",
            EditObject: proyeccionContractData.Recibo,
            CustomStyle: css`
                .titleContainer{
                    display: none;
                }
                /* .ModalElement:nth-child(2) {
                    grid-column: span 6;

                }
                .ModalElement:nth-child(2) input{
                   max-width: 500px;
                } */
            `
        });
        this.calculoRecibo(proyeccionContractData.Contrato, this.tasasCambio, proyeccionForm, proyeccionContractData);
        const fechaOriginal = new Date(proyeccionForm.FormObject.Fecha_original) < new Date() ? new Date() : new Date(proyeccionForm.FormObject.Fecha_original);

        const inputDate = WRender.Create({
            // @ts-ignore
            tagName: "input", type: "date", min: fechaOriginal.toISO(), value: fechaOriginal.toISO(), onchange: (ev) => {
                /**@type {Recibos} */
                const recibo = proyeccionForm.FormObject
                /**@type {WForm} */
                const form = proyeccionForm
                const InputControl = ev.target
                // @ts-ignore
                const fechaInicio = new Date(recibo.Fecha_original);
                fechaInicio.setHours(0, 0, 0, 0);
                const fechaFin = new Date(InputControl.value + "T23:59:00");
                /**@type {Number} */
                // @ts-ignore
                const diasMora = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
                //console.log(fechaInicio, fechaFin, diasMora, recibo.Fecha_original, InputControl.value, new Date(recibo.Fecha_original).toStartDate());
                proyeccionContractData.Fecha = fechaFin;
                //console.log(diasMora);
                this.proyeccionDetail.innerHTML = "";
                // @ts-ignore
                if (diasMora > this.vencimientoConfig ?? 0) {
                    this.proyeccionDetail.appendChild(html`<div class="proyeccion-container-detail">
                        <label class="value-container">NO ES POSIBLE PROYECTAR A MAS DE ${this.vencimientoConfig} DÍAS</label>
                    </div>`);
                    return;
                }
                const montoMora = proyeccionContractData.cuotasPendientes[0].Total * (proyeccionContractData.Contrato?.Mora / 100) * (diasMora);
                // @ts-ignore
                recibo.Mora_dolares = (montoMora).toFixed(3);
                // @ts-ignore
                recibo.Mora_cordobas = (recibo.Tasa_cambio * recibo.Mora_dolares).toFixed(3);
                // @ts-ignore
                recibo.Total_cordobas = (recibo.Tasa_cambio * recibo.Total_dolares).toFixed(3);
                proyeccionContractData.cuotasPendientes[0].Mora = montoMora
                Recibos_ModelComponent.DefineMaxAndMinInForm(form, proyeccionContractData);

                this.proyeccionDetail.appendChild(html`<div class="proyeccion-container-detail">
                    <label class="value-container">
                        DÍAS DE MORA:
                        <span>${diasMora}</span>
                    </label>
                    <label class="value-container">
                        MORA C$:
                        <span>${ConvertToMoneyString(proyeccionContractData.MoraActual)}</span>
                    </label>
                    <label class="value-container">
                        MORA $:
                        <span>${ConvertToMoneyString(recibo.Mora_dolares)}</span>
                    </label>
                </div>`);
            }
        });

        this.proyeccion.append(this.selectContratosDetail(proyeccionContractData.Contrato), inputDate, this.proyeccionDetail, proyeccionForm);
    }
    selectContrato = async (/**@type {Transaction_Contratos} */ selectContrato) => {
        if (selectContrato.Estado != "ACTIVO") {
            this.append(ModalMessage("Este contrato se encuentra " + selectContrato.Estado));
            return;
        }

        this.Contrato = await new Transaction_Contratos({ Numero_contrato: selectContrato.Numero_contrato }).Find();
        if (this.reciboForm != undefined) {
            //this.reciboForm.FormObject.Tasa_interes = this.getTasaInteres();
            this.reciboForm.DrawComponent();
        }
        await this.generateRecibo(this.Contrato);

        this.selectedClientDetail.innerHTML = "";
        this.selectedClientDetail.append(this.selectContratosDetail(this.Contrato));

        this.Manager.NavigateFunction("valoraciones", this.valoracionesContainer);
        //this.contratoDetailUpdate();
    };

    /**
     *
     * @param {Transaction_Contratos} contrato
     * @param {Array<Catalogo_Cambio_Divisa>} tasasCambio
     * @param {ContractData} contractData
     * @param {WForm} RecibosForm
     */
    calculoRecibo = (contrato, tasasCambio, RecibosForm, contractData) => {
        ///**@type {Recibos} */
        let formObject = RecibosForm.FormObject;
        if (RecibosForm != undefined) {
            console.log(contractData.cuotasPendientes);

            const cuota = contractData.cuotasPendientes[0];
            contrato.Tbl_Cuotas.sort((a, b) => a.Id_cuota - b.Id_cuota);
            let primeraCuotaConCapitalMayorACero = 0;
            let interes_cargos = 0;
            let interes_demas_cargos_pagar_cordobas = 0;
            let abono_capital_cordobas = 0;
            let mora_interes = 0;
            let cuota_total = 0;
            let fecha = new Date();
            let mora_interes_cordobas = 0;


            //console.log(contrato.Tbl_Cuotas, cuota);
            if (cuota != null) {
                fecha = cuota.Fecha;
                primeraCuotaConCapitalMayorACero = cuota.Total;
                interes_cargos = cuota.Interes;
                // @ts-ignore
                interes_demas_cargos_pagar_cordobas = cuota.Interes * tasasCambio[0].Valor_de_venta;
                abono_capital_cordobas = cuota.Abono_capital;
                mora_interes = this.ContractData.MoraActual;
                // @ts-ignore
                mora_interes_cordobas = mora_interes * tasasCambio[0].Valor_de_venta;
                cuota_total = cuota.Total;

                //this.cuota = cuota;
                contractData.proximaCuota = contractData.cuotasPendientes[1];
                contractData.ultimaCuota = contractData.cuotasPendientes[contractData.cuotasPendientes.length - 1];
                //break;
            }

            formObject["Fecha_original"] = cuota?.Fecha;
            formObject["Fecha"] = fecha;
            formObject["Numero_contrato"] = contrato["Numero_contrato"];
            formObject["Tasa_cambio"] = tasasCambio[0].Valor_de_venta;
            formObject["Tasa_cambio_compra"] = tasasCambio[0].Valor_de_compra;
            formObject["Monto"] = contrato["Monto"].toFixed(3);
            // @ts-ignore
            formObject["Saldo_actual_cordobas"] = (contrato["Saldo"] * tasasCambio[0].Valor_de_venta).toFixed(3);
            formObject["Saldo_actual_dolares"] = contrato["Saldo"].toFixed(3);
            formObject["Interes_cargos"] = interes_cargos.toFixed(3);

            formObject["Interes_demas_cargos_pagar_cordobas"] = interes_demas_cargos_pagar_cordobas.toFixed(3);
            formObject["Interes_demas_cargos_pagar_dolares"] = interes_cargos.toFixed(3);

            // @ts-ignore
            formObject["Abono_capital_cordobas"] = (abono_capital_cordobas * tasasCambio[0].Valor_de_venta).toFixed(3);
            formObject["Abono_capital_dolares"] = abono_capital_cordobas.toFixed(3);;

            // @ts-ignore
            formObject["Cuota_pagar_cordobas"] = (primeraCuotaConCapitalMayorACero * tasasCambio[0].Valor_de_venta).toFixed(3);
            formObject["Cuota_pagar_dolares"] = primeraCuotaConCapitalMayorACero.toFixed(3);;

            formObject["Mora_cordobas"] = (mora_interes_cordobas).toFixed(3);
            formObject["Mora_dolares"] = mora_interes?.toFixed(3);

            formObject["Mora_interes_cordobas"] = (mora_interes_cordobas + interes_demas_cargos_pagar_cordobas).toFixed(3);
            formObject["Mora_interes_dolares"] = (mora_interes + interes_cargos).toFixed(3);

            // @ts-ignore
            formObject["Total_cordobas"] = (cuota_total * tasasCambio[0].Valor_de_venta + mora_interes_cordobas).toFixed(3);
            formObject["Total_dolares"] = (cuota_total + mora_interes).toFixed(3);


            formObject["Total_parciales"] = 1; //TODO todo preguntar
            formObject["Fecha_roc"] = new Date();
            // @ts-ignore
            formObject["Paga_cordobas"] = this.ContractData.pagoActualCordobas.toFixed(3);
            formObject["Paga_dolares"] = this.ContractData.pagoActual.toFixed(3);
            formObject["Monto_cordobas"] = formObject["Paga_cordobas"];
            formObject["Monto_dolares"] = formObject["Paga_dolares"];
            formObject["Solo_abono"] = false;
            formObject["Cancelar"] = false;
            formObject["Total_apagar_dolares"] = this.ContractData.pagoActual.toFixed(3);;
        }

    };
    CustomStyle = css`
        .valoraciones-container{
            padding: 20px;
            display: grid;
            grid-template-columns: 400px calc(100% - 730px) 300px;
            gap: 20px 30px;
        }
        #reciboForm, .multiSelectEstadosArticulos {
            grid-column: span 3;
        }      
        .column-venta{
            display: grid;
            grid-template-columns: repeat(4, calc(25% - 10px));
            gap: 10px;
            margin-bottom: 5px;
            font-size: 12px;
        }
        .column-venta label{
           grid-column: span 2;
        }
        .column-venta span{
           text-align: right;
           font-weight: bold;
           border-bottom: solid 1px #d4d4d4;
        }
        #valoracionesTable,
        #cuotasTable,
        .TabContainerTables,
        .nav-header,
        .selected-client{
            grid-column: span 3;
        }
        .nav-header {
            display: flex;
            width: 100%;
            justify-content: space-between;
            font-size: 14px;
            font-weight: bold;
            color: var(--font-secundary-color)
        }        
        .OptionContainer{
            display: flex;
        } w-filter-option {
            grid-column: span 2;
        }

        .DataContainer span {
            font-size:10px;
        }
        .DataContainer label{          
            width: 100%;
            margin-bottom: 5px;
            font-size:12px;
            font-weight: bold;
        }

        .DataContainer {
            display: flex;
            padding: 5px;
            text-align: left;
            justify-content: space-between;
            flex-wrap: wrap;    
            overflow: hidden;
            border-left: 8px solid #d9d9d9;
            border-radius: 8px;
            transition: all .5s;
        }
        .DataContainer:hover {           
            border-left: 8px solid #575757;
        }
        .diasMora {
            color: red;
        }
        .proyeccion-container-detail {
            padding: 20px;
            display: flex;
            justify-content: left;
            color: red;
        }
        .proyeccion-container-detail .value-container {
            font-weight: bold;
            font-size: 16px;
            margin-left: 10px;
            color: red;
        }
        .proyeccion-container-detail .value-container span {
            font-weight: bold;
            color: red;
        }
    `;

    /**
     * @param {{ Fecha: string | number | Date; Total: number; }} cuota
     * @param {{ Mora: any; }} contrato
     */
    forceMora(cuota, contrato) {
        const fechaOriginal = new Date(cuota.Fecha);
        // @ts-ignore
        const fechaActual = new Date().addDays(33);
        fechaOriginal.setHours(0, 0, 0, 0);
        fechaActual.setHours(0, 0, 0, 0);
        // @ts-ignore
        const diferencia = fechaActual - fechaOriginal;
        const diasDeDiferencia = (diferencia / (1000 * 60 * 60 * 24)) >= 0 ? (diferencia / (1000 * 60 * 60 * 24)) : 0;
        //console.log(diasDeDiferencia, (diferencia / (1000 * 60 * 60 * 24)) < 0);
        const montoMora = cuota.Total * ((contrato?.Mora ?? 0 / 100) ?? 0.005) * diasDeDiferencia;
        this.diasMora = diasDeDiferencia;
        //console.log(this.diasMora, fechaActual, fechaOriginal);
        //console.log(diasDeDiferencia);
        return montoMora;
    }

    /**
     * @param {Transaction_Contratos} selectContrato
     */
    selectContratosDetail(selectContrato) {
        return html`<div>
            <div class="column-venta">           
                <div>
                    <div class="DataContainer">
                        <span>Nombre:</span>
                        <label>${selectContrato.Catalogo_Clientes.primer_nombre + ' ' + selectContrato.Catalogo_Clientes.segundo_nombre + ' ' + selectContrato.Catalogo_Clientes.primer_apellido + ' ' + selectContrato.Catalogo_Clientes.segundo_apellidio}
                    </label>
                    </div>
                    <div class="DataContainer">
                        <span>Dirección:</span>
                        <label>${selectContrato.Catalogo_Clientes.direccion}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Identificación:</span>
                        <label>${selectContrato.Catalogo_Clientes.identificacion}</label>
                    </div>
                    <div class="DataContainer">
                        <span>contrato #:</span>
                        <label>${selectContrato.Numero_contrato}</label>
                    </div>
                    <div class="DataContainer">
                            <span>Tipo de articulo:</span>
                            <label>${WOrtograficValidation.es(this.GetCategoriaContrato(this.ContractData.Contrato.Detail_Prendas))}</label>
                    </div>
                </div>
               <div>
                    <div class="DataContainer">
                        <span>Fecha de contrato:</span>
                        <label>${// @ts-ignore
            selectContrato.Fecha?.toDateFormatEs() ?? "-"}</label>
                    </div>
                    <div class="DataContainer">
                        <span>F/Último pago:</span>
                        <label>${ // @ts-ignore 
            this.UltimaReciboPagado?.Fecha?.toDateFormatEs() ?? "-"}</label>
                    </div>
                    <div class="DataContainer">
                        <span>F/Última actualización:</span>
                        <label>${ // @ts-ignore 
            this.UltimaCuotaPagada?.Fecha?.toDateFormatEs() ?? "-"}</label>
                    </div>
                    <div class="DataContainer">
                        <span>F/Próximo pago:</span>
                        <label>${  // @ts-ignore 
            this.CuotaActual?.Fecha?.toDateFormatEs() ?? "-"}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Fecha de cancelación:</span>
                        <label>${// @ts-ignore
            this.Contrato?.Fecha_cancelar?.toDateFormatEs() ?? "-"}</label>
                    </div>
               </div>
               <div>
                    <div class="DataContainer">
                        <span>Monto C$:</span>
                        <label>${ConvertToMoneyString(selectContrato.Valoracion_empeño_cordobas)}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Monto $:</span>
                        <label>${ConvertToMoneyString(selectContrato.Valoracion_empeño_dolares)}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Saldo actual C$:</span>
                        <label>${ConvertToMoneyString((selectContrato.Saldo) * this.tasasCambio[0].Valor_de_venta)}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Saldo actual $:</span>
                        <label>${ConvertToMoneyString(selectContrato.Saldo)}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Intereses y demás cargos:</span>
                        <label>${(selectContrato.Tasas_interes * 100).toFixed(0)} %</label>
                    </div>
                    
               </div>
               <div>                   
                    <div class="DataContainer ${this.ContractData.diasMora > 0 ? "diasMora" : ""}">
                        <span>Días en mora:</span>
                        <label class="">${this.ContractData.diasMora ?? 0}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Plazo:</span>
                        <label>${selectContrato.Tbl_Cuotas.filter(c => c.Estado != "INACTIVO").length}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Reestructuraciones:</span>
                        <label>${selectContrato.Reestructurado ?? "-"}</label>
                    </div>  
                    <div class="DataContainer">
                        <span>Tasa de cambio compra:</span>
                        <label>${this.tasasCambio[0].Valor_de_compra}</label>
                    </div>
                    <div class="DataContainer">
                        <span>Tasa de cambio venta:</span>
                        <label>${this.tasasCambio[0].Valor_de_venta}</label>
                    </div>
               </div>
            </div>
            <div>
                <h4 style="text-align:center;">DATOS DEL RECIBO OFICIAL DE CAJA</h4>
            </div>
        </div>`;
    }
    CustomFormStyle() {
        return css`
            .ContainerFormWModal {
                display: flex;
                .div {
                    flex: 1;
                }
                .div.formulario {
                    display: none;
                }
                .inputTitle, .password-container label {
                    padding: 2px;
                    display: block;
                    text-align: left;
                    margin: 5px 0 5px 0;
                    font-size: 12px;
                    color: var(--font-secundary-color);
                }
                .RADIO  {grid-column: span 2}
            }
        `;
    }
    /**
     * @param {any} body
     */
    printRecibo(body) {
        const objFra = WRender.Create({
            tagName: "iframe",
            style: { minHeight: "700px" },
            // @ts-ignore
            srcdoc: body
        });
        const print = function () {
            // @ts-ignore
            objFra.contentWindow.focus(); // Set focus.

            // @ts-ignore
            objFra.contentWindow.print(); // Print it  
        };
        const btn = html`<img class="print" src="../WDevCore/Media/print.png"/>`;
        btn.onclick = print;
        this.append(new WModalForm({
            ObjectModal: WRender.Create({
                class: "print-container", children: [this.PrintIconStyle(), [btn],

                WRender.Create({ className: "print-container-iframe", children: [objFra] })]
            })
        }));
        objFra.onload = print;
    }
    PrintIconStyle() {
        return css`
           .print {
            width: 30px;
            height: 30px;
            padding: 5px;
            border: solid 1px #bdbcbc; 
            border-radius: 5px;
            cursor: pointer;        
        } .print-container {
            width: 98%;   
            margin: auto;          
        } .print-container div{
            width: 100%; 
           display: flex;
           justify-content: flex-end;
           padding: 5px;
           border-radius: 5px;
           border: solid 1px #bdbcbc; 
           margin-bottom: 5px;
        } .print-container-iframe {
            overflow-y: auto;  
            max-height: 650px;
            background-color: #bdbcbc;  
        }  .print-container iframe { 
            width: 320px;
            max-width: 320px;
            margin: 10px auto;
            display: block;
            background-color: #fff;
            border: none;
        }
         `;
    }
}
customElements.define('w-gestion-recibos-view', Gestion_RecibosView);
export { Gestion_RecibosView };