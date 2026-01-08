//@ts-check
// @ts-ignore
import { ComponentsManager, html, WRender } from "../../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
// @ts-ignore
import { Catalogo_Cambio_Divisa } from "../../FrontModel/Catalogo_Cambio_Divisa.js";
import { WAppNavigator } from "../../WDevCore/WComponents/WAppNavigator.js";
import { WModalForm } from "../../WDevCore/WComponents/WModalForm.js";
import { WPrintExportToolBar } from "../../WDevCore/WComponents/WPrintExportToolBar.mjs";
import { WTableComponent } from "../../WDevCore/WComponents/WTableComponent.js";
import { css } from "../../WDevCore/WModules/WStyledRender.js";
import { DocumentsData } from "../FrontModel/DocumentsData.js";
import { Tbl_Factura_ModelComponent } from "../FrontModel/ModelComponent/Tbl_Factura_ModelComponent.js";
import { Tbl_Factura } from "../FrontModel/Tbl_Factura.js";
import { FacturasBuilder } from "./Builders/FacturasBuilder.js";
import { VentasComponent } from "./VentasComponent.js";
import { Transaction_Contratos } from "../../FrontModel/Model.js";
import { ModalVericateAction } from "../../WDevCore/WComponents/ModalVericateAction.js";
import { ModalMessage } from "../../WDevCore/WComponents/ModalMessage.js";
import { WAlertMessage } from "../../WDevCore/WComponents/WAlertMessage.js";

/**
 * @typedef {Object} FacturacionConfig
 * * @property {Tbl_Factura} [Entity]
 * * @property {Object}[TasaCambio]
 * * @property {Number}[IvaPercent]
 */

class FacturaComponentView extends HTMLElement {

    /**
     * @param {FacturacionConfig} FacturacionConfig
     */
    constructor(FacturacionConfig) {
        super();
        this.FacturacionConfig = FacturacionConfig ?? {};
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.navigator = new WAppNavigator({ Inicialize: true, Elements: this.ElementsNav, })
        this.append(this.CustomStyle, this.OptionContainer, this.navigator, this.TabContainer);
        this.Draw();
    }
    ElementsNav = [{
        name: "Ventas", action: async () => {
            this.Manager.NavigateFunction("FacturasRealizadas", await this.VerFacturasRealizadas())
        }
    }, {
        name: "Nueva Venta", action: async () => {
            WAlertMessage.Clear();
            await this.NewFactura();
        }
    }]

    Draw = async () => {
        this.TabContainer
    }
    async NewFactura() {
        this.tasasCambio = await new Catalogo_Cambio_Divisa().Get();
        /**@type  {Catalogo_Cambio_Divisa}*/
        this.TasaActual = this.tasasCambio[0];
        if(!this.TimeId) {            
            this.TimeId =  new Date().getTime();
            //console.log("isNew", this.TimeId);
        }

        this.Manager.NavigateFunction("newFactura" + this.TimeId, new VentasComponent({
            TasaActual: this.TasaActual,
            action: async (/**@type { {factura: Tbl_Factura, Contract: String, Recibo: String, Transaction_Contratos:  Transaction_Contratos}} */ response) => {
                switch (response.factura.Tipo) {
                    case "VENTA":
                        this.Manager.NavigateFunction("newFacturaPrinter", await this.VerFactura(response.factura));
                        break;
                    case "APARTADO_MENSUAL":
                        this.Manager.NavigateFunction("newFacturaPrinter", await this.VerContratoRecibo(response));
                        break;
                    case "APARTADO_QUINCENAL":
                        this.Manager.NavigateFunction("newFacturaPrinter", await this.VerContratoRecibo(response));
                        break;
                    default:
                        break;
                }
                this.TimeId = undefined;

            }
        }));
    }
    /**
     * @param {{factura: Tbl_Factura, Contract: String, Recibo: String, Transaction_Contratos: Transaction_Contratos}} response
     * @returns {Promise<HTMLElement>}
     */
    async VerContratoRecibo(response) {
        /**@type {DocumentsData} */
        const documentsData = await new DocumentsData().GetDataFragments();
        documentsData.Header.style.width = "100%";
        const factura = FacturasBuilder.BuildFacturaRecibo(response, documentsData)
        //const contrato = await
        return html`<div class="contract-response">
            ${new WPrintExportToolBar({
            PrintAction: (toolBar) => {
                toolBar.Print(html`<div class="contract-response">
                        ${factura.cloneNode(true)}
                        <div class="contract">${response.Contract}</div>
                    </div>`)
            }
        })}
            ${factura}
            <div class="contract">${response.Contract}</div>            
        </div>`;
    }

