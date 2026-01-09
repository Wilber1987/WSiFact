//@ts-check
import { EntityClass } from "../WDevCore/WModules/EntityClass.js";

class Tbl_Cuotas extends EntityClass {
	/**
	 * 
	 * @param {Tbl_Cuotas} [props] 
	 */
	constructor(props) {
		super();
		Object.assign(this, props);
	}
	/**Datos de la Tbl_cuotas*/
	/**@type {Date} */
	Fecha;
	/**@type {Number} Tbl_cuotas del abono total a pagar dolares*/
	Id_cuota;
	/**@type {Number} Tbl_cuotas del abono total a pagar dolares*/
	Total;
	/**@type {Number} valor del interes del capital*/
	Interes;
	/**@type {Number} */
	Abono_capital;
	/**@type {Number} capital restante*/
	Capital_restante;
	/**@type {Number} mora*/
	Mora;
	/**DATOS DE LA FATURA */
	/**@type {Date} */
	Fecha_pago;
	/**@type {Number} Tbl_cuotas del abono*/
	Pago_contado;
	/**@type {Number} Tbl_cuotas del abono*/
	Descuento;
	/**@type {Number} Tbl_cuotas del abono*/
	Tasa_cambio;
	/**@type {String} Tbl_cuotas del abono*/
	Estado;

}
export { Tbl_Cuotas }

class Transaction_Contratos extends EntityClass {
	/**
	* @param {Partial<Transaction_Contratos>} [props] 
	*/
	constructor(props) {
		super(props, 'EntityDBO');
		Object.assign(this, props);
		this.Tbl_Cuotas = this.Tbl_Cuotas?.map(c => new Tbl_Cuotas(c));
	}
	/**@type {Number} */Numero_contrato;
	/**@type {Date} */Fecha_contrato;
	/**@type {Date} */Fecha_cancelar;
	/**@type {Number} */ Monto;
	/**@type {Number} */ Interes;
	/**@type {Number} */ Interes_dolares;
	/**@type {Number} */ Mora;
	/**@type {Boolean}*/ IsAnulable;
	Estado;
	Fecha_vencimiento;
	/**@type {Number} */ Saldo;
	Dias_mora;
	/**@type {Number} */ Saldo_mora;
	Fecha_baja;
	/**@type {Number} */ Abonos;
	Ultima_visita;
	Tipo;
	Entregado;
	/**@type {Number} */ Interes_actual;
	Observaciones;
	/**@type {Number} */ Iva;
	/**@type {Number} */ Margen;
	/**@type {Number} */ Descuento;
	/**@type {Number} */ Util;
	/**@type {Number} */ Tasa_interes_cargos;
	Tasa_mora;
	Fecha_mora;
	Fecha_interes;
	Tasa_gestion_crediticia;
	Id_User_OLD;
	/**@type {Number} */ Tasa_cambio;
	Tasa_cambio_compra;
	Dkm;
	Gasolinamonto;
	Valorcad;
	Montocuotaatrazadas;
	Mes_pagado;
	Tasa_hoy;
	Numero_protocolo;
	Valor_dolar;
	Parciales;
	Mora_parcial;
	Interes_parcial;
	Motivo_anulacion;
	Idcatemp;
	Cuota_fija_inicial;
	Fecha_cancelar_inicial;
	Plazo_inicial;
	Dias_para_baja;
	Codigo_cliente;
	/**@type {Catalogo_Clientes} */ Catalogo_Clientes;
	/**@type {Array<Tbl_Cuotas>} */ Tbl_Cuotas;
	/**@type {Array<Transaction_Facturas>} */ Transaction_Facturas;
	/**@type {Array<Detail_Prendas>} */ Detail_Prendas;
	//nuevas
	/**@type {Number} */ Valoracion_compra_cordobas;
	/**@type {Number} */ Valoracion_compra_dolares;
	/**@type {Number} */ Valoracion_empeño_cordobas;
	/**@type {Number} */ Valoracion_empeño_dolares;
	/**@type {Number} */ Taza_interes_cargos;

	/**@type {Number} */ Cuotafija;
	/**@type {Number} */ Cuotafija_dolares;
	/**@type {Number} */ Gestion_crediticia;
	/**@type {Number} */ Tasas_interes;
	/**@type {Number} */ Plazo;
	/**@type {Date} */ Fecha;
	/**@type {Number} */ Total_pagar_cordobas;
	/**@type {Number} */ Total_pagar_dolares;
	/**@type {Number} */ Reestructurado;
	/**@type {Array<Transaccion_Factura>} */ Recibos;
	Anular = async () => {
		return await this.SaveData("Transactional_Contrato/AnularContract", this)
	}

}

export { Transaction_Contratos }
class Detail_Prendas extends EntityClass {
	/**
	 * 
	 * @param {Object} props 
	 */
	constructor(props) {
		super(props, 'EntityDBO');
		for (const prop in props) {
			this[prop] = props[prop];
			//console.log(this[prop], props[prop]);
		}
	}
	/**@type {Number} */ Numero_prenda;
	/**@type {Number} */ Numero_contrato_OLD;
	/**@type {String} */ Descripcion;
	/**@type {Number} */ Monto_aprobado_cordobas;
	/**@type {Number} */ Monto_aprobado_dolares;
	/**@type {String} */ Tipo;
	/**@type {String} */ Marca;
	/**@type {String} */ Serie;
	/**@type {String} */ Modelo;
	/**@type {Number} */ Iva;
	/**@type {Number} */ Margen;
	/**@type {Number} */ Estado;
	/**@type {Number} */ Interesl;
	/**@type {Number} */ Moral;
	/**@type {Number} */ Fliquidacion;
	/**@type {Number} */ Precio_venta;
	/**@type {String} */ En_manos_de;
	/**@type {String} */ Color;
	/**@type {Number} */ Detail_Prendas_Vehiculos;
	/**@type {Catalogo_Categoria} */ Catalogo_Categoria;
	/**@type {Transactional_Valoracion_ModelComponent} */ Transactional_Valoracion_ModelComponent;
}
export { Detail_Prendas }

class Catalogo_Categoria extends EntityClass {
	constructor(props) {
		super(props, 'EntityDbo');
		Object.assign(this, props);
	}
	/**@type {Number}*/ Id_categoria;
	/**@type {String}*/ Tipo;
	/**@type {String}*/ Descripcion;
	/**@type {Number}*/ Plazo_limite;
	/**@type {Number}*/ Prioridad;
	/**@type {Boolean}*/ IsEditable;
	/**@type {Array<Detail_Prendas>} OneToMany*/ Detail_Prendas;
	/**@type {Array<Transactional_Valoracion_ModelComponent>} OneToMany*/ Transactional_Valoracion_ModelComponent;
}
export { Catalogo_Categoria }

class Detail_Prendas_Vehiculos extends EntityClass {
	constructor(props) {
		super(props, 'EntityDBO');
		Object.assign(this, props);
	}
	Capacidad_cilindros;
	Cantidad_cilindros;
	Cantidad_pasajeros;
	Year_vehiculo;
	Montor;
	Chasis;
	Placa;
	Circuacion;
	Defectuoso;
	Fecha_aut_descuento;
	Defecto;
	Porcentage_descuento_maximo;
	Fecha_seguro;
	Combustible;
	Detail_Prendas;
}
export { Detail_Prendas_Vehiculos }
