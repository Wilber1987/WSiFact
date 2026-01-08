//@ts-check
import { Catalogo_Inversores } from "../FrontModel/DBODataBaseModel.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { WAlertMessage } from "../WDevCore/WComponents/WAlertMessage.js";
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js";
import { WForm } from "../WDevCore/WComponents/WForm.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
import { ComponentsManager, WRender } from "../WDevCore/WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WDevCore/WModules/WOrtograficValidation.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
class Gestion_InversionistaView extends HTMLElement {
    constructor(props) {
        super();
        this.Draw();
    }
    Draw = async () => {
        const model = new Catalogo_Inversores();
        const dataset = await model.Get();

        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });

        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.TableComponent = new WTableComponent({
            ModelObject: model, Dataset: dataset, Options: {
                UserActions: [
                    {
                        name: "Editar", action: (cliente) => {
                            this.Gestion_InversionistaForm.cliente = cliente;
                            this.Gestion_InversionistaForm.Draw();
                            this.NewTransaction();
                        }
                    }
                ]
            }
        });
        this.FilterOptions = new WFilterOptions({
            Dataset: dataset,
            ModelObject: model,
            Display: true,
            FilterFunction: (DFilt) => {
                this.TableComponent?.DrawTable(DFilt);
            }
        });
        this.MainComponent = WRender.Create({ className: "main-container", children: [this.FilterOptions, this.TableComponent] })
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Basic', innerText: 'Ingresar PersonaNatural',
            onclick: () => this.NewTransaction()
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Editar PersonaNatural',
            onclick: () => { this.Manager?.NavigateFunction("tabla", this.MainComponent) }
        }))
        this.NewTransaction()


        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            //this.FilterOptions,
            this.OptionContainer,
            this.TabContainer
        );


    }
    Gestion_InversionistaForm = new Gestion_InversionistaForm();
    NewTransaction(Model) {
        this.Manager?.NavigateFunction("Gestion_InversionistaForm", this.Gestion_InversionistaForm)
    }

}
customElements.define('w-gestion_inversionista', Gestion_InversionistaView);
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Gestion_InversionistaView()) })

class Gestion_InversionistaForm extends HTMLElement {
    constructor(cliente) {
        super();
        this.cliente = cliente ?? {};
        this.Draw();
    }

    ModelCliente = new Catalogo_Inversores();

    Draw = async () => {

        this.innerHTML = "";

        this.FormularioCliente = new WForm({
            ModelObject: this.ModelCliente, EditObject: this.cliente, Options: false, DivColumns: "32% 32% 32%"
        });

        this.OptionContainer = WRender.Create({ className: "OptionContainer OptionBottom" });
        this.TabContainer = WRender.Create({ className: "TabNewContainer", id: 'TabNewContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Success', innerText: 'Guardar',
            onclick: async () => {
                if (!this.FormularioCliente?.Validate()) {
                    WAlertMessage.Warning("Necesita llenar todos los datos del cliente primeramente");
                    return;
                }
                if (this.cliente.codigo_cliente == null || this.cliente.codigo_cliente == undefined) {
                    /**@type {Catalogo_Inversores} */
                    const result = await new Catalogo_Inversores(this.cliente).Save();

                    if (result?.id_inversor != null) {
                        this.cliente.codigo_cliente = result?.id_inversor;
                        this.append(ModalMessage("Datos guardados correctamente"));
                    } else {
                        this.append(ModalMessage("Error al guardar intentelo nuevamente"));
                    }
                } else {
                    const result = await new Catalogo_Inversores(this.cliente).Update();
                    this.append(ModalMessage(WOrtograficValidation.es(result.message)));
                }
            }
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Basic', innerText: 'Limpiar',
            onclick: () => {
                for (const prop in this.cliente) {
                    this.cliente[prop] = undefined;
                }
                this.FormularioCliente?.DrawComponent();
            }
        }));
        this.ClienteFormulario()

        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.CustomStyle,
            this.TabContainer,
            this.OptionContainer
        );
    }
    /***formulario para creacion y edicion de cliente  */
    ClienteFormulario() {
        this.Manager?.NavigateFunction("formularioCliente", this.FormularioCliente)
    }
    CustomStyle = css`
         w-form {
            margin: 20px;
            border: 1px solid #cacaca;
            border-radius: 20px;
            padding: 20px;
        }
    `
}
customElements.define('w-catalogo_inversores', Gestion_InversionistaForm);
export { Gestion_InversionistaView };

