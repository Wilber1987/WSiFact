//@ts-check
import { WRender, ComponentsManager, html } from "../WDevCore/WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js"
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js"
import { Transaccion_Factura, Catalogo_Cambio_Divisa_ModelComponent } from "../FrontModel/DBODataBaseModel.js"
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { WAjaxTools } from "../WDevCore/WModules/WAjaxTools.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { ModalVericateAction } from "../WDevCore/WComponents/ModalVericateAction.js";
import { WPrintExportToolBar } from "../WDevCore/WComponents/WPrintExportToolBar.mjs";
class Ver_RecibosView extends HTMLElement {
	constructor(props) {
		super();
		this.Draw();
	}
	Draw = async () => {
		const tasa = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
		this.OptionContainer = WRender.Create({ className: "OptionContainer" });
		this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: 'TabContainer' } })
		const id_Recibo = new URLSearchParams(window.location.search).get('id_Recibo');
		if (id_Recibo != null) {
			await this.printRecibo(id_Recibo, tasa);
		}
		this.MainComponent = new WTableComponent({
			EntityModel: new Transaccion_Factura({ Factura_contrato: {} }),
			ModelObject: new Transaccion_Factura(),
			Options: {
				Filter: true,
				FilterDisplay: true,
				UserActions: [
					{
						name: "Anular",
						rendered: (/** @type { Transaccion_Factura } */ factura) => {
							// @ts-ignore
							return factura.estado != "ANULADO"
						},
						action: (factura) => {
							factura.motivo_anulacion = null
							const modal = new WModalForm({
								ModelObject: {
									motivo_anulacion: { type: "TEXTAREA" }
								}, EditObject: factura,
								title: "ANULACIÓN",
								ObjectOptions: {
									SaveFunction: async () => {
										if (factura.estado == "ANULADO") {
											this.append(ModalMessage("Recibo ya esta anulado"));
											return;
										}
										this.append(ModalVericateAction(async (editObject) => {
											const response =
												await WAjaxTools.PostRequest("../api/ApiRecibos/anularRecibo",
													{
														id_recibo: factura.id_factura,
														tasa_cambio: tasa[0].Valor_de_venta,
														tasa_cambio_compra: tasa[0].Valor_de_compra,
														motivo_anulacion: factura.motivo_anulacion
													});

											this.append(ModalMessage(response.message, undefined, true));
											modal.close();
										}, "Esta seguro que desea anular este contrato"))
									}
								}
							});
							this.append(modal);
						}
					}, {
						name: "Imprimir", action: async (factura) => {
							//this.append(ModalVericateAction(async () => {
							const id_factura = factura.id_factura
							if (factura.estado == "ANULADO") {
								alert("RECIBO ANULADO")
								return;
							}

							await this.printRecibo(id_factura, tasa, factura);
							// }, "¿Esta seguro que desea imprimir este recibo?"))
						}
					}
				]
			}
		})
		this.TabContainer.append(this.MainComponent)
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
		this.OptionContainer?.append(WRender.Create({
			tagName: 'button', className: 'Block-Secundary', innerText: 'Nuevo Recibo',
			onclick: () => {
				window.location.href = "/PagesViews/Gestion_Recibos";
			}
		}))
	}


	async printRecibo(id_factura, tasa, factura) {
		const response = await WAjaxTools.PostRequest("../api/ApiRecibos/printRecibo",
			{ id_recibo: id_factura, tasa_cambio: tasa[0].Valor_de_compra });
		if (response.status == 200 && response.body.documents != null && response.body.documents != undefined) {
			const docs = [];
			response.body.documents.forEach(element => {
				const objFra = WRender.Create({
					// @ts-ignore
					tagName: "iframe", srcdoc: element.body,
					style: {
						minHeight: "700px",
						width: element.type == "REESTRUCTURE_TABLE" || element.type == "RECIBO_QUINCENAL" ? "95%" : "320px",
						maxWidth: element.type == "REESTRUCTURE_TABLE" || element.type == "RECIBO_QUINCENAL" ? "1100px" : "320px"
					}
				})
				/*//console.log(objFra.srcdoc);
				const print = function () {
					// @ts-ignore
					objFra.contentWindow.focus(); // Set focus.
					// @ts-ignore
					objFra.contentWindow.print(); // Print it  
				};
				const btn = html`<img class="print" src="../WDevCore/Media/print.png"/>`
				btn.onclick = print*/
				docs.push(WRender.Create({
					className: "doc-container", children: [
						this.PrintIconStyle(response.body),
						new WPrintExportToolBar({
							PrintAction: (toolBar) => {
								toolBar.Print(html`<div class="contract-response">
									<div class="recibo">${element.body}</div>
								</div>`)
							}
						}),
						// @ts-ignore
						WRender.Create({ className: "print-container-iframe", children: objFra })]
				}));
			});

			this.append(new WModalForm({
				ObjectModal: WRender.Create({
					class: "print-container", children: docs
				})
			}))
			// objFra.onload = print
			//document.body.appendChild(objFra); 
			// const ventimp = window.open(' ', 'popimpr');
			// ventimp?.document.write(response.message);
			// ventimp?.focus();
			// setTimeout(() => {
			//     ventimp?.print();
			//     ventimp?.close();
			// }, 100);
		} else if (response.status == 200 && response.message != null) {
			this.append(ModalMessage(response.message))
		}
	}


	PrintIconStyle(responseBody) {
		return css`
		   .print {
			width: 30px;
			height: 30px;
			padding: 5px;
			border: solid 1px #bdbcbc; 
			border-radius: 5px;
			cursor: pointer;        
		} .print-container {
			width: 98%;   
			margin: auto;          
		} .print-container .doc-container{
			width: 100%; 
			display: flex;
			justify-content: flex-end;
			padding: 5px;
			border-radius: 5px;
			border: solid 1px #bdbcbc; 
			margin-bottom: 5px;
			flex-direction: column;
		}.print-container-iframe {
			background-color: #bdbcbc;  
		}  .print-container iframe {            
			margin: 10px auto;
			display: block;
			background-color: #fff;
			border: none;
		}
		 `;
	}
}
customElements.define('w-datos_configuracion', Ver_RecibosView);
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Ver_RecibosView()) })
