
using APPCORE;
using CAPA_NEGOCIO.Util;
using Business;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transactions;
namespace DataBaseModel
{

	public class Detail_Valores : EntityClass
	{
		[PrimaryKey(Identity = false)]
		public int? Id_valoracion { get; set; }
		public double? Valoracion_1 { get; set; }
		public double? Valoracion_2 { get; set; }
		public double? Valoracion_3 { get; set; }
		public double? Dolares_1 { get; set; }
		public double? Dolares_2 { get; set; }
		public double? Dolares_3 { get; set; }
	}
	public class Transactional_Valoracion : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_valoracion { get; set; }
		public string? Descripcion { get; set; }
		public string? Marca { get; set; }
		public string? Serie { get; set; }
		public string? Modelo { get; set; }
		public double? Tasa_interes { get; set; }
		public int? Plazo { get; set; }
		public DateTime? Fecha { get; set; }
		public double? Tasa_de_cambio { get; set; }
		public int? Id_estado { get; set; }
		public int? Id_categoria { get; set; }
		public double? Valoracion_compra_cordobas { get; set; }
		public double? Valoracion_compra_dolares { get; set; }
		public double? Valoracion_empeño_cordobas { get; set; }
		public double? Valoracion_empeño_dolares { get; set; }

		public double? Precio_venta_empeño_cordobas { get; set; }
		public double? Precio_venta_empeño_dolares { get; set; }


		[ManyToOne(TableName = "Catalogo_Estados_Articulos", KeyColumn = "id_estado_articulo", ForeignKeyColumn = "id_estado")]
		public Catalogo_Estados_Articulos? Catalogo_Estados_Articulos { get; set; }
		[ManyToOne(TableName = "Catalogo_Categoria", KeyColumn = "id_categoria", ForeignKeyColumn = "id_categoria")]
		public Catalogo_Categoria? Catalogo_Categoria { get; set; }
		[OneToOne(TableName = "Detail_Valores", KeyColumn = "id_valoracion", ForeignKeyColumn = "id_valoracion")]
		public Detail_Valores? Detail_Valores { get; set; }

