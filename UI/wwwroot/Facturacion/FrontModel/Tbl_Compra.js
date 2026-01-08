//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Proveedor } from './Cat_Proveedor.js'
import { Detalle_Compra } from './Detalle_Compra.js'
class Tbl_Compra extends EntityClass {
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
   /**@type {Number}*/ Id_Compra;
   /**@type {Datos_Compra}*/ Datos_Compra;
   /**@type {Date}*/ Fecha;
   /**@type {Number}*/ Tasa_Cambio;
   /**@type {String}*/ Moneda;
   /**@type {Number}*/ Sub_Total;
   /**@type {Number}*/ Iva;
   /**@type {Number}*/ Total;
   /**@type {String}*/ Estado;
   /**@type {String}*/ Observaciones;
   /**@type {Cat_Proveedor} ManyToOne*/ Cat_Proveedor;
   /**@type {Array<Detalle_Compra>} OneToMany*/ Detalle_Compra;
   /**@type {Boolean}*/ IsAnulable;
    Anular = async () => {
        return await this.SaveData("apiEntityFacturacion/anularCompra", this);
    }
}
export { Tbl_Compra }

export class Datos_Compra {
    RUC;
    Nombre_Comprador;
}
