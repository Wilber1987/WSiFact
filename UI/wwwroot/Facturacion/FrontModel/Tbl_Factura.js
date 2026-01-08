//@ts-check
import { Catalogo_Clientes } from "../../FrontModel/DBODataBaseModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { Detalle_Factura } from './Detalle_Factura.js';
class Tbl_Factura extends EntityClass {
    /**
     * @param {Partial<Tbl_Factura> } [props]
     */
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
    /**@type {Number?}*/ Id_Factura;
    /**@type {String}*/ Tipo;
    /**@type {String}*/ Concepto;
    /**@type {String}*/ Codigo_venta;
    /**@type {String}*/ Serie;
    /**@type {String}*/ Forma_Pago;
    /**@type {String}*/ Direccion_Envio;
    /**@type {Number}*/ Id_Cliente;
    /**@type {Number}*/ Id_Sucursal;
    /**@type {Date}*/ Fecha;
    /**@type {Date}*/ Fecha_Vencimiento;
    /**@type {String}*/ Observaciones;
    /**@type {Number}*/ Id_Usuario;
    /**@type {String}*/ Estado;
    /**@type {Number}*/ Sub_Total;
    /**@type {Number}*/ Iva;
    /**@type {Number}*/ Descuento;
    /**@type {Number}*/ Tasa_Cambio;
    /**@type {Number}*/ Tasa_Cambio_Venta;
    /**@type {Number}*/ Total;
    /**@type {Array<Detalle_Factura>} OneToMany*/ Detalle_Factura;
    /**@type {DatosFactura}*/ Datos;
    /**@type {Catalogo_Clientes}*/ Cliente;

    /**@type {Boolean}*/ Is_cambio_cordobas;
    /**@type {String}*/ Moneda;
    /**@type {Number}*/ Monto_dolares;
    /**@type {Number}*/ cambio_cordobas;
    /**@type {Number}*/ cambio_dolares;
    /**@type {Number}*/ Monto_cordobas;
    /**@type {String}*/ Motivo_anulacion;
    /**@type {Datos_Financiamiento?} */ Datos_Financiamiento;
    /**@type {Boolean}*/ IsAnulable;

    GetValoracionContrato = async () => {
        return await this.SaveData("Transactional_Contrato/GetDataContract", this)
    }
    async GetFacturaContrato() {
        return await this.SaveData("ApiEntityFacturacion/FindFacturaContrato", this)
    }
    async Anular() {
        return await this.SaveData("ApiEntityFacturacion/AnularFactura", this)
    }
}
export { Tbl_Factura };
export class DatosFactura {
    constructor(props) {
        Object.assign(this, props);
    }
    /**@type {String}*/ Nombre_Vendedor;
    /**@type {String}*/ Nombre_Cliente
    /**@type {String}*/ Direccion_Cliente
    /**@type {String}*/ Telefono_Cliente
}
export class Datos_Financiamiento {
	/**@type {Number} */ Numero_Contrato;
	/**@type {Number} */ Total_Financiado;
    /**@type {Number} */ Total_Financiado_Cordobas;
	/**@type {Number} */ Plazo;
	/**@type {Number} */ Interes;
	/**@type {Number} */ Pago_Cuota;
    /**@type {Number} */Cuota_Fija_Dolares;
    /**@type {Number} */Cuota_Fija_Cordobas;
}