		public List<Transactional_Valoracion> GuardarValoraciones(List<Transactional_Valoracion> valoraciones)
		{
			try
			{
				this.BeginGlobalTransaction();
				foreach (Transactional_Valoracion valoracion in valoraciones)
				{
					if (valoracion?.Id_valoracion == null)
					{
						valoracion!.Fecha = DateTime.Now;
						valoracion?.Save();
					}
				}
				this.CommitGlobalTransaction();
				return valoraciones;
			}
			catch (System.Exception)
			{
				this.RollBackGlobalTransaction();
				throw;
			}
		}
	}


		public class DesgloseIntereses
	{
		//porcentajes de intereses
		public double? GASTOS_ADMINISTRATIVOS { get; set; }
		public double? COMISIONES { get; set; }
		public double? MANTENIMIENTO_VALOR { get; set; }
		public double? GASTOS_LEGALES { get; set; }
		public double? INTERES_NETO_CORRIENTE { get; set; }
		public double? GESTION_CREDITICIA { get; set; }
		//fin porcentajes de intereses

		public double GetPorcentageInteresesSGC(bool aplicaGastosAdministrativos)
		{
			return (aplicaGastosAdministrativos ? GASTOS_ADMINISTRATIVOS.GetValueOrDefault() : 0) +
					COMISIONES.GetValueOrDefault() +
					MANTENIMIENTO_VALOR.GetValueOrDefault() +
					GASTOS_LEGALES.GetValueOrDefault() +
					INTERES_NETO_CORRIENTE.GetValueOrDefault();
		}
		public double GetPorcentageIntereses(bool aplicaGastosAdministrativos)
		{
			return GetPorcentageInteresesSGC(aplicaGastosAdministrativos) + GESTION_CREDITICIA.GetValueOrDefault();
		}
	}

	public enum Contratos_State
	{
		ACTIVO, 
		/* Cuando esta en saldo 0 pasa a estado cancelado*/
		CANCELADO, 
		ANULADO,
        CAPITAL_CANCELADO,
        VENCIDO
    }
	public enum Contratos_Type
	{
		EMPENO, PRESTAMO, EMPENO_VEHICULO, APARTADO_QUINCENAL, APARTADO_MENSUAL
	}
	public class Detail_Prendas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Numero_prenda { get; set; }
		public int? Numero_contrato_OLD { get; set; }
		public string? Descripcion { get; set; }
		public double? Monto_aprobado_cordobas { get; set; }
		public double? Monto_aprobado_dolares { get; set; }
		public string? Tipo { get; set; }
		public string? Marca { get; set; }
		public string? Serie { get; set; }
		public string? Modelo { get; set; }
		public string? Iva { get; set; }
		public string? Margen { get; set; }
		public string? Estado { get; set; }
		public double? Interesl { get; set; }
		public double? Moral { get; set; }
		public DateTime? Fliquidacion { get; set; }
		public double? Precio_venta { get; set; }
		public EnManosDe? En_manos_de { get; set; }
		public string? Color { get; set; }
		public string? Factura { get; set; }
		public string? Tipo_movimiento { get; set; }
		public double? V_porcentage_etiqueta { get; set; }
		public int? Id_categoria { get; set; }
		public int? Id_valoracion { get; set; }
		public int? Numero_contrato { get; set; }
		// [ManyToOne(TableName = "Transaction_Contratos", KeyColumn = "numero_contrato", ForeignKeyColumn = "numero_contrato")]
		// public Transaction_Contratos? Transaction_Contratos { get; set; }
		[OneToOne(TableName = "Detail_Prendas_Vehiculos", KeyColumn = "numero_prenda", ForeignKeyColumn = "numero_prenda")]
		public Detail_Prendas_Vehiculos? Detail_Prendas_Vehiculos { get; set; }
		[ManyToOne(TableName = "Catalogo_Categoria", KeyColumn = "id_categoria", ForeignKeyColumn = "id_categoria")]
		public Cat_Categorias? Catalogo_Categoria { get; set; }
		[ManyToOne(TableName = "Transactional_Valoracion", KeyColumn = "id_valoracion", ForeignKeyColumn = "id_valoracion")]
		public Transactional_Valoracion? Transactional_Valoracion { get; set; }

	}
	public enum EnManosDe
	{
		ACREEDOR, DEUDOR,
        CLIENTE
    }
	public class Detail_Prendas_Vehiculos : EntityClass
	{
		[PrimaryKey(Identity = false)]
		public int? Numero_prenda { get; set; }
		public string? Capacidad_cilindros { get; set; }
		public string? Cantidad_cilindros { get; set; }
		public string? Cantidad_pasajeros { get; set; }
		public int? Year_vehiculo { get; set; }
		public string? Montor { get; set; }
		public string? Chasis { get; set; }
		public string? Placa { get; set; }
		public string? Circuacion { get; set; }
		public string? Defectuoso { get; set; }
		public DateTime? Fecha_aut_descuento { get; set; }
		public string? Defecto { get; set; }
		public double? Porcentage_descuento_maximo { get; set; }
		public string? Uso { get; set; }
		public string? Servicio { get; set; }
		public DateTime? Fecha_seguro { get; set; }
		public string? Combustible { get; set; }
		// [OneToOne(TableName = "Detail_Prendas", KeyColumn = "numero_prenda", ForeignKeyColumn = "numero_prenda")]
		// public Detail_Prendas? Detail_Prendas { get; set; }
	}
	public class Transaction_Contratos_Inversionistas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Numero_cont { get; set; }
		public DateTime? Fecha { get; set; }
		public double? Taza { get; set; }
		public double? Monto_inicial { get; set; }
		public string? Nombre_sustituto { get; set; }
		public string? Identificacion_sustituto { get; set; }
		public string? Direccion_sustituto { get; set; }
		public string? Departamento_sus { get; set; }
		public string? Municipio_sustituto { get; set; }
		public int? Id_inversor { get; set; }
		public DateTime? Fecha_pago { get; set; }
		public DateTime? Fecha_ultimo_pago { get; set; }
		public double? Saldo { get; set; }
		public double? Montointeres { get; set; }
		public double? Interes { get; set; }
		public DateTime? Fecha_restructura { get; set; }
		public int? Id_User { get; set; }
		[ManyToOne(TableName = "Catalogo_Inversores", KeyColumn = "id_inversor", ForeignKeyColumn = "id_inversor")]
		public Catalogo_Inversores? Catalogo_Inversores { get; set; }
		[ManyToOne(TableName = "Security_Users", KeyColumn = "Id_User", ForeignKeyColumn = "Id_User")]
		public Security_Users? Security_Users { get; set; }
	}
	
	public class Transaction_Movimiento : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_movimiento { get; set; }
		public string? Descripcion { get; set; }
		public string? Concepto { get; set; }
		public int? Id_usuario_crea { get; set; }
		public DateTime? Fecha { get; set; }
		public string? Tipo { get; set; }
		public string? Moneda { get; set; }
		public double? Tasa_cambio { get; set; }
		public bool? Correo_enviado { get; set; }
		public double? Tasa_cambio_compra { get; set; }
		public bool? Is_transaction { get; set; }
		public int? Id_sucursal { get; set; } 
		public int? Id_cuenta_origen { get; set; }
		public int? Id_cuenta_destino { get; set; }
		public TipoMovimiento? Tipo_Movimiento { get; set; }

		[OneToMany(TableName = "Detail_Movimiento", KeyColumn = "id_movimiento", ForeignKeyColumn = "id_movimiento")]
		public List<Detail_Movimiento>? Detail_Movimiento { get; set; }
	}
	public class Detail_Movimiento : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_detalle { get; set; }
		public int? Id_movimiento { get; set; }
		public double? Debito { get; set; }
		public double? Debito_dolares { get; set; }
		public double? Credito { get; set; }
		public double? Credito_dolares { get; set; }
		public double? Tasa_cambio { get; set; }
		public double? Tasa_cambio_compra { get; set; }
		public string? Moneda { get; set; }

		public double? Monto_inicial { get; set; }
		public double? Monto_final { get; set; }
		public double? Monto_inicial_dolares { get; set; }
		public double? Monto_final_dolares { get; set; }
		public DateTime? Fecha { get; set; }
		[ManyToOne(TableName = "Transaction_Movimiento", KeyColumn = "id_movimiento", ForeignKeyColumn = "id_movimiento")]
		public Transaction_Movimiento? Transaction_Movimiento { get; set; }
		public int? Id_cuenta { get; set; }
		[ManyToOne(TableName = "Catalogo_Cuentas", KeyColumn = "id_cuentas", ForeignKeyColumn = "id_cuenta")]
		public Catalogo_Cuentas? catalogo_Cuentas { get; set; }
	}

	public class Transaccion_Factura : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_factura { get; set; }
		public int? Numero_contrato { get; set; }
		public string? Tipo { get; set; }
		public string? Concepto { get; set; }
		public double? Tasa_cambio { get; set; }
		public double? Total { get; set; }
		public int? Id_cliente { get; set; }
		public int? Id_sucursal { get; set; }
		public DateTime? Fecha { get; set; }
		public int? Id_usuario { get; set; }
		public string? Estado { get; set; }
		public string? No_factura { get; set; }
		public double? Subtotal { get; set; }
		public double? Iva { get; set; }
		public double? Total_cordobas { get; set; }
		public string? Moneda { get; set; }
		public string? Motivo_Anulacion { get; set; }
		public string? Consecutivo { get;  set; }
		
		public bool IsAnulable { get 
		{
		    return Estado != "ANULADO" && Estado != "CANCELADO" && !DateUtil.IsAffterNDays(Fecha, 1);
		}}

		[JsonProp]
		public Factura_contrato? Factura_contrato { get; set; }

		[OneToMany(TableName = "Detalle_Factura_Recibo", KeyColumn = "id_factura", ForeignKeyColumn = "id_factura")]
		public List<Detalle_Factura_Recibo>? Detalle_Factura_Recibo { get; set; }
		
	}

	public class Factura_contrato
	{
		public int? numero_contrato { get; set; }
		public int? cuotas_pactadas { get; set; }
		public int? cuotas_pendientes { get; set; }
		public double? saldo_anterior { get; set; }
		public double? saldo_actual { get; set; }
		public double? mora { get; set; }
		public double? interes_demas_cargos_pagar { get; set; }
		public DateTime? proximo_pago_pactado { get; set; }
		public double? total_parciales { get; set; }
		public string? tipo { get; set; }
		public string? tipo_cuenta { get; set; }
		public double? total { get; set; }
		public double? tasa_cambio { get; set; }
		public int? id_cliente { get; set; }
		public int? id_clasificacion_interes_anterior { get; set; }
		public int? id_sucursal { get; set; }
		public double? reestructuracion { get; set; }
		public double? perdida_de_documento { get; set; }
		public double? total_pagado { get; set; }
		public bool? cancel_with_perdida { get; set; }
	
		public bool? Solo_Interes_Mora { get;  set; }
		public Datos_Reestructuracion? Datos_Reestructuracion { get; set; }
		public double? mora_pagado { get;  set; }
		public double? interes_pagado { get;  set; }
		public double? abono_capital { get; set; }
		public int? reestructurado_anterior { get;  set; }
	}
	
	public class Datos_Reestructuracion 
	{
		
		public int? Plazo_Anterior { get; set; }
		public int? Nuevo_Plazo { get; set; }
		public double? Monto_Anterior { get; set; }
		public double? Nuevo_Monto { get; set; }		
		public double? Cuota_Anterior { get; set; }
		public double? Nuevo_Cuota { get; set; }
		public List<Tbl_Cuotas>? Cuotas_reestructuradas  { get; set; }
		public double? Cuota_Anterior_Cordobas { get;  set; }
		public double? Nueva_Cuota_Cordobas { get;  set; }
		public double? Monto_Anterior_Cordobas { get;  set; }
		public double? Nuevo_Monto_Cordobas { get;  set; }
	}


	public class Catalogo_Producto : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_producto { get; set; }
		public string? Descripcion { get; set; }
		public int? Id_categoria { get; set; }
		public int? Id_marca { get; set; }
	}

	public class Catalogo_Marca : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_marca { get; set; }
		public string? Nombre { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }

		[OneToMany(TableName = "Catalogo_Producto", KeyColumn = "id_marca", ForeignKeyColumn = "id_marca")]
		public List<Catalogo_Producto>? Detalle_Factura { get; set; }
	}


	public class Catalogo_Categorias : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_categoria { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
	}

	public class Transaction_Lotes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_transaccion { get; set; }
		public string? Descripcion { get; set; }
		public DateTime? Fecha { get; set; }
		public int? Id_usuario { get; set; }
		public int? Id_tipo_transaccion { get; set; }
		public string? Estado { get; set; }
	}


	public class Transaction_Detalle_Lotes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_detalle_transaccion { get; set; }
		public int? Id_lote { get; set; }
		public int? Cantidad_afectada { get; set; }
		public int? Id_transaccion { get; set; }
		public int? Id_detalle_factura { get; set; }
	}

	public class Detalle_Factura_Recibo : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id { get; set; }

		public int? Id_cuota { get; set; }
		public double? Total_cuota { get; set; }
		public double? Monto_pagado { get; set; }
		public double? Capital_restante { get; set; }
		public string? Concepto { get; set; }
		public double? Tasa_cambio { get; set; }
		public int? Id_factura { get; set; }
		[JsonProp]
		public EstadoAnteriorCuota? EstadoAnterior { get; set; }

		//[ManyToOne(TableName = "Transaccion_Factura", KeyColumn = "id_factura", ForeignKeyColumn = "id_factura")]
		public Transaccion_Factura? Transaccion_Factura { get; set; }
		[ManyToOne(TableName = "Tbl_Cuotas", KeyColumn = "id_cuota", ForeignKeyColumn = "id_cuota")]
		public Tbl_Cuotas? Tbl_Cuotas { get; set; }
	}

	public class EstadoAnteriorCuota
	{
		public DateTime? fecha_pago { get; set; }
		public double? pago_contado { get; set; }
		public string? Estado { get; set; }
		public double? total { get; set; }
		public double? interes { get; set; }
		public double? abono_capital { get; set; }
	}
}
