//@ts-check
import { Transactional_Configuraciones } from "../../Admin/ADMINISTRATIVE_ACCESSDataBaseModel.js";
import { Catalogo_Cambio_Divisa } from "../../FrontModel/Catalogo_Cambio_Divisa.js";
import { Catalogo_Cambio_Divisa_ModelComponent } from "../../FrontModel/DBODataBaseModel.js";
import { ModalMessage } from "../../WDevCore/WComponents/ModalMessage.js";
import { ModalVericateAction } from "../../WDevCore/WComponents/ModalVericateAction.js";
import { WAlertMessage } from "../../WDevCore/WComponents/WAlertMessage.js";
import { WForm } from "../../WDevCore/WComponents/WForm.js";
import { ResponseServices } from "../../WDevCore/WModules/CommonModel.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../../WDevCore/WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../../WDevCore/WModules/WOrtograficValidation.js";
import { css } from "../../WDevCore/WModules/WStyledRender.js";
import { Tbl_Factura_ModelComponent } from "../FrontModel/ModelComponent/Tbl_Factura_ModelComponent.js";
import { Tbl_Factura } from "../FrontModel/Tbl_Factura.js";
import { Tbl_Lotes } from "../FrontModel/Tbl_Lotes.js";

/**
 * @typedef {Object} Config
 * @property {function} [saveAction] - Optional para enviar una peticion personalisada a la api
 * @property {function} [action] - Optional action function que se ejecuta despues de la respuesta de la api si es exitosa
 * @property {Catalogo_Cambio_Divisa}  TasaActual
 * @property {Tbl_Factura} [Entity] - Optional entity object
 * @property {Boolean} [IsReturn] - Optional entity object
 * @property {Boolean} [IsActiveCredit] - Optional entity object
 * @property {{ IsDevolucion: boolean, MaxAmount: Number, MinAmount: Number, ArticulosRemplazados: Array<any>,  IsAllArticulosRemplazados: boolean}} [ReturnData]
 */

class VentasComponent extends HTMLElement {
    /**
     * @param {Partial<Config>} Config
     */
    constructor(Config) {
        super();
        this.TasaActual = Config.TasaActual;
        this.Config = Config ?? {};
        this.Config.Entity = this.Config.Entity ?? new Tbl_Factura({
            Tasa_Cambio: this.TasaActual?.Valor_de_compra,
            Tasa_Cambio_Venta: this.TasaActual?.Valor_de_venta
        });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.CompraContainer = WRender.Create({ className: "Factura-container" });

        //this.navigator = new WAppNavigator({ Inicialize: true, Elements: this.ElementsNav })
        this.append(this.CustomStyle, this.OptionContainer, this.CompraContainer, this.TabContainer);
    }
    connectedCallback() {
        this.CompraContainer.innerHTML = "";
        this.Draw();
    }
    Draw = async () => {
        this.Intereses = await new Transactional_Configuraciones().getConfiguraciones_Intereses();
        this.Configs = await new Transactional_Configuraciones().getConfiguraciones_Beneficios();
        this.TasasCambioList = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
        this.TasasCambio = this.TasasCambioList[0];
        this.setFacturaContainer();
    }

