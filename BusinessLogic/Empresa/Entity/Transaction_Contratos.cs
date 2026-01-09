using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using BusinessLogic.Empresa.Contratos;
using CAPA_NEGOCIO.Util;
using Business;
using Transactions;

namespace DataBaseModel
{
	public class Transaction_Contratos : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Numero_contrato { get; set; }
		public DateTime? Fecha_contrato { get; set; }
		public DateTime? Fecha_cancelar { get; set; }
		public double? Monto { get; set; }
		public double? Interes { get; set; }
		public double? Mora { get; set; }
		public Contratos_State? Estado { get; set; }
		public DateTime? Fecha_vencimiento { get; set; }
		public int? Codigo_cliente { get; set; }
		public double? Saldo { get; set; }
		public double? Abonos { get; set; }
		public Contratos_Type? Tipo { get; set; }
		public string? Entregado { get; set; }
		public double? Interes_actual { get; set; }
		public string? Observaciones { get; set; }
		public double? Iva { get; set; }
		public double? Descuento { get; set; }
		public double? Taza_cambio { get; set; }
		public double? Taza_cambio_compra { get; set; }
		public int? Id_agente { get; set; }
		public int? Plazo { get; set; }
		public double? Cuotafija { get; set; }
		public double? Tasa_hoy { get; set; }
		public string? Motivo_anulacion { get; set; }
		public double? Valoracion_compra_dolares { get; set; }
		public double? Valoracion_compra_cordobas { get; set; }
		public double? Valoracion_empeño_cordobas { get; set; }
		public double? Valoracion_empeño_dolares { get; set; }
		public double? Tasas_interes { get; set; }
		public double? Gestion_crediticia { get; set; }
		public double? Cuotafija_dolares { get; set; }
		public DateTime? Fecha { get; set; }
		public double? Total_pagar_cordobas { get; set; }
		public double? Total_pagar_dolares { get; set; }
		public double? Interes_dolares { get; set; }
		public int? Id_User { get; set; }
		public bool IsAnulable
		{
			get
			{
				return Estado != Contratos_State.ANULADO && Estado != Contratos_State.CANCELADO
				&& DateUtil.IsBefore(Fecha, 24)
				&& Tipo != Contratos_Type.APARTADO_QUINCENAL
				&& Tipo != Contratos_Type.APARTADO_MENSUAL;
			}
		}

		public int? Reestructurado { get; set; }
		[JsonProp]
		public DesgloseIntereses? DesgloseIntereses { get; set; }
		[JsonProp]
		public List<Notas_de_contrato>? Notas { get; set; }

		[ManyToOne(TableName = "Catalogo_Clientes", KeyColumn = "codigo_cliente", ForeignKeyColumn = "codigo_cliente")]
		public Catalogo_Clientes? Catalogo_Clientes { get; set; }
		[ManyToOne(TableName = "Security_Users", KeyColumn = "Id_User", ForeignKeyColumn = "Id_User")]
		public Security_Users? Security_Users { get; set; }
		[OneToMany(TableName = "Detail_Prendas", KeyColumn = "numero_contrato", ForeignKeyColumn = "numero_contrato")]
		public List<Detail_Prendas>? Detail_Prendas { get; set; }
		[OneToMany(TableName = "Tbl_Cuotas", KeyColumn = "numero_contrato", ForeignKeyColumn = "numero_contrato")]
		public List<Tbl_Cuotas>? Tbl_Cuotas { get; set; }

