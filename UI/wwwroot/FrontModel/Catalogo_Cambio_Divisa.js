//@ts-check
import { EntityClass } from "../WDevCore/WModules/EntityClass.js";

class Catalogo_Cambio_Divisa extends EntityClass {   
    /**
    * @param {Partial<Catalogo_Cambio_Divisa>} [props] 
    */
    constructor(props) {
        super(props, 'EntityDbo');
        Object.assign(this, props);
    }
    /**@type {Number?}*/ Id_cambio = null;
    /**@type {Date?}*/ Fecha = null;
    /**@type {Number?}*/ Valor_de_compra = null;
    /**@type {Number?}*/ Valor_de_venta = null;
}
export { Catalogo_Cambio_Divisa }
