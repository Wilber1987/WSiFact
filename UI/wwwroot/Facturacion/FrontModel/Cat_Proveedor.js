//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Tbl_Compra }  from './Tbl_Compra.js'
class Cat_Proveedor extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {Number}*/ Id_Proveedor;
   /**@type {String}*/ Nombre;
   /**@type {String}*/ Estado;
   /**@type {Object}*/ Datos_Proveedor;
   /**@type {String}*/ Identificacion;
   /**@type {Array<Tbl_Compra>} OneToMany*/ Tbl_Compra;
}
export { Cat_Proveedor }
