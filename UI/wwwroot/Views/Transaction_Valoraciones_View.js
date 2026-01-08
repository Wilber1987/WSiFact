//@ts-check
// @ts-ignore
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../WDevCore/WModules/WComponentsTools.js";
// @ts-ignore
import { Catalogo_Cambio_Divisa_ModelComponent, Catalogo_Categoria_ModelComponent, Catalogo_Clientes, Catalogo_Estados_Articulos, Transactional_Valoracion_ModelComponent } from "../FrontModel/DBODataBaseModel.js";
import { WForm } from "../WDevCore/WComponents/WForm.js";


import { Transactional_Configuraciones } from "../Admin/ADMINISTRATIVE_ACCESSDataBaseModel.js";
import { Cat_Categorias } from "../Facturacion/FrontModel/Cat_Categorias.js";
import { Cat_Marca } from "../Facturacion/FrontModel/Cat_Marca.js";
import { Cat_Producto } from "../Facturacion/FrontModel/Cat_Producto.js";
import { Cat_Proveedor } from "../Facturacion/FrontModel/Cat_Proveedor.js";
import { Detalle_Compra } from "../Facturacion/FrontModel/Detalle_Compra.js";
import { Datos_Compra, Tbl_Compra } from "../Facturacion/FrontModel/Tbl_Compra.js";
import { ComprasComponent } from "../Facturacion/Views/CompraComponent.js";
import { Transaction_Contratos, ValoracionesTransaction } from "../FrontModel/Model.js";
import { Tbl_Cuotas_ModelComponent } from "../FrontModel/ModelComponents.js";
import { FinancialModule } from "../modules/FinancialModule.js";
import { clientSearcher, ValoracionesSearch } from "../modules/SerchersModules.js";
import { Permissions, WSecurity } from "../WDevCore/Security/WSecurity.js";
import { WAppNavigator } from "../WDevCore/WComponents/WAppNavigator.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { WArrayF } from "../WDevCore/WModules/WArrayF.js";
import { FacturasBuilder } from "../Facturacion/Views/Builders/FacturasBuilder.js";
import { DocumentsData } from "../Facturacion/FrontModel/DocumentsData.js";
import { Catalogo_Cambio_Divisa } from "../FrontModel/Catalogo_Cambio_Divisa.js";
import { Transactional_Valoracion } from "../Facturacion/FrontModel/Tbl_Lotes.js";
import { WPrintExportToolBar } from "../WDevCore/WComponents/WPrintExportToolBar.mjs";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { WAlertMessage } from "../WDevCore/WComponents/WAlertMessage.js";
import { WCard } from "../WDevCore/WComponents/WCard.js";
import { SystemConfigs } from "../Services/SystemConfigs.js";
import { Catalogo_Clientes_ModelComponent } from "../Facturacion/FrontModel/Catalogo_Clientes.js";
class Transaction_Valoraciones_View extends HTMLElement {
	// @ts-ignore
	constructor(props) {
		super();
		this.OptionContainer = WRender.Create({ className: "OptionContainer" });
		this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
		this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
		this.valoracionesContainer = WRender.Create({ className: "valoraciones-container" });
		this.append(this.CustomStyle);
		/**
		 * @type {Catalogo_Clientes}
		 */
		// @ts-ignore
		this.Cliente = {}
		this.valoresObject = {
			Valoracion_1: 0, dolares_1: 0,
			Valoracion_2: 0, dolares_2: 0,
			Valoracion_3: 0, dolares_3: 0,
		}
		this.valoracionesDataset = [];
		this.selectedClientDetail = WRender.Create({ tagName: "label", className: "selected-client" });
		this.amortizacionResumen = WRender.Create({ tagName: "label", innerText: this.valoracionResumen(0, 0, 0, 0) });
		this.Draw();
	}
	Draw = async () => {
		this.valoracionesContainer.innerHTML = "";
		/** @type {Array<Catalogo_Cambio_Divisa>} */
		this.tasasCambio = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
		let estadosArticulos = await new Catalogo_Estados_Articulos().Get();
		estadosArticulos = estadosArticulos.sort(((a, b) => a.id_estado_articulo - b.id_estado_articulo));
		this.Categorias = await new Catalogo_Categoria_ModelComponent().Get();
		this.Intereses = await new Transactional_Configuraciones().getConfiguraciones_Intereses();
		this.Beneficios = await new Transactional_Configuraciones().getConfiguraciones_Beneficios();
		this.InteresBase = WArrayF.SumValAtt(this.Intereses, "Valor");

		this.buildValoresModel(this.tasasCambio);

		this.multiSelectEstadosArticulos = new WTableComponent({
			Dataset: estadosArticulos,
			ModelObject: new Catalogo_Estados_Articulos({
				porcentaje_compra: { type: 'number', hidden: true },
				porcentaje_empeno: { type: 'number', hidden: true },
				valor_compra_cordobas: {
					type: "operation", action: (element) => {
						return ConvertToMoneyString(this.calculoCordobas(element.porcentaje_compra));
					}
				}, valor_compra_dolares: {
					type: "operation", action: (element) => {
						// @ts-ignore
						return ConvertToMoneyString(this.calculoDolares(element.porcentaje_compra));
					}
				},
				valor_empeño_cordobas: {
					type: "operation", action: (element) => {
						return ConvertToMoneyString(this.calculoCordobas(element.porcentaje_empeno));
					}
				}, valor_empeño_dolares: {
					type: "operation", action: (element) => {
						// @ts-ignore
						return ConvertToMoneyString(this.calculoDolares(element.porcentaje_empeno));
					}
				}
			}),
			selectedItems: [estadosArticulos[0]],
			paginate: false,
			Options: {
				Select: true, MultiSelect: false, SelectAction: () => {
					this.valoracionesForm?.DrawComponent();
					this.calculoAmortizacion();
					this.beneficiosDetailUpdate();
				}
			}
		});
		this.multiSelectEstadosArticulos.className = "multiSelectEstadosArticulos";
		this.valoracionModel = this.valoracionesModel(this.tasasCambio,
			this.multiSelectEstadosArticulos);

		this.SetOption();

		this.valoracionesForm = new WForm({
			ModelObject: this.valoracionModel,
			AutoSave: false,
			Options: false,
			// @ts-ignore
			id: "valoracionesForm",
			// @ts-ignore
			SaveFunction: (/**@type {Transactional_Valoracion_ModelComponent} */ valoracion) => {
			}, CustomStyle: css`
				.divForm {
					display: "grid";
					grid-template-columns: repeat(5, calc(20% - 15px));
					grid-template-rows: repeat(3, auto)
				} .textAreaContainer{
					grid-row: span 1 !important;
					padding-bottom: 0px !important;
				}  .ModalElement label {
					display: block;
					width: 100%;
					margin: 0px;
				}`
		});

		this.valoracionesTable = new WTableComponent({
			Dataset: this.valoracionesDataset,
			ModelObject: new Transactional_Valoracion_ModelComponent({}),
			paginate: true,
			AutoSave: false,
			id: "valoracionesTable",
			AddItemsFromApi: false,
			Options: {
				//Select: true,
				Delete: true,
				DeleteAction: () => this.calculoAmortizacion(),
			}
		});

		this.CuotasTable = new WTableComponent({

			ModelObject: new Tbl_Cuotas_ModelComponent({ Estado: undefined }),
			paginate: false,
			AddItemsFromApi: false,
			AutoSave: false,
			id: "cuotasTable",
			Options: {

			}
		});

		this.BeneficioDetail = WRender.Create({ className: "beneficios-detail" });
		this.beneficiosDetailUpdate();
		this.valoresObject = this.valoresObject ?? {
			Valoracion_1: 0, dolares_1: 0,
			Valoracion_2: 0, dolares_2: 0,
			Valoracion_3: 0, dolares_3: 0,
		}

		this.valoresForm = new WForm({
			EditObject: this.valoresObject,
			ModelObject: this.valoresModel,
			Options: false,
			DivColumns: "calc(100% - 160px) 150px",
			// @ts-ignore
			ProxyAction: (/**@type {WForm} */ valoracion) => {
				this.valoracionesForm?.SetOperationValues();
			}, CustomStyle: css`
				.ModalElement {
					display: grid !important;
					grid-template-columns: auto 120px;
					align-items: center;
				} .ModalElement label {
					display: block;
					width: 100%;
					margin: 0px;
				} input {
					min-width: 120px;
				}`
		});

		this.TabContainerTables = WRender.Create({ className: "TabContainerTables", id: 'TabContainerTables' });
		this.ManagerTables = new ComponentsManager({ MainContainer: this.TabContainerTables });
		this.TableNavigator = new WAppNavigator({
			NavStyle: "Tab",
			Inicialize: true,
			Elements: [{
				name: "Amortización de deuda", action: () => {
					this.ManagerTables?.NavigateFunction("cuotas", this.CuotasTable)
				}
			}, {
				name: "Valoraciones", action: () => {
					this.ManagerTables?.NavigateFunction("valoraciones", this.valoracionesTable)
				}
			}]
		})

		this.valoracionesContainer.append(
			this.selectedClientDetail,
			this.valoracionesForm,
			this.BeneficioDetail,
			this.valoresForm,
			this.multiSelectEstadosArticulos,
			WRender.Create({ className: "nav-header", children: [this.TableNavigator, this.amortizacionResumen] }),
			this.TabContainerTables
		);
		if (!this.clientSercher) {
			this.clientSercher = clientSearcher([{
				name: "Seleccionar", action: (cliente) => {
					this.selectCliente(cliente)
				}
			}]);
		}
		this.Manager.NavigateFunction("buscar-cliente", this.clientSercher);
		this.append(
			StylesControlsV2.cloneNode(true),
			StyleScrolls.cloneNode(true),
			StylesControlsV3.cloneNode(true),
			this.OptionContainer,
			this.TabContainer
		);
	}

