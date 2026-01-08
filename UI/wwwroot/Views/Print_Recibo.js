//@ts-check
import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { Recibos } from "../FrontModel/Recibos.js";
import {WAjaxTools} from "../WDevCore/WModules/WAjaxTools.js";
import {WArrayF} from "../WDevCore/WModules/WArrayF.js";

class Print_Recibo  extends HTMLElement {
    /**
     * 
     * @param {Recibos} entity 
     */

    //ValoracionesTransaction
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
        if (params.get('id_Recibo') != undefined) {
            // @ts-ignore
            this.entity.id_recibo = params.get('id_Recibo');
        }
        if (this.entity.id_recibo != null && this.entity.id_recibo != undefined) {
            const contract = await this.entity.VerRecibo();
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
            tagName: 'button', className: 'Block-Primary', innerText: 'Datos Recibo',
            onclick: async () => this.Manager.NavigateFunction("id", undefined ?? WRender.Create({ className: "component" }))
        }))
    }

    CustomStyle = css`
        .component{
           display: block;
        }           
    `
}
customElements.define('w-component', Print_Recibo );
export { Print_Recibo  }
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Print_Recibo (new Recibos())) })