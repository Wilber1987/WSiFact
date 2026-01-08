//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Detalle_Factura_ModelComponent } from './Detalle_Factura_ModelComponent.js'
import { Catalogo_Clientes } from "../../../ClientModule/FrontModel/Catalogo_Clientes.js";
import { Datos_Financiamiento, Tbl_Factura } from "../Tbl_Factura.js";
import { WForm } from "../../../WDevCore/WComponents/WForm.js";
import { Detalle_Factura } from "../Detalle_Factura.js";
import { WArrayF } from "../../../WDevCore/WModules/WArrayF.js";
import { FinancialModule } from "../../../modules/FinancialModule.js";
import { Detail_Prendas, Transaction_Contratos, ValoracionesTransaction } from "../../../FrontModel/Model.js";
import { Catalogo_Cambio_Divisa } from "../../../FrontModel/Catalogo_Cambio_Divisa.js";
import { ModalMessage } from "../../../WDevCore/WComponents/ModalMessage.js";
import { WAlertMessage } from "../../../WDevCore/WComponents/WAlertMessage.js";
import { DateTime } from "../../../WDevCore/WModules/Types/DateTime.js";



class Tbl_Factura_ModelComponent extends EntityClass {
	constructor(props) {
		super(props, 'EntityFacturacion');
		Object.assign(this, props);;
	}
	/**@type {ModelProperty}*/ Id_Factura = { type: 'number', primary: true };
	/**@type {ModelProperty}*/ Cliente = { type: 'wselect', ModelObject: () => new Catalogo_Clientes(), defaultValue: null, ForeignKeyColumn: "Id_Cliente" };
	/**@type {ModelProperty}*/ Tipo = {
		type: 'select', Dataset: ["VENTA", "APARTADO_MENSUAL", "APARTADO_QUINCENAL"],
		action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			this.TypeAction(EditObject, form);
		}
	};
	//**@type {ModelProperty}*/ Concepto = { type: 'textarea' };
	//**@type {ModelProperty}*/ Serie = { type: 'text', hidden: true  };
	/**@type {ModelProperty}*/ Forma_Pago = { type: 'select', Dataset: ["CONTADO", "TARJETA", "TRANSFERENCIA"] };
	//**@type {ModelProperty}*/ Direccion_Envio = { type: 'text', hidden: true  };
	/**@type {ModelProperty}*/ Id_Cliente = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Id_Sucursal = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Fecha = { type: 'datetime', disabled: true, defaultValue: new DateTime().toISO() };
	/**@type {ModelProperty}*/ Moneda = {
		type: "radio", Dataset: ["DOLARES", "CORDOBAS"],
		action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			if (EditObject.Moneda == "DOLARES") {
				form.ModelObject.Monto_dolares.hidden = false;
				form.ModelObject.Monto_cordobas.hidden = true;

				form.ModelObject.Is_cambio_cordobas.hidden = false;
				EditObject.Is_cambio_cordobas = false;
				//form?.DrawComponent();
			} else {
				form.ModelObject.Monto_dolares.hidden = true;
				form.ModelObject.Monto_cordobas.hidden = false;

				form.ModelObject.Is_cambio_cordobas.hidden = true;
				EditObject.Is_cambio_cordobas = false;
				//form?.DrawComponent();
			}
		}
	}
	/**@type {ModelProperty}*/ Fecha_Vencimiento = { type: 'date', hidden: true };
	/**@type {ModelProperty}*/ Observaciones = { type: 'textarea', require: false };
	/**@type {ModelProperty}*/ Id_Usuario = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Estado = { type: 'SELECT', hidden: true, Dataset: ["ACTIVA", "ANULADO"] };
	/**@type {ModelProperty}*/ Sub_Total = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Iva = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Tasa_Cambio = { type: 'number', hidden: true };
	/**@type {ModelProperty}*/ Total = { type: 'number', hidden: true };

	/**@type {ModelProperty}*/Datos_Financiamiento = {
		type: 'MODEL',
		hiddenFilter: true,
		hidden: true,
		ModelObject: new Datos_Financiamiento_ModelComponent(),
		action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			//return ConvertToMoneyString(EditObject.cambio_cordobas = EditObject.Monto_cordobas - (EditObject.Total * EditObject.Tasa_Cambio));
		}
	};

	/**@type {ModelProperty}*/ Monto_dolares = {
		type: 'MONEY', defaultValue: 0, hiddenFilter: true, hiddenInTable: true, action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {

			this.CalculeTotal(EditObject, form);
		}
	};
	/**@type {ModelProperty}*/Monto_cordobas = {
		type: 'MONEY', defaultValue: 0, hiddenFilter: true, hiddenInTable: true, hidden: true, action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			//console.log(EditObject. Monto_dolares, EditObject.Total);

			this.CalculeTotal(EditObject, form);
		}
	};
	/**@type {ModelProperty}*/ cambio_dolares = {
		type: 'MONEY', disabled: true, require: false, defaultValue: 0, min: 0, hiddenFilter: true, hiddenInTable: true, action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			//console.log(EditObject. Monto_dolares);
			//return ConvertToMoneyString(EditObject.cambio_dolares = EditObject. Monto_dolares - EditObject.paga_dolares);
		}
	};
	/**@type {ModelProperty}*/ cambio_cordobas = {
		type: 'MONEY', disabled: true, require: false, defaultValue: 0, min: 0, hiddenFilter: true, hiddenInTable: true, action: (/**@type {Tbl_Factura}*/ EditObject, /**@type {WForm} */ form) => {
			//return ConvertToMoneyString(EditObject.cambio_cordobas = EditObject.Monto_cordobas - (EditObject.Total * EditObject.Tasa_Cambio));
		}
	};
	/**@type {ModelProperty} */ Is_cambio_cordobas = { type: "checkbox", require: false, hiddenFilter: true, hiddenInTable: true, label: "dar cambio en córdobas", hidden: true };


	/**@type {ModelProperty}*/ Detalle_Factura = {
		type: 'MasterDetail',
		ModelObject: () => new Detalle_Factura_ModelComponent(),
		action: (/**@type {Tbl_Factura}*/ EditObject, /** @type {WForm} */ form) => {
			this.CalculeTotal(EditObject, form);
			this.Detalle_Factura.ModelObject.Lote.Dataset = undefined;			
		},
		Options: {
			Add: true,			
			Edit: true,
			Delete: true,
		}
	};
	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	TypeAction(EditObject, form) {
		WAlertMessage.Clear();
		switch (EditObject.Tipo) {
			case "APARTADO_MENSUAL":
				EditObject.Datos_Financiamiento = EditObject.Datos_Financiamiento ?? new Datos_Financiamiento();
				this.PrepareApartadoMensual(EditObject, form);
				this.cambio_cordobas.hidden = true;
				this.cambio_dolares.hidden = true;
				this.Is_cambio_cordobas.hidden = true;
				break;
			case "APARTADO_QUINCENAL":
				EditObject.Datos_Financiamiento = EditObject.Datos_Financiamiento ?? new Datos_Financiamiento();
				this.PrepareApartadoQuincenal(EditObject, form);

				this.cambio_cordobas.hidden = true;
				this.cambio_dolares.hidden = true;
				this.Is_cambio_cordobas.hidden = true;
				break;
			default:
				this.Datos_Financiamiento.hidden = true;
				EditObject.Datos_Financiamiento = null;

				this.cambio_cordobas.hidden = false;
				this.cambio_dolares.hidden = false;
				this.Is_cambio_cordobas.hidden = false;

				break;
		}
		//this.CalculeTotal(EditObject, form);
		form.SetOperationValues()
	}
	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	PrepareApartadoQuincenal(EditObject, form) {
		//const categorias = EditObject.Detalle_Factura.flatMap(detalle => detalle.Lote.Datos_Producto.Catalogo_Categoria);

		this.Datos_Financiamiento.hidden = false;
		//console.log(categorias);
		//const Configs = JSON.parse(sessionStorage.getItem("Configs") ?? "[]");
		const PlazoMaximo = this.GetNumeroCuotasQuincenales(EditObject.Total); //  (Configs.find(c => c.Nombre == "QUOTAS_QUINCENALES").Valor ?? 0.25);
		//document.body.append(new WAlertMessage({ Message: `Apartado quincenal: Cuotas ${PlazoMaximo} (pago actual y tres futuras)` }))
		WAlertMessage.Connect({ Message: `Apartado quincenal: Cuotas ${PlazoMaximo}` })
		this.Datos_Financiamiento.ModelObject.Plazo.max = PlazoMaximo;
		this.Datos_Financiamiento.ModelObject.Plazo.min = PlazoMaximo;
		EditObject.Datos_Financiamiento.Plazo = PlazoMaximo;
		//console.log(this.Datos_Financiamiento);

		const contrato = new ValoracionesTransaction();
		const interes = 0;
		/**@type {Catalogo_Cambio_Divisa} */
		const tasa = this.GetTasa();
		this.CreateContrato(contrato, EditObject, interes, tasa);
	}

	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	PrepareApartadoMensual(EditObject, form) {
		WAlertMessage.Clear();
		const categorias = EditObject.Detalle_Factura.flatMap(detalle => detalle.Lote.Datos_Producto.Catalogo_Categoria);

		this.Datos_Financiamiento.hidden = false;
		let PlazoMaximo = WArrayF.MinValue(categorias, "plazo_limite");
		//console.log(PlazoMaximo);
		WAlertMessage.Connect({ Message: `Apartado mensual: Cuotas ${PlazoMaximo}` })
		this.Datos_Financiamiento.ModelObject.Plazo.max = PlazoMaximo;
		this.Datos_Financiamiento.ModelObject.Plazo.action = (Datos_Financiamiento, Datos_FinanciamientoForm) => {
			this.CalculeTotal(EditObject, form);
		}

		//console.log(this.Datos_Financiamiento);
		const contrato = new ValoracionesTransaction();
		const interes = WArrayF.SumValAtt(JSON.parse(sessionStorage.getItem("Intereses") ?? "[]").filter(i => i.Nombre != "GASTOS_ADMINISTRATIVOS"), "Valor");

		/**@type {Catalogo_Cambio_Divisa} */
		const tasa = this.GetTasa();

		this.CreateContrato(contrato, EditObject, interes, tasa);
	}
	/**
	 * @param {ValoracionesTransaction} contrato
	 * @param {Tbl_Factura} EditObject
	 * @param {number} interes
	 * @param {Catalogo_Cambio_Divisa} tasa
	 */
	CreateContrato(contrato, EditObject, interes, tasa) {
		const totalDolares = (EditObject.Total ?? 0) - (EditObject.Monto_dolares ?? 0);
		const totalCordobas = ((EditObject.Total ?? 0) * EditObject.Tasa_Cambio) - (EditObject.Monto_cordobas ?? 0);
		contrato.valoraciones = EditObject.Detalle_Factura.map(detalle => detalle.Lote.Datos_Producto);
		contrato.Transaction_Contratos = new Transaction_Contratos({
			tasas_interes: interes / 100,
			fecha: new Date(),
			plazo: EditObject.Datos_Financiamiento?.Plazo ?? 1,
			taza_cambio: tasa.Valor_de_venta,
			taza_cambio_compra: tasa.Valor_de_compra,
			taza_interes_cargos: interes,
			Catalogo_Clientes: EditObject.Cliente,
			gestion_crediticia: 0,
			Valoracion_empeño_dolares: totalDolares,
			Valoracion_empeño_cordobas: totalCordobas,
			Detail_Prendas: EditObject.Detalle_Factura?.map(detalle => {
				const valoracion = detalle.Lote?.Datos_Producto;
				return new Detail_Prendas({
					Descripcion: valoracion?.Descripcion,
					modelo: valoracion?.Modelo,
					marca: valoracion?.Marca,
					serie: valoracion?.Serie,
					monto_aprobado_cordobas: valoracion?.Valoracion_empeño_cordobas,
					monto_aprobado_dolares: valoracion?.Valoracion_empeño_dolares,
					color: "-",
					en_manos_de: "ACREEDOR",
					precio_venta: valoracion?.Precio_venta_empeño_dolares,
					Catalogo_Categoria: valoracion?.Catalogo_Categoria,
					Transactional_Valoracion_ModelComponent: valoracion
				});
			})
		});
		FinancialModule.calculoAmortizacion(contrato, false);
		EditObject.Datos_Financiamiento.Plazo = EditObject.Datos_Financiamiento.Plazo ?? 1;
		EditObject.Datos_Financiamiento.Total_Financiado = contrato.Transaction_Contratos.Valoracion_empeño_dolares;
		EditObject.Datos_Financiamiento.Total_Financiado_Cordobas = contrato.Transaction_Contratos.Valoracion_empeño_cordobas;
		EditObject.Datos_Financiamiento.Cuota_Fija_Dolares = contrato.Transaction_Contratos.cuotafija_dolares;
		EditObject.Datos_Financiamiento.Cuota_Fija_Cordobas = contrato.Transaction_Contratos.cuotafija_dolares * tasa.Valor_de_venta;

	}

	/**
	* @returns {Catalogo_Cambio_Divisa}
	*/
	GetTasa() {
		return JSON.parse(sessionStorage.getItem("TasasCambio") ?? "{}");
	}

	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	CalculeCambioCordobas(EditObject, form) {
		EditObject.Monto_dolares = parseFloat((EditObject.Monto_cordobas / EditObject.Tasa_Cambio).toFixed(3));
		EditObject.cambio_dolares = parseFloat((EditObject.Monto_dolares - EditObject.Total).toFixed(3));
		EditObject.cambio_cordobas = parseFloat((EditObject.Monto_cordobas - (EditObject.Total * EditObject.Tasa_Cambio)).toFixed(3));
		if (EditObject.Moneda == "DOLARES") {
			EditObject.cambio_cordobas = parseFloat(((EditObject.Monto_dolares - EditObject.Total) * EditObject.Tasa_Cambio).toFixed(3));
		}
		EditObject.cambio_dolares = EditObject.cambio_dolares < 0 ? 0 : EditObject.cambio_dolares;
		EditObject.cambio_cordobas = EditObject.cambio_cordobas < 0 ? 0 : EditObject.cambio_cordobas;
	}

	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	CalculeCambioDolares(EditObject, form) {
		EditObject.Monto_cordobas = parseFloat((EditObject.Monto_dolares * EditObject.Tasa_Cambio).toFixed(3));
		//console.log(EditObject.Monto_cordobas);
		EditObject.cambio_dolares = parseFloat((EditObject.Monto_dolares - EditObject.Total).toFixed(3));
		EditObject.cambio_cordobas = parseFloat((EditObject.Monto_cordobas - EditObject.Total).toFixed(3));
		if (EditObject.Moneda == "DOLARES") {
			EditObject.cambio_cordobas = parseFloat(((EditObject.Monto_dolares - EditObject.Total) * EditObject.Tasa_Cambio_Venta).toFixed(3));
		}
		EditObject.cambio_dolares = EditObject.cambio_dolares < 0 ? 0 : EditObject.cambio_dolares;
		EditObject.cambio_cordobas = EditObject.cambio_cordobas < 0 ? 0 : EditObject.cambio_cordobas;
	}

	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	CalculeTotal(EditObject, form) {
		EditObject.Tasa_Cambio_Venta = this.GetTasa().Valor_de_venta;
		EditObject.Tasa_Cambio = this.GetTasa().Valor_de_compra;
		//console.log(EditObject.Detalle_Factura);
		EditObject.Detalle_Factura = EditObject.Detalle_Factura ?? [];

		if (!EditObject.Detalle_Factura || !Array.isArray(EditObject.Detalle_Factura)) {
			throw new Error("Detalle_Factura no está definido o no es un array.");
		}
		// Crear un mapa para agrupar detalles por id_lote
		/**@type {Array<Detalle_Factura>} */
		const lotesMap = [];

		for (const detalle of EditObject.Detalle_Factura) {
			if (form.ModelObject.Detalle_Factura.ModelObject.__proto__ == Function.prototype) {
				form.ModelObject.Detalle_Factura.ModelObject = form.ModelObject.Detalle_Factura.ModelObject();
			}
			form.ModelObject.Detalle_Factura.ModelObject.UpdateDetalle(EditObject, detalle, undefined, false);

			const loteFusionado = lotesMap.find(det => det.Lote.Id_Lote == detalle.Lote.Id_Lote)
			if (loteFusionado) {
				continue;
			}
			const detalles = EditObject.Detalle_Factura.filter(det => det.Lote.Id_Lote == detalle.Lote.Id_Lote);
			let cantidadTotal = WArrayF.SumValAtt(detalles, "Cantidad");
			if (cantidadTotal > detalle.Lote.Cantidad_Existente) {
				cantidadTotal = detalle.Lote.Cantidad_Existente;
				form.shadowRoot?.append(ModalMessage("El lote seleccionado, supera la cantidad existente"))
				//throw new Error("Cantidad insuficiente");
				//return false;
			}
			if (!loteFusionado) {
				const subtotal = detalle.Precio_Venta * cantidadTotal;
				const totalDescuento = subtotal * (detalle.Descuento / 100);
				const totalIva = (subtotal - totalDescuento) * 0;
				//console.log(detalle.Lote);

				lotesMap.push(new Detalle_Factura({
					Lote: detalle.Lote,
					Cantidad: cantidadTotal,
					Sub_Total: subtotal,
					Descuento: detalle.Descuento,
					Precio_Venta: detalle.Precio_Venta,
					Monto_Descuento: totalDescuento,
					Iva: totalIva,
					Total: subtotal - totalDescuento + totalIva,
					isRemovable: detalle.isRemovable,
					isEditable: detalle.isEditable
				}))
			}
		}
		EditObject.Detalle_Factura.length = 0;
		EditObject.Detalle_Factura.push(...lotesMap);
		// Calcular los totales actualizados
		const subtotal = WArrayF.SumValAtt(EditObject.Detalle_Factura, "Sub_Total");
		const descuento = WArrayF.SumValAtt(EditObject.Detalle_Factura, "Monto_Descuento");
		const iva = WArrayF.SumValAtt(EditObject.Detalle_Factura, "Iva");
		const total = WArrayF.SumValAtt(EditObject.Detalle_Factura, "Total");
		EditObject.Sub_Total = subtotal;
		EditObject.Descuento = descuento;
		EditObject.Iva = iva;
		EditObject.Total = total;
		this.UpdatePagoMinimo(EditObject, form)
		switch (EditObject.Tipo) {
			case "APARTADO_MENSUAL":
				this.PrepareApartadoMensual(EditObject, form);
				break;
			case "APARTADO_QUINCENAL":
				this.PrepareApartadoQuincenal(EditObject, form);
				break;
			default:

				break;
		}
		this.CalculeCambioDolares(EditObject, form);
		this.CalculeCambioCordobas(EditObject, form);
		// @ts-ignore el parent element siempre existe dado este contexto
		form.parentElement?.parentElement?.CalculeTotal(EditObject);

		//form?.DrawComponent();
	}

	/**
	 * @param {Tbl_Factura} EditObject
	 * @param {WForm} form
	 */
	UpdatePagoMinimo(EditObject, form) {
		if (EditObject.Detalle_Factura?.length == 0) {
			return;
			// Add your condition logic here
		}
		const Configs = JSON.parse(sessionStorage.getItem("Configs") ?? "[]");
		const Tasa_Cambio = EditObject.Detalle_Factura[0].Lote?.EtiquetaLote?.TasaCambio?.Valor_de_venta;
		const porcentajeMinimoMensual = (Configs.find(c => c.Nombre == "PORCENTAGE_MINIMO_DE_PAGO_APARTADO_MENSUAL").Valor ?? 35) / 100
		const porcentajeMinimoQuincenal = 1 / (this.GetNumeroCuotasQuincenales(EditObject.Total) + 1);
		let montoMinimoC = 0;
		let montoMinimo = 0;
		switch (EditObject.Tipo) {
			case "VENTA":
				this.Monto_cordobas.min = (EditObject.Total * Tasa_Cambio).toFixed(2);
				this.Monto_dolares.min = (EditObject.Total).toFixed(2);
				break;
			case "APARTADO_MENSUAL":
				montoMinimoC = ((EditObject.Total * Tasa_Cambio) * porcentajeMinimoMensual);
				montoMinimo = ((EditObject.Total) * porcentajeMinimoMensual);

				this.Monto_cordobas.min = montoMinimoC.toFixed(2);
				this.Monto_dolares.min = montoMinimo.toFixed(2);
				EditObject.Monto_dolares = EditObject.Monto_dolares < montoMinimo ? montoMinimo : EditObject.Monto_dolares;
				EditObject.Monto_cordobas = EditObject.Monto_cordobas < montoMinimoC ? montoMinimoC : EditObject.Monto_cordobas;
				break;
			case "APARTADO_QUINCENAL":
				montoMinimoC = ((EditObject.Total * Tasa_Cambio) * porcentajeMinimoQuincenal);
				montoMinimo = ((EditObject.Total) * porcentajeMinimoQuincenal);

				this.Monto_cordobas.min = montoMinimoC.toFixed(2);
				this.Monto_dolares.min = montoMinimo.toFixed(2);
				EditObject.Monto_dolares = EditObject.Monto_dolares < montoMinimo ? montoMinimo : EditObject.Monto_dolares;
				EditObject.Monto_cordobas = EditObject.Monto_cordobas < montoMinimoC ? montoMinimoC : EditObject.Monto_cordobas;
				break;
			default:
				break;
		}
	}
	/**
	* @param {number} value
	* @returns {number}
	*/
	GetNumeroCuotasQuincenales(value) {
		if (value >= 61) {
			return 3;
		} else if (value >= 31) {
			return 2;
		} else {
			return 1;
		}
	}


}
export { Tbl_Factura_ModelComponent }

export class Datos_Financiamiento_ModelComponent {
	//**@type {ModelProperty} */ Numero_Contrato = { type: 'number', hidden: true };
	/**@type {ModelProperty} */ Plazo = {
		type: 'number', defaultValue: 1, min: 1,
		pattern: '^[0-9]+$',
		action: (/**@type {Datos_Financiamiento}*/ EditObject, /**@type {WForm}*/ form) => {
			// @ts-ignore
			//form.Config.ParentModel?.DrawComponent();
		}
	};
	/**@type {ModelProperty} */ Total_Financiado = { type: 'Money', disabled: true };
	/**@type {ModelProperty} */ Total_Financiado_Cordobas = { type: 'Money', disabled: true };
	/**@type {ModelProperty} */ Cuota_Fija_Dolares = { type: 'Money', disabled: true };
	/**@type {ModelProperty} */ Cuota_Fija_Cordobas = { type: 'Money', disabled: true };
}
