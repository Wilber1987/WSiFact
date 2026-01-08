//@ts-check
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Almacenes } from "./Cat_Almacenes.js";
import { Cat_Almacenes_ModelComponent } from "./ModelComponent/Cat_Almacenes_ModelComponent.js";
import { Tbl_Lotes_ModelComponent } from "./ModelComponent/Tbl_Lotes_ModelComponent.js";
import { Tbl_Lotes } from "./Tbl_Lotes.js";
import { EstadoEnum, MotivosBajasEnum } from "../Enums/enums.js";




class Tbl_Bajas_Almacen extends EntityClass {
	constructor(props) {
		super(props, 'TransactionLotes');
		Object.assign(this, props);;
	}

	/**@type {number}*/ Id_Baja;
	/**@type {number}*/ Id_Lote;
	/**@type {MotivosBajasEnum}*/ Motivo_Baja;
	/**@type {number}*/ Cantidad;
	/**@type {Date}*/ Fecha;
	/**@type {string}*/ Observaciones;
	/**@type {number}*/ Id_User;
	/**@type {number}*/ Id_Transaccion;
	/**@type {EstadoEnum}*/ Estado;
	/**@type {Boolean}*/ IsActivo;

	/**@type {Tbl_Lotes}*/ Tbl_Lotes;
}
export { Tbl_Bajas_Almacen };

class Tbl_Bajas_Almacen_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'TransactionLotes');
        for (const prop in props) this[prop] = props[prop];
    }

    /**@type {ModelProperty}*/ Id_Baja = { type: 'number', hiddenFilter: true };
    /**@type {ModelProperty}*/ Motivo_Baja = { type: 'select', Dataset: Object.values(MotivosBajasEnum) };
    /**@type {ModelProperty}*/ Cantidad = { type: 'number', hiddenFilter: true };
    /**@type {ModelProperty}*/ Fecha = { type: 'date' };
    /**@type {ModelProperty}*/ Observaciones = { type: 'text', hiddenFilter: true };
    /**@type {ModelProperty}*/ Estado = { type: 'select', Dataset: Object.values(EstadoEnum), hiddenFilter: true };

    /**@type {ModelProperty}*/ Tbl_Lotes = { type: 'WSELECT', ModelObject: () => new Tbl_Lotes_ModelComponent() };
}
export { Tbl_Bajas_Almacen_ModelComponent };
