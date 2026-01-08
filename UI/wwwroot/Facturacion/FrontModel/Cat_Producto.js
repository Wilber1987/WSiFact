//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Marca } from './Cat_Marca.js'
import { Cat_Categorias } from './Cat_Categorias.js'
import { Detalle_Compra } from './Detalle_Compra.js'
import { Detalle_Factura } from './Detalle_Factura.js'
class Cat_Producto extends EntityClass {
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
   /**@type {Number}*/ Id_Producto;
   /**@type {String}*/ Descripcion;
   /**@type {Cat_Marca} ManyToOne*/ Cat_Marca;
   /**@type {Cat_Categorias} ManyToOne*/ Cat_Categorias;
   /**@type {Array<Detalle_Compra>} OneToMany*/ Detalle_Compra;
   /**@type {Array<Detalle_Factura>} OneToMany*/ Detalle_Factura;
}
export { Cat_Producto }
