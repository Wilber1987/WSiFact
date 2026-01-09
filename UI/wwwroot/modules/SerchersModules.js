//@ts-check
// @ts-ignore
import { WRender } from "../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { Notas_de_contrato, Transaction_Contratos_ModelComponent } from "../FrontModel/DBODataBaseModel.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
// @ts-ignore
import { Catalogo_Clientes_ModelComponent } from "../ClientModule/FrontModel/Catalogo_Clientes.js";
import { Tbl_Cuotas, Transaction_Contratos } from "../FrontModel/Model.js";
import { Tbl_Cuotas_ModelComponent } from "../FrontModel/ModelComponents.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { WDetailObject } from "../WDevCore/WComponents/WDetailObject.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";

/**
 * 
 * @param { Array<import("../WDevCore/WModules/CommonModel.js").Actions> } actions 
 * @returns { HTMLElement }
 */
const clientSearcher = (actions) => {
    const model = new Catalogo_Clientes_ModelComponent();
    const TableComponent = new WTableComponent({
        ModelObject: model,  Options: {
            Filter: true,
            FilterDisplay: true,
            UserActions: actions
        }
    })
    return WRender.Create({ className: "main-container", children: [TableComponent] });
}
export { clientSearcher };

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
    return WRender.Create({
        className: "main-contratos-searcher", children: [
            TableComponent]
    });
}
export { contratosSearcher };
