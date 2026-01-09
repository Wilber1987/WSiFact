//@ts-check
import { WRender, ComponentsManager, html } from "../WDevCore/WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WDevCore/WModules/WOrtograficValidation.js";
import { StylesControlsV2, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { WFilterOptions } from '../WDevCore/WComponents/WFilterControls.js';
import { WAppNavigator } from "../WDevCore/WComponents/WAppNavigator.js"
import { Catalogo_Agentes, Catalogo_Clasificacion_Cliente, Catalogo_Tipo_Agente, Catalogo_Cambio_Divisa_ModelComponent, Catalogo_Cuentas, Catalogo_Departamento, Catalogo_Inversores, Catalogo_Municipio, Catalogo_Nacionalidad, Catalogo_Profesiones, Catalogo_Sucursales_ModelComponent, Catalogo_Estados_Articulos, Catalogo_Categoria_ModelComponent, Permisos_Cuentas, Catalogo_Clasificacion_Interes } from "../FrontModel/DBODataBaseModel.js"
import { EntityClass } from "../WDevCore/WModules/EntityClass.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { Catalogo_Tipo_Identificacion_ModelComponent } from "../ClientModule/FrontModel/Catalogo_Clientes.js";
import {WAjaxTools} from "../WDevCore/WModules/WAjaxTools.js";
class DBOCatalogosManagerView extends HTMLElement {
    constructor() {
        super();
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: 'TabContainer' } })
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            this.MainNav,
            this.CustomStyle,
            this.TabContainer
        );
    }
    /** @param {EntityClass} Model*/
    NavigateFunction = async (Model) => {
        const data = await Model.Get();
        const mainComponent = new WTableComponent({
            ModelObject: Model,
            Dataset: data,
            AutoSave: true,
            Options: {
                Add: true,
                Edit: true,
                Filter: true,
                FilterDisplay: true
            }
        })

       /*const filterOptions = new WFilterOptions({
            Dataset: data,
            ModelObject: Model,
            FilterFunction: (DFilt) => {
                mainComponent.DrawTable(DFilt);
            }
        });
        WRender.SetStyle(filterOptions, { marginBottom: "20px", display: "block" })*/
        this.TabManager.NavigateFunction(Model.constructor.name, WRender.Create({
            className: "catalogo-container",
            children: [
                html`<h2>${WOrtograficValidation.es(Model.constructor.name)}</h2>`,
                //filterOptions,
                mainComponent]
        }));
    }
    MainNav = new WAppNavigator({
        Direction: "column",
        Inicialize: true,
        //@ts-ignore
        Elements: [
            {
                name: WOrtograficValidation.es('Catalogo_Cambio_Divisa'), action: async () => {
                    this.NavigateFunction(new Catalogo_Cambio_Divisa_ModelComponent())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Sucursales_ModelComponent'), action: async () => {
                    this.NavigateFunction(new Catalogo_Sucursales_ModelComponent())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Cuentas'), action: async () => {
                    this.NavigateFunction(new Catalogo_Cuentas())
                }
            }, {
                name: WOrtograficValidation.es('Permisos_Cuentas'), action: async () => {
                    this.NavigateFunction(new Permisos_Cuentas())
                }
            },{
                name: WOrtograficValidation.es('Catalogo_Clasificacion_Interes'), action: async () => {
                    this.NavigateFunction(new Catalogo_Clasificacion_Interes())
                }
            },/*//TODO ELIMINAR A POSTERIOR LO DE LOS AGENTES { {
                name: WOrtograficValidation.es('Catalogo_Tipo_Agente'), action: async () => {
                    this.NavigateFunction(new Catalogo_Tipo_Agente())
                }
            },
            
                name: WOrtograficValidation.es('Catalogo_Agentes'), action: async () => {
                    this.NavigateFunction(new Catalogo_Agentes())
                }
            },*/ {
                name: WOrtograficValidation.es('Catalogo_Nacionalidad'), action: async () => {
                    this.NavigateFunction(new Catalogo_Nacionalidad())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Departamento'), action: async () => {
                    this.NavigateFunction(new Catalogo_Departamento())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Municipio'), action: async () => {
                    this.NavigateFunction(new Catalogo_Municipio())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Profesiones'), action: async () => {
                    this.NavigateFunction(new Catalogo_Profesiones())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Clasificacion_Cliente'), action: async () => {
                    this.NavigateFunction(new Catalogo_Clasificacion_Cliente())
                }
            }, {
                name: 'Tipo Identificación', action: async () => {
                    this.NavigateFunction(new Catalogo_Tipo_Identificacion_ModelComponent())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Estados_Articulos'), action: async () => {
                    this.NavigateFunction(new Catalogo_Estados_Articulos())
                }
            }, {
                name: WOrtograficValidation.es('Catalogo_Categoria'), action: async () => {
                    this.NavigateFunction(new Catalogo_Categoria_ModelComponent())
                }
            },
        ]
    });
    CustomStyle = css`
        w-catalogos-manager {
            display: grid;
            grid-template-columns: 150px calc(100% - 170px);
            gap: 20px
        }
    `
}
customElements.define('w-catalogos-manager', DBOCatalogosManagerView);
export { DBOCatalogosManagerView }