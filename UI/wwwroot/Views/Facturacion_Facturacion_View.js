//@ts-check
// @ts-ignore
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { ComponentsManager, WRender } from "../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { Catalogo_Clientes, Transaction_Facturas_ModelComponent } from "../FrontModel/DBODataBaseModel.js";
// @ts-ignore
import { Transaction_Facturas } from "../FrontModel/Model.js";
import { clientSearcher } from "../modules/SerchersModules.js";
import { WDetailObject } from "../WDevCore/WComponents/WDetailObject.js";
class Facturacion_Facturacion_View extends HTMLElement {
    constructor(props) {
        super();
        this.Draw();
    }

    Draw = async () => {
        const model = new Catalogo_Clientes();
        //const dataset = await model.Get();

        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Historial de Facturas',
            onclick: () => this.NewGestionFacturas()
        }))

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Tertiary', innerText: 'Imprimir Factura',
            onclick: async () => {
                //todo
                /*if (this.TableComponent != undefined) {
                    const datasetUpdated = await model.Get();
                    // @ts-ignore
                    this.TableComponent.Dataset = datasetUpdated;
                    this.TableComponent?.DrawTable();

                } else {
                    const data = await model.Get();
                    this.TableComponent = new WTableComponent({
                        ModelObject: model, Dataset: data, Options: {
                            Filter: true,
                            FilterDisplay: true,
                            UserActions: [
                                {
                                    name: "Editar", action: (cliente) => {
                                        if (this.Gestion_ClientesForm != null) {
                                            this.Gestion_ClientesForm.cliente = cliente
                                            this.Gestion_ClientesForm.Draw();
                                            this.NewTransaction();
                                        }

                                    }
                                }
                            ]
                        }
                    })
                    this.MainComponent = WRender.Create({ className: "main-container", children: [this.TableComponent] })
                }
                this.Manager?.NavigateFunction("tabla", this.MainComponent);*/
            }
        }))

        //this.NewTransaction();
        this.NewGestionFacturas()
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );


    }

    NewGestionFacturas() {
        this.Manager?.NavigateFunction("Historial_FacturasForm", clientSearcher([
            {
                name: "Seleccionar",
                action: async (cliente) => {
                    const response = await new Transaction_Facturas({ codigo_cliente: cliente.codigo_cliente }).Get();
                    cliente.Transaction_Facturas = response;
                    this.Manager?.NavigateFunction("Gestion_ClientesDetail" + cliente.codigo_cliente, new WDetailObject({
                        ModelObject: new Transaction_Facturas_ModelComponent({
                            Transaction_Facturas:
                                //{ type: "MASTERDETAIL", ModelObject: () => new Transaction_Facturas_ModelComponent(), Dataset: response }
                                { type: "MASTERDETAIL", ModelObject: () => new Transaction_Facturas_ModelComponent(), Dataset: response }
                        }),
                        ObjectDetail: cliente
                    }))
                }
            }
        ]))
    }
}