//@ts-check
// @ts-ignore
import { ComponentsManager, WRender } from "../../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
// @ts-ignore
import { WAppNavigator } from "../../WDevCore/WComponents/WAppNavigator.js";
import { css } from "../../WDevCore/WModules/WStyledRender.js";
import { Tbl_Compra } from "../FrontModel/Tbl_Compra.js";
import { ComprasComponent } from "./CompraComponent.js";

/**
 * @typedef {Object} ComprasConfig
 * * @property {Tbl_Compra} [Entity]
 * * @property {Object}[TasaCambio]
 * * @property {Number}[IvaPercent]
 */

class ComprasComponentView extends HTMLElement {
    /**
     * @param {ComprasConfig} ComprasConfig
     */
    constructor(ComprasConfig) {
        super();
        this.ComprasConfig = ComprasConfig ?? {};
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.navigator = new WAppNavigator({ Inicialize: true, Elements: this.ElementsNav })
        this.append(this.CustomStyle, this.OptionContainer, this.navigator, this.TabContainer);
        this.Draw();
    }  
    ElementsNav = [{
        name: "Nueva Factura Proveedor", action: () => {
            this.Manager.NavigateFunction("newFactura", new ComprasComponent(this.ComprasConfig));
            //new WForm({ ModelObject: this.ComprasModel, EntityModel: new Tbl_Compra }))
        }
    }, {
        name: "Compras Proveedor", action: () => {
            window.location.href = "/Facturacion/ComprasManager";
        }
    }]

    Draw = async () => {
    }//end draw


    CustomStyle = css`
    `
}
customElements.define('w-main-compras-component', ComprasComponentView);
export { ComprasComponentView };

window.addEventListener('load', async () => {
    // @ts-ignore
    MainBody.append(new ComprasComponentView())
});