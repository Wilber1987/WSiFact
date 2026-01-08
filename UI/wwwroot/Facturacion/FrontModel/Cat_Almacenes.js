//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Tbl_Lotes } from './Tbl_Lotes.js';
class Cat_Almacenes extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {Number}*/ Id_Almacen;
   /**@type {String}*/ Descripcion;
   /**@type {String}*/ Estado;
   /**@type {Array<Tbl_Lotes>} OneToMany*/ Tbl_Lotes;
}
export { Cat_Almacenes };

