//@ts-check
// @ts-ignore
import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
// @ts-ignore
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { Cat_Proveedor, Tbl_Factura } from "../FrontModel/FacturacionModel.js"
// @ts-ignore
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { Tbl_Cuotas_ModelComponent } from "../FrontModel/ModelComponents.js";
import {WAjaxTools} from "../WDevCore/WModules/WAjaxTools.js";
class FacturasSearch extends HTMLElement {
    constructor(/** @type {Function} */ action,/** @type {Function} */ secondAction) {
        super();
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.action = action;
        this.secondAction = secondAction;
        this.DrawComponent();
    }
    DrawComponent = async () => {
        const model = new Tbl_Factura(/*{ requiere_valoracion: { type: "TEXT", hiddenFilter: true } }*/);
        const dataset = await model.Get();

        this.SearchContainer = WRender.Create({
            className: "search-container"
        })
        this.MainComponent = new WTableComponent({
            ModelObject: model,
            Dataset: dataset.map(x => {
                // @ts-ignore                
                return x;
            }),
            Options: {
                UserActions: [
                    {
                        name: "Seleccionar", action: (/**@type {Tbl_Factura}*/ selected) => {
                            this.action(selected);
                        }
                    }
                ]
            }
        })
        this.FilterOptions = new WFilterOptions({
            Dataset: dataset,
            ModelObject: model,
            Display: true,
            FilterFunction: (DFilt) => {
                // @ts-ignore
                this.MainComponent.Dataset = DFilt.map(x => {
                    // @ts-ignore
                    //x.requiere_valoracion = (new Date().subtractDays(40) < new Date(x.Fecha)) ? "NO" : "SI";
                    return x;
                });
                this.MainComponent?.DrawTable();
            }
        });
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.FilterOptions,
            this.TabContainer,
            this.MainComponent
        );
    }
}
customElements.define('w-component-facturas-searcher', FacturasSearch);
export { FacturasSearch }

/**
 * 
 * @param { Function } action 
 * @returns { HTMLElement }
 */
const proveedorSearcher = (action) => {
    const model = new Cat_Proveedor();
    const TableComponent = new WTableComponent({
        ModelObject: model, Dataset: [], Options: {
            Filter: true,
            FilterDisplay: true,
            UserActions: [{
                name: "Selecionar",
                action: async (proveedor) => {
                    await action(proveedor);
                }
            }]
        }
    })    
    return WRender.Create({ className: "main-proveedores-searcher", children: [TableComponent] });
}
export { proveedorSearcher }