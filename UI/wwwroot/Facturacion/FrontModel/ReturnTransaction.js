import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Tbl_Factura } from "./Tbl_Factura.js";

export class ReturnTransaction extends EntityClass {
    /** @param {Partial<ReturnTransaction>} [props] */
    constructor(props) {
        super(props, 'TransactionLotes');
        for (const prop in props) {
            if (prop in this) {
                this[prop] = props[prop];
            }
        }
    }
    /**@type {Tbl_Factura} */
    NuevaFactura;
    /**@type {Detalle_Factura} */
    ArticulosRemplazados;
    /**@type {Number} */
    MinAmount;
    /**@type {Number} */
    Numero_Contrato;
    /**@type {String} */
    Observaciones;
}