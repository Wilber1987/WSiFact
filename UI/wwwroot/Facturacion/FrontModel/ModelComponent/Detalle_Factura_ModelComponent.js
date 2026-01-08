//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Tbl_Factura_ModelComponent } from './Tbl_Factura_ModelComponent.js'
import { Cat_Producto_ModelComponent } from './Cat_Producto_ModelComponent.js'
import { Tbl_Lotes_ModelComponent } from "./Tbl_Lotes_ModelComponent.js";
import { Tbl_Lotes } from "../Tbl_Lotes.js";
import { WForm } from "../../../WDevCore/WComponents/WForm.js";
import { Detalle_Factura } from "../Detalle_Factura.js";
class Detalle_Factura_ModelComponent extends EntityClass {
	constructor(props) {
		super(props, 'EntityFacturacion');
		Object.assign(this, props);
	}
	/**@type {ModelProperty}*/ Id_DetalleFactura = { type: 'number', primary: true };
	/**@type {ModelProperty}*/ Lote = {
		require: false,
		type: 'WSELECT',
		IsGridDisplay: true,
		label: "Artículos",
		ModelObject: () => new Tbl_Lotes_ModelComponent(),
		EntityModel: new Tbl_Lotes(),
		action: (/**@type {Detalle_Factura} */ detail, /**@type {WForm} */ form) => {
			this.UpdateDetalle(form.Config.ParentEntity, detail);
		}
	};
	/**@type {ModelProperty}*/ Presentacion = {
		type: 'select',
		hiddenInTable: true,
		defaultValue: "UND",
		Dataset: ["UND"] // ["KILATE", "UND", "LBS", "KILO", "DOCENA"]
	};
	//**@type {ModelProperty}*/ Id_Lote = { type: 'number' };
	/**@type {ModelProperty}*/ Descuento = {
		type: 'number',
		min: 0,
		max: 50,
		Dataset: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
		defaultValue: 0,
		require: false,
		label: " % de Descuento",
		IsEditableInGrid: true,
		action: (/**@type {Detalle_Factura} */ detail, /**@type {WForm} */ form) => {
			this.CalculeTotal(detail, form);
		}
	};
	/**@type {ModelProperty}*/ Cantidad = {
		type: 'number', min: 1, IsEditableInGrid: true,
		action: (/**@type {Detalle_Factura} */ detail, /**@type {WForm} */ form) => {
			this.CalculeTotal(detail, form);
		}
	};
	/**@type {ModelProperty}*/ Precio_Venta = { type: 'money', disabled: true, label: "Pre/Cont. $" };
	/**@type {ModelProperty}*/ Monto_Descuento = { type: 'money', disabled: true, require: false };
	/**@type {ModelProperty}*/ Sub_Total = { type: 'money', disabled: true, hidden: true };
	/**@type {ModelProperty}*/ Iva = { type: 'money', disabled: true, hidden: true };
	/**@type {ModelProperty}*/ Total = { type: 'money', disabled: true };

	UpdateDetalle(ParentEntity, detail, form, updateProps = true) {
		//TODO AGREGAR  TASA DE CAMBIO
		switch (ParentEntity.Tipo) {
			case "VENTA":
				if (updateProps) {
					this.Precio_Venta.defaultValue = detail.Lote.EtiquetaLote.Precio_venta_Contado_dolares;
				}
				detail.Precio_Venta = detail.Lote.EtiquetaLote.Precio_venta_Contado_dolares;
				break;
			case "APARTADO_MENSUAL": case "APARTADO_QUINCENAL":
				detail.Descuento = 0;
				if (updateProps) {
					this.Precio_Venta.defaultValue = detail.Lote.EtiquetaLote.Precio_venta_Apartado_dolares;
				}
				detail.Precio_Venta = detail.Lote.EtiquetaLote.Precio_venta_Apartado_dolares;
				break;
			default:
				break;
		}
		if (updateProps) {
			this.Cantidad.max = detail.Lote.Cantidad_Existente;
		}

		detail.Cantidad = detail.Cantidad ?? 1;
		detail.Descuento = detail.Descuento ?? 0;
		this.CalculeTotal(detail, form);
	}

	/**
	 * @param {Detalle_Factura} detail
	 * @param {WForm} form
	 */
	CalculeTotal(detail, form) {
		const subtotal = detail.Cantidad * detail.Precio_Venta;
		/** asumiendo que el descuento es negativo */
		detail.Sub_Total = parseFloat((subtotal - subtotal * ((detail.Descuento ?? 0) / 100)).toFixed(2));
		detail.Monto_Descuento = parseFloat((subtotal * ((detail.Descuento ?? 0) / 100)).toFixed(2));
		detail.Iva = 0 //parseFloat((detail.Sub_Total * 0.15).toFixed(2));
		detail.Total = parseFloat((detail.Sub_Total + detail.Iva).toFixed(2));
		//form.DrawComponent();
		//console.log(detail);
	}
	//**@type {ModelProperty}*/ Tbl_Factura = { type: 'WSELECT',  ModelObject: ()=> new Tbl_Factura_ModelComponent()};
	//**@type {ModelProperty}*/ Cat_Producto = { type: 'WSELECT',  ModelObject: ()=> new Cat_Producto_ModelComponent()};
}
export { Detalle_Factura_ModelComponent }
