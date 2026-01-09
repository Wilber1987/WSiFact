//@ts-check
// @ts-ignore
import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../WDevCore/WModules/EntityClass.js";
import { DateTime } from "../WDevCore/WModules/Types/DateTime.js";
import { Catalogo_Cuentas } from "./DBODataBaseModel.js";


/**
 * Representa una transacción de movimiento general.
 */
export class Transaction_Movimiento {
  /**
   * @type {number} Identificador primario de la transacción
   */
  /**
   * @type {number} Identificador primario de la transacción
   */
  Id_movimiento;

  /**
   * @type {string} Descripción general de la transacción
   */
  Descripcion;

  /**
   * @type {string} Concepto asociado al movimiento
   */
  Concepto;

  /**
   * @type {number} ID del usuario que crea la transacción
   */
  Id_usuario_crea;

  /**
   * @type {Date} Fecha de la transacción
   */
  Fecha;

  /**
   * @type {string} Tipo de transacción (ej. ingreso, egreso)
   */
  Tipo;

  /**
   * @type {string} Moneda utilizada (ej. "C$", "$")
   */
  Moneda;

  /**
   * @type {number} Tasa de cambio en el momento de la transacción
   */
  Tasa_cambio;

  /**
   * @type {boolean} Indica si se ha enviado un correo
   */
  Correo_enviado;

  /**
   * @type {number} Tasa de cambio para la compra
   */
  Tasa_cambio_compra;

  /**
   * @type {boolean} Indica si es parte de una transacción agrupada
   */
  Is_transaction;

  /**
   * @type {number} ID de la sucursal donde se realizó la transacción
   */
  Id_sucursal;

  /**
   * @type {number} ID de la cuenta origen
   */
  Id_cuenta_origen;

  /**
   * @type {number} ID de la cuenta destino
   */
  Id_cuenta_destino;

  /**
   * @type {Detail_Movimiento[]} Lista de detalles asociados a esta transacción
   */
  Detail_Movimiento;

  /**
   * Constructor opcional para inicializar la clase con datos
   * @param {Partial<Transaction_Movimiento>} [props={}]
   */
  constructor(props = {}) {
    Object.assign(this, props);
  }
}


export const TipoMovimiento =
{
  COMPRA_DE_MONEDA: "COMPRA_DE_MONEDA",
  VENTA_DE_MONEDA: "VENTA_DE_MONEDA",
  REEMBOLSO_POR_CONTRATO_ANULADO: "REEMBOLSO_POR_CONTRATO_ANULADO",
  DESEMBOLSO_POR_CONTRATO: "DESEMBOLSO_POR_CONTRATO",
  INGRESO_POR_PAGO_DE_RECIBO: "INGRESO_POR_PAGO_DE_RECIBO",
  DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_RECIBO: "DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_RECIBO",
  DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_FACTURACION: "DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_FACTURACION",
  INGRESO_POR_PAGO_DE_FACTURACION: "INGRESO_POR_PAGO_DE_FACTURACION",
  PAGO: "PAGO",
  INGRESO: "INGRESO",
  EGRESO: "EGRESO",
  MOVIMIENTO_CUENTA: "MOVIMIENTO_CUENTA",
  DESEMBOLSO_POR_COMPRA: "DESEMBOLSO_POR_COMPRA",
  REEMBOLSO_POR_COMPRA_ANULADA: "REEMBOLSO_POR_COMPRA_ANULADA",
}

export class Movimientos_Cuentas extends EntityClass {
  constructor(props) {
    super(props);
    Object.assign(this, props);
  }

  /**@type {number}**/ Id_movimiento;
  /**@type {number}**/ Id_cuenta_origen;
  /**@type {number}**/ Id_cuenta_destino;
  /**@type {Catalogo_Cuentas}**/ Catalogo_Cuentas_Origen;
  /**@type {Catalogo_Cuentas}**/ Catalogo_Cuentas_Destino;
  //moneda = { type: 'select', Dataset: ["C$", "$"], hiddenInTable: false,hidden:true, disabled: true, require: false, };
  /**@type {string}**/ Moneda;
  /**@type {number}**/ Monto;
  /**@type {number}**/ Tasa_cambio;
  //tasa_cambio_compra = { type: "number", disabled: true , hiddenFilter: true};	
  /**@type {number}**/ Id_usuario_crea;
  /**@type {Date}**/ Fecha;
  /**@type {string}**/ Concepto;
  /**@type {string}**/ Descripcion;
}

