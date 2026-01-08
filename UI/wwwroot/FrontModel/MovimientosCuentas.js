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
  id_movimiento;

  /**
   * @type {string} Descripción general de la transacción
   */
  descripcion;

  /**
   * @type {string} Concepto asociado al movimiento
   */
  concepto;

  /**
   * @type {number} ID del usuario que crea la transacción
   */
  id_usuario_crea;

  /**
   * @type {Date} Fecha de la transacción
   */
  fecha;

  /**
   * @type {string} Tipo de transacción (ej. ingreso, egreso)
   */
  tipo;

  /**
   * @type {string} Moneda utilizada (ej. "C$", "$")
   */
  moneda;

  /**
   * @type {number} Tasa de cambio en el momento de la transacción
   */
  tasa_cambio;

  /**
   * @type {boolean} Indica si se ha enviado un correo
   */
  correo_enviado;

  /**
   * @type {number} Tasa de cambio para la compra
   */
  tasa_cambio_compra;

  /**
   * @type {boolean} Indica si es parte de una transacción agrupada
   */
  is_transaction;

  /**
   * @type {number} ID de la sucursal donde se realizó la transacción
   */
  id_sucursal;

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

  /**@type {number}**/ id_movimiento;
  /**@type {number}**/ Id_cuenta_origen;
  /**@type {number}**/ Id_cuenta_destino;
  /**@type {Catalogo_Cuentas}**/ Catalogo_Cuentas_Origen;
  /**@type {Catalogo_Cuentas}**/ Catalogo_Cuentas_Destino;
  //moneda = { type: 'select', Dataset: ["C$", "$"], hiddenInTable: false,hidden:true, disabled: true, require: false, };
  /**@type {string}**/ moneda;
  /**@type {number}**/ monto;
  /**@type {number}**/ tasa_cambio;
  //tasa_cambio_compra = { type: "number", disabled: true , hiddenFilter: true};	
  /**@type {number}**/ id_usuario_crea;
  /**@type {Date}**/ fecha;
  /**@type {string}**/ concepto;
  /**@type {string}**/ descripcion;
}

export class Detail_Movimiento extends EntityClass {
  constructor(props) {
    super(props);
    Object.assign(this, props);
  }

  /**@type {number}**/ id_movimiento;
  /**@type {DateTime}**/ fecha;
  /**@type {number}**/ debito;
  /**@type {number}**/ credito;
  /**@type {number}**/ debitodolares;
  /**@type {number}**/ creditodolares;
  /**@type {number}**/ monto_inicial;
  /**@type {number}**/ monto_final;
  /**@type {number}**/ monto_inicialdolares;
  /**@type {number}**/ monto_finaldolares;
  /**@type {Transaction_Movimiento}**/ Transaction_Movimiento;
}

class Movimientos_Cuentas_ModelComponent extends EntityClass {
  constructor(props) {
    super(props, 'Cuentas');
    Object.assign(this, props);
  }
	/**@type {ModelProperty} */ id_movimiento = { type: "number", primary: true }
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
	/**@type {ModelProperty} */ moneda = { type: "radio", Dataset: ["CORDOBAS", "DOLARES"] };
	/**@type {ModelProperty} */ monto = { type: "money", hiddenFilter: true };
	/**@type {ModelProperty} */ tasa_cambio = { type: "money", disabled: true, hiddenFilter: true, hidden: true };
	//tasa_cambio_compra = { type: "number", disabled: true , hiddenFilter: true};	
	/**@type {ModelProperty} */ id_usuario_crea = { type: "number", hidden: true, hiddenFilter: true };
	/**@type {ModelProperty} */ fecha = { type: "datetime", disabled: true, require: false };  
  /**@type {ModelProperty} */ Tipo_Movimiento = { type: "Select", Dataset: Object.keys(TipoMovimiento) };
	/**@type {ModelProperty} */ concepto = { type: "textarea" };
	/**@type {ModelProperty} */ descripcion = { type: "textarea", require: false, hiddenFilter: true, hiddenInTable: true };
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
  id_movimiento = { type: "number", primary: true };
  fecha = { type: "date" };
  //moneda = { type: 'select', Dataset: ["C$", "$"], hiddenInTable: false,hidden:true, disabled: true, require: false, };
  debito = { type: "money" };
  credito = { type: "money" };
  debito_dolares = { type: "money" };
  credito_dolares = { type: "money" };
  monto_inicial = { type: "money" };
  monto_final = { type: "money" };
  monto_inicial_dolares = { type: "money" };
  monto_final_dolares = { type: "money" };
  Transaction_Movimiento = undefined;
}
export { Detail_Movimiento_ModelComponent }

