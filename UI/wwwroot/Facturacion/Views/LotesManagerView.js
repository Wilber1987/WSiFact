//@ts-check
// @ts-ignore
import { ComponentsManager, html, WRender } from "../../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { WTableComponent } from "../../WDevCore/WComponents/WTableComponent.js";
// @ts-ignore
import { WAppNavigator } from "../../WDevCore/WComponents/WAppNavigator.js";
import { css } from "../../WDevCore/WModules/WStyledRender.js";
import { Tbl_Lotes_ModelComponent } from "../FrontModel/ModelComponent/Tbl_Lotes_ModelComponent.js";
import { Tbl_Lotes } from "../FrontModel/Tbl_Lotes.js";
import { WModalForm } from "../../WDevCore/WComponents/WModalForm.js";
import { Tbl_Transaccion } from "../FrontModel/Tbl_Transaction.js";
import { Tbl_Transaccion_ModelComponent } from "../FrontModel/ModelComponent/Tbl_Transaction_ModelComponent.js";
import { WPrintExportToolBar } from "../../WDevCore/WComponents/WPrintExportToolBar.mjs";
import { WArrayF } from "../../WDevCore/WModules/WArrayF.js";
import { DateTime } from "../../WDevCore/WModules/Types/DateTime.js";
import { ModalMessage } from "../../WDevCore/WComponents/ModalMessage.js";
import { ModalVericateAction } from "../../WDevCore/WComponents/ModalVericateAction.js";
import { WFilterOptions } from "../../WDevCore/WComponents/WFilterControls.js";
import { DivisasServicesUtil } from "../../Services/DivisasServicesUtil.js";
import { SystemConfigs } from "../../Services/SystemConfigs.js";
import { WAlertMessage } from "../../WDevCore/WComponents/WAlertMessage.js";
import { Tbl_Bajas_Almacen, Tbl_Bajas_Almacen_ModelComponent } from "../FrontModel/Tbl_Bajas_Almacen.js";
import { Tbl_Movimientos_Almacen, Tbl_Movimientos_Almacen_ModelComponent } from "../FrontModel/Tbl_Movimientos_Almacen.js";
import { EstadoEnum } from "../Enums/enums.js";
import { Money } from "../../WDevCore/WModules/Types/Money.js";

/**
 * @typedef {Object} LotesConfig
 * * @property {Tbl_Lotes} [Entity]
 * * @property {Tbl_Lotes} [TasaCambio]
 */
