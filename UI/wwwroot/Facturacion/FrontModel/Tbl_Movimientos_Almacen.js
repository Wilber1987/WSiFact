//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { EstadoEnum, TipoMovimientoEnum } from "../Enums/enums.js";
import { Cat_Almacenes } from "./Cat_Almacenes.js";
import { Tbl_Lotes } from "./Tbl_Lotes.js";
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { Catalogo_Sucursales_ModelComponent } from "./Catalogo_Sucursales.js";
import { Tbl_Lotes_ModelComponent } from "./ModelComponent/Tbl_Lotes_ModelComponent.js";
import { Cat_Almacenes_ModelComponent } from "./ModelComponent/Cat_Almacenes_ModelComponent.js";
import { WForm } from "../../WDevCore/WComponents/WForm.js";

class Tbl_Movimientos_Almacen extends EntityClass {

	constructor(props) {
		super(props, 'TransactionLotes');
		Object.assign(this, props);
	}

	/**@type {number}*/ Id_Movimiento;
	/**@type {number}*/ Id_Lote_Original;
	/**@type {number}*/ Id_Lote_Destino;
	/**@type {TipoMovimientoEnum}*/ Tipo_Movimiento;
	/**@type {number}*/ Cantidad;
	/**@type {Date}*/ Fecha;
	/**@type {string}*/ Observaciones;
	/**@type {number}*/ Id_User;
	/**@type {number}*/ Id_Transaction;
	/**@type {EstadoEnum}*/ Estado;

	/**@type {Tbl_Lotes}*/ Tbl_Lote_Original;
	/**@type {Tbl_Lotes}*/ Tbl_Lote_Destino;
	/**@type {Boolean}*/ IsActivo;


	async AnularMovimiento(Transaction) {
		return await this.SaveData("ApiTransactionLotes/AnularTbl_Movimientos_Almacen", Transaction)
	}
}
export { Tbl_Movimientos_Almacen };


class Tbl_Movimientos_Almacen_ModelComponent extends EntityClass {
	constructor(props) {
		super(props, 'TransactionLotes');
		for (const prop in props) this[prop] = props[prop];
	}

    /**@type {ModelProperty}*/ Id_Movimiento = { type: 'number', hiddenFilter: true, primary: true };
	/**@type {ModelProperty}*/ Observaciones = { type: 'textarea', hiddenFilter: true };
    /**@type {ModelProperty}*/ Tipo_Movimiento = { type: 'select', Dataset: Object.values(TipoMovimientoEnum) };

    /**@type {ModelProperty}*/ Fecha = { type: 'date', hidden: true };

    /**@type {ModelProperty}*/ Estado = { type: 'select', Dataset: Object.values(EstadoEnum), hiddenFilter: true, hidden: true };
	/**@type {ModelProperty}*/ Tbl_Lote_Original = {
		type: 'WSELECT',
		label: "Existencia a trasladar",
		require: false,
		ModelObject: () => new Tbl_Lotes_ModelComponent(), action: (/**@type {Tbl_Movimientos_Almacen} */ Movimiento, /**@type {WForm} */ form) => {
			this.Cantidad.max = Movimiento.Tbl_Lote_Original.Cantidad_Existente;
			Movimiento.Cantidad = Movimiento.Cantidad > this.Cantidad.max ? this.Cantidad.max : Movimiento.Cantidad;
			form.Controls.Cantidad.max = this.Cantidad.max;
		}
	};
	/**@type {ModelProperty}*/ Tbl_Lote_Destino = { type: 'WSELECT', ModelObject: () => new Tbl_Lotes_ModelComponent(), hidden: true };

    /**@type {ModelProperty}*/ Cat_Almacenes = { type: 'WSELECT', label: "Almacen de destino", ModelObject: () => new Cat_Almacenes_ModelComponent(), hiddenFilter: true };
	/**@type {ModelProperty}*/ Cantidad = { type: 'number', hiddenFilter: true, min: 1 };


}
export { Tbl_Movimientos_Almacen_ModelComponent };

