//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Producto }  from './Cat_Producto.js'
class Cat_Marca extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {Number}*/ Id_Marca;
   /**@type {String}*/ Nombre;
   /**@type {String}*/ Descripcion;
   /**@type {String}*/ Estado;
   /**@type {Array<Cat_Producto>} OneToMany*/ Cat_Producto;
}
export { Cat_Marca }
