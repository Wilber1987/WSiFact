//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Cat_Marca_ModelComponent }  from './Cat_Marca_ModelComponent.js'
import { Cat_Categorias_ModelComponent }  from './Cat_Categorias_ModelComponent.js'
class Cat_Producto_ModelComponent extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {ModelProperty}*/ Id_Producto = { type: 'number', primary: true };
   /**@type {ModelProperty}*/ Descripcion = { type: 'text' };
   /**@type {ModelProperty}*/ Cat_Marca = { type: 'WSELECT',  ModelObject: ()=> new Cat_Marca_ModelComponent()};
   /**@type {ModelProperty}*/ Cat_Categorias = { type: 'WSELECT',  ModelObject: ()=> new Cat_Categorias_ModelComponent()};
   ///**@type {ModelProperty}*/ Detalle_Compra = { type: 'MasterDetail',  ModelObject: ()=> new Detalle_Compra_ModelComponent()};
   ///**@type {ModelProperty}*/ Detalle_Factura = { type: 'MasterDetail',  ModelObject: ()=> new Detalle_Factura_ModelComponent()};
}
export { Cat_Producto_ModelComponent }
