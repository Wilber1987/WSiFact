import { EntityClass } from "../WDevCore/WModules/EntityClass.js";
class Recibos extends EntityClass {
    constructor(props) {
        super(props, 'Recibos');
        this.Monto_dolares = undefined;
        this.Monto_cordobas = undefined;
        this.Cambio_dolares = undefined;
        this.Cambio_cordobas = undefined;
        this.Is_cambio_cordobas = undefined;
        this.Pago_parcial = undefined;
        this.Reestructurar = undefined;
        this.Solo_interes_mora = undefined;
        this.Perdida_de_documento_monto = undefined;
        this.Fecha_original = undefined;
        Object.assign(this, props);
    }
    /**@type {Number}*/ Id_recibo;
    /**@type {Number}*/ Consecutivo;
    /**@type {Boolean}*/ Temporal;
    /**@type {Number}*/ Numero_contrato;
    /**@type {String}*/ Moneda;
    /**@type {Number}*/ Monto;
    /**@type {Number}*/ Saldo_actual_cordobas;
    /**@type {Number}*/ Saldo_actual_dolares;
    /**@type {Number}*/ Plazo;
    /**@type {Number}*/ Interes_cargos;
    /**@type {Number}*/ Tasa_cambio;
    /**@type {Number}*/ Tasa_cambio_compra;
    /**@type {Number}*/ Interes_demas_cargos_pagar_cordobas;
    /**@type {Number}*/ Interes_demas_cargos_pagar_dolares;
    /**@type {Number}*/ Abono_capital_cordobas;
    /**@type {Number}*/ Abono_capital_dolares;
    /**@type {Number}*/ Cuota_pagar_cordobas;
    /**@type {Number}*/ Cuota_pagar_dolares;
    /**@type {Number}*/ Mora_cordobas;
    /**@type {Number}*/ Mora_dolares;
    /**@type {Number}*/ Mora_interes_cordobas;
    /**@type {Number}*/ Mora_interes_dolares;
    /**@type {Number}*/ Total_cordobas;
    /**@type {Number}*/ Total_dolares;
    /**@type {Number}*/ Total_parciales;
    /**@type {Date}*/ Fecha_roc;
    /**@type {Number}*/ Paga_cordobas;
    /**@type {Number}*/ Paga_dolares;
    /**@type {Boolean}*/ Solo_abono;
    /**@type {Boolean}*/ Cancelar;
    Reestructurar_value;
    Reestructurar_monto;
    Perdida_de_documento;
    Total_apagar_cordobas;
    Total_apagar_dolares;
}
export { Recibos }