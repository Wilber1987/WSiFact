using System.Transactions;
using API.Controllers;
using APPCORE;
using APPCORE.Services;
using Business;
using DataBaseModel;
using Transactions;
namespace Model
{
	public class ContractServices : TransactionalClass
	{

		public Transaction_Contratos? Transaction_Contratos { get; set; }
		public List<Transactional_Valoracion>? valoraciones { get; set; }
		public string? Moneda { get; set; }
		/**@type {Number} */

		public ResponseService SaveDataContract(string Identify)
		{
			try
			{
				new Transactional_Valoracion().GuardarValoraciones(valoraciones);
				SessionServices.Set("ValoracionesTransaction", this, Identify);
				return new ResponseService()
				{
					status = 200
				};
			}
			catch (System.Exception)
			{
				return new ResponseService()
				{
					status = 200
				};
			}
		}

		public ResponseService SaveContract(string Identify)
		{
			try
			{
				BeginGlobalTransaction();
				ResponseService response = DoSaveContract(Identify);
				if (response.status != 200)
				{
					RollBackGlobalTransaction();
					return response;
				}
				CommitGlobalTransaction();
				return new ResponseService()
				{
					status = 200,
					message = "Contrato guardado correctamente",
					body = Transaction_Contratos
				};
			}
			catch (System.Exception ex)
			{
				RollBackGlobalTransaction();
				return new ResponseService()
				{
					status = 500,
					body = ex
				};
			}
		}

		public ResponseService DoSaveContract(string Identify)
		{
			var  (User, dbUser) =  Business.Security_Users.GetUserData(Identify);
			var configuraciones = new Transactional_Configuraciones().GetConfig(ConfiguracionesInteresesEnum.MORA_CONTRATOS_EMP.ToString());
			if (Transaction_Contratos?.Detail_Prendas?.Count == 0)
			{
				return new ResponseService()
				{
					status = 403,
					message = "Prendas Requeridas"
				};
			}
			foreach (var prenda in Transaction_Contratos?.Detail_Prendas ?? [])
			{
				if (prenda.serie != null)
				{
					List<Detail_Prendas> prendasGuardadas = new Detail_Prendas().Where<Detail_Prendas>(
						FilterData.Equal("serie", prenda?.serie),
						FilterData.Distinc("serie", ""),
						FilterData.NotNull("serie")
					);
					foreach (var prendaGuardada in prendasGuardadas)
					{
						Transaction_Contratos? contrato = new Transaction_Contratos { numero_contrato = prendaGuardada.numero_contrato }.Find<Transaction_Contratos>();
						if (contrato?.estado == Contratos_State.ACTIVO || contrato?.estado == Contratos_State.VENCIDO)
						{
							return new ResponseService()
							{
								status = 403,
								message = $"No es posible guardar el contrato ya que la Prenda con serie '{prenda?.serie}' esta incluida en un contrato {contrato?.estado}"
							};
						}
					}
				}
			}

			Transaction_Contratos.fecha_contrato = DateTime.Now;
			Transaction_Contratos.fecha_cancelar = Transaction_Contratos.Tbl_Cuotas.Select(c => c.fecha).ToList().Max();
			Transaction_Contratos.fecha_vencimiento = Transaction_Contratos.Tbl_Cuotas.Select(c => c.fecha).ToList().Max();
			var valoracion = Transaction_Contratos.Detail_Prendas[0];
			if (Transaction_Contratos?.tipo == Contratos_Type.APARTADO_QUINCENAL
			|| Transaction_Contratos?.tipo == Contratos_Type.APARTADO_MENSUAL)
			{
				valoracion.Catalogo_Categoria.tipo = valoracion.Catalogo_Categoria.tipo;

			}
			else if (valoracion.en_manos_de == EnManosDe.ACREEDOR
			&& valoracion.Catalogo_Categoria.tipo.ToUpper() != "Vehículos".ToUpper())
			{
				Transaction_Contratos.tipo = Contratos_Type.EMPENO;
			}
			else if (valoracion.en_manos_de == EnManosDe.ACREEDOR
			 && valoracion.Catalogo_Categoria.tipo.ToUpper() == "Vehículos".ToUpper())
			{

				Transaction_Contratos.tipo = Contratos_Type.EMPENO_VEHICULO;
			}
			else
			{
				Transaction_Contratos.tipo = Contratos_Type.PRESTAMO;
			}

			Transaction_Contratos.monto = Transaction_Contratos.Valoracion_empeño_dolares;
			Transaction_Contratos.saldo = Transaction_Contratos.Valoracion_empeño_dolares;
			Transaction_Contratos.mora = Convert.ToDouble(configuraciones.Valor);
			Transaction_Contratos.estado = Contratos_State.ACTIVO;
			Transaction_Contratos.Id_User = dbUser?.Id_User;
			Transaction_Contratos.Tbl_Cuotas?.ForEach(c =>
			{
				c.pago_contado = 0;
				c.Estado = c.Estado == Contratos_State.CAPITAL_CANCELADO.ToString() ? c.Estado : "PENDIENTE";
			});
			var Intereses = new Transactional_Configuraciones().GetIntereses();
			Transaction_Contratos.DesgloseIntereses = new DesgloseIntereses
			{
				GASTOS_ADMINISTRATIVOS = Convert.ToDouble(Intereses.Find(c => c.Nombre.Equals(InteresesPrestamosEnum.GASTOS_ADMINISTRATIVOS.ToString()))?.Valor),
				COMISIONES = Convert.ToDouble(Intereses.Find(c => c.Nombre.Equals(InteresesPrestamosEnum.COMISIONES.ToString()))?.Valor),
				MANTENIMIENTO_VALOR = Convert.ToDouble(Intereses.Find(c => c.Nombre.Equals(InteresesPrestamosEnum.MANTENIMIENTO_VALOR.ToString()))?.Valor),
				GASTOS_LEGALES = Convert.ToDouble(Intereses.Find(c => c.Nombre.Equals(InteresesPrestamosEnum.GASTOS_LEGALES.ToString()))?.Valor),
				INTERES_NETO_CORRIENTE = Convert.ToDouble(Intereses.Find(c => c.Nombre.Equals(InteresesPrestamosEnum.INTERES_NETO_CORRIENTE.ToString()))?.Valor),
				GESTION_CREDITICIA = Transaction_Contratos.gestion_crediticia,
			};
			var newContract = Transaction_Contratos.Save();
			Transaction_Contratos.numero_contrato = ((Transaction_Contratos)newContract)?.numero_contrato;
			//CREACION
			var cuentaOrigen = Catalogo_Cuentas.GetCuentaEgresoContratos(dbUser);
			var cuentaDestino = Catalogo_Cuentas.GetCuentaRegistoContratos(dbUser);
			if (cuentaDestino == null || cuentaOrigen == null)
			{
				return new ResponseService()
				{
					status = 400,
					message = "Cuentas no configuradas correctamente"
				};
			}
			return new Movimientos_Cuentas
			{
				Catalogo_Cuentas_Destino = cuentaDestino,
				Catalogo_Cuentas_Origen = cuentaOrigen,
				concepto = "Desembolso de monto para, contrato No: " + Transaction_Contratos.numero_contrato,
				descripcion = "Desembolso de monto para, contrato No: " + Transaction_Contratos.numero_contrato,
				moneda = Moneda ?? "DOLARES",
				monto = Moneda == "CORDOBAS" ? Transaction_Contratos.Valoracion_empeño_cordobas : Transaction_Contratos.monto,
				tasa_cambio = Transaction_Contratos.taza_cambio,
				tasa_cambio_compra = Transaction_Contratos.taza_cambio_compra,
				is_transaction = true,
				Tipo_Movimiento = TipoMovimiento.DESEMBOLSO_POR_CONTRATO
			}.SaveMovimiento(dbUser);
		}

