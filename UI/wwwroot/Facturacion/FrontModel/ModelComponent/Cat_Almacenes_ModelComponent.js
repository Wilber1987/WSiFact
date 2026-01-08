//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Tbl_Lotes_ModelComponent }  from './Tbl_Lotes_ModelComponent.js'
class Cat_Almacenes_ModelComponent extends EntityClass {
   constructor(props) {
       super(props, 'EntityFacturacion');
       Object.assign(this, props);
   }
   /**@type {ModelProperty}*/ Id_Almacen = { type: 'number', primary: true };
   /**@type {ModelProperty}*/ Descripcion = { type: 'text' };
   /**@type {ModelProperty}*/ Estado = { type: 'text' };
   /**@type {ModelProperty}*/ Tbl_Lotes = { type: 'MasterDetail',  ModelObject: ()=> new Tbl_Lotes_ModelComponent()};
}
export { Cat_Almacenes_ModelComponent }
