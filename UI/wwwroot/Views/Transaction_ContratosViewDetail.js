//@ts-check
import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { Transaction_Contratos, ValoracionesTransaction } from "../FrontModel/Model.js";
import {WAjaxTools} from "../WDevCore/WModules/WAjaxTools.js";
import {WArrayF} from "../WDevCore/WModules/WArrayF.js";

class Transaction_ContratosViewDetail extends HTMLElement {
    /**
     * 
     * @param {ValoracionesTransaction} entity 
     */
    constructor(entity) {
        super();
        this.entity = entity;
        this.attachShadow({ mode: 'open' });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.shadowRoot?.append(this.CustomStyle);
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
        this.SetOption();
        const params = new URLSearchParams(window.location.search)
        if (params.get('numero_contrato') != undefined) {
            this.entity.Transaction_Contratos.numero_contrato = params.get('numero_contrato');
        }
        if (this.entity.Transaction_Contratos.numero_contrato != null && this.entity.Transaction_Contratos.numero_contrato != undefined) {
            const contract = await this.entity.VerContrato();
            this.shadowRoot?.append(WRender.Create({
                tagName: "iframe", src: contract.value, style: {
                    width: "100%",
                    minHeight: "700px"
                }
            }))
        } else {
            this.shadowRoot?.append(WRender.Create({
                tagName: "h1", innerText: "NO DATA!"
            }))
        }
    }
    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Datos contrato',
            onclick: async () => this.Manager.NavigateFunction("id", undefined ?? WRender.Create({ className: "component" }))
        }))
    }

    CustomStyle = css`
        .component{
           display: block;
        }           
    `
}
customElements.define('w-component', Transaction_ContratosViewDetail);
export { Transaction_ContratosViewDetail }

window.addEventListener('load', async () => {
    // @ts-ignore
    MainBody.append(new Transaction_ContratosViewDetail(new ValoracionesTransaction({
        Transaction_Contratos: new Transaction_Contratos()
    })))
})