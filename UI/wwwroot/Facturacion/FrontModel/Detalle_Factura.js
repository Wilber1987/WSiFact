//@ts-check
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Cat_Producto } from './Cat_Producto.js';
import { Tbl_Factura } from './Tbl_Factura.js';
import { Tbl_Lotes } from "./Tbl_Lotes.js";
class Detalle_Factura extends EntityClass {
    /**
    * @param {Partial<Detalle_Factura>} props 
    */
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
    /**@type {Number}*/ Id_DetalleFactura;
    /**@type {Number}*/ Cantidad;
    /**@type {Number}*/ Precio_Venta;
    /**@type {Number}*/ Iva;
    /**@type {Number}*/ Total;
    /**@type {Number}*/ Id_Lote;
    /**@type {Number}*/ Descuento;
    /**@type {Number}*/ Monto_Descuento;
    /**@type {Number}*/ Sub_Total;
    /**@type {Tbl_Lotes} ManyToOne*/ Lote;
    //**@type {Tbl_Factura} ManyToOne*/ Tbl_Factura;
    //**@type {Cat_Producto} ManyToOne*/ Cat_Producto;
}
export { Detalle_Factura };

