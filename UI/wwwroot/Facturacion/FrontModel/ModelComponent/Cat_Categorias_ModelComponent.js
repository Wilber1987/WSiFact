//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
class Cat_Categorias_ModelComponent extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {ModelProperty}*/ Id_Categoria = { type: 'number', primary: true };
   /**@type {ModelProperty}*/ Descripcion = { type: 'text' };
   /**@type {ModelProperty}*/ Estado = { type: 'text' };
   ///**@type {ModelProperty}*/ Cat_Producto = { type: 'MasterDetail',  ModelObject: ()=> new Cat_Producto_ModelComponent()};
}
export { Cat_Categorias_ModelComponent }
