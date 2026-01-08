//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
class Lotes extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {Number}*/ Id_Transaccion;
   /**@type {String}*/ Name;
   /**@type {String}*/ Descripcion;
   /**@type {Date}*/ Fecha;
   /**@type {Number}*/ Id_Usuario;
   /**@type {Number}*/ Id_Tipo_transaccion;
   /**@type {String}*/ Estado;
}
export { Lotes };

