//@ts-check
// @ts-ignore
import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
// @ts-ignore
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { Catalogo_Clientes, Notas_de_contrato, Transaction_Contratos_ModelComponent, Transactional_Valoracion_ModelComponent } from "../FrontModel/DBODataBaseModel.js"
// @ts-ignore
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js";
import { Tbl_Cuotas, Transaction_Contratos, ValoracionesTransaction } from "../FrontModel/Model.js";
import { Tbl_Cuotas_ModelComponent } from "../FrontModel/ModelComponents.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { WDetailObject } from "../WDevCore/WComponents/WDetailObject.js";
import { FilterData } from "../WDevCore/WModules/CommonModel.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { DateTime } from "../WDevCore/WModules/Types/DateTime.js";
import { SystemConfigs } from "../Services/SystemConfigs.js";
class ValoracionesSearch extends HTMLElement {
    constructor(/** @type {Function} */ action,/** @type {Function|undefined} */ secondAction,/** @type {Boolean} */ onlyValids = false) {
        super();
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.action = action;
        this.secondAction = secondAction;
        this.onlyValids = onlyValids;
        this.DrawComponent();
    }
    DrawComponent = async () => {
        const model = new Transactional_Valoracion_ModelComponent({ requiere_valoracion: { type: "TEXT", hiddenFilter: true } });
        const requiere_valoracion = parseFloat((await SystemConfigs.FindByName("VENCIMIENTO_VALORACION"))?.Valor ?? "40")
        if (this.onlyValids) {
            // @ts-ignore`
            model.FilterData.push(FilterData.Greater("Fecha",new DateTime().subtractDays(40).toISO() ) );
        }
        let dataset = await model.Get();

        this.SearchContainer = WRender.Create({
            className: "search-container"
        })
        this.MainComponent = new WTableComponent({
            ModelObject: model,
            Dataset: dataset.map(/**@param {Transactional_Valoracion_ModelComponent} x*/ x => {
                // @ts-ignore
                x.requiere_valoracion = x.requireReValoracion(requiere_valoracion) ? "SI" : "NO";
                return x;
            }),
            Options: {
                UserActions: [
                    {
                        name: "Seleccionar", action: (/**@type {Transactional_Valoracion_ModelComponent}*/ selected) => {
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
                    x.requiere_valoracion = (new Date().subtractDays(40) < new Date(x.Fecha)) ? "NO" : "SI";
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
customElements.define('w-component', ValoracionesSearch);
export { ValoracionesSearch }
/**
 * 
 * @param { Array } actions 
 * @returns { HTMLElement }
 */
const clientSearcher = (actions) => {
    const model = new Catalogo_Clientes();
    const TableComponent = new WTableComponent({
        ModelObject: model,  Options: {
            Filter: true,
            FilterDisplay: true,
            UserActions: actions
        }
    })
    return WRender.Create({ className: "main-container", children: [TableComponent] });
}
export { clientSearcher }

/**
 * 
 * @param { Function } [action] 
 * @param { Function } [anularAction]
 * @returns { HTMLElement }
 */
const contratosSearcher = (action, anularAction, withNotas = false) => {
    const model = new Transaction_Contratos_ModelComponent();
    model.Tbl_Cuotas.ModelObject = () => new Tbl_Cuotas_ModelComponent({
        Estado: {
            type: "operation", action: (/** @type {Tbl_Cuotas} */ cuota) => {
                if (cuota.total == cuota.pago_contado) {
                    return "CANCELADA";
                } else if (cuota.pago_contado > 0) {
                    return "PAGO PARCIAL";
                }
            }
        }
    });
    const actions = []
    if (action) {
        actions.push({
            name: "Seleccionar",
            action: async (cliente) => {
                // @ts-ignore
                await action(cliente);
            }
        })
    }
    if (anularAction) {
        actions.push({
            name: "Anular",
            rendered: (/** @type { Transaction_Contratos } */ contrato) => {
                return contrato.IsAnulable
                //return contrato.estado != "ANULADO" && contrato.estado != "CANCELADO"
            }, 
            action: async (cliente) => {
                // @ts-ignore
                await anularAction(cliente);
            }
        })
    }
    if (withNotas) {
        actions.push({
            name: "Agregar nota",
            action: async (cliente) => {
                document.body.appendChild( new WModalForm({
                    ModelObject: new Notas_de_contrato(),
                    title: "Agregar nota",
                    ObjectOptions: {
                        SaveFunction: async (nuevaNota) => {
                            if (cliente.Notas) {
                                cliente.Notas.push(nuevaNota)
                            } else {
                                cliente.Notas = [nuevaNota]
                            }
                            const response = await  new Transaction_Contratos(cliente).Update();
                            document.body.appendChild(ModalMessage(response.message));                            
                        } 
                    }
                }));
               
            }
        })
    }
    actions.push({
        name: "Ver detalles",
        action: async (/** @type { Transaction_Contratos } */ contrato) => {
            // @ts-ignore
            const contratoF = await new Transaction_Contratos({ numero_contrato: contrato.numero_contrato }).Find();
            document.body.append(new WModalForm({ ObjectModal: new  WDetailObject({ ObjectDetail: contratoF , ModelObject: new Transaction_Contratos_ModelComponent()})}));
        }
    })
    const TableComponent = new WTableComponent({
        EntityModel: model,
        ModelObject: new Transaction_Contratos_ModelComponent({
            numero_contrato: { type: "Number", primary: false }
        }),
        AddItemsFromApi: true,
        Options: {
            //Show: true,
            Filter: true,
            FilterDisplay: true,
            UserActions: actions
        }
    })
    /*const FilterOptions = new WFilterOptions({
        Dataset: [],
        //EntityModel: model,
        ModelObject: new Transaction_Contratos_ModelComponent(),
        Display: true,
        FilterFunction: (DFilt) => {
            TableComponent.Dataset = DFilt;
            TableComponent?.DrawTable();
            // @ts-ignore
            //action(DFilt, FilterOptions);
        }
    });*/
    return WRender.Create({
        className: "main-contratos-searcher", children: [
            //FilterOptions,
            TableComponent]
    });
}
export { contratosSearcher }