    async setFacturaContainer() {
        this.TotalesDetail = WRender.Create({ tagName: "div", className: "resumen-container" });
        this.TotalesDetailUpdate(0, 0, 0, 0);
        this.FacturaModel = this.BuildFacturaModel()
        this.FacturaForm = new WForm({
            ModelObject: this.FacturaModel,
            AutoSave: false,
            limit: 5,
            EditObject: this.Config.Entity,
            Groups: [  // Grupos de controles para organizar el formulario
                {
                    Name: "Datos_de_pago",  // Nombre del grupo
                    Propertys: [
                        "Monto_dolares",
                        "Monto_cordobas",
                        "cambio_dolares",
                        "cambio_cordobas",
                        "Is_cambio_cordobas"
                    ],  // Propiedades que pertenecen a este grupo
                    WithAcordeon: false  // Si el grupo debe mostrarse como un acordeón
                }, {
                    Name: "Articulos",  // Nombre del grupo
                    Propertys: [
                        "Detalle_Factura",
                    ],  // Propiedades que pertenecen a este grupo
                    WithAcordeon: false  // Si el grupo debe mostrarse como un acordeón
                }
            ],
            //DivColumns: "repeat(5, 20%)",
            //Options: false,
            // @ts-ignore
            SaveFunction: async (/**@type {Tbl_Factura} */ factura) => {
                await this.SaveVenta(factura);
            }
        });

        if (this.Config.ReturnData?.IsDevolucion == true) {
            this.CalculeTotal(this.FacturaForm.FormObject, this.FacturaForm, this.FacturaModel)
        }

        this.CompraContainer.append(
            this.FacturaForm,
            this.TotalesDetail
        );
    }
    /**
     * @param {Tbl_Factura} factura
     */
    async SaveVenta(factura) {
        if (!this.FacturaForm?.Validate()) {
            WAlertMessage.Warning("Agregue datos para poder continuar");
            return;
        }
        if (this.Config.IsReturn) {
            if (this.Config.ReturnData?.IsAllArticulosRemplazados == false && (this.Config.ReturnData?.MinAmount ?? 0) > factura.Total) {
                WAlertMessage.Info(`El monto minímo de la factura es de $ ${ConvertToMoneyString(this.Config.ReturnData?.MinAmount)} dólares, 
                    equivalentes a C$ ${ConvertToMoneyString(this.Config.ReturnData?.MinAmount * (this.Config.TasaActual?.Valor_de_compra ?? 1))} córdobas.`);
                return;
            }
        }
        this.append(ModalVericateAction(async () => {

            let response = new ResponseServices({ status: 400 });
            if (this.Config.saveAction) {
                response = await this.Config.saveAction(new Tbl_Factura(factura));
            } else {
                // @ts-ignore
                response = await new Tbl_Factura(factura).Save();
            }
            if (response.status == 200) {
                if (this.Config?.action != undefined) {
                    this.append(ModalVericateAction(async () => {
                        // @ts-ignore
                        this.Config?.action(response.body, response);
                    }, response.message, false));
                } else {
                    this.append(ModalMessage(response.message, undefined, true));
                }
                this.setFacturaContainer();
            } else {
                WAlertMessage.Danger(response.message);
            }
        }, "¿Desea guardar la venta?"));
    }

