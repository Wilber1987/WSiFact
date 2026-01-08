import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";

class Tbl_Transaccion extends EntityClass {
  constructor(props) {
    super(props, 'EntityFacturacion');
    Object.assign(this, props);
  }
  /** @type {Number} */ Id_Transaccion;
  /** @type {Number} */ Cantidad;
  /** @type {Number} */ Id_Lote;
  /** @type {String} */ Tipo;
  /** @type {String} */ Descripcion;
}
export { Tbl_Transaccion }