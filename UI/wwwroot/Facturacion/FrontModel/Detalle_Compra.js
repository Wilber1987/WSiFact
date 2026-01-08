//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Producto }  from './Cat_Producto.js'
import { Tbl_Compra }  from './Tbl_Compra.js'
import { Tbl_Lotes }  from './Tbl_Lotes.js'
class Detalle_Compra extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);;
       this.Aplica_Iva = undefined;
       this.Precio_Venta = undefined;
   }
   /**@type {Number}*/ Id_Detalle_Compra;
   /**@type {Number}*/ Cantidad;
   /**@type {Number}*/ Precio_Unitario;
   /**@type {Number}*/ SubTotal;
   /**@type {Number}*/ Iva;
   /**@type {Number}*/ Total;
   /**@type {String}*/ Presentacion;   
   /**@type {Object}*/  Datos_Producto_Lote;
   /**@type {Cat_Producto} ManyToOne*/ Cat_Producto;
   /**@type {Tbl_Compra} ManyToOne*/ Tbl_Compra;
   /**@type {Array<Tbl_Lotes>} OneToMany*/ Tbl_Lotes;
}
export { Detalle_Compra }