    VerFacturasRealizadas() {
        return new WTableComponent({
            ModelObject: new Tbl_Factura_ModelComponent(),
            EntityModel: new Tbl_Factura(),
            Options: {
                Filter: true,
                UserActions: [
                    {
                        name: "Imprimir",
                        //rendered: (/**@type {Tbl_Factura} */ factura) => factura.Tipo != "APARTADO_QUINCENAL",
                        action: async (/**@type {Tbl_Factura} */ factura) => {
                            this.append(new WModalForm({
                                ShadowRoot: false,
                                ObjectModal: await this.VerFactura(factura)
                            }))
                        }
                    }, {
                        name: "Contrato",
                        rendered: (/**@type {Tbl_Factura} */ factura) => factura.Tipo == "APARTADO_MENSUAL" || factura.Tipo == "APARTADO_QUINCENAL",
                        action: async (/**@type {Tbl_Factura} */ factura) => {
                            this.append(new WModalForm({
                                ShadowRoot: false,
                                ObjectModal: await this.VerContrato(factura)
                            }))
                        }
                    },{
                        name: "Anular",
                        rendered: (/** @type { Tbl_Factura } */ factura) => {
                            return factura.IsAnulable;
                            //return factura.Estado != "ANULADO" && factura.Estado != "CANCELADO"
                        },
                        action: async (/**@type {Tbl_Factura}*/ factura) => {
                            factura.Motivo_anulacion = "";
                            const modal = new WModalForm({
                                ModelObject: {
                                    motivo_anulacion: { type: "TEXTAREA" }
                                }, EditObject: factura,
                                title: "ANULACIÓN",
                                ObjectOptions: {
                                    SaveFunction: async () => {
                                        this.append(ModalVericateAction(async (editObject) => {
                                            const response = await factura.Anular();
                                            this.append(ModalMessage(response.message, undefined, true));
                                            modal.close();
                                        }, "Esta seguro que desea anular este contrato"))
                                    }
                                }
                            });
                            this.append(modal);
                        }
                    }
                ]
            }
        });
    }
    async VerRecibos(factura) {
        const response = await new Tbl_Factura(factura).GetFacturaContrato();
        /**@type {DocumentsData} */
        const documentsData = await new DocumentsData().GetDataFragments();
        documentsData.Header.style.width = "100%";
        const facturaR = FacturasBuilder.BuildFacturaRecibo(response.body, documentsData)
        return html`<div class="contract-response">
             ${new WPrintExportToolBar({
            PrintAction: (toolBar) => {
                toolBar.Print(html`<div>${facturaR.cloneNode(true)}</div>`)
            }
        })}
            ${facturaR}        
        </div>`;

    }
    async VerContrato(factura) {
        const response = await new Tbl_Factura(factura).GetFacturaContrato();
        return html`<div class="contract-response">
            ${new WPrintExportToolBar({
            PrintAction: (toolBar) => {
                toolBar.Print(html`<div>${response.body.Contract}</div>`)
            }
        })}
        <div class="contract">${response.body.Contract}</div>            
        </div>`;
    }

    /**
     * @param {Tbl_Factura} factura
     * @returns {Promise<HTMLElement>}
     */
    async VerFactura(factura) {
        /**@type {DocumentsData} */
        const documentsData = await new DocumentsData().GetDataFragments();
        documentsData.Header.style.width = "100%";
        this.factura = FacturasBuilder.BuildFactura(factura, documentsData)
        return html`<div class="contract-response">
            ${this.BuildOptionsBar(this.factura, documentsData)}
            ${this.factura}          
        </div>`;
    }

    /**
    * @param {HTMLElement} factura
    */
    BuildOptionsBar(factura, documentsData) {
        return new WPrintExportToolBar({
            PrintAction: (toolBar) => {
                toolBar.Print(html`<div class="">                   
                    ${factura.cloneNode(true)}    
                </div>`);
                return;
            }
        });
    }

    CustomStyle = css`
        .factura-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .contract-response {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px  30px;
            background-color: #d7d7d7;
        }
        .contract  {
            width: 210mm; /* A4 width */            
            background-color: white;
            margin: 10px 0;
            padding: 20px;
            color: #000;              
        }

    `
}
customElements.define('w-main-factura-component', FacturaComponentView);
export { FacturaComponentView };

window.addEventListener('load', async () => {
    // @ts-ignore
    MainBody.append(new FacturaComponentView())
});