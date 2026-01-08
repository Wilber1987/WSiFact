import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { Catalogo_Inversores, Transaction_Contratos_Inversionistas } from "../FrontModel/DBODataBaseModel.js"
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js";
import {WAjaxTools} from "../WDevCore/WModules/WAjaxTools.js";
class Transaction_Contratos_InversionistasView extends HTMLElement {
    constructor(props) {
        super();        
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.Draw();
    }
    Draw = async () => {
        this.SetOption();       
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
    }
    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Basic', innerText: 'Buscar persona natural',
            onclick: () => this.Manager.NavigateFunction("buscar-cliente", inversoresSearcher(this.selectCliente))
        }))  
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Basic', innerText: 'Nueva Contrato',
            onclick: () => this.Manager.NavigateFunction("valoraciones")
        }))
             
    }
}
customElements.define('w-transaction_contratos_inversionistas', Transaction_Contratos_InversionistasView);
window.addEventListener('load', async () => { MainBody.append(new Transaction_Contratos_InversionistasView()) })

/**
 * 
 * @param { Function } action 
 * @returns { HTMLElement }
 */
const inversoresSearcher = (action) => {
    const model = new Catalogo_Inversores();
    const TableComponent = new WTableComponent({
        ModelObject: model,  
        Options: {
            UserActions: [{
                name: "Selecionar",
                action: async (cliente) => {
                    await action(cliente);
                }
            }]
        }
    })
    const FilterOptions = new WFilterOptions({
        Dataset: [],
        ModelObject: model,
        Display: true,
        FilterFunction: (DFilt) => {
            TableComponent?.DrawTable(DFilt);
        }
    });
    return WRender.Create({ className: "main-container", children: [FilterOptions, TableComponent] });
}
export { inversoresSearcher }