	/**
	 * 
	 * @param {Number} Valoracion_compra_cordobas 
	 * @param {Number} Valoracion_compra_dolares 
	 * @param {Number} Valoracion_empeño_cordobas 
	 * @param {Number} Valoracion_empeño_dolares 
	 * @returns {string}
	 */
	valoracionResumen(Valoracion_compra_cordobas, Valoracion_compra_dolares, Valoracion_empeño_cordobas, Valoracion_empeño_dolares) {
		return `Compra C$: ${ConvertToMoneyString(Valoracion_compra_cordobas)} - Compra $: ${ConvertToMoneyString(Valoracion_compra_dolares)} - Empeño C$: ${ConvertToMoneyString(Valoracion_empeño_cordobas)} - Empeño $: ${ConvertToMoneyString(Valoracion_empeño_dolares)}`;
	}
	buildValoresModel(tasasCambio) {
		this.valoresModel = {
			Valoracion_1: {
				type: "number", label: "Valoración 1 - C$:", action: () => {
					this.valoresObject.dolares_1 = this.valoresObject.Valoracion_1 / tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".dolares_1");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.dolares_1.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			},
			dolares_1: {
				type: "number", label: "$:", action: () => {
					this.valoresObject.Valoracion_1 = this.valoresObject.dolares_1 * tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".Valoracion_1");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.Valoracion_1.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			},
			Valoracion_2: {
				type: "number", label: "Valoración 2 - C$:", action: () => {
					this.valoresObject.dolares_2 = this.valoresObject.Valoracion_2 / tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".dolares_2");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.dolares_2.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			},
			dolares_2: {
				type: "number", label: "$:", action: () => {
					this.valoresObject.Valoracion_2 = this.valoresObject.dolares_2 * tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".Valoracion_2");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.Valoracion_2.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			},
			Valoracion_3: {
				type: "number", label: "Valoración 3 - C$:", action: () => {
					this.valoresObject.dolares_3 = this.valoresObject.Valoracion_3 / tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".dolares_3");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.dolares_3.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			},
			dolares_3: {
				type: "number", label: "$:", action: () => {
					this.valoresObject.Valoracion_3 = this.valoresObject.dolares_3 * tasasCambio[0].Valor_de_venta;
					/** @type {HTMLInputElement|undefined|null} */
					const control = this.valoresForm?.shadowRoot?.querySelector(".Valoracion_3");
					if (control != undefined || control != null) {
						control.value = this.valoresObject.Valoracion_3.toString();
					}
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.beneficiosDetailUpdate();
					this.multiSelectEstadosArticulos?.SetOperationValues()
				}
			}, total_cordobas: {
				type: "number", label: "Total - C$", disabled: true, action: (data) => {
					//return this.promediarValoresCordobas(data)
				}
			}, total_dolares: {
				type: "number", label: "$:", disabled: true, action: (data) => {
					//return this.promediarValoresDolares(data)
				}
			}
		};
	}
	promediarValoresDolares(data) {
		//console.log(data);
		data.total_dolares = ((parseFloat(data.dolares_1) + parseFloat(data.dolares_2) + parseFloat(data.dolares_3)) / 3).toFixed(3);
		const control = this.valoresForm?.shadowRoot?.querySelector(".total_dolares");
		if (control != undefined || control != null) {
			// @ts-ignore
			control.value = data.total_dolares.toString();
		}
		return data.total_dolares;
	}

