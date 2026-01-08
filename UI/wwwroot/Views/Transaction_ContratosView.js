//@ts-check
// @ts-ignore
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { Catalogo_Cambio_Divisa_ModelComponent, Catalogo_Clientes, Detail_Prendas_ModelComponent, Detail_Prendas_Vehiculos_ModelComponent, Transaction_Contratos_ModelComponent } from "../FrontModel/DBODataBaseModel.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
// @ts-ignore
import { Transactional_Configuraciones } from "../Admin/ADMINISTRATIVE_ACCESSDataBaseModel.js";
import { Detail_Prendas, Transaction_Contratos, ValoracionesTransaction } from "../FrontModel/Model.js";
import { Tbl_Cuotas_ModelComponent } from "../FrontModel/ModelComponents.js";
import { FinancialModule } from "../modules/FinancialModule.js";
import { clientSearcher, contratosSearcher, ValoracionesSearch } from "../modules/SerchersModules.js";
import { WAppNavigator } from "../WDevCore/WComponents/WAppNavigator.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { WArrayF } from "../WDevCore/WModules/WArrayF.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { ModalVericateAction } from "../WDevCore/WComponents/ModalVericateAction.js";

/**
 * @typedef {Object} ContratosConfig
 * * @property {ValoracionesTransaction} [Entity]
 */
