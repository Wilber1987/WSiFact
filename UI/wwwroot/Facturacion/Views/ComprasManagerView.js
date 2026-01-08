//@ts-check
// @ts-ignore
import { ComponentsManager, html, WRender } from "../../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { WTableComponent } from "../../WDevCore/WComponents/WTableComponent.js";
// @ts-ignore
import { WAppNavigator } from "../../WDevCore/WComponents/WAppNavigator.js";
import { css } from "../../WDevCore/WModules/WStyledRender.js";
import { Tbl_Compra_ModelComponent } from "../FrontModel/ModelComponent/Tbl_Compra_ModelComponent.js";
import { Tbl_Compra } from "../FrontModel/Tbl_Compra.js";
import { WPrintExportToolBar } from "../../WDevCore/WComponents/WPrintExportToolBar.mjs";
import { FacturasBuilder } from "./Builders/FacturasBuilder.js";
import { DocumentsData } from "../FrontModel/DocumentsData.js";
import { WModalForm } from "../../WDevCore/WComponents/WModalForm.js";
import { ModalVericateAction } from "../../WDevCore/WComponents/ModalVericateAction.js";

/**
 * @typedef {Object} ComprasConfig
 * * @property {Tbl_Compra} [Entity]
 * * @property {Tbl_Compra}[TasaCambio]
 */
class ComprasManagerView extends HTMLElement {
    constructor(ComprasConfig) {
        super();
        this.ComprasConfig = ComprasConfig;
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });

        this.navigator = new WAppNavigator({ Inicialize: true, Elements: this.ElementsNav })
        this.append(this.CustomStyle, this.OptionContainer, this.navigator, this.TabContainer);
        this.indexFactura = 0;
        this.Draw();
        this.valoresObject = {
            subtotal: 0,
            iva: 0,
        }
    }

    ElementsNav = [
        {
            name: "Compras Proveedor", action: () => {
                this.Manager.NavigateFunction("Compras", new WTableComponent({
                    ModelObject: new Tbl_Compra_ModelComponent, EntityModel: new Tbl_Compra,
                    Options: {
                        Search: false, Filter: true, Add: false, Edit: false, FilterDisplay: true,
                        UserActions: [{
                            name: "Anular",
                            rendered: (/** @type { Tbl_Compra } */ factura) => {
                                return factura.IsAnulable
                                //return factura.Estado != "ANULADO" && factura.Estado != "CANCELADO" 
                            },
                            action: async (/**@type {Tbl_Compra}*/compra) => {
                                this.append(ModalVericateAction(async () => {
                                    const response = await compra.Anular();
                                    // @ts-ignore
                                    this.append(ModalMessage(response.message));

                                    //modal.close();
                                }, "¿Esta seguro que desea anular esta compra?"))
                            }
                        }, {
                            name: "Ver Compra",
                            action: async (/**@type {Tbl_Compra}*/compra) => {
                                /**@type {DocumentsData} */
                                const documentsData = await new DocumentsData().GetDataFragments();
                                documentsData.Header.style.width = "100%";
                                const facturaR = FacturasBuilder.BuildFacturaCompra(documentsData, compra);  
                                const div = html`<div class="contract-response">
                                    ${new WPrintExportToolBar({
                                        PrintAction: (/** @type {WPrintExportToolBar} */ toolBar) => {
                                            toolBar.Print(html`<div>${facturaR.cloneNode(true)}</div>`)
                                        }
                                    })}
                                    ${facturaR}      
                                </div>`;
                                document.body.append(new WModalForm({
                                    ShadowRoot: false,
                                    ObjectModal: div,
                                    ObjectOptions: {
                                        SaveFunction: () => {
                                            location.href = "/Facturacion/ComprasManager"
                                        }
                                    }
                                }))
                            }
                        }]
                    }
                }))
            }
        }
    ]

    Draw = async () => {
    }//end draw

    BuildCompraModel = () => {
        this.ComprasModel = new Tbl_Compra_ModelComponent();
    }
    CustomStyle = css`       
        .OptionContainer{
            display: flex;
        }
        .contract-response {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0px  30px;
            background-color: #d7d7d7;
        }         
    `
}
customElements.define('w-main-compras-manager', ComprasManagerView);
export { ComprasManagerView };

window.addEventListener('load', async () => {
    // @ts-ignore
    MainBody.append(new ComprasManagerView())
});