		//[OneToMany(TableName = "Transaccion_Factura", KeyColumn = "numero_contrato", ForeignKeyColumn = "numero_contrato")]
		public List<Transaccion_Factura>? Recibos { get; set; }
		public ResponseService Anular(string Identify, bool anularIgnoreTransactions = false, bool anularFullCost = false)
		{
			try
			{
				//BeginGlobalTransaction();
				var  (User, dbUser) =  Business.Security_Users.GetUserData(Identify);
				Transaction_Contratos? Transaction_Contratos = new Transaction_Contratos
				{
					Numero_contrato = this.Numero_contrato
				}.Find<Transaction_Contratos>();
				if (Transaction_Contratos == null)
				{
					return new ResponseService { status = 403, message = "Contrato no existe" };
				}
				var cuotasPagadas = Transaction_Contratos.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == "CANCELADO").ToList();
				if (cuotasPagadas.Count > 0 && !anularIgnoreTransactions)
				{
					return new ResponseService { status = 403, message = "Contrato no puede ser anulado debido a que ya se realizaron transacciones en el (pago de cuotas)" };
				}
				if (IsAnulable && !anularIgnoreTransactions)
				{
					return new ResponseService { status = 403, message = "Fecha límite para anulación a caducado" };
				}
				Transaction_Contratos.Motivo_anulacion = this.Motivo_anulacion;
				Transaction_Contratos.Estado = Contratos_State.ANULADO;
				Transaction_Contratos.Update();
				//ANULAR
				var cuentaOrigen = Catalogo_Cuentas.GetCuentaRegistoContratos(dbUser);
				var cuentaDestino = Catalogo_Cuentas.GetCuentaEgresoContratos(dbUser);
				Transaction_Movimiento? movimientosAnterior = new Transaction_Movimiento().Find<Transaction_Movimiento>(
					FilterData.Equal("concepto", "Desembolso de monto para, contrato No: " + Transaction_Contratos.Numero_contrato)
				);
				ResponseService response = new Movimientos_Cuentas
				{
					Catalogo_Cuentas_Destino = cuentaDestino,
					Catalogo_Cuentas_Origen = cuentaOrigen,
					Concepto = "Reembolso de monto para anulación de contrato No: " + Transaction_Contratos.Numero_contrato,
					Descripcion = Motivo_anulacion,
					Moneda = movimientosAnterior?.Moneda,
					Monto = movimientosAnterior?.Moneda == "CORDOBAS" ? Transaction_Contratos.Valoracion_empeño_cordobas : Transaction_Contratos.Monto,
					Tasa_cambio = Transaction_Contratos.Taza_cambio,
					Tasa_cambio_compra = Transaction_Contratos.Taza_cambio_compra,
					Is_transaction = true,
					Tipo_Movimiento = TipoMovimiento.REEMBOLSO_POR_CONTRATO_ANULADO
				}.SaveMovimiento(dbUser);
				return new ResponseService { status = 200, message = "Contrato anulado correctamente" };
			}
			catch (Exception ex)
			{
				//RollBackGlobalTransaction();
				return new ResponseService { status = 500, message = ex.Message };
			}
		}

		public List<Tbl_Cuotas> Reestructurar(double? reestructuracion_value)
		{
			if (this.Reestructurado == null)
			{
				this.Reestructurado = 0;
			}
			this.Plazo += Convert.ToInt32(reestructuracion_value);
			this.Reestructurado += 1;
			this.Update();
			return CrearCuotas(this.Saldo, reestructuracion_value);
		}
		public List<Tbl_Cuotas> CrearCuotas(double? monto,
								 double? plazo,
								 bool autoSave = true,
								 bool quincenal = false)
		{
			var tasasCambio = new Catalogo_Cambio_Divisa().Get<Catalogo_Cambio_Divisa>()[0].Valor_de_venta;
			this.Cuotafija_dolares = this.GetPago(monto, plazo);
			this.Cuotafija = this.Cuotafija_dolares * this.Taza_cambio;
			var capital = monto;
			List<Tbl_Cuotas> cuotas = new List<Tbl_Cuotas>();
			DateTime fechaC = Fecha.GetValueOrDefault();

			int totalCuotas = Convert.ToInt32(plazo);

			for (var index = 0; index < totalCuotas; index++)
			{
				if (quincenal)
				{
					// Si es la primera cuota del mes, se asigna al día 15, si no, al día 30
					//fechaC = new DateTime(fechaC.Year, fechaC.Month, (index % 2 == 0) ? 15 : 30);
					//if (index % 2 != 0) fechaC = fechaC.AddMonths(1); // Avanza al siguiente mes después del día 30
					fechaC = fechaC.AddDays(15);
				}
				else
				{
					fechaC = fechaC.AddMonths(1);
				}

				var abono_capital = this.Cuotafija_dolares - (capital * this.Tasas_interes);
				var cuota = new Tbl_Cuotas
				{
					Estado = EstadoEnum.PENDIENTE.ToString(),
					Fecha = fechaC,
					Total = this.Cuotafija_dolares,
					Interes = capital * this.Tasas_interes,
					Abono_capital = abono_capital,
					Capital_restante = (capital - abono_capital) < 0 ? 0 : (capital - abono_capital),
					Tasa_cambio = tasasCambio,
					Numero_contrato = this.Numero_contrato
				};
				capital -= abono_capital;

				if (autoSave)
				{
					cuota.Save();
				}

				cuotas.Add(cuota);
			}
			return cuotas;
		}

		private double? GetPago(double? monto, double? cuotas)
		{

			var tasa = this.Tasas_interes;
			if (tasa == 0)
			{
				return monto / cuotas;
			}
			var payment = tasa * Math.Pow(Convert.ToDouble(1 + tasa), Convert.ToDouble(cuotas)) * monto
				/ (Math.Pow(Convert.ToDouble(1 + tasa), Convert.ToDouble(cuotas)) - 1);
			return payment;
		}

		public void EstablecerComoVencido()
		{
			try
			{
				var VencimientoConfig = new Transactional_Configuraciones().GetConfig(ConfiguracionesVencimientos.VENCIMIENTO_CONTRATO.ToString());
				var cuotasPendientes = new Tbl_Cuotas { Numero_contrato = Numero_contrato, Estado = EstadoEnum.PENDIENTE.ToString() }.Get<Tbl_Cuotas>();
				if (cuotasPendientes.Count == 0)
				{
					return;//todo ver el retorno
				}
				Tbl_Cuotas CuotaActual = cuotasPendientes.Last();
				DateTime fechaOriginal = CuotaActual.Fecha.GetValueOrDefault();
				TimeSpan diferencia = DateTime.Now - fechaOriginal;
				int diasDeDiferencia = diferencia.Days;
				if (diasDeDiferencia > Convert.ToInt32(VencimientoConfig.Valor))
				{
					Estado = Contratos_State.VENCIDO;
					Update();
					Transactional_Configuraciones beneficioVentaE = new Transactional_Configuraciones()
						   .GetConfig(ConfiguracionesBeneficiosEnum.BENEFICIO_VENTA_ARTICULO_EMPENO.ToString());
					var dbUser = new Security_Users { Id_User = Id_User }.Find<Security_Users>();
					Detail_Prendas?.ForEach(prenda =>
					{
						if (prenda.En_manos_de == EnManosDe.ACREEDOR)
						{
							//Tbl_Lotes.GenerarLoteAPartirDeDevolucion(prenda, beneficioVentaE, dbUser, this);
						}
					});
					Tbl_Cuotas?.ForEach(Cuota =>
					{
						Cuota.Estado = EstadoEnum.VENCIDO.ToString();
						Cuota.Update();
					});
				}
			}
			catch (System.Exception Exception)
			{
				LoggerServices.AddMessageError("error al vencer contrato", Exception);
			}
		}




		public Transaction_Contratos? FindAndUpdateContract()
		{
			Transaction_Contratos? contrato = Find<Transaction_Contratos>();
			var cuotas = new Tbl_Cuotas()
			{
				Numero_contrato = contrato?.Numero_contrato
			}.Where<Tbl_Cuotas>(
				FilterData.Equal("Estado", EstadoEnum.PENDIENTE),
				FilterData.Less("fecha", DateTime.Now)
			);
			foreach (var cuota in cuotas)
			{
				if (Tipo == Contratos_Type.APARTADO_QUINCENAL && cuota.Mora != 0)
				{
					cuota.Mora = 0;
					cuota.Update();
				}
				else
				{
					TimeSpan diferencia = DateTime.Now.Subtract(cuota.Fecha.GetValueOrDefault());
					int diasEnMora = (int)Math.Floor(diferencia.TotalDays);
					// Si 'diasEnMora' es negativo, significa que la fecha de pago aún no ha llegado, entonces ajustamos a cero
					diasEnMora = Math.Max(diasEnMora, 0);
					var montoMora = cuota.Total * ((cuota.Transaction_Contratos?.Mora / 100) ?? 0.005) * diasEnMora;
					if (montoMora > 0)
					{
						cuota.Mora = montoMora;
						cuota.Update();
					}
				}

			}
			var contratoActualizado = Find<Transaction_Contratos>();
			contratoActualizado?.GetRecibos();
			return contratoActualizado;
		}

		public List<Transaction_Contratos> GetContratos()
		{
			var contratos = Where<Transaction_Contratos>(FilterData.Limit(30));
			foreach (var contrato in contratos)
			{
				contrato.GetRecibos();
			}
			return contratos;
		}

		private void GetRecibos()
		{
			Recibos = new Transaccion_Factura
			{
				filterData = [new FilterData
				{
					PropName = "Factura_contrato",
					JsonPropName = "numero_contrato",
					FilterType = "JSONPROP_EQUAL",
					PropSQLType = "int",
					Values = new List<string?> { Numero_contrato.GetValueOrDefault().ToString() }
				}]
			}.SimpleGet<Transaccion_Factura>();
		}

		internal void Cancelar(Security_Users? dbUser)
		{
			if (Estado != Contratos_State.CANCELADO)
			{
				Estado = Contratos_State.CANCELADO;
				Tbl_Acta_Entrega.ActasDePrendasPorCancelacionContrato(dbUser, this);
			}
		}
	}

	public class Notas_de_contrato
	{
		public DateTime Fecha { get; set; }
		public string? Descripcion { get; set; }
	}

	public class Tbl_Cuotas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_cuota { get; set; }
		/**@type {Date} */
		public DateTime? Fecha { get; set; }
		/**@type {Number} Tbl_cuotas del abono*/
		public double? Total { get; set; }
		/**@type {Number} valor del interes del capital*/
		public double? Interes { get; set; }
		/**@type {Number} */
		public double? Abono_capital { get; set; }
		/**@type {Number} capital restante*/
		public double? Capital_restante { get; set; }
		/**@type {Number} capital mora*/
		public double? Mora { get; set; }
		/**DATOS DE LA FATURA */
		/**@type {Date} */
		public DateTime? Fecha_pago { get; set; }
		/**@type {Number} Tbl_cuotas del abono*/
		public double? Pago_contado { get; set; }
		/**@type {Number} Tbl_cuotas del abono*/
		public double? Descuento { get; set; }
		/**@type {Number} Tbl_cuotas del abono*/
		public double? Tasa_cambio { get; set; }
		public int? Numero_contrato { get; set; }
		public string? Estado { get; set; }

		[ManyToOne(TableName = "Transaction_Contratos", KeyColumn = "numero_contrato", ForeignKeyColumn = "numero_contrato")]
		public Transaction_Contratos? Transaction_Contratos { get; set; }
	}

}