    /**
    * @param {Number} subtotal
    * @param {Number} iva
    * @param {Number} total
    * @param {Number} descuento
    */
    TotalesDetailUpdate(subtotal, iva, total, descuento) {
        // @ts-ignore
        this.Config.Entity.Moneda = this.Config.Entity?.Moneda ?? "CORDOBAS"
        // @ts-ignore                
        this.TotalesDetail.innerHTML = "";
        this.TotalesDetail?.append(html`<div class="detail-container">
            <h3>DATOS DE CONTADO</h3>
            <hr/>
            <label class="value-container">
                <span>Sub Total:</span>
                <span class="value">${WOrtograficValidation.es(this.Config.Entity?.Moneda)} ${ConvertToMoneyString(subtotal ?? 0)}</span>
            </label>
            <label class="value-container">
                <span>Descuento:</span>
                <span class="value">${WOrtograficValidation.es(this.Config.Entity?.Moneda)} ${ConvertToMoneyString(descuento ?? 0)}</span>
            </label>
            <!-- <label class="value-container">
                <span>Iva:</span>
                <span class="value">${WOrtograficValidation.es(this.Config.Entity?.Moneda)} ${ConvertToMoneyString(iva ?? 0)}</span>
            </label> -->
            <hr/>
            <label class="value-container total">
                <span>Total:</span>
                <span class="value">${WOrtograficValidation.es(this.Config.Entity?.Moneda)} ${ConvertToMoneyString(total ?? 0)} </span>
            </label>
            <hr/>
        </div>`);
        if (["APARTADO_MENSUAL", "APARTADO_QUINCENAL"].includes(this.Config.Entity?.Tipo ?? "VENTA")) {
            this.TotalesDetail?.append(html`<div class="detail-container">       
                <h3>DATOS DE FINANCIAMIENTO</h3>
                <hr/>
                <label class="value-container">
                    <span>Plazo:</span>
                    <span class="value">${this.Config.Entity?.Datos_Financiamiento?.Plazo ?? 1}</span>
                </label>
                <label class="value-container">
                    <span>Cuota Fija $:</span>
                    <span class="value"> ${ConvertToMoneyString(this.Config.Entity?.Datos_Financiamiento?.Cuota_Fija_Dolares ?? 0)}</span>
                </label>
                <label class="value-container">
                    <span>Cuota Fija C$:</span>
                    <span class="value"> ${ConvertToMoneyString(this.Config.Entity?.Datos_Financiamiento?.Cuota_Fija_Cordobas ?? 0)}</span>
                </label>                
                <hr/>
            </div>`);
        }
        if (this.Config.IsReturn && this.Config.ReturnData?.IsAllArticulosRemplazados == false) {
            this.TotalesDetail?.append(html`<div class="detail-container">       
                <h3>DATOS DE ANULACIÓN DE ACTA DE ENTREGA</h3>
                <hr/>
                <label class="value-container">
                    <span>Monto disponible C$:</span>
                    <span class="value">${ConvertToMoneyString((this.Config.ReturnData?.MinAmount ?? 1) * (this.Config.TasaActual?.Valor_de_compra ?? 1))}</span>
                </label>
                <label class="value-container">
                    <span>Monto disponible $:</span>
                    <span class="value">${ConvertToMoneyString(this.Config.ReturnData?.MinAmount ?? 1)}</span>
                </label>                              
                <hr/>
            </div>`);
        }
    }
    BuildFacturaModel() {
        sessionStorage.setItem("Intereses", JSON.stringify(this.Intereses));
        sessionStorage.setItem("TasasCambio", JSON.stringify(this.TasasCambio));
        sessionStorage.setItem("Configs", JSON.stringify(this.Configs));
        const ventasModel = new Tbl_Factura_ModelComponent();
        /**analisa EditObject.Detalle_Factura y el elmento Lote de cada detalle factura y detecta si los lotes (id_lote) estan repetidos analisa si la cantidad_existente del primer lote encontrado es suficiente para la sumatoria de la cantidad de cada detalle, si no es asi retorna false, si es asi fusionalos en un solo detalle, seleccionado el primer lote como lote seleccionado */
        // ventasModel.Detalle_Factura.action = (/**@type {Tbl_Factura} */ EditObject, form, control) => {
        //     this.CalculeTotal(EditObject, form, ventasModel)
        // }
        // ventasModel.Tipo.action = (/**@type {Tbl_Factura} */ EditObject, form, control) => {
        //     ventasModel.TypeAction(EditObject, form);
        //     this.CalculeTotal(EditObject, form, ventasModel)
        // }

        if (this.Config.IsActiveCredit == false) {
            ventasModel.Tipo.Dataset = ["VENTA"];
        }
        if (this.Config.ReturnData?.IsDevolucion == true) {
            ventasModel.Cliente.hidden = true;            
            ventasModel.Moneda.hidden = true;            
            ventasModel.Detalle_Factura.ModelObject.Descuento.hidden = true;   
            if (this.Config.ReturnData?.IsAllArticulosRemplazados == true) {             
                ventasModel.Monto_dolares.hidden = true;
                ventasModel.Monto_cordobas.hidden = true;
                ventasModel.cambio_dolares.hidden = true;
                ventasModel.cambio_cordobas.hidden = true;
                ventasModel.Is_cambio_cordobas.hidden = true;
                ventasModel.Detalle_Factura.Options = {}
            }
        }
        return ventasModel;
    }
    /**
     * @param {Tbl_Factura} EditObject
     * @param {WForm} form
     * @param {Tbl_Factura_ModelComponent} ventasModel
     */
    CalculeTotal = (EditObject, form, ventasModel) => {
        try {
            this.TotalesDetailUpdate(EditObject.Sub_Total ?? 0, EditObject.Iva ?? 0, EditObject.Total ?? 0, EditObject.Descuento ?? 0);
        } catch (error) {
            console.error(error);
            // @ts-ignore
            WAlertMessage.Danger(error);
        }
    }

    CustomStyle = css`
        .Factura-container{
            padding: 20px;
            display: grid;
            grid-template-columns:  calc(100% - 320px) 300px;
            gap: 20px;
        }
        hr {
            width: 100%;
        }
        .resumen-container, w-form {
            box-shadow: 0 0 5px 0 #999;
            padding: 20px;
            border-radius: 5px;
        }
        .resumen-container .detail-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .detail-container h3 {
            color: #4894aa;
            margin: 10px 0px;
        }
        .value{
            text-align: right;
        }
        .value-container {
            display: grid;
            grid-template-columns: 50% 50%;
        }
        .total {
            font-weight: 700;
        }
        #FacturaForm, .multiSelectEstadosArticulos,#FacturaForm {
            grid-column: span 2;
        }
        .beneficios-detail h4 {
            margin: 0px 10px 10px 10px;
        }
        .beneficios-detail {
            padding: 15px;
            border-radius: 10px;
            border: solid 1px #999;
            overflow: hidden;
            max-height:15px;
            transition: all 0.7s;
            cursor: pointer;
        }
        .beneficios-detail:hover {
            max-height:1500px;
        }
        .column-venta{
            display: grid;
            grid-template-columns: 47% 47%;
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
        #FacturaTable,
        #detalleFacturaTable,
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
        }w-main-Factura {
            display: block;
            width: 98%;
        }
        @media (max-width: 900px){
            .Factura-container{
                grid-template-columns:  100%;
            }
        }
    `
}
customElements.define('w-main-ventas-component', VentasComponent);
export { VentasComponent };
