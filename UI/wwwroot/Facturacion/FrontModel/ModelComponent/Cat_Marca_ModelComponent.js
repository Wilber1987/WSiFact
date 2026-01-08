//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Cat_Producto_ModelComponent }  from './Cat_Producto_ModelComponent.js'
class Cat_Marca_ModelComponent extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {ModelProperty}*/ Id_Marca = { type: 'number', primary: true };
   /**@type {ModelProperty}*/ Nombre = { type: 'text' };
   /**@type {ModelProperty}*/ Descripcion = { type: 'text' };
   /**@type {ModelProperty}*/ Estado = { type: 'text' };
   /**@type {ModelProperty}*/ Cat_Producto = { type: 'MasterDetail',  ModelObject: ()=> new Cat_Producto_ModelComponent()};
}
export { Cat_Marca_ModelComponent }