	promediarValoresCordobas(data) {
		data.total_cordobas = ((parseFloat(data.Valoracion_1) + parseFloat(data.Valoracion_2) + parseFloat(data.Valoracion_3)) / 3).toFixed(3);
		const control = this.valoresForm?.shadowRoot?.querySelector(".total_cordobas");
		if (control != undefined || control != null) {
			// @ts-ignore
			control.value = data.total_cordobas.toString();
		}
		return data.total_cordobas;
	}

	valoracionesModel(tasasCambio, multiSelectEstadosArticulos) {
		return new Transactional_Valoracion_ModelComponent({
			Fecha: { type: 'date', disabled: true },
			Tasa_de_cambio: { type: 'number', disabled: true, defaultValue: tasasCambio[0].Valor_de_venta },
			// @ts-ignore
			Tasa_interes: { type: 'number', disabled: true, defaultValue: this.InteresBase + 6 },
			Plazo: {
				// @ts-ignore
				type: "number", action: () => this.calculoAmortizacion(), min: 1, max: this.Categorias[0].plazo_limite, defaultValue: 1
			}, Catalogo_Estados_Articulos: { type: 'WSELECT', hidden: true },
			Valoracion_compra_cordobas: {
				// @ts-ignore
				type: 'operation', action: (/**@type {Transactional_Valoracion_ModelComponent} */ valoracion) => {
					return this.calculoCordobas(multiSelectEstadosArticulos.selectedItems[0].porcentaje_compra);
				}, hidden: true
			}, Valoracion_empeño_cordobas: {
				// @ts-ignore
				type: 'operation', action: (/**@type {Transactional_Valoracion_ModelComponent} */ valoracion) => {
					return this.calculoCordobas(multiSelectEstadosArticulos.selectedItems[0].porcentaje_empeno);
				}, hidden: true
			}, Valoracion_compra_dolares: {
				// @ts-ignore
				type: 'operation', action: (/**@type {Transactional_Valoracion_ModelComponent} */ valoracion) => {
					return this.calculoDolares(multiSelectEstadosArticulos.selectedItems[0].porcentaje_compra);
				}, hidden: true
			}, Valoracion_empeño_dolares: {
				// @ts-ignore
				type: 'operation', action: (/**@type {Transactional_Valoracion_ModelComponent} */ valoracion) => {
					return this.calculoDolares(multiSelectEstadosArticulos.selectedItems[0].porcentaje_empeno);
				}, hidden: true
			},
		});
	}
	/** @return {Number} */
	calculoCordobas = (porcentaje) => {
		// @ts-ignore
		/**@type {Number} */ const tasa_cambio = this.tasasCambio[0]?.Valor_de_compra;
		// @ts-ignore
		return (this.calculoDolares(porcentaje) * tasa_cambio).toFixed(3);
	}
	/** @return {Number} */
	calculoDolares = (porcentaje) => {
		// @ts-ignore
		return Math.round((this.avgValores().toFixed(0) * (porcentaje / 100))).toFixed(3);
	}
	avgValores() {
		return ((parseFloat(this.valoresObject.dolares_1.toString()) +
			parseFloat(this.valoresObject.dolares_2.toString()) +
			parseFloat(this.valoresObject.dolares_3.toString())) / 3);
	}
	SetOption() {
		this.OptionContainer.innerHTML = "";
		this.OptionContainer.append(WRender.Create({
			tagName: 'button', className: 'Block-Secundary', innerText: 'Buscar cliente',
			onclick: () => {
				this.Manager.NavigateFunction("buscar-cliente", this.clientSercher)
			}
		}))
		this.OptionContainer.append(WRender.Create({
			tagName: 'button', className: 'Block-Primary', innerText: 'Valoración',
			onclick: () => this.Manager.NavigateFunction("valoraciones", this.valoracionesContainer)
		}))

		this.OptionContainer.append(WRender.Create({
			tagName: 'button', className: 'Block-Tertiary', innerText: 'Buscar valoraciones',
			onclick: () => this.Manager.NavigateFunction("Searcher", new ValoracionesSearch(this.selectValoracion))
		}))
		this.OptionContainer.append(WRender.Create({
			tagName: 'button', className: 'Block-Fourth', innerText: 'Añadir / Guardar',
			onclick: async () => {
				if (!this.valoracionesForm?.Validate()) {
					return;
				}
				if (this.valoresObject.Valoracion_1 <= 0 ||
					this.valoresObject.Valoracion_3 <= 0 ||
					this.valoresObject.Valoracion_3 <= 0) {
					WAlertMessage.Warning("Llene el formulario de valoraciones con montos mayores a 0");
					return;
				}
				const existVehiculo = this.valoracionesTable?.Dataset.find(p => p.Catalogo_Categoria.id_categoria == 2);
				if (existVehiculo != undefined && this.valoracionesForm?.FormObject.Catalogo_Categoria.id_categoria != 2) {
					WAlertMessage.Warning("Anteriormente valoro un vehículo por lo tanto no puede agregar valoraciones de diferente categoría");
					return;
				}

				const notExistVehiculo = this.valoracionesTable?.Dataset.find(p => p.Catalogo_Categoria.id_categoria != 2);
				if (notExistVehiculo != undefined && this.valoracionesForm?.FormObject.Catalogo_Categoria.id_categoria == 2) {
					WAlertMessage.Warning("Anteriormente valoro un artículo distinto de vehículo por lo tanto no puede agregar valoraciones de esta categoría");
					return;
				}
				/**@type {Transactional_Valoracion} */
				const newValoracion = new Transactional_Valoracion();
				for (const prop in this.valoracionesForm?.FormObject) {
					newValoracion[prop] = this.valoracionesForm?.FormObject[prop];
				}
				const newValores = {};
				for (const prop in this.valoresObject) {
					newValores[prop] = this.valoresObject[prop];
				}
				newValoracion.Detail_Valores = newValores;
				newValoracion.Catalogo_Estados_Articulos = this.multiSelectEstadosArticulos?.selectedItems[0];
				newValoracion.id_estado = this.multiSelectEstadosArticulos?.selectedItems[0].id_estado_articulo;
				// @ts-ignore
				const serch = this.valoracionesTable?.Dataset.find(f => WArrayF.compareObj(f, newValoracion));
				this.valoracionesTable?.Dataset.push(newValoracion);
				this.valoracionesTable?.DrawTable();
				this.calculoAmortizacion();
				this.resetValoresForm();
				for (const prop in this.valoracionesForm?.FormObject) {
					if (prop == "Detail_Valores") continue;
					if (prop == "Tasa_interes") continue;
					if (prop == "Plazo") continue;
					this.valoracionesForm.FormObject[prop] = undefined;
				}
				this.valoracionesForm.DrawComponent();
				//guardar
				
				for (const element of this.valoracionesTable?.Dataset ?? []) {
					if (element.requireReValoracion(parseFloat((await SystemConfigs.FindByName("VENCIMIENTO_VALORACION"))?.Valor ?? "40"))) {
						element.id_valoracion = null;
						element.Fecha = new Date();
					}
				}
				this.valoracionModel?.GuardarValoraciones(this.valoracionesTable?.Dataset);
			}
		}))
		/*this.OptionContainer.append(WRender.Create({
			tagName: 'button', className: 'Block-Fifth', innerText: 'Guardar valoraciones',
			onclick: async () => {
				if (this.valoracionesTable?.Dataset.length == 0) {
					WAlertMessage.Connect({ Message: "Agregue valoraciones para poder continuar", Type: "warning" }); 
					return;
				}
				this.valoracionesTable?.Dataset.forEach(element => {
					element.id_valoracion = null;
					element.Fecha = new Date();
				});
				const valoracionesGuardadas = await this.valoracionModel?.GuardarValoraciones(this.valoracionesTable?.Dataset);
				if (valoracionesGuardadas?.length > 0) {
					WAlertMessage.Connect({ Message: "Valoraciones guardadas correctamente", Type: "warning" }); 
				}
			}
		}))*/
		if (WSecurity.HavePermission(Permissions.GESTION_EMPEÑOS)) {
			this.OptionContainer.append(WRender.Create({
				tagName: 'button', className: 'Block-Success', innerText: 'Generar Contrato',
				onclick: async () => {
					if (this.valoracionesTable?.Dataset.length == 0) {
						WAlertMessage.Connect({ Message: "Agregue valoraciones para poder continuar", Type: "warning" });
						return;
					}
					if (this.Cliente?.codigo_cliente == undefined) {
						WAlertMessage.Connect({ Message: "Seleccione un cliente para continuar", Type: "warning" });
						return;
					}
					const response = await this.calculoAmortizacion().SaveDataContract();
					if (response) {
						window.location.href = "/PagesViews/Transaction_ContratosView";
					}
				}
			}))
		}

		if (WSecurity.HavePermission(Permissions.GESTION_COMPRAS)) {
			this.OptionContainer.append(WRender.Create({
				tagName: 'button', className: 'Block-Success', innerText: 'Facturar',
				onclick: async () => {
					const Compra = this.GenerateCompra();
				}
			}))
		}

	}
	GenerateCompra() {
		if (this.Cliente.codigo_cliente == undefined) {
			this.append(ModalMessage("Seleccione o cree un cliente nuevo para continuar"));
			this.append(this.NuevoClienteProveedor())
			return;
		}
		if (this.valoracionesTable?.Dataset.length == 0) {
			this.append(ModalMessage("Agregue valoraciones para poder continuar"));
			return;
		}
		const nuevaCompra = new Tbl_Compra();
		// @ts-ignore
		nuevaCompra.Tasa_Cambio = this.tasasCambio[0]?.Valor_de_venta;

		nuevaCompra.Cat_Proveedor = new Cat_Proveedor({
			stado: "ACTIVO",
			Identificacion: this.Cliente.identificacion,
			Nombre: `${this.Cliente.primer_nombre} ${this.Cliente.segundo_nombre ?? ""} ${this.Cliente.primer_apellido ?? ""} ${this.Cliente.segundo_apellidio ?? ""}`,
			Datos_Proveedor: this.Cliente
		});
		nuevaCompra.Datos_Compra = new Datos_Compra();
		nuevaCompra.Datos_Compra.RUC = this.Cliente.identificacion
		nuevaCompra.Moneda = "DOLARES";
		const IvaPercent = 0;
		nuevaCompra.Detalle_Compra = this.valoracionesTable?.Dataset.map((/**@type {Transactional_Valoracion_ModelComponent} */ element) => {
			const detalleCompra = new Detalle_Compra();
			detalleCompra.Cantidad = 1;
			const beneficioVentaC = this.Beneficios?.find(b => b.Nombre == "BENEFICIO_VENTA_ARTICULO_COMPRADO")

			// @ts-ignore
			detalleCompra.Precio_Unitario = element.Valoracion_compra_dolares;
			// @ts-ignore
			detalleCompra.Precio_Venta = ((element.Valoracion_compra_dolares) * (beneficioVentaC.Valor / 100 + 1));
			detalleCompra.SubTotal = detalleCompra.Precio_Unitario * detalleCompra.Cantidad;
			detalleCompra.Aplica_Iva = false;
			detalleCompra.Iva = detalleCompra.Precio_Unitario * IvaPercent;
			detalleCompra.Total = detalleCompra.SubTotal + detalleCompra.Iva;
			detalleCompra.Datos_Producto_Lote = element;
			detalleCompra.Presentacion = "UND";
			detalleCompra.Cat_Producto = new Cat_Producto({
				Descripcion: element.Descripcion,
				Cat_Marca: new Cat_Marca({
					Nombre: element.Marca,
					Descripcion: element.Marca,
					Estado: "ACTIVO"
				}),
				Cat_Categorias: new Cat_Categorias({
					// @ts-ignore
					Descripcion: element.Catalogo_Categoria.descripcion,
					Estado: "ACTIVO"
				})
			});
			return detalleCompra;
		}) ?? [];
		const modal = new WModalForm({
			title: "REGISTRAR COMPRA",
			// @ts-ignore
			FullScreen: true,
			ObjectModal: new ComprasComponent({
				Entity: nuevaCompra,
				TasaCambio: nuevaCompra.Tasa_Cambio,
				IvaPercent: IvaPercent,
				WithTemplate: true,
				action: async (object, response) => {
					//this.append(ModalMessage(response.message));
					/**@type {DocumentsData} */
					const documentsData = await new DocumentsData().GetDataFragments();
					documentsData.Header.style.width = "100%";
					// console.log(FacturasBuilder.BuildFacturaCompra(documentsData, response.body));
					const facturaR = FacturasBuilder.BuildFacturaCompra(documentsData, response.body);
					const div = html`<div class="contract-response">
						${new WPrintExportToolBar({
						PrintAction: (toolBar) => {
							toolBar.Print(html`<div>${facturaR.cloneNode(true)}</div>`)
						}
					})}
						${facturaR}        
					</div>`;
					document.body.append(new WModalForm({
						ShadowRoot: false,
						ObjectModal: div,
						ObjectOptions: {
							SaveFunction: () => {
								location.href = "/Facturacion/ComprasManager"
							}
						}
					}))
					modal.close();
					/**
					 * @type {Catalogo_Clientes}
					 */
					// @ts-ignore
					this.Cliente = {}
					this.valoresObject = {
						Valoracion_1: 0, dolares_1: 0,
						Valoracion_2: 0, dolares_2: 0,
						Valoracion_3: 0, dolares_3: 0,
					}
					this.valoracionesDataset = [];
					this.selectedClientDetail = WRender.Create({ tagName: "label", className: "selected-client" });
					this.amortizacionResumen = WRender.Create({ tagName: "label", innerText: this.valoracionResumen(0, 0, 0, 0) });
					this.Draw();
				}
			})
		})
		this.append(modal);
	}
	NuevoClienteProveedor() {
		return new WModalForm({
			ModelObject: new Catalogo_Clientes_ModelComponent(),
			EditObject: { codigo_cliente: -1 },
			AutoSave: false,
			ObjectOptions: {
				SaveFunction: (/** @type {Catalogo_Clientes} */ cliente)=> {
					this.Cliente = cliente;
					this.GenerateCompra();
				}
			}
		});
	}
	selectCliente = (/**@type {Catalogo_Clientes} */ selectCliente) => {
		this.Cliente = selectCliente;
		if (this.valoracionesForm != undefined) {
			this.valoracionesForm.FormObject.Tasa_interes = this.getTasaInteres();
			this.valoracionesForm.DrawComponent();
		}
		this.calculoAmortizacion();
		this.selectedClientDetail.innerText = `
			Cliente seleccionado: ${selectCliente.primer_nombre} ${selectCliente.segundo_nombre ?? ''} ${selectCliente.primer_apellido} ${selectCliente.segundo_apellidio ?? ''}
		`;
		this.selectedClientDetail.innerHTML = "";
		this.selectedClientDetail.append(new WCard(selectCliente, new Catalogo_Clientes()))
		this.Manager.NavigateFunction("valoraciones", this.valoracionesContainer);
		this.beneficiosDetailUpdate();
	}
	getTasaInteres = () => {
		if (this.Cliente.Catalogo_Clasificacion_Interes) {
			return parseFloat(this.Cliente.Catalogo_Clasificacion_Interes.porcentaje)
				// @ts-ignore
				+ this.InteresBase;
		} else {
			// @ts-ignore
			return 6 + this.InteresBase;
		}
	}
	selectValoracion = async (/**@type {Transactional_Valoracion}*/ valoracion) => {
		if (valoracion.id_valoracion != undefined || valoracion.id_valoracion != null) {
			const valoracionAgregada = this.valoracionesTable?.Dataset.find(d => d.id_valoracion == valoracion.id_valoracion);
			if (valoracionAgregada != null) {
				this.append(ModalMessage("Valoración ya esta agregada"));
				return;
			}
		}
		// @ts-ignore
		valoracion.Tasa_de_cambio = this.tasasCambio[0]?.Valor_de_venta
		if (this.valoracionesForm != undefined) {
			for (const prop in this.valoracionesForm?.FormObject) {
				if (prop == "Detail_Valores") continue;
				if (prop == "Tasa_interes") continue;
				if (prop == "Serie") continue;
				// @ts-ignore
				if (prop == "id_valoracion" && valoracion.requireReValoracion(parseFloat((await SystemConfigs.FindByName("VENCIMIENTO_VALORACION"))?.Valor ?? "40"))) continue;
				this.valoracionesForm.FormObject[prop] = valoracion[prop]
			}
			this.valoracionesForm.Config.ModelObject?.Catalogo_Categoria?.action(this.valoracionesForm.FormObject, this.valoracionesForm);
			if (this.valoresForm != undefined) {
				// @ts-ignore
				if (!valoracion.requireReValoracion(parseFloat((await SystemConfigs.FindByName("VENCIMIENTO_VALORACION"))?.Valor ?? "40"))) {
					this.valoresObject.Valoracion_1 = valoracion.Detail_Valores?.Valoracion_1 ?? 0;
					this.valoresObject.dolares_1 = valoracion.Detail_Valores?.dolares_1 ?? 0;
					this.valoresObject.Valoracion_2 = valoracion.Detail_Valores?.Valoracion_2 ?? 0;
					this.valoresObject.dolares_2 = valoracion.Detail_Valores?.dolares_2 ?? 0;
					this.valoresObject.Valoracion_3 = valoracion.Detail_Valores?.Valoracion_3 ?? 0;
					this.valoresObject.dolares_3 = valoracion.Detail_Valores?.dolares_3 ?? 0;
					this.promediarValoresDolares(this.valoresObject);
					this.promediarValoresCordobas(this.valoresObject);
					this.valoresForm.DrawComponent();
				} else {
					this.resetValoresForm();
				}
			}
		}
		this.beneficiosDetailUpdate();

		this.Manager.NavigateFunction("valoraciones", this.valoracionesContainer);
	}
	resetValoresForm() {
		this.valoresObject.Valoracion_1 = 0;
		this.valoresObject.dolares_1 = 0;
		this.valoresObject.Valoracion_2 = 0;
		this.valoresObject.dolares_2 = 0;
		this.valoresObject.Valoracion_3 = 0;
		this.valoresObject.dolares_3 = 0;
		this.valoresForm?.DrawComponent();
	}
	beneficiosDetailUpdate() {
		// @ts-ignore
		this.BeneficioDetail.innerHTML = "";
		const detail = this.valoracionesForm?.FormObject;
		const beneficioVentaC = this.Beneficios?.find(b => b.Nombre == "BENEFICIO_VENTA_ARTICULO_COMPRADO");
		const beneficioVentaE = this.Beneficios?.find(b => b.Nombre == "BENEFICIO_VENTA_ARTICULO_EMPENO");
		const mora = detail.Tasa_interes * 2 / 100;
		const precio_venta_empeño = ((parseFloat(detail.Valoracion_empeño_dolares) * (mora + 1)) * (beneficioVentaE.Valor / 100 + 1));
		//console.log(precio_venta_empeño);
		// @ts-ignore
		this.valoracionesForm.FormObject.Precio_venta_empeño_cordobas = (precio_venta_empeño);
		// @ts-ignore
		this.valoracionesForm.FormObject.Precio_venta_empeño_dolares = (precio_venta_empeño / this.tasasCambio[0].Valor_de_venta)
		// @ts-ignore
		//const moraDolares =  mora / this.tasasCambio[0].Valor_de_venta;    
		this.BeneficioDetail?.append(html`<div>
			<h4>BENEFICIOS:</h4>
			<div class="column-venta">
				<label>VENTA DE COMPRA</label>
				<span>C$ ${((detail.Valoracion_compra_cordobas) * (beneficioVentaC.Valor / 100 + 1)).toFixed(3)}</span>
				<span>$ ${((detail.Valoracion_compra_dolares) * (beneficioVentaC.Valor / 100 + 1)).toFixed(3)}</span>
			</div>
			<div class="column-venta">
				<label>VENTA DE EMPEÑO</label>
				<span>C$ ${precio_venta_empeño.toString() == "NaN" ? "0.00"
				: (precio_venta_empeño *
					// @ts-ignore
					this.tasasCambio[0].Valor_de_venta).toFixed(3)}</span>
				<span>$ ${precio_venta_empeño.toString() == "NaN" ? "0.00"
				: precio_venta_empeño.toFixed(3)}</span>
			</div>
		</div>`);
		this.multiSelectEstadosArticulos?.SetOperationValues();
		this.multiSelectEstadosArticulos?.DrawTable();
	}
	/**
	 * 
	 * @returns {ValoracionesTransaction}
	 */
	calculoAmortizacion = () => {
		if (this.valoracionesTable?.Dataset.length == 0) {
			this.amortizacionResumen.innerText = this.valoracionResumen(0, 0, 0, 0);
			return new ValoracionesTransaction();
		}
		const total = this.valoracionesTable?.Dataset.reduce((sum, value) => (typeof value.Edad == "number" ? sum + value.Edad : sum), 0);
		const contrato = new ValoracionesTransaction();
		// @ts-ignore
		contrato.valoraciones = this.valoracionesTable?.Dataset;

		contrato.Transaction_Contratos = new Transaction_Contratos({
			tasas_interes: this.getTasaInteres() / 100,
			fecha: new Date(),
			plazo: this.valoracionesForm?.FormObject.Plazo ?? 1,
			// @ts-ignore
			taza_cambio: this.tasasCambio[0].Valor_de_venta,
			// @ts-ignore
			taza_cambio_compra: this.tasasCambio[0].Valor_de_compra,
			taza_interes_cargos: this.InteresBase,
			Catalogo_Clientes: this.Cliente.codigo_cliente != undefined ? this.Cliente : this.GenerateClient(),
			gestion_crediticia: this.Cliente.Catalogo_Clasificacion_Interes?.porcentaje ?? 6,
		});
		FinancialModule.calculoAmortizacion(contrato);
		//console.log(FinancialModule.calculoAmortizacion(contrato));

		if (this.CuotasTable != undefined) {
			this.CuotasTable.Dataset = contrato.Transaction_Contratos.Tbl_Cuotas;
			this.CuotasTable?.Draw();
		}
		this.amortizacionResumen.innerText = this.valoracionResumen(
			contrato.Transaction_Contratos.Valoracion_compra_cordobas,
			contrato.Transaction_Contratos.Valoracion_compra_dolares,
			contrato.Transaction_Contratos.Valoracion_empeño_cordobas,
			contrato.Transaction_Contratos.Valoracion_empeño_dolares);
		return contrato;
	}
	/**
	* @returns {Catalogo_Clientes}
	*/
	GenerateClient() {
		return new Catalogo_Clientes({
			Catalogo_Clasificacion_Interes: {
				id_clasificacion_interes: 6,
				Descripcion: "RANGO 6",
				Estado: "ACTIVO",
				porcentaje: 6,
				Catalogo_Clientes: null,
				filterData: null
			},
			Catalogo_Clasificacion_Cliente: {
				id_clasificacion: 6,
				Descripcion: "NO DEFINIDO",
				Estado: "ACTIVO",
				porcentaje: null,
				Catalogo_Clientes: null,
				filterData: null
			}
		})
	}
	CustomStyle = css`
		.valoraciones-container{
			padding: 20px;
			display: grid;
			grid-template-columns: 400px calc(100% - 730px) 300px;
			gap: 20px 30px;
			@media (max-width: 800px) {
				grid-template-columns: 100%;
			}
		}
		#valoracionesForm, .multiSelectEstadosArticulos {
			grid-column: span 2;
			@media (max-width: 800px) {
				grid-column: span 1;
			}
		}
		.beneficios-detail h4 {
			margin: 0px 10px 5px 10px;
		}
		.beneficios-detail {
			padding: 10px;
			border-radius: 10px;
			border: solid 1px #999;
			overflow: hidden;
			max-height:15px;
			transition: all 0.7s;
			cursor: pointer;
		}
		.beneficios-detail:hover {
			max-height:1500px;
		}
		.column-venta{
			display: grid;
			grid-template-columns: 47% 47%;
			gap: 5px;
			margin-bottom: 5px;
			font-size: 12px;
		}
		.column-venta label{
		   grid-column: span 2;
		}
		.column-venta span{
		   text-align: right;
		   font-weight: bold;
		   border-bottom: solid 1px #d4d4d4;
		}
		#valoracionesTable,
		#cuotasTable,
		.TabContainerTables,
		.nav-header,
		.selected-client{
			grid-column: span 3;
			@media (max-width: 800px) {
				grid-column: span 1;
			}
		}
		.nav-header {
			display: flex;
			width: 100%;
			justify-content: space-between;
			font-size: 14px;
			font-weight: bold;
			color: var(--font-secundary-color)
		}   
		.contract-response {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0px  30px;
			background-color: #d7d7d7;
		}    
		.OptionContainer{
			display: flex;
		} w-filter-option {
			grid-column: span 2;
		}    
		w-card {
			display: block;
			border-radius: 10px;
			border: solid 1px #bcbdbd;
			padding: 10px 30px 10px 10px;
		}    
	`
}
customElements.define('w-valoraciones-view', Transaction_Valoraciones_View);
export { Transaction_Valoraciones_View };
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Transaction_Valoraciones_View()) })

