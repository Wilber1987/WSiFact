//@ts-check

// @ts-ignore
import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";
import { DateTime } from "../WDevCore/WModules/Types/DateTime.js";
import { ConvertToMoneyString } from "../WDevCore/WModules/WComponentsTools.js";
import { Detail_Movimiento } from "./MovimientosCuentas.js";

export class Movimiento {
   
    /**
    * @param {Detail_Movimiento} movimiento 
    */
    constructor(movimiento, type = "cordobas") {
        this.montos = movimiento;
        this.Transaction_Movimiento = movimiento.Transaction_Movimiento || {};
        this.fecha = new DateTime(movimiento.fecha);       
        // Determina las propiedades según el tipo
        const tipo = type.toLowerCase();
        this.debitoProp = tipo === "dolares" ? "debito_dolares" : "debito";
        this.creaditoProp = tipo === "dolares" ? "credito_dolares" : "credito";
        this.montoProp = tipo === "dolares" ? "monto_final_dolares" : "monto_final";
        this.currency = tipo === "dolares" ? "$" : "C$";
    }

    get concepto() {
        return this.Transaction_Movimiento?.concepto || "";
    }

    get fechaFormateada() {
        return this.fecha ? this.toDateFormatEs(this.fecha) : "";
    }
    get month() {
        return this.fecha?.getMonthFormatEs();
    }
    get day() {
        return this.fecha?.getDayFormatWithDateEs();
    }
    get debito() {
        const value = this.montos[this.debitoProp];
        return value ? value : 0;
    }

    get credito() {
        const value = this.montos[this.creaditoProp];
        return value ? value : 0;
    }

    get saldo() {
        const value = this.montos[this.montoProp];
        return value ?? 0;
    }

    toDateFormatEs(date) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

}

export class Movimiento_ModelComponent {
    constructor(props) {
        // Cargar propiedades dinámicamente si se proporcionan
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */  id_movimiento = { type: "number", primary: true };
    /**@type {ModelProperty} */  concepto = { type: "text" };
    /**@type {ModelProperty} */  fecha = { type: "datetime" };
    /**@type {ModelProperty} */  debito = { type: "money" };
    /**@type {ModelProperty} */  credito = { type: "money" };
    /**@type {ModelProperty} */  saldo = { type: "money" };
}
