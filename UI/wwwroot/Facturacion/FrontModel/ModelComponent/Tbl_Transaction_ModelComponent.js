import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";


class Tbl_Transaccion_ModelComponent extends EntityClass {
  constructor(props) {
    super(props, 'EntityFacturacion');
    for (const prop in props) {
      this[prop] = props[prop];
    }
  }
  /** @type {ModelProperty} */ Id_Transaccion = { type: 'number', primary: true, hiddenFilter: true };
  /** @type {ModelProperty} */ Cantidad = { type: 'number' };
  /** @type {ModelProperty} */ Id_Lote = { type: 'number', hidden: true };;
  /** @type {ModelProperty} */ Tipo = { type: 'text' , hidden: true};;
  /** @type {ModelProperty} */ Descripcion = { type: 'textarea' };;
}
export { Tbl_Transaccion_ModelComponent }