class LotesManagerView extends HTMLElement {
	constructor(LotesConfig) {
		super();
		this.LotesConfig = LotesConfig;
		this.OptionContainer = WRender.Create({ className: "OptionContainer" });
		this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
		this.navigator = new WAppNavigator({ Elements: this.ElementsNav })
		this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: true, WNavigator: this.navigator });

		this.indexFactura = 0;
		this.valoresObject = {
			subtotal: 0,
			iva: 0,
		}
		this.Draw();
	}
	ElementsNav = [{
		name: "Etiquetas ventas", id: "Etiquetas-Venta", action: async () => {
			this.Manager.NavigateFunction("Etiquetas-Venta", await this.EtiquetasView());
		}
	}, {
		name: "Existencias", id: "Lotes", action: () => {
			this.Manager.NavigateFunction("Lotes", this.ExistenciasView())
		}
	}, {
		name: "Existencias inactivas", id: "LotesInactivos", action: () => {
			this.Manager.NavigateFunction("LotesInactivos", this.ExistenciasInactivasView())
		}
	}, {
		name: "Articulos de baja", id: "Bajas", action: () => {
			this.Manager.NavigateFunction("Bajas", this.BajasView())
		}
	}, //TODO REVISAR MOVIMIENTOS
	{
		name: "Movimientos realizados", id: "Movimientos", action: () => {
			this.Manager.NavigateFunction("Movimientos", this.MovimientosView())
		}
	},
	]

	Draw = async () => {
		this.TasaCambio = await DivisasServicesUtil.TasaCambio();
		this.Porcentaje = await SystemConfigs.FindByName("PORCENTAGE_MINIMO_DE_PAGO_APARTADO_MENSUAL");
		this.append(this.CustomStyle, this.OptionContainer, this.navigator, this.TabContainer);
	}//end draw

	BuildLoteModel = () => {
		this.LotesModel = new Tbl_Lotes_ModelComponent();
	}


	ExistenciasView() {
		return new WTableComponent({
			ModelObject: new Tbl_Lotes_ModelComponent(),
			EntityModel: new Tbl_Lotes(),
			TypeMoney: "Dollar",
			Options: {
				Search: false,
				Filter: true,
				Add: false,
				Edit: false,
				FilterDisplay: true,
				AutoSetDate: false,
				UserActions: [{
					name: "Dar de baja",
					rendered: (/**@type {Tbl_Lotes}*/ Lote) => Lote.IsActivo,
					action: async (/**@type {Tbl_Lotes}*/ Lote) => {
						this.DarLoteDeBaja(Lote);
					}
				}]
			}
		});
	}
	ExistenciasInactivasView() {
		const model = new Tbl_Lotes({
			// @ts-ignore
			Get: async () => {
				return await model.GetData("ApiTransactionLotes/getTbl_LotesInactivos")
			}
		})
		return new WTableComponent({
			ModelObject: new Tbl_Lotes_ModelComponent(),
			EntityModel: model,
			TypeMoney: "Dollar",
			Options: {
				Search: false,
				Filter: true,
				Add: false,
				Edit: false,
				FilterDisplay: true,
				AutoSetDate: false,
				UserActions: [{
					name: "Activar",
					rendered: (/**@type {Tbl_Lotes}*/ Lote) => Lote.IsActivo,
					action: async (/**@type {Tbl_Lotes}*/ Lote) => {
						this.ActivarLoteDeBaja(Lote);
					}
				}, {
					name: "Dar de baja",
					rendered: (/**@type {Tbl_Lotes}*/ Lote) => Lote.IsActivo,
					action: async (/**@type {Tbl_Lotes}*/ Lote) => {
						this.DarLoteDeBaja(Lote);
					}
				}]
			}
		});
	}
	/**
	 * @param {Tbl_Lotes} Lote
	 */
	ActivarLoteDeBaja(Lote) {
		const modal = new WModalForm({
			ModelObject: new Tbl_Transaccion_ModelComponent({
				Cantidad: undefined
			}),
			//EditObject: Transaction,
			title: "ACTIVAR  EXISTENCIA",
			ObjectOptions: {
				SaveFunction: async (/**@type {Tbl_Transaccion}*/ editObject) => {
					editObject.Id_Lote = Lote.Id_Lote;
					this.append(ModalVericateAction(async () => {
						const response = await new Tbl_Lotes({
							Id_Lote: Lote.Id_Lote,
							Estado: EstadoEnum.ACTIVO,
							Detalles: `${Lote.Descripcion} - Activado: ${editObject.Descripcion}`,
						}
						).Update();
						this.append(ModalMessage(response.message, "success", true));
						modal.close();
					}, "¿Está seguro que desea activar esta existencia existencia?"));
				}
			}
		});
		this.append(modal);
	}
	BajasView() {
		return new WTableComponent({
			ModelObject: new Tbl_Bajas_Almacen_ModelComponent(),
			EntityModel: new Tbl_Bajas_Almacen(),
			TypeMoney: "Dollar",
			Options: {
				Search: false,
				Filter: true,
				Add: false,
				Edit: false,
				FilterDisplay: true,
				AutoSetDate: false,
				UserActions: [{
					name: "Revertir",
					rendered: (/**@type {Tbl_Bajas_Almacen}*/ baja) => baja.IsActivo,
					action: async (/**@type {Tbl_Bajas_Almacen}*/ Lote) => {
						this.RevertirLoteDeBaja(Lote);
					}
				}]
			}
		});
	}
	/**
	* @param {Tbl_Bajas_Almacen} Baja 
	* @returns {any}
	*/
	RevertirLoteDeBaja(Baja) {
		console.log(Baja);

		const modal = new WModalForm({
			ModelObject: new Tbl_Transaccion_ModelComponent({
				Cantidad: undefined
			}),
			//EditObject: Transaction,
			title: "REVERTIR BAJA DE EXISTENCIA",
			ObjectOptions: {
				SaveFunction: async (/**@type {Tbl_Transaccion}*/ editObject) => {
					editObject.Id_Transaccion = Baja.Id_Transaccion;
					this.append(ModalVericateAction(async () => {
						const response = await new Tbl_Lotes().RevertirBaja(editObject);
						this.append(ModalMessage(response.message, "success", true));
						modal.close();
					}, "Esta seguro que desea revertir esta baja?"));
				}
			}
		});
		this.append(modal);
	}

	MovimientosView() {
		return new WTableComponent({
			ModelObject: new Tbl_Movimientos_Almacen_ModelComponent(),
			EntityModel: new Tbl_Movimientos_Almacen(),
			TypeMoney: "Dollar",
			AutoSave: true,
			Options: {
				Search: false,
				Filter: true,
				Add: true,
				Edit: false,
				FilterDisplay: true,
				AutoSetDate: false,
				UserActions: [{
					name: "Dar de baja",
					rendered: (/**@type {Tbl_Movimientos_Almacen}*/ mov) => mov.IsActivo,
					action: async (/**@type {Tbl_Movimientos_Almacen}*/ Lote) => {
						this.AnularMovimiento(Lote);
					}
				}]
			}
		});
	}
	AnularMovimiento(Movimiento) {
		const modal = new WModalForm({
			ModelObject: new Tbl_Transaccion_ModelComponent({
				Cantidad: undefined
			}),
			//EditObject: Transaction,
			title: "BAJA DE EXISTENCIA",
			ObjectOptions: {
				SaveFunction: async (/**@type {Tbl_Transaccion}*/ editObject) => {
					editObject.Id_Transaccion = Movimiento.Id_Transaccion;
					this.append(ModalVericateAction(async () => {
						const response = await new Tbl_Movimientos_Almacen().AnularMovimiento(editObject);
						this.append(ModalMessage(response.message, "success", true));
						modal.close();
					}, "Esta seguro que desea dar de baja esta existencia?"));
				}
			}
		});
		this.append(modal);
	}
	DarLoteDeBaja(Lote) {
		const modal = new WModalForm({
			ModelObject: new Tbl_Transaccion_ModelComponent({
				Cantidad: { type: 'number', min: 1, max: Lote.Cantidad_Existente, defaultValue: 1 }
			}),
			//EditObject: Transaction,
			title: "BAJA DE EXISTENCIA",
			ObjectOptions: {
				SaveFunction: async (/**@type {Tbl_Transaccion}*/ editObject) => {
					editObject.Id_Lote = Lote.Id_Lote;
					this.append(ModalVericateAction(async () => {
						console.log(editObject);
						const response = await new Tbl_Lotes().DarDeBaja(editObject);
						this.append(ModalMessage(response.message, "success", true));
						modal.close();
					}, "Esta seguro que desea dar de baja esta existencia?"));
				}
			}
		});
		this.append(modal);
	}

	async EtiquetasView() {
		/**@type {Array<Tbl_Lotes>} */
		const selectedLotes = [];
		const etiquetasContainer = html`<div class="etiquetas-container"></div>`

		const filter = new WFilterOptions({
			ModelObject: new Tbl_Lotes_ModelComponent(),
			EntityModel: new Tbl_Lotes(),
			//AutoSetDate: true,
			UseEntityMethods: true,
			Display: true,
			FilterFunction: async (lotes) => {
				etiquetasContainer.innerHTML = "";
				etiquetasContainer.append(html`<div class="etiqueta-detail-header">
					<div class="etiqueta-header">Detalle</div>
					<div class="etiqueta-header">Código</div>
					<div class="etiqueta-header">Tipo</div>
					<div class="etiqueta-header">V. liquidación $</div>
					<div class="etiqueta-header">% utilidad venta</div>
					<div class="etiqueta-header">Precio de venta $</div>
					<div class="etiqueta-header">% utilidad S. Apartado</div>
					<div class="etiqueta-header">Precio de S. Apartado $</div>
					<div class="etiqueta-header"><%</div>
					<div class="etiqueta-header"></div>
				</div>`)
				lotes.forEach(lote => { etiquetasContainer.append(this.CreateEtiqueta(lote, selectedLotes)) })
			}
		});
		await filter.filterFunction();
		const div = html`<div>
			<div class="OptionContainer">
				${filter}
				${new WPrintExportToolBar({ PrintAction: (tool) => this.ImprimirEtiquetas(selectedLotes, tool) })}			
			</div>	
			${etiquetasContainer}		
		</div>`
		return div;
	}
	/**
	* @param {Array<Tbl_Lotes>} lotes 
	* @param {WPrintExportToolBar} tool
	*/
	ImprimirEtiquetas(lotes, tool) {
		if (!lotes || lotes.length == 0) {
			WAlertMessage.Connect({ Message: "Seleccione etiquetas para imprimir", Type: "warning" });
			return;
		}
		const fragment = html`<div class="etiquetas">
			${this.EtiquetaStyle()}               
			${lotes.map(lote => this.BuildLoteEtiqueta(lote))}
		</div>`
		//this.append(fragment.cloneNode(true));
		tool.Print(fragment);
	}

	/**
	* @param {Tbl_Lotes} lote
	*/
	BuildLoteEtiqueta(lote) {
		return html`<div class="etiqueta" >
			<table >                
				<tr>
					<td class="value-prop" style="text-align: center; width: 50%" colspan="2"> 
						<img class="logo" src="/Media/img/logo.png"/>
					</td >
					<td colspan="4" style="text-align: center;">Datos de venta</td>
				</tr>
				<tr>
					<td class="value-prop" style="width: 50%" colspan="2">ARTÍCULO</td>
					<td colspan="4">${lote.Detalles}</td>
				</tr>
				<tr>
					<td class="value-prop" style="width: 50%" colspan="2">P/CONTADO</td>                    
					<td  colspan="4">C$ ${(lote.EtiquetaLote.Precio_venta_Apartado_dolares * // @ts-ignore
				this.TasaCambio.Valor_de_venta).toFixed(2)}</td>					
				</tr>
				<tr>
					<td class="value-prop" style="width: 50%" colspan="2">APARTADO / QUINCENAL</td>                    
					<td  colspan="4">C$ ${(lote.EtiquetaLote.Cuota_apartado_quincenal_dolares * // @ts-ignore
				this.TasaCambio.Valor_de_venta).toFixed(2)}</td>					
				</tr>
				<tr>
					<td class="value-prop" style="width: 50%" colspan="2">N° CUOTAS</td>
					<td colspan="4" style="text-align: center;">${lote.EtiquetaLote.N_Cuotas}</td>
				</tr>
				<tr>
					<td class="value-prop" style="width: 50%" colspan="2">APARTADO / MENSUAL</td>                    
					<td  colspan="4">C$ ${// @ts-ignore
			new Money((lote.EtiquetaLote.Precio_venta_Apartado_dolares * (parseFloat(this.Porcentaje?.Valor ?? 35) / 100)) * this.TasaCambio.Valor_de_venta, "NIO")}</td>					
				</tr>
				<tr>
					<td colspan="2" class="value-prop">CÓDIGO: ${lote.Lote}</td>
					<td colspan="2">${lote.EtiquetaLote.Tipo != "CV" ? "ENVIADO A LIQ" : "ENVIADO A LIQ"}</td>
					<td colspan="2">${new DateTime(lote.Fecha_Ingreso).toDDMMYYYY()}</td>
				</tr>
			</table>
		</div>`;
		//TODO ENVIO A LIQ Y COMPRA
	}
	/**
	 * @param {Tbl_Lotes} lote
	 * @param {Array<Tbl_Lotes>} selectedLotes
	 * @returns {HTMLElement}
	 */
	CreateEtiqueta(lote, selectedLotes) {
		const etiqueta = html`<div class="etiqueta-detail" id="${lote.EtiquetaLote?.Codigo}">
			<div>${lote.Detalles}</div>
			<div>${lote.Lote}</div>
			<div>${lote.EtiquetaLote?.Tipo}</div>
			<div>$ ${lote.EtiquetaLote?.Precio_compra_dolares?.toFixed(2)}</div>
			<div>${lote.EtiquetaLote?.PorcentajesUtilidad + lote.EtiquetaLote?.PorcentajeAdicional}</div>
			<div>$ ${lote.EtiquetaLote?.Precio_venta_Contado_dolares?.toFixed(2)}</div>
			<div>${lote.EtiquetaLote?.PorcentajesApartado + lote.EtiquetaLote?.PorcentajeAdicional}</div>
			<div>$ ${lote.EtiquetaLote?.Precio_venta_Apartado_dolares?.toFixed(2)}</div>
			<div>
				<input type="number"
					value="${lote.EtiquetaLote?.PorcentajeAdicional}" 
					max="100" min="0" pattern="\d*" 
					onchange="${async (ev) => {
						if ( ev.target.value < 0) {
							ev.target.value = 0;
						}
						lote.EtiquetaLote.PorcentajeAdicional = ev.target.value;
						const response = await lote.Update();
						if (response.status == 200) {
							location.reload();
						}
					}}">
					</div>
			<div><input type="checkbox" onchange="${async (ev) => {
				WArrayF.AddOrRemove(lote, selectedLotes, ev.target.checked);
			}}"></div>
		</div>`
		return etiqueta;
	}
	CustomStyle = css`       
		.OptionContainer{
			justify-content: space-between;
			align-items: center;
			& .search-box {
				width: 400px;
			}
		}
		.etiquetas-container {
			display: grid;
			grid-template-columns: repeat(10, 1fr); /* Ocho columnas de igual tamaño */
			margin: 20px 0px;      
			border-radius: 15px;
			border: 1px solid #ccc;
			overflow: hidden;
		}

		.etiqueta-detail, .etiqueta-detail-header {
			display: contents; /* Permite que los hijos hereden el grid del contenedor */
		}

		.etiqueta-header {
			font-weight: bold;
			text-align: center;
			padding: 5px 10px;
			background-color:  #ebebeb;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.etiqueta-detail > div {
			text-align: center;
			padding: 5px 10px;
			border-bottom: 1px solid #ddd;
		}

		.etiqueta-detail input {
			width: calc(100% - 5);
			text-align: center;
			border: 1px solid #ccc;
			border-radius: 4px;
			padding: 5px;
		}

		/* Estilo responsivo */
		@media (max-width: 768px) {
			.etiquetas-container {
				grid-template-columns: repeat(4, 1fr); /* Reducir a 4 columnas */
			}

			.etiqueta-header,
			.etiqueta-detail > div {
				font-size: 12px; /* Reducir el tamaño de fuente */
				padding: 3px 5px; /* Reducir el espaciado */
			}
		}

		@media (max-width: 480px) {
			.etiquetas-container {
				grid-template-columns: repeat(2, 1fr); /* Reducir a 2 columnas */
			}
			.etiqueta-header,
			.etiqueta-detail > div {
				font-size: 10px; /* Reducir aún más el tamaño de fuente */
				padding: 2px 3px; /* Reducir el espaciado */
			}
		}
	`
	EtiquetaStyle() {
		return css`
			.etiquetas {  
				text-align: center;
			}
			.etiqueta {
				max-width: 100mm;
				display: inline-block;
				width:45%;
				margin: 10px;
				height: 300px;
				overflow: hidden;
			}
			table {
				width: 100%;
				height: 100%;
				max-width: 100mm;
				border-collapse: collapse;
				& img {
					height: 50px;
					width: 60px;
				}
				& .value-prop{
					text-align: right;
				}
				& td {
					font-size: 12px !important;
					border: solid 1px #000;
					padding: 5px;
				}               
			}
	   `
	}
}
customElements.define('w-main-lotes-manager', LotesManagerView);
export { LotesManagerView };

window.addEventListener('load', async () => {
	// @ts-ignore
	MainBody.append(new LotesManagerView())
});


