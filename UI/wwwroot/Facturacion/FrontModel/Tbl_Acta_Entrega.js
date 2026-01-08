//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { EstadoEnum } from "../Enums/enums.js";

import { Catalogo_Sucursales_ModelComponent } from "../../FrontModel/DBODataBaseModel.js";
import { Detail_Prendas, Transaction_Contratos } from "../../FrontModel/Model.js";
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";

class Tbl_Acta_Entrega extends EntityClass {
	constructor(props) {
		super(props, 'TransactionLotes');
		Object.assign(this, props);
	}

	/**@type {number}*/ Id_Acta_Entrega;
	/**@type {Date}*/ Fecha;
	/**@type {string}*/ Observaciones;
	/**@type {number}*/ Numero_Contrato;
	/**@type {number}*/ Numero_Prenda;
	/**@type {number}*/ Id_Sucursal;
	/**@type {EstadoEnum}*/ Estado;
	/**@type {Boolean}*/ IsAnulable;

	/**@type {Transaction_Contratos}*/ Contrato;
	/**@type {Detail_Prendas}*/ Prenda;
	/**@type {Catalogo_Sucursales_ModelComponent}*/ Catalogo_Sucursales;
}
export { Tbl_Acta_Entrega };

class Tbl_Acta_Entrega_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'TransactionLotes');
        for (const prop in props) this[prop] = props[prop];
    }

    /**@type {ModelProperty}*/ Id_Acta_Entrega = { type: 'number', hiddenFilter: true };
    /**@type {ModelProperty}*/ Fecha = { type: 'date' };
    /**@type {ModelProperty}*/ Observaciones = { type: 'text' , hiddenFilter: true};
    /**@type {ModelProperty}*/ Numero_Contrato = { type: 'number' };
    /**@type {ModelProperty}*/ Numero_Prenda = { type: 'number' };
    /**@type {ModelProperty}*/ Id_Sucursal = { type: 'number', hiddenFilter: true };
    /**@type {ModelProperty}*/ Estado = { type: 'select', Dataset: Object.values(EstadoEnum) };

    /**@type {ModelProperty}*/ Catalogo_Sucursales = { type: 'WSELECT', ModelObject: () => new Catalogo_Sucursales_ModelComponent() };
}
export { Tbl_Acta_Entrega_ModelComponent };