export class Detail_Movimiento extends EntityClass {
  constructor(props) {
    super(props);
    Object.assign(this, props);
  }

  /**@type {number}**/ Id_movimiento;
  /**@type {DateTime}**/ Fecha;
  /**@type {number}**/ Debito;
  /**@type {number}**/ Credito;
  /**@type {number}**/ Debitodolares;
  /**@type {number}**/ Creditodolares;
  /**@type {number}**/ Monto_inicial;
  /**@type {number}**/ Monto_final;
  /**@type {number}**/ Monto_inicialdolares;
  /**@type {number}**/ Monto_finaldolares;
  /**@type {Transaction_Movimiento}**/ Transaction_Movimiento;
}

class Movimientos_Cuentas_ModelComponent extends EntityClass {
  constructor(props) {
    super(props, 'Cuentas');
    Object.assign(this, props);
  }
	/**@type {ModelProperty} */ Id_movimiento = { type: "number", primary: true }
	/**@type {ModelProperty} */ Id_cuenta_origen = { type: "number", hidden: true }
	/**@type {ModelProperty} */ Id_cuenta_destino = { type: "number", hidden: true }
	/**@type {ModelProperty} */ Catalogo_Cuentas_Origen = {
    type: 'WSELECT',
    ModelObject: () => new Catalogo_Cuentas(), ForeignKeyColumn: "Id_cuenta_origen"
  };
	/**@type {ModelProperty} */ Catalogo_Cuentas_Destino = {
    type: 'WSELECT',
    ModelObject: () => new Catalogo_Cuentas(), ForeignKeyColumn: "Id_cuenta_destino"
  };
	//moneda = { type: 'select', Dataset: ["C$", "$"], hiddenInTable: false,hidden:true, disabled: true, require: false, };
	/**@type {ModelProperty} */ Moneda = { type: "radio", Dataset: ["CORDOBAS", "DOLARES"] };
	/**@type {ModelProperty} */ Monto = { type: "money", hiddenFilter: true };
	/**@type {ModelProperty} */ Tasa_cambio = { type: "money", disabled: true, hiddenFilter: true, hidden: true };
	//tasa_cambio_compra = { type: "number", disabled: true , hiddenFilter: true};	
	/**@type {ModelProperty} */ Id_usuario_crea = { type: "number", hidden: true, hiddenFilter: true };
	/**@type {ModelProperty} */ Fecha = { type: "datetime", disabled: true, require: false };
  /**@type {ModelProperty} */ Tipo_Movimiento = { type: "Select", Dataset: Object.keys(TipoMovimiento) };
	/**@type {ModelProperty} */ Concepto = { type: "textarea" };
	/**@type {ModelProperty} */ Descripcion = { type: "textarea", require: false, hiddenFilter: true, hiddenInTable: true };
}
export { Movimientos_Cuentas_ModelComponent }


class Detail_Movimiento_ModelComponent extends EntityClass {

  /**
  * @param {Partial<Detail_Movimiento_ModelComponent>} props 
  */
  constructor(props) {
    super(props, 'Cuentas');
    Object.assign(this, props);;
  }
  Id_movimiento = { type: "number", primary: true };
  Fecha = { type: "date" };
  //moneda = { type: 'select', Dataset: ["C$", "$"], hiddenInTable: false,hidden:true, disabled: true, require: false, };
  Debito = { type: "money" };
  Credito = { type: "money" };
  Debito_dolares = { type: "money" };
  Credito_dolares = { type: "money" };
  Monto_inicial = { type: "money" };
  Monto_final = { type: "money" };
  Monto_inicial_dolares = { type: "money" };
  Monto_final_dolares = { type: "money" };
  Transaction_Movimiento = undefined;
}
export { Detail_Movimiento_ModelComponent }