		public ContractServices GetDataContract(string Identify)
		{
			ContractServices? valoracionesTransaction
			 = SessionServices.Get<ContractServices>("ValoracionesTransaction", Identify);
			return valoracionesTransaction ?? new ContractServices();
		}

		public void Vencimientos()
		{
			//var VencimientoConfig = new Transactional_Configuraciones().GetConfig(ConfiguracionesVencimientos.VENCIMIENTO_CONTRATO.ToString());
			var contratosVencidos = new Transaction_Contratos().Where<Transaction_Contratos>(
				FilterData.Or(
					FilterData.Equal("tipo", Contratos_Type.EMPENO.ToString()),
					FilterData.Equal("tipo", Contratos_Type.EMPENO_VEHICULO.ToString())
				),
				FilterData.Equal("estado", EstadoEnum.ACTIVO.ToString())
			);

			contratosVencidos.ForEach(contrato =>
			{
				BeginGlobalTransaction();
				contrato.EstablecerComoVencido();
				CommitGlobalTransaction();
			});
		}

		public object GetParcialesData(ParcialesData data)
		{
			List<Transaccion_Factura> transaccion_Facturas = new Transaccion_Factura
			{
				numero_contrato = data.numero_contrato
			}.Get<Transaccion_Factura>();
			List<Detalle_Factura_Recibo> detalle_Factura_Recibos = transaccion_Facturas.Where(t => t.Detalle_Factura_Recibo != null).ToList()
				.SelectMany(t => t.Detalle_Factura_Recibo).ToList();
			List<Detalle_Factura_Recibo> detalle_Factura_Recibos_Parciales = detalle_Factura_Recibos
					.Where(r => r.id_cuota == data.id_cuota && r.concepto.ToUpper().Contains("PAGO PARCIAL")).ToList();

			double pagoParciales = 0;
			if (detalle_Factura_Recibos_Parciales.Count != 0)
			{
				pagoParciales = detalle_Factura_Recibos_Parciales.Select(c => Convert.ToDouble(c.monto_pagado)).ToList().Sum();
			}
			return new
			{
				pagoParciales
			};
		}
		public class ParcialesData
		{
			public int? numero_contrato { get; set; }
			public int? id_cuota { get; set; }
		}
	}
}