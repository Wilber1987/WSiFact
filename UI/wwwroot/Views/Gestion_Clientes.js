//@ts-check
import { Catalogo_Clientes, Catalogo_Clientes_ModelComponent } from "../ClientModule/FrontModel/Catalogo_Clientes.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
import { ComponentsManager, WRender } from "../WDevCore/WModules/WComponentsTools.js";

class Gestion_ClientesView extends HTMLElement {
    constructor() {
        super();
        this.Draw();
    }
    Draw = async () => {
        //const dataset = await model.Get();

        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
        this.Manager?.NavigateFunction("clientes", new WTableComponent({
            ModelObject: new Catalogo_Clientes_ModelComponent(),
            EntityModel: new Catalogo_Clientes(),
            Options: {
                Add: true, Filter: true, Edit: true, Show: true
            }
        }))
    }


}
customElements.define('w-gestion_clientes', Gestion_ClientesView);
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Gestion_ClientesView()) })


