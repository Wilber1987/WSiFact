//@ts-check

// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";

export class TransactionReport extends EntityClass {
    /**
    * @param {Partial<TransactionReport>} [props] 
    */
    constructor(props) {
        super(props, "ApiDasboard")
        Object.assign(this, props);
    }
    /**@type {String?} */ Id_sucursal = null;
    /**@type {String?} */ Nombre = null;
    /**@type {String?} */ Moneda = null;
    /**@type {String?} */ Tipo_movimiento = null;
    /**@type {Number?} */ Debito = null;
    /**@type {Number?} */ Credito = null;
    /**@type {Number?} */ Debito_dolares = null;
    /**@type {Number?} */ Credito_dolares = null;

    /**
     *  @returns {Promise<Array<TransactionReport>>} 
     * */
    GetFacturasHoy = async () => await this.Post("ApiDasboard/GetFacturasHoy", this)

    /**
     *  @returns {Promise<Array<TransactionReport>>} 
     * */
    GetFacturasSemana = async () => await this.Post("ApiDasboard/GetFacturasSemana", this)
    /**
     *  @returns {Promise<Array<TransactionReport>>} 
     * */
    GetFacturasMes = async () => await this.Post("ApiDasboard/GetFacturasMes", this)
    /**
     *  @returns {Promise<Array<TransactionReport>>} 
     * */
    GetFacturasAnio = async () => await this.Post("ApiDasboard/GetFacturasAnio", this)
}

export class TransactionReport_ModelComponent extends EntityClass {
    /**
    * @param {Partial<TransactionReport_ModelComponent>} [props] 
    */
    constructor(props) {
        super()
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Id_sucursal = { type: "NUMBER", primary: true };
    /**@type {ModelProperty} */ Nombre = { type: "TEXT" };
    /**@type {ModelProperty} */ Moneda = { type: "TEXT" };
    /**@type {ModelProperty} */ Tipo_movimiento = { type: "TEXT" };
    /**@type {ModelProperty} */ Debito = { type: "MONEY" };
    /**@type {ModelProperty} */ Credito = { type: "MONEY" };
    /**@type {ModelProperty} */ Debito_dolares = { type: "MONEY" };
    /**@type {ModelProperty} */ Credito_dolares = { type: "MONEY" };
}