import { WRender, ComponentsManager } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js"
import { Transactional_Configuraciones, Transactional_Configuraciones_ModelComponent } from "./ADMINISTRATIVE_ACCESSDataBaseModel.js"
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { WAjaxTools } from "../WDevCore/WModules/WAjaxTools.js";
class Transactional_ConfiguracionesView extends HTMLElement {
    constructor(props) {
        super();
        this.Draw();
    }
    Draw = async () => {
        const model = new Transactional_Configuraciones_ModelComponent();
        const dataset = await model.Get();
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: 'TabContainer' } })
        this.MainComponent = new WTableComponent({
            ModelObject: model, 
            EntityModel: new Transactional_Configuraciones(),
            Dataset: dataset, 
            maxElementByPage: 50, 
            Options: {
                UrlUpdate: "../api/ApiEntityAdministrative_Access/updateTransactional_Configuraciones",
                //Search: true, 
                Filter: true, FilterDisplay: true, UserActions: [
                    {
                        name: "Editar", action: (element) => {
                            this.append(new WModalForm({
                                AutoSave: true,
                                ModelObject: new Transactional_Configuraciones_ModelComponent({
                                    Valor: { type: this.ConfigType(element) }
                                }),
                                EditObject: element, ObjectOptions: {
                                    SaveFunction: () => {
                                        window.location.reload();
                                    }
                                }
                            }))
                        }
                    }
                ]

            }
        })
        this.TabContainer.append(this.MainComponent)

        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            this.TabContainer
        );
    }
    ConfigType(element) {
        if (this.IsImage(element)) {
            return "IMG";
        } else if (this.IsDrawImage(element)) {
            return "DRAW";
        } else if (this.IsNumber(element)) {
            return "NUMBER";
        }
        return "TEXT"
    }

    IsNumber(element) {
        return element.Tipo_Configuracion == "INTERESES" ||
            element.Tipo_Configuracion == "BENEFICIOS" ||
            element.Tipo_Configuracion == "NUMBER";
    }
    IsDrawImage(element) {
        return element.Nombre == "FIRMA_DIGITAL_APODERADO" ||
            element.Nombre == "FIRMA_DIGITAL_APODERADO_VICEPRESIDENTE"
    }
    IsImage(element) {
        return element.Nombre == "LOGO"
    }
}
customElements.define('w-transactional_configuraciones', Transactional_ConfiguracionesView);
export { Transactional_ConfiguracionesView }