class Transaction_ContratosView extends HTMLElement {
    /**
     * 
     * @param {ContratosConfig} props 
     */
    constructor(props) {
        super();
        this.attachShadow({ mode: 'open' });
        this.entity = new ValoracionesTransaction(props?.Entity) ?? new ValoracionesTransaction();
        this.entity.Transaction_Contratos = this.entity.Transaction_Contratos ?? {}
        this.componentsModel = new Transaction_Contratos_ModelComponent();
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.valoracionesContainer = WRender.Create({ className: "valoraciones-container" });
        this.shadowRoot?.append(this.CustomStyle);
        this.Cliente = {}
        this.valoracionesDataset = [];
        this.selectedClientDetail = WRender.Create({ tagName: "div", className: "client-container" });
        this.amortizacionResumen = WRender.Create({ tagName: "div", className: "resumen-container" });
        this.contratosForm = WRender.Create({
            className: "contratos-form",
            children: [this.selectedClientDetail, this.amortizacionResumen]
        });
        this.SetOption();
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
        this.Draw();
    }
    Draw = async () => {
        this.tasasCambio = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
        this.Intereses = await new Transactional_Configuraciones().getConfiguraciones_Intereses();
        this.InteresBase = WArrayF.SumValAtt(this.Intereses, "Valor");
        this.entity.Transaction_Contratos.taza_interes_cargos = this.InteresBase;
        FinancialModule.calculoAmortizacion(this.entity);
        /**@type  {Catalogo_Cambio_Divisa_ModelComponent}*/
        this.tasaActual = this.tasasCambio[0];
        // @ts-ignore
        const isVehiculo = this.entity.Transaction_Contratos?.Detail_Prendas?.find(p => p.Catalogo_Categoria.tipo == "Vehículos");
        // console.log(isVehiculo);
        const modelPrendas = new Detail_Prendas_ModelComponent({
            Detail_Prendas_Vehiculos: {
                type: 'Model',
                ModelObject: () => new Detail_Prendas_Vehiculos_ModelComponent(),
                hidden: isVehiculo == undefined ? true : false
            }
        });
        this.prendasTable = new WTableComponent({
            Dataset: this.entity.Transaction_Contratos?.Detail_Prendas ?? [],
            EntityModel: new Detail_Prendas({}),
            ModelObject: modelPrendas,
            AddItemsFromApi: false,
            AutoSave: false,
            Options: {
                Delete: true,
                Edit: true,
                Search: true,
                DeleteAction: () => this.deletePrenda(),
            }
        });
        this.CuotasTable = new WTableComponent({
            Dataset: this.entity.Transaction_Contratos?.Tbl_Cuotas ?? [],
            ModelObject: new Tbl_Cuotas_ModelComponent({ Estado: undefined }),
            paginate: false,
            AddItemsFromApi: false,
            AutoSave: false,
            id: "cuotasTable",
            Options: {

            }
        });
        const fechaCancelacion = WRender.Create({ tagName: 'label', innerText: this.fechaCancelacion() })
        this.inputPlazo = WRender.Create({
            tagName: 'input', type: 'number', className: "input-contrato", onchange: (ev) => {
                this.entity.Transaction_Contratos.plazo = ev.target.value;
                this.update();
                fechaCancelacion.innerText = this.fechaCancelacion()
            }, value: 1, min: 1, max: this.prioridadEnElPlazo()
        });
        this.SelectMoneda = WRender.Create({
            tagName: 'select', class: 'input-contrato', children: [
                { tagName: 'option', innerText: 'Desembolso en dólares', value: 'DOLARES' },
                { tagName: 'option', innerText: 'Desembolso en córdoba', value: 'CORDOBAS' }
            ], onchange: (ev) => {
                this.entity.Moneda = ev.target.value
            }
        });

        this.setPlazo();
        this.inputObservacion = WRender.Create({
            tagName: 'textarea', placeholder: "observaciones...", className: "input-observacion", onchange: (ev) => {
                this.entity.Transaction_Contratos.observaciones = ev.target.value;
            }
        });

        const optionContainer = WRender.Create({
            className: "OptionContainer form",
            children: [
                "Plazo:", this.inputPlazo, this.SelectMoneda,
                "Fecha de cancelación:",
                fechaCancelacion, this.inputObservacion,
            ]
        });
        this.contratosForm.append(optionContainer, this.prendasTable, this.CuotasTable);
        this.Manager.NavigateFunction("valoraciones", this.contratosForm);
        this.selectCliente(this.entity.Transaction_Contratos?.Catalogo_Clientes ?? {})
        this.valoracionResumen(this.entity);
    }
    /**
     * 
     * @returns {Number}
     */
    prioridadEnElPlazo() {
        const prioridad = this.entity.Transaction_Contratos?.Detail_Prendas?.find(p =>
            p.Transactional_Valoracion_ModelComponent.Catalogo_Categoria.prioridad ==
            WArrayF.MinValue(this.entity.Transaction_Contratos.Detail_Prendas.map(
                sp => sp.Transactional_Valoracion_ModelComponent.Catalogo_Categoria), "prioridad"));
        // @ts-ignore
        return prioridad?.Catalogo_Categoria?.plazo_limite ?? 1

    }
    /**
    * 
    * @returns {String}
    */
    fechaCancelacion() {
        if (this.entity.Transaction_Contratos?.Tbl_Cuotas == undefined) {
            // @ts-ignore
            return new Date().toString().toDateFormatEs();
        }
        const prioridad = WArrayF.MaxDateValue(this.entity.Transaction_Contratos.Tbl_Cuotas, "fecha");
        // @ts-ignore
        return prioridad.toString().toDateFormatEs();

    }


    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Datos contrato',
            onclick: () => this.Manager.NavigateFunction("valoraciones")
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Buscar cliente',
            onclick: () => {
                if (!this.clientSercher) {
                    this.clientSercher = clientSearcher([{
                        name: "Selecionar",
                        action: async (cliente) => {
                            this.selectCliente(cliente)
                        }
                    }]);
                }
                this.Manager.NavigateFunction("buscar-cliente", this.clientSercher)
            }
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Tertiary', innerText: 'Buscar valoraciones',
            onclick: () => this.Manager.NavigateFunction("Searcher",
                new ValoracionesSearch(this.selectValoracion, undefined, true))
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Fifth', innerText: 'Guardar contrato',
            onclick: async () => {
                if (this.entity.Transaction_Contratos.Detail_Prendas.length == 0) {
                    this.shadowRoot?.append(ModalMessage("Debe ingresar prendas para realizar el contrato!"));
                    return;
                }

                let isVehiculoValidation = true;
                let isSerieValidation = true;
                this.entity.Transaction_Contratos.Detail_Prendas.forEach(element => {
                    // @ts-ignore
                    if (element.Catalogo_Categoria.tipo == "Vehículos" &&
                        (element.Detail_Prendas_Vehiculos == undefined
                            || element.Detail_Prendas_Vehiculos == null)) {
                        isVehiculoValidation = false;
                    }
                    // @ts-ignore
                    if (element.serie == null || element.serie == undefined || element.serie.replaceAll(" ", "") == "") {
                        isSerieValidation = false;
                    }
                });
                if (!isSerieValidation) {
                    this.shadowRoot?.append(ModalMessage("Debe ingresar la información requerida de las prendas, serie incompleta!"));
                    return;
                }
                if (!isVehiculoValidation) {
                    this.shadowRoot?.append(ModalMessage("Debe ingresar la información requerida del vehículos!"));
                    return;
                }

                const response = await this.entity.SaveContract();
                if (response.status == 200) {
                    this.shadowRoot?.append(ModalVericateAction(() => {
                        location.href = "/PagesViews/Transaction_ContratosViewDetail?numero_contrato=" + response.body.numero_contrato;
                    }, response.message, false));
                } else {
                    this.shadowRoot?.append(ModalMessage(response.message));
                }
            }
        }))
    }
    selectCliente = (/**@type {Catalogo_Clientes} */ selectCliente) => {
        this.entity.Transaction_Contratos.Catalogo_Clientes = selectCliente;
        this.update();
        this.Manager.NavigateFunction("valoraciones");
    }
    /**
     * 
     * @param {ValoracionesTransaction} entity 
     * @returns 
     */
    valoracionResumen(entity) {
        this.amortizacionResumen.innerHTML = "";
        if (entity.Transaction_Contratos.total_pagar_cordobas == undefined) {
            this.amortizacionResumen.innerHTML = `<div class="detail-container">Agregue prendas</div>`;
            return;
        }
        //.console.log(entity.Transaction_Contratos);
        this.amortizacionResumen.append(html`<div class="detail-container">
            <div>
                <label class="value-container">
                    CARGOS A PAGAR:
                    <span>${entity.Transaction_Contratos.taza_interes_cargos} %</span>
                </label>
                <label class="value-container">
                    GESTIÓN CREDITICIA:
                    <span>${entity.Transaction_Contratos.gestion_crediticia} %</span>
                </label>

                <label class="value-container">
                    CAMBIO DE DÓLAR A CÓRDOBAS:
                    <span>$ ${this.tasaActual?.Valor_de_compra}</span>
                </label>
                <label class="value-container">
                    CAMBIO DE CÓRDOBAS A DÓLAR:
                    <span>$ ${this.tasaActual?.Valor_de_venta}</span>
                </label>
            </div>
            <div>
                <label class="value-container">
                    Valor Capital C$:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.Valoracion_empeño_cordobas)}</span>
                </label>
                <label class="value-container">
                    Int. y demas cargo C$:
                    <span>${// @ts-ignore
            ConvertToMoneyString(entity.Transaction_Contratos.interes * this.tasaActual.Valor_de_venta)}</span>
                </label>
                <label class="value-container">
                    Cuota fija C$:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.cuotafija)}</span>
                </label>
                <label class="value-container">
                    Total a pagar C$:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.total_pagar_cordobas)}</span>
                </label>
            </div>
            <div>
                <label class="value-container">
                    Valor Capital $:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.Valoracion_empeño_dolares)}</span>
                </label>
                <label class="value-container">
                    Int. y demas cargos $:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.interes)}</span>
                </label>
                <label class="value-container">
                    Cuota fija $:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.cuotafija_dolares)}</span>
                </label>
                <label class="value-container">
                    Total a pagar $:
                    <span>${ConvertToMoneyString(entity.Transaction_Contratos.total_pagar_dolares)}</span>
                </label>
            </div>  
        </div>`);
        this.Manager.NavigateFunction("valoraciones");
    }
    clientResumen(/**@type {Catalogo_Clientes} */ selectCliente) {
        if (selectCliente == undefined) {
            this.selectedClientDetail.innerHTML = `<div class="detail-container">Seleccionar Cliente</div>`;
            return;
        }
        this.selectedClientDetail.innerHTML = "";
        this.selectedClientDetail.append(html`<div class="detail-container">
            <label class="name"> Cliente seleccionado: ${selectCliente.primer_nombre ?? ""} ${selectCliente.segundo_nombre ?? ''} 
            ${selectCliente.primer_apellido ?? ''} ${selectCliente.segundo_apellidio ?? ''}</label>
            <label>Tipo de indentificación: ${selectCliente.Catalogo_Tipo_Identificacion?.Descripcion ?? ""}</label>
            <label>Número de documento: ${selectCliente.identificacion ?? ""}</label>
            <label>Teléfono: ${selectCliente.telefono ?? ""}</label>
        </div>`);
    }
    // @ts-ignore
    selectValoracion = (valoracion) => {
        // @ts-ignore
        const existInList = this.entity.Transaction_Contratos.Detail_Prendas?.find(p => p.serie == valoracion.Serie);
        if (existInList != undefined) {
            this.shadowRoot?.append(ModalMessage("La valoración ya esta en la lista"));
            return;
        }
        // @ts-ignore
        const existVehiculo = this.entity.Transaction_Contratos?.Detail_Prendas?.find(p => p.Catalogo_Categoria.id_categoria == 2);
        if (existVehiculo != undefined && valoracion.Catalogo_Categoria.id_categoria != 2) {
            this.shadowRoot?.append(ModalMessage("Anteriormente valoro un vehículo por lo tanto no puede agregar valoraciones de diferente categoría"));
            return;
        }
        // @ts-ignore
        const notExistVehiculo = this.entity.Transaction_Contratos?.Detail_Prendas?.find(p => p.Catalogo_Categoria.id_categoria != 2);
        if (notExistVehiculo != undefined && valoracion.Catalogo_Categoria.id_categoria == 2) {
            this.shadowRoot?.append(ModalMessage("Anteriormente valoro un artículo distinto de vehículo por lo tanto no puede agregar valoraciones de esta categoría"));
            return;
        }
        this.entity.Transaction_Contratos.Detail_Prendas = this.entity.Transaction_Contratos.Detail_Prendas ?? [];
        this.entity.valoraciones = this.entity.valoraciones ?? [];
        this.entity.valoraciones.push(valoracion);
        this.entity.Transaction_Contratos.Detail_Prendas?.push(new Detail_Prendas({
            Descripcion: valoracion.Descripcion,
            modelo: valoracion.Modelo,
            mara: valoracion.Marca,
            serie: valoracion.Serie,
            monto_aprobado_cordobas: valoracion.Valoracion_empeño_cordobas,
            monto_aprobado_dolares: valoracion.Valoracion_empeño_dolares,
            en_manos_de: undefined,
            Catalogo_Categoria: valoracion.Catalogo_Categoria,
            Transactional_Valoracion_ModelComponent: valoracion
        }))
        // @ts-ignore
        this.entity.Transaction_Contratos.taza_cambio = this.tasaActual?.Valor_de_venta;
        // @ts-ignore
        this.entity.Transaction_Contratos.taza_cambio_compra = this.tasaActual?.Valor_de_compra;
        this.setPlazo();
        this.update();
        this.Manager.NavigateFunction("valoraciones");
    }
    setPlazo() {
        if (this.entity.valoraciones) {
            // @ts-ignore
            this.inputPlazo.value = this.entity?.valoraciones[0]?.Plazo;
            // @ts-ignore
            this.entity.Transaction_Contratos.plazo = this.entity?.valoraciones[0]?.Plazo ?? 1;
            this.entity.Transaction_Contratos.fecha = new Date();
        }
    }

    deletePrenda() {
        // @ts-ignore
        this.inputPlazo.max = this.prioridadEnElPlazo();
        // @ts-ignore
        this.entity.Transaction_Contratos.Detail_Prendas = this.prendasTable?.Dataset;
        // @ts-ignore
        this.CuotasTable.Dataset = undefined;
        // @ts-ignore
        this.entity.valoraciones = this.entity.Transaction_Contratos.Detail_Prendas.map(p => p.Transactional_Valoracion_ModelComponent);
        this.update();

    }
    update() {
        FinancialModule.calculoAmortizacion(this.entity);
        if (this.prendasTable != undefined && this.entity.Transaction_Contratos.Detail_Prendas != undefined) {
            this.entity.Transaction_Contratos?.Detail_Prendas.forEach(detalle => {
                detalle.monto_aprobado_dolares = detalle.Transactional_Valoracion_ModelComponent.Valoracion_empeño_dolares
            })
            this.prendasTable.Dataset = this.entity.Transaction_Contratos.Detail_Prendas;
            this.prendasTable?.DrawTable();
        }

        this.clientResumen(this.entity.Transaction_Contratos.Catalogo_Clientes);
        // @ts-ignore
        this.inputPlazo.max = this.prioridadEnElPlazo();
        //console.log(this.entity.valoraciones);
        if (this.CuotasTable != undefined) {
            this.CuotasTable.Dataset = this.entity?.Transaction_Contratos?.Tbl_Cuotas ?? [];
            this.CuotasTable?.DrawTable();
        }
        this.valoracionResumen(this.entity);
    }
    CustomStyle = css`
        .detail-container{
            padding: 20px;
            display: grid;
            grid-template-columns:  repeat(4, auto);
            gap: 20px 30px;
            border: solid 1px #b1b1b1;
            border-radius: 20px;
            font-size: 12px;
            margin: 10px 20px;
        }    
        .value-container {
            display: flex;
            justify-content: space-between;
        }
        .detail-container div {
            display: flex;
            flex-direction: column;
        } 
        .OptionContainer{
            display: flex;
            align-items: center;            
            gap: 15px;
            margin: 10px 20px ;
        } 
        .OptionContainer.form{
            border: solid 1px #b1b1b1;
            border-radius: 20px;
            font-size: 12px;
            padding: 20px;
            flex-wrap: wrap;
        } 
        .input-contrato  {
            width: 180px !important;
            text-align: right;
        }
        .input-observacion {
            border-radius: 5px;
        }
        w-filter-option {
            grid-column: span 2;
        }
    `
}
customElements.define('w-transaction_contratos', Transaction_ContratosView);
export { Transaction_ContratosView };

