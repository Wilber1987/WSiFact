//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Proveedor } from './Cat_Proveedor.js'
import { Detalle_Compra } from './Detalle_Compra.js'
class Tbl_Configuracion_Factura extends EntityClass {
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
   /**@type {Number}*/ Id_Configuracion;   
   /**@type {Number}*/ Descripcion;
   /**@type {Boolean}*/ Auto_Debito;   
   /**@type {String}*/ Estado;   
}
export { Tbl_Configuracion_Factura }
