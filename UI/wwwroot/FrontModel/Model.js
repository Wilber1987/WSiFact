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
	fecha;
	/**@type {Number} Tbl_cuotas del abono total a pagar dolares*/
	id_cuota;
	/**@type {Number} Tbl_cuotas del abono total a pagar dolares*/
	total;
	/**@type {Number} valor del interes del capital*/
	interes;
	/**@type {Number} */
	abono_capital;
	/**@type {Number} capital restante*/
	capital_restante;
	/**@type {Number} mora*/
	mora;
	/**DATOS DE LA FATURA */
	/**@type {Date} */
	fecha_pago;
	/**@type {Number} Tbl_cuotas del abono*/
	pago_contado;
	/**@type {Number} Tbl_cuotas del abono*/
	descuento;
	/**@type {Number} Tbl_cuotas del abono*/
	tasa_cambio;
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
	/**@type {Number} */numero_contrato;
	/**@type {Date} */fecha_contrato;
	/**@type {Date} */fecha_cancelar;
	/**@type {Number} */ monto;
	/**@type {Number} */ interes;
	/**@type {Number} */ interes_dolares;
	/**@type {Number} */ mora;
	/**@type {Boolean}*/ IsAnulable;
	estado;
	fecha_vencimiento;
	/**@type {Number} */ saldo;
	dias_mora;
	/**@type {Number} */ saldo_mora;
	fecha_baja;
	/**@type {Number} */ abonos;
	ultima_visita;
	tipo;
	entregado;
	/**@type {Number} */ interes_actual;
	observaciones;
	/**@type {Number} */ iva;
	/**@type {Number} */ margen;
	/**@type {Number} */ descuento;
	/**@type {Number} */ util;
	/**@type {Number} */ taza_interes_cargos;
	taza_mora;
	fecha_mora;
	fecha_interes;
	taza_gestion_crediticia;
	Id_User_OLD;
	/**@type {Number} */ taza_cambio;
	taza_cambio_compra;
	dkm;
	gasolinamonto;
	valorcad;
	montocuotaatrazadas;
	mes_pagado;
	tasa_hoy;
	numero_protocolo;
	valor_dolar;
	parciales;
	mora_parcial;
	interes_parcial;
	motivo_anulacion;
	idcatemp;
	cuota_fija_inicial;
	fecha_cancelar_inicial;
	plazo_inicial;
	dias_para_baja;
	codigo_cliente;
	/**@type {Catalogo_Clientes} */ Catalogo_Clientes;
	/**@type {Array<Tbl_Cuotas>} */ Tbl_Cuotas;
	/**@type {Array<Transaction_Facturas>} */ Transaction_Facturas;
	/**@type {Array<Detail_Prendas>} */ Detail_Prendas;
	//nuevas
	/**@type {Number} */ Valoracion_compra_cordobas;
	/**@type {Number} */ Valoracion_compra_dolares;
	/**@type {Number} */ Valoracion_empeño_cordobas;
	/**@type {Number} */ Valoracion_empeño_dolares;
	/**@type {Number} */ taza_interes_cargos;

	/**@type {Number} */ cuotafija;
	/**@type {Number} */ cuotafija_dolares;
	/**@type {Number} */ gestion_crediticia;
	/**@type {Number} */ tasas_interes;
	/**@type {Number} */ plazo;
	/**@type {Date} */ fecha;
	/**@type {Number} */ total_pagar_cordobas;
	/**@type {Number} */ total_pagar_dolares;
	/**@type {Number} */ reestructurado;
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
	/**@type {Number} */ numero_prenda;
	/**@type {Number} */ numero_contrato_OLD;
	/**@type {String} */ Descripcion;
	/**@type {Number} */ monto_aprobado_cordobas;
	/**@type {Number} */ monto_aprobado_dolares;
	/**@type {String} */ Tipo;
	/**@type {String} */ marca;
	/**@type {String} */ serie;
	/**@type {String} */ modelo;
	/**@type {Number} */ iva;
	/**@type {Number} */ margen;
	/**@type {Number} */ estado;
	/**@type {Number} */ interesl;
	/**@type {Number} */ moral;
	/**@type {Number} */ fliquidacion;
	/**@type {Number} */ precio_venta;
	/**@type {String} */ en_manos_de;
	/**@type {String} */ color;
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
	/**@type {Number}*/ id_categoria;
	/**@type {String}*/ tipo;
	/**@type {String}*/ descripcion;
	/**@type {Number}*/ plazo_limite;
	/**@type {Number}*/ prioridad;
	/**@type {Boolean}*/ isEditable;
	/**@type {Array<Detail_Prendas>} OneToMany*/ Detail_Prendas;
	/**@type {Array<Transactional_Valoracion_ModelComponent>} OneToMany*/ Transactional_Valoracion_ModelComponent;
}
export { Catalogo_Categoria }

class Detail_Prendas_Vehiculos extends EntityClass {
	constructor(props) {
		super(props, 'EntityDBO');
		Object.assign(this, props);
	}
	capacidad_cilindros;
	cantidad_cilindros;
	cantidad_pasajeros;
	year_vehiculo;
	montor;
	chasis;
	placa;
	circuacion;
	defectuoso;
	fecha_aut_descuento;
	defecto;
	porcentage_descuento_maximo;
	fecha_seguro;
	combustible;
	Detail_Prendas;
}
export { Detail_Prendas_Vehiculos }