class MainContract extends HTMLElement {
    constructor(contrato) {
        super();
        // FinancialModule.calculoAmortizacion(contrato);     
        if (contrato.Transaction_Contratos != null) {
            // FinancialModule.calculoAmortizacion(contrato);
            this.ElementsNav.unshift({
                name: "Contrato valorado", action: () => this.Manager.NavigateFunction("contrato-valorado", new Transaction_ContratosView({ Entity: contrato }))
            });
        }
        this.componentsModel = new Transaction_Contratos_ModelComponent();
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.valoracionesContainer = WRender.Create({ className: "valoraciones-container" });
        this.navigator = new WAppNavigator({ Inicialize: true, Elements: this.ElementsNav })
        this.append(this.CustomStyle, this.OptionContainer, this.navigator, this.TabContainer);
        this.indexContract = 0;
        this.DrawComponent();
    }
    ElementsNav = [
        {
            name: "Contratos", action: () => {
                this.Manager.NavigateFunction("contratos", contratosSearcher((contrato) => {
                    location.href = "/PagesViews/Transaction_ContratosViewDetail?numero_contrato=" + contrato.numero_contrato;
                }, (/** @type {Transaction_Contratos} */ contrato) => {
                    const modal = new WModalForm({
                        ModelObject: {
                            motivo_anulacion: { type: "TEXTAREA" }
                        }, EditObject: contrato,
                        title: "ANULACIÓN DE CONTRATO",
                        ObjectOptions: {
                            SaveFunction: async () => {
                                this.append(ModalVericateAction(async (editObject) => {
                                    console.log(contrato, editObject);
                                    const response = await new Transaction_Contratos(contrato).Anular();
                                    this.append(ModalMessage(response.message));
                                    modal.close();
                                }, "Esta seguro que desea anular este contrato"))
                            }
                        }
                    });
                    this.append(modal);
                }, true))
            }
        }
    ]
    connectedCallback() { }
    DrawComponent = async () => {

    }
    CustomStyle = css``
}
customElements.define('w-main-contract', MainContract);
export { MainContract };

window.addEventListener('load', async () => {
    const contrato = await new ValoracionesTransaction().GetValoracionContrato();
    // @ts-ignore
    //
    MainBody.append(new MainContract(contrato))
    //MainBody.append(new MainContract(testData))
})