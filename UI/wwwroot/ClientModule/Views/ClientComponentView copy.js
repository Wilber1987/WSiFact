//@ts-check

import { Condicion_Laboral_Cliente } from "../../FrontModel/DBODataBaseModel.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../../WDevCore/StyleModules/WStyleComponents";
import { ModalMessage } from "../../WDevCore/WComponents/ModalMessage";
import { WAlertMessage } from "../../WDevCore/WComponents/WAlertMessage.js";
import { WAppNavigator } from "../../WDevCore/WComponents/WAppNavigator.js";
import { WForm } from "../../WDevCore/WComponents/WForm.js";
import { ComponentsManager, WRender } from "../../WDevCore/WModules/WComponentsTools";
import { WOrtograficValidation } from "../../WDevCore/WModules/WOrtograficValidation";
import { css } from "../../WDevCore/WModules/WStyledRender";
import { Catalogo_Clientes } from "../FrontModel/Catalogo_Clientes.js";

class ClientComponentView extends HTMLElement {
	constructor(cliente) {
		super();
		this.cliente = cliente ?? {};
		this.Draw();
	}

	ModelCliente = new Catalogo_Clientes();
	ModelDatosLaborales = new Condicion_Laboral_Cliente();

	Draw = async () => {
		this.cliente.Condicion_Laboral_Cliente = this.cliente.Condicion_Laboral_Cliente ?? [];
		if (this.cliente.Condicion_Laboral_Cliente.length == 0) {
			this.cliente.Condicion_Laboral_Cliente.push({});
		}

		this.innerHTML = "";

		this.FormularioCliente = new WForm({
			ModelObject: this.ModelCliente, EditObject: this.cliente, Options: false, DivColumns: "32% 32% 32%"
		});
		this.FormularioDatos = new WForm({
			ModelObject: this.ModelDatosLaborales, EditObject: this.cliente.Condicion_Laboral_Cliente[0], Options: false
		});


		this.OptionContainer = new WAppNavigator({
			Elements: [
				{
					name: 'Datos Cliente', action: () => {
						this.ClienteFormulario()
					}
				}, {
					name: 'Datos Laborales', action: () => {
						this.DatosLaborales()
					}
				}
			]
		}); //WRender.Create({ className: "OptionContainer" });
		this.OptionContainerBottom = WRender.Create({ className: "OptionContainer OptionBottom" });
		this.TabContainer = WRender.Create({ className: "TabNewContainer", id: 'TabNewContainer' });

		this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });

		this.OptionContainerBottom.append(WRender.Create({
			tagName: 'button', className: 'Block-Success', innerText: 'Guardar',
			onclick: async () => {
				if (!this.FormularioCliente?.Validate()) {
					this.Manager?.NavigateFunction("formularioCliente", this.FormularioCliente)					
					WAlertMessage.Warning("Necesita llenar todos los datos del cliente primeramente"); 
					return;
				}

				if (this.cliente.codigo_cliente == null || this.cliente.codigo_cliente == undefined) {
					/**@type {Catalogo_Clientes} */
					const result = await new Catalogo_Clientes(this.cliente).Save();

					if (result?.codigo_cliente != null) {
						this.cliente.codigo_cliente = result?.codigo_cliente;
						this.append(ModalMessage("Datos guardados correctamente"));
						this.updateForms();
					} else {
						this.append(ModalMessage("Error al guardar intentelo nuevamente"));
					}
				} else {
					const result = await new Catalogo_Clientes(this.cliente).Update();
					this.append(ModalMessage(WOrtograficValidation.es(result.message)));
				}
			}
		}))
		this.OptionContainerBottom.append(WRender.Create({
			tagName: 'button', className: 'Block-Basic', innerText: 'Limpiar',
			onclick: () => {
				this.updateForms()
			}
		}));
		this.ClienteFormulario()

		this.append(
			StylesControlsV2.cloneNode(true),
			StyleScrolls.cloneNode(true),
			StylesControlsV3.cloneNode(true),
			this.CustomStyle,
			this.OptionContainer,
			this.TabContainer,
			this.OptionContainerBottom
		);
	}
	updateForms() {
		this.cliente = {};
		this.cliente.Condicion_Laboral_Cliente = [{}];
		// @ts-ignore
		this.FormularioCliente.FormObject = this.cliente;
		// @ts-ignore
		this.FormularioDatos.FormObject = this.cliente.Condicion_Laboral_Cliente[0];
		this.FormularioCliente?.DrawComponent();
		this.FormularioDatos?.DrawComponent();
	}

	/***formulario para creacion y edicion de cliente  */
	ClienteFormulario() {
		this.Manager?.NavigateFunction("formularioCliente", this.FormularioCliente)
	}

	/***formulario para creacion y edicion de datos laborales  */
	DatosLaborales() {
		this.Manager?.NavigateFunction("formularioDatosLaborales", this.FormularioDatos)
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
customElements.define('w-catalogo_clientes', ClientComponentView);
export { ClientComponentView }