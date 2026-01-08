using API.Controllers;
using APPCORE;
using CAPA_NEGOCIO.Services;
using Business;
using DataBaseModel;
using Model;
using UI.CAPA_NEGOCIO.Empresa.Services.Recibos;
using BusinessLogic.Facturacion.Operations;

namespace Transactions
{
	public class Recibos_Transactions : EntityClass
	{
		#region propiedades
		[PrimaryKey(Identity = true)]
		public int? id_recibo { get; set; }
		public int? consecutivo { get; set; }
		public bool? temporal { get; set; }
		public int? numero_contrato { get; set; }
		public double? monto { get; set; }
		public double? saldo_actual_cordobas { get; set; }
		public double? saldo_actual_dolares { get; set; }
		public double? plazo { get; set; }
		public double? interes_cargos { get; set; }
		public double? tasa_cambio { get; set; }
		public double? tasa_cambio_compra { get; set; }
		public double? interes_demas_cargos_pagar_cordobas { get; set; }
		public double? interes_demas_cargos_pagar_dolares { get; set; }
		public double? abono_capital_cordobas { get; set; }
		public double? abono_capital_dolares { get; set; }
		public double? cuota_pagar_cordobas { get; set; }
		public double? cuota_pagar_dolares { get; set; }
		public double? mora_cordobas { get; set; }
		public double? mora_dolares { get; set; }
		public double? mora_interes_cordobas { get; set; }
		public double? mora_interes_dolares { get; set; }
		public double? total_cordobas { get; set; }
		public double? total_dolares { get; set; }
		public double? total_parciales { get; set; }
		public DateTime? fecha_roc { get; set; }
		public double? paga_cordobas { get; set; }
		public double? paga_dolares { get; set; }
		public bool? solo_abono { get; set; }
		public bool? solo_interes_mora { get; set; }
		public bool? cancelar { get; set; }
		public bool? reestructurar { get; set; }
		public double? reestructurar_value { get; set; }
		public double? total_apagar_dolares { get; set; }
		public string? moneda { get; set; }
		public string? motivo_anulacion { get; set; }
		public bool? perdida_de_documento { get; set; }
		public double? monto_dolares { get; set; }
		public double? monto_cordobas { get; set; }
		public double? cambio_dolares { get; set; }
		public double? cambio_cordobas { get; set; }
		public bool? Is_cambio_cordobas { get; set; }
		public bool? pago_parcial { get; set; }
		public List<Tbl_Cuotas>? CuotasReestructuradas { get; private set; }
		#endregion

		public ResponseService SaveRecibos(string Identify)
		{
			try
			{
				var (user, dbUser) = Business.Security_Users.GetUserData(Identify);
				var contrato = new Transaction_Contratos() { numero_contrato = this.numero_contrato }.Find<Transaction_Contratos>();
				var sucursal = new Catalogo_Sucursales() { Id_Sucursal = dbUser?.Id_Sucursal }.Find<Catalogo_Sucursales>();
				if (contrato == null)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Nº contrato no encontrado"
					};
				}
				if (this.cancelar.HasValue && this.cancelar.Value
					&& Math.Round((Decimal)this.paga_dolares.GetValueOrDefault(), 3) < Math.Round((Decimal)contrato.saldo.GetValueOrDefault(), 3))
				{
					return new ResponseService()
					{
						status = 400,
						message = "Para cancelar es necesario un monto de " + contrato.saldo
					};
				}
				double monto = this.paga_dolares.GetValueOrDefault();
				BeginGlobalTransaction();

				var DetallesFacturaRecibos = new List<Detalle_Factura_Recibo>();
				//SE VALIDA SI AL MONTO SE LE VA A DEBITAR LA REESTRUCTURACION Y LA PERDIDA DE DOCUMENTOS                
				monto = CalcularGastosAdicionales(contrato, monto, DetallesFacturaRecibos);
				//respaldos
				var reestructuradoRespaldo = contrato.reestructurado;
				var Cuota_Anterior = contrato.cuotafija_dolares;
				var Cuota_Anterior_Cordobas = contrato.cuotafija_dolares;
				var Monto_Anterior = contrato.monto;
				var Monto_Anterior_Cordobas = contrato.Valoracion_empeño_cordobas;
				var Plazo_Anterior = contrato.plazo;
				var id_clasificacion_interes_anterior = contrato.Catalogo_Clientes?.id_clasificacion_interes;

				var cuotasPendientes = contrato.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == EstadoEnum.PENDIENTE.ToString()).ToList();


				Tbl_Cuotas CuotaActual = cuotasPendientes.Last();
				double? mora = cuotasPendientes?.Select(c => c.mora).ToList().Sum();
				double? saldo_pendiente = contrato.saldo;
				double? interesCorriente = InteresCorriente(CuotaActual, contrato);
				double? perdida_de_documento_monto = this.perdida_de_documento == true ? 1 : 0;
				double? reestructuracion_monto = reestructurar_value ?? 0;
				double? total_capital_restante = mora
					+ saldo_pendiente
					+ interesCorriente
					+ perdida_de_documento_monto
					+ reestructuracion_monto;

				double? interesPagado = monto > (mora + interesCorriente) ? interesCorriente
					: monto > mora ? monto - mora : 0;
				double? moraPagado = monto > mora ? mora : mora - monto;

				double? abonoCapital = monto > (mora + interesCorriente) ? (monto - mora - interesCorriente) : 0;
				double? saldoRespaldo = contrato.saldo;
				contrato.saldo -= abonoCapital;
				if (contrato.saldo <= 0.5)
				{
					contrato.saldo = 0;
					contrato.Cancelar(dbUser);

					var contartosActivos = new Transaction_Contratos { codigo_cliente = contrato.codigo_cliente }.Where<Transaction_Contratos>(
						FilterData.Equal("estado", Contratos_State.ACTIVO),
						FilterData.Distinc("numero_contrato", contrato.numero_contrato)
					);
					if (contartosActivos.Count == 0)
					{
						contrato.Catalogo_Clientes?.ActualizarClasificacionInteres();
					}
				}

				if (this.cancelar == true && contrato.saldo == 0)
				{
					contrato.saldo = 0;
					contrato.Cancelar(dbUser);
					cuotasPendientes?.ForEach(cuota =>
					{
						EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
						cuota.pago_contado = cuota.abono_capital;
						AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
						"Pago de completo de cuota, en la cancelación de contrato No: " + this.numero_contrato);
						cuota.Estado = Contratos_State.CANCELADO.ToString();
					});
				}
				else if (solo_interes_mora == true)//PAGA SOLO INTERES + MORA
				{
					monto = SoloInteresMora(contrato, monto, DetallesFacturaRecibos, null, CuotaActual);
				}
				else if (pago_parcial == true)//PAGA SOLO INTERES + MORA
				{
					monto = SoloPagoParcial(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
				}
				else if (solo_abono == true) //PAGA ABONO AL CAPITAL
				{
					monto = AbonoCapital(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, null);
				}
				else if (reestructurar == true) //PAGA ABONO AL CAPITAL
				{
					monto = SoloInteresMora(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
					if (abonoCapital > 0)
					{
						DetallesFacturaRecibos?.Add(new Detalle_Factura_Recibo()
						{
							total_cuota = abonoCapital,
							monto_pagado = abonoCapital,
							capital_restante = 0,
							concepto = "Abono al capital en la reestructuración",
							tasa_cambio = this.tasa_cambio
						});
					}
					cuotasPendientes?.ForEach(c =>
					{
						c.Estado = EstadoEnum.INACTIVO.ToString();
						c.Update();
					});
					monto = CalcularReestructurar(contrato, monto, DetallesFacturaRecibos);
				}
				else //PAGA MAS DE LO NORMAL (CUOTA CON INTERESES + MORA) + ABONO AL CAPITAL
				{
					monto = CancelarCuotaActual(monto, CuotaActual, DetallesFacturaRecibos);
					monto = AbonoCapital(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
				}

				//fecha de proximo pago
				var cuotasPendiente = contrato.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == EstadoEnum.PENDIENTE.ToString()).ToList();

				//guardado de factura
				var factura = new Transaccion_Factura()
				{
					tipo = "RECIBO", //TODO ENUM
					estado = EstadoEnum.ACTIVO.ToString(),
					concepto = GetConcepto(),
					tasa_cambio = this.tasa_cambio,
					total = this.paga_dolares,
					id_cliente = contrato.codigo_cliente,
					id_sucursal = sucursal?.Id_Sucursal,
					fecha = DateTime.Now,
					Moneda = moneda,
					Consecutivo = temporal != true ? getConsecutivo(dbUser) : null,
					total_cordobas = paga_cordobas,
					id_usuario = user.UserId,
					Factura_contrato = BuildFacturaContrato(dbUser, contrato, reestructuradoRespaldo, Cuota_Anterior, Cuota_Anterior_Cordobas, Monto_Anterior, Monto_Anterior_Cordobas, Plazo_Anterior, id_clasificacion_interes_anterior, interesPagado, moraPagado, abonoCapital, saldoRespaldo, cuotasPendiente),
					Detalle_Factura_Recibo = DetallesFacturaRecibos
				};
				if (temporal != true)
				{
					contrato.Update();
					factura.Save();
					//crear recibos                    
					var cuentaOrigen = Catalogo_Cuentas.GetCuentaEgresoRecibos(dbUser);
					var cuentaDestino = Catalogo_Cuentas.GetCuentaIngresoRecibos(dbUser);

					if (cuentaDestino == null || cuentaOrigen == null)
					{
						RollBackGlobalTransaction();
						return new ResponseService()
						{
							status = 400,
							message = "Cuentas no configuradas correctamente"
						};
					}
					ResponseService response = new Movimientos_Cuentas
					{
						Catalogo_Cuentas_Destino = cuentaDestino,
						Catalogo_Cuentas_Origen = cuentaOrigen,
						concepto = "Pago de cuota, contrato No: " + this.numero_contrato,
						descripcion = "Pago de cuota, contrato No: " + this.numero_contrato,
						moneda = this.moneda?.ToUpper(),
						monto = this.moneda?.ToUpper() == "DOLARES" ? this.paga_dolares : this.paga_cordobas,
						tasa_cambio = this.tasa_cambio,
						//tasa_cambio_compra = this.tasa_cambio_compra,
						is_transaction = true,
						Tipo_Movimiento = TipoMovimiento.INGRESO_POR_PAGO_DE_RECIBO
					}.SaveMovimiento(dbUser);
					if (response.status == 400)
					{
						RollBackGlobalTransaction();
						return response;
					}
					var responseMC = MesaCambiariaService.GenerarMovimientosCambiariosrecibos(dbUser, this);
					if (responseMC.status != 200)
					{
						RollBackGlobalTransaction();
						return responseMC;
					}
					CommitGlobalTransaction();
				}
				else
				{
					RollBackGlobalTransaction();
				}
				return new ResponseService()
				{
					status = 200,
					message = temporal == true ? "Factura temporal" : "Factura registrada correctamente",
					body = temporal == true ? new RecibosTemplateServices().GenerateReciboHtmlTemplate(factura) : factura
				};

			}
			catch (System.Exception ex)
			{
				RollBackGlobalTransaction();
				return new ResponseService()
				{
					message = "Error:" + ex.ToString(),
					status = 400
				};
			}

		}

		private Factura_contrato BuildFacturaContrato(Security_Users? dbUser, Transaction_Contratos contrato, int? reestructuradoRespaldo, double? Cuota_Anterior, double? Cuota_Anterior_Cordobas, double? Monto_Anterior, double? Monto_Anterior_Cordobas, int? Plazo_Anterior, int? id_clasificacion_interes_anterior, double? interesPagado, double? moraPagado, double? abonoCapital, double? saldoRespaldo, List<Tbl_Cuotas> cuotasPendiente)
		{
			return new Factura_contrato()
			{
				numero_contrato = this.numero_contrato,
				cuotas_pactadas = contrato.Tbl_Cuotas.Count(),
				cuotas_pendientes = cuotasPendiente.Count(),
				saldo_anterior = saldoRespaldo,
				saldo_actual = contrato.saldo,
				abono_capital = abonoCapital,
				interes_pagado = interesPagado,
				mora_pagado = moraPagado,
				id_clasificacion_interes_anterior = id_clasificacion_interes_anterior,
				reestructurado_anterior = reestructuradoRespaldo,
				mora = this.mora_dolares,
				interes_demas_cargos_pagar = this.interes_demas_cargos_pagar_dolares,
				proximo_pago_pactado = cuotasPendiente.Count > 0 ? cuotasPendiente[0].fecha : null,
				//total_parciales = this.total_parciales,//todo preguntar a EMPRESA 
				tipo = null,
				tipo_cuenta = null,
				total = this.total_dolares,
				tasa_cambio = this.tasa_cambio,
				id_cliente = contrato.codigo_cliente,
				id_sucursal = dbUser?.Id_Sucursal,
				reestructuracion = this.reestructurar == true ? 1 : 0,
				perdida_de_documento = this.perdida_de_documento == true ? 1 : 0,
				total_pagado = this.total_apagar_dolares,
				cancel_with_perdida = this.cancelar == true && this.perdida_de_documento == true,
				Datos_Reestructuracion = this.reestructurar == true ? new Datos_Reestructuracion
				{
					Cuotas_reestructuradas = CuotasReestructuradas,
					Cuota_Anterior = Cuota_Anterior,
					Cuota_Anterior_Cordobas = Cuota_Anterior_Cordobas,
					Nuevo_Cuota = CuotasReestructuradas.FirstOrDefault()?.total,
					Nueva_Cuota_Cordobas = CuotasReestructuradas[0].total * tasa_cambio,

					Monto_Anterior = Monto_Anterior,
					Nuevo_Monto = contrato.saldo,
					Monto_Anterior_Cordobas = Monto_Anterior_Cordobas,
					Nuevo_Monto_Cordobas = contrato.saldo * tasa_cambio,
					Plazo_Anterior = Plazo_Anterior,
					Nuevo_Plazo = Convert.ToInt32(plazo)
				} : null,
				Solo_Interes_Mora = solo_interes_mora
			};
		}

		private double SoloPagoParcial(Transaction_Contratos contrato, double monto, List<Detalle_Factura_Recibo> DetallesFacturaRecibos, List<Tbl_Cuotas>? cuotasPendientes, Tbl_Cuotas? CuotaActual)
		{
			double montoPago = monto;
			EstadoAnteriorCuota estadoAnteriorCuotaActual = CloneCuota(CuotaActual);
			CuotaActual.fecha_pago = DateTime.Now;
			//VERIFICA MORA PENDIENTE
			if (monto >= CuotaActual.mora && CuotaActual.mora > 0)
			{
				monto -= CuotaActual.mora.GetValueOrDefault();
				CuotaActual.mora = 0;
			}
			else if (CuotaActual.mora > 0)
			{
				CuotaActual.mora -= monto;
				monto = 0;
			}
			//VERIFICA INTERES PENDIENTE
			if (monto >= CuotaActual.interes && CuotaActual.interes > 0)
			{
				monto -= CuotaActual.interes.GetValueOrDefault();
				CuotaActual.interes = 0;
			}
			else if (CuotaActual.interes > 0)
			{
				CuotaActual.interes -= monto;
				monto = 0;
			}
			//ABONA AL CAPITAL EL RESTANTE
			if (monto > 0 && contrato.saldo > 0)
			{
				monto = AbonoCapital(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
			}
			CuotaActual?.Update();
			DetallesFacturaRecibos.Add(new Detalle_Factura_Recibo()
			{
				id_cuota = CuotaActual!.id_cuota,
				total_cuota = montoPago,
				monto_pagado = montoPago,
				capital_restante = CuotaActual.capital_restante,
				concepto = $"Pago parcial de interes + mora de cuota correspondiente a la cuota {CuotaActual?.fecha?.ToString("dd-MM-yyyy")} del contrato No: " + this.numero_contrato,
				tasa_cambio = this.tasa_cambio,
				EstadoAnterior = estadoAnteriorCuotaActual,
				Tbl_Cuotas = CuotaActual
			});

			return monto;
		}

		private string? getConsecutivo(Security_Users? dbUser)
		{
			Datos_Configuracion config = new Datos_Configuracion { Id_Sucursal = dbUser?.Id_Sucursal }.FindConfig() ?? new Datos_Configuracion { Consecutivo = 0 };
			config.Consecutivo++;
			config.Update();
			return config.Consecutivo?.ToString("D9");
		}

		private string GetConcepto()
		{
			if (solo_interes_mora == true)
			{
				return "Pago de interés + mora de contrato No: " + this.numero_contrato?.ToString("D9");
			}
			if (solo_abono == true)
			{
				return "Pago de abono al capital de contrato No: " + this.numero_contrato?.ToString("D9");
			}
			if (reestructurar == true)
			{
				return "Pago de interés + mora + reestructuración de contrato No: " + this.numero_contrato?.ToString("D9");
			}
			if (cancelar == true)
			{
				return "Pago de Cancelación de contrato No: " + this.numero_contrato?.ToString("D9");
			}
			if (pago_parcial == true)
			{
				return "Pago parcial de contrato No: " + this.numero_contrato?.ToString("D9");
			}
			return "Pago de cuota contrato No: " + this.numero_contrato?.ToString("D9");
		}

		private double SoloInteresMora(Transaction_Contratos contrato, double monto,
		List<Detalle_Factura_Recibo> DetallesFacturaRecibos,
		List<Tbl_Cuotas>? cuotasPendientes,
		Tbl_Cuotas? CuotaActual)
		{
			EstadoAnteriorCuota estadoAnteriorCuotaActual = CloneCuota(CuotaActual);
			CuotaActual.fecha_pago = DateTime.Now;
			CuotaActual.pago_contado = monto;
			monto = 0;
			CuotaActual.Estado = Contratos_State.CANCELADO.ToString();
			if (cuotasPendientes == null)//si es solo un recibo de pago de interes mora el estado de las cuotas debe incluir a las cuotas con capital cancelado 
			{
				cuotasPendientes = contrato.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == EstadoEnum.PENDIENTE.ToString()
						|| c.Estado?.ToUpper() == Contratos_State.CAPITAL_CANCELADO.ToString()).ToList();
			}


			AgregarCuotaDetalle(CuotaActual, DetallesFacturaRecibos, estadoAnteriorCuotaActual,
			$"Pago de interes + mora de cuota correspondiente a la cuota {CuotaActual?.fecha?.ToString("dd-MM-yyyy")} del contrato No: " + this.numero_contrato);
			CuotaActual?.Update();

			Tbl_Cuotas? CuotaFinal = cuotasPendientes.First();//DADO QUE LAS CUOTAS VIENEN EN ORDEN DESC SE TOMA LA PRIMERA
			EstadoAnteriorCuota estadoAnteriorCuotaFinal = CloneCuota(CuotaFinal);
			CuotaFinal.abono_capital += CuotaActual?.abono_capital;
			CuotaFinal.interes = CuotaFinal.abono_capital * contrato.tasas_interes;
			CuotaFinal.total = CuotaFinal.interes + CuotaFinal.abono_capital;
			CuotaFinal.Estado = EstadoEnum.PENDIENTE.ToString();



			Tbl_Cuotas? CuotaAnterior = CuotaActual;
			cuotasPendientes?.OrderBy(c => c.id_cuota).ToList()?.ForEach(cuota =>
			{
				if (cuota.id_cuota == CuotaActual?.id_cuota) return;
				if (cuota.id_cuota == CuotaFinal?.id_cuota) return;
				EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
				cuota.abono_capital = CuotaAnterior?.abono_capital;
				cuota.interes = CuotaAnterior?.interes;
				cuota.pago_contado = 0;
				cuota.Estado = EstadoEnum.PENDIENTE.ToString();
				AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
					$"Actualización de datos de pago de la cuota {CuotaActual?.fecha?.ToString("dd-MM-yyyy")} del contrato No: "
					+ this.numero_contrato);
				cuota.Update();
			});
			//AGREGO EL DETALLE DE LA MODIFICACION
			AgregarCuotaDetalle(CuotaFinal, DetallesFacturaRecibos, estadoAnteriorCuotaFinal,
					$"Actualización de datos de pago de la cuota {CuotaFinal?.fecha?.ToString("dd-MM-yyyy")} del contrato No: "
					+ this.numero_contrato);

			CuotaFinal?.Update();
			return monto;
		}

		private double AbonoCapital(Transaction_Contratos? contrato,
		double monto,
		List<Detalle_Factura_Recibo> DetallesFacturaRecibos,
		List<Tbl_Cuotas>? cuotasPendientes,
		Tbl_Cuotas? CuotaActual)
		{
			if (monto > 0)
			{
				//UpdateCuotas(contrato);
				cuotasPendientes?.ForEach(cuota =>
				{
					if (cuota.id_cuota == CuotaActual?.id_cuota) return;
					if (monto <= 0) return;
					EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
					cuota.fecha_pago = DateTime.Now;
					if (monto >= cuota.abono_capital && monto > 0)
					{
						cuota.pago_contado = cuota.abono_capital;
						cuota.abono_capital = 0;
						cuota.total = 0;
						monto -= cuota.pago_contado.GetValueOrDefault();
						cuota.Estado = Contratos_State.CAPITAL_CANCELADO.ToString();//se usa cuando se cancela una cuota por via de pago adicional de capital 
						cuota.interes = 0;
					}
					else
					{
						cuota.pago_contado = monto;
						cuota.abono_capital += -monto;
						monto = 0;
						cuota.interes = cuota.abono_capital * contrato?.tasas_interes;
						cuota.total = cuota.interes + cuota.abono_capital;
					}
					AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
						"Abono al capital del contrato No: " + this.numero_contrato);
					cuota.Update();
				});
			}

			return monto;
		}

		private void AgregarCuotaDetalle(Tbl_Cuotas cuota,
		List<Detalle_Factura_Recibo> DetallesFacturaRecibos,
		EstadoAnteriorCuota estadoAnterior,
		string mensaje)
		{
			DetallesFacturaRecibos.Add(new Detalle_Factura_Recibo()
			{
				id_cuota = cuota.id_cuota,
				//total_cuota = cuota.pago_contado,
				//monto_pagado = cuota.pago_contado,
				//capital_restante = cuota.capital_restante,
				concepto = mensaje,
				tasa_cambio = this.tasa_cambio,
				EstadoAnterior = estadoAnterior,
				Tbl_Cuotas = cuota
			});
		}

		private double CancelarCuotaActual(double monto, Tbl_Cuotas CuotaActual, List<Detalle_Factura_Recibo> detallesFacturaRecibos)
		{
			EstadoAnteriorCuota estadoAnterior = CloneCuota(CuotaActual);
			CuotaActual.fecha_pago = DateTime.Now;
			if (monto >= CuotaActual.total && monto > 0)
			{
				CuotaActual.pago_contado = CuotaActual.total;
				monto -= (double)CuotaActual.total;
				CuotaActual.Estado = Contratos_State.CANCELADO.ToString();
			}
			else
			{
				CuotaActual.pago_contado = monto;
				monto = 0;
			}

			AgregarCuotaDetalle(CuotaActual, detallesFacturaRecibos, estadoAnterior,
			"Pago de cuota del contrato No: " + this.numero_contrato);
			CuotaActual.Update();
			return monto;
		}

		private EstadoAnteriorCuota CloneCuota(Tbl_Cuotas CuotaActual)
		{
			return new EstadoAnteriorCuota()
			{
				fecha_pago = CuotaActual.fecha_pago,
				pago_contado = CuotaActual.pago_contado,
				Estado = CuotaActual.Estado,
				total = CuotaActual.total,
				interes = CuotaActual.interes,
				abono_capital = CuotaActual.abono_capital
			};
		}

		private double CalcularGastosAdicionales(Transaction_Contratos? contrato, double monto, List<Detalle_Factura_Recibo>? DetallesFacturaRecibos)
		{
			if (this.perdida_de_documento == true)
			{
				monto = monto - 1;
				DetallesFacturaRecibos?.Add(
					new Detalle_Factura_Recibo()
					{
						total_cuota = 1,
						monto_pagado = 1,
						concepto = "Pago por tramite de perdida de documentos",
						tasa_cambio = this.tasa_cambio
					}
				);
			}
			if (this.reestructurar == true)
			{
				monto = monto - 1;
				DetallesFacturaRecibos?.Add(
					new Detalle_Factura_Recibo()
					{
						total_cuota = 1,
						monto_pagado = 1,
						capital_restante = 0,
						concepto = "Pago por tramite de reestructuración de cuota",
						tasa_cambio = this.tasa_cambio
					}
				);
			}
			return monto;
		}
		private double CalcularReestructurar(Transaction_Contratos? contrato, double monto, List<Detalle_Factura_Recibo>? DetallesFacturaRecibos)
		{
			CuotasReestructuradas = contrato?.Reestructurar(this.reestructurar_value);
			return monto;
		}

		public object? AnularFactura(string Identify)
		{
			try
			{
				var (User, dbUser) = Business.Security_Users.GetUserData(Identify);
				var factura = new Transaccion_Factura() { id_factura = this.id_recibo }.Find<Transaccion_Factura>();
				var contrato = new Transaction_Contratos() { numero_contrato = factura?.Factura_contrato?.numero_contrato }.Find<Transaction_Contratos>();
				var FacturasActivas = new Transaccion_Factura()
				{
					numero_contrato = factura?.Factura_contrato?.numero_contrato
				}.Where<Transaccion_Factura>(
					FilterData.Equal("estado", EstadoEnum.ACTIVO),
					FilterData.Greater("id_factura", this.id_recibo)
				);
				if (FacturasActivas.Count > 0)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Recibo no se puede anular, debido a que hay recibos posteriores activos"
					};
				}

				if (factura == null)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Recibo no encontrado"
					};
				}
				if (factura.estado != EstadoEnum.ACTIVO.ToString())
				{
					return new ResponseService()
					{
						status = 400,
						message = "Recibo no se encuentra activo"
					};
				}
				factura.estado = EstadoEnum.ANULADO.ToString();
				factura.Motivo_Anulacion = motivo_anulacion;
				BeginGlobalTransaction();
				factura.Update();

				if (contrato != null)
				{
					contrato.saldo = factura?.Factura_contrato?.saldo_anterior;
					contrato.estado = Contratos_State.ACTIVO;
					contrato.reestructurado = factura?.Factura_contrato?.reestructurado_anterior;
					var reestructuracionData = factura?.Factura_contrato?.Datos_Reestructuracion;
					if (reestructuracionData != null)
					{
						contrato.cuotafija = reestructuracionData.Cuota_Anterior_Cordobas;
						contrato.cuotafija_dolares = reestructuracionData.Cuota_Anterior;
						contrato.plazo = reestructuracionData.Plazo_Anterior;
						contrato.monto = reestructuracionData.Monto_Anterior;

						reestructuracionData.Cuotas_reestructuradas?.ForEach(c =>
						{
							c.Delete();
						});
					}
					contrato.Update();
				}

				factura?.Detalle_Factura_Recibo.OrderBy(c => c.id_cuota).ToList().ForEach(detalle =>
				{
					Tbl_Cuotas? cuota = detalle?.Tbl_Cuotas;
					if (cuota != null)
					{
						cuota.fecha_pago = detalle?.EstadoAnterior?.fecha_pago;
						cuota.pago_contado = detalle?.EstadoAnterior?.pago_contado;
						cuota.Estado = detalle?.EstadoAnterior?.Estado;
						cuota.total = detalle?.EstadoAnterior?.total;
						cuota.interes = detalle?.EstadoAnterior?.interes;
						cuota.abono_capital = detalle?.EstadoAnterior?.abono_capital;
						cuota.Update();
					}
				});

				if (contrato?.Catalogo_Clientes?.id_clasificacion_interes != factura?.Factura_contrato?.id_clasificacion_interes_anterior)
				{
					contrato!.Catalogo_Clientes!.id_clasificacion_interes = factura?.Factura_contrato?.id_clasificacion_interes_anterior;
					contrato.Catalogo_Clientes.Update();
				}

				var cuentaOrigen = Catalogo_Cuentas.GetCuentaIngresoRecibos(dbUser);
				var cuentaDestino = Catalogo_Cuentas.GetCuentaEgresoRecibos(dbUser);

				if (cuentaDestino == null || cuentaOrigen == null)
				{
					RollBackGlobalTransaction();
					return new ResponseService()
					{
						status = 400,
						message = "Cuentas para anulación de factura no configuradas correctamente"
					};
				}
				contrato?.EstablecerComoVencido();
				var detalle = contrato != null
					? $"Anulación de cuota No: <strong>{factura?.no_factura}</strong> del contrato No:  <strong>${factura?.Factura_contrato?.numero_contrato}</strong>"
					: "Anulación de recibo: " + factura?.no_factura;
				ResponseService response = new Movimientos_Cuentas
				{
					Catalogo_Cuentas_Destino = cuentaDestino,
					Catalogo_Cuentas_Origen = cuentaOrigen,
					concepto = detalle,
					descripcion = detalle,
					moneda = factura?.Moneda?.ToUpper(),
					monto = factura?.Moneda?.ToUpper() == "DOLARES" ? factura.total : factura?.total_cordobas,
					tasa_cambio = factura?.tasa_cambio,
					//tasa_cambio_compra = this.tasa_cambio_compra,
					is_transaction = true,
					Tipo_Movimiento = TipoMovimiento.DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_RECIBO
				}.SaveMovimiento(dbUser);

				if (response.status == 400)
				{
					RollBackGlobalTransaction();
					return response;
				}
				CommitGlobalTransaction();

				return new ResponseService()
				{
					status = 200,
					message = "Recibo anulado correctamente",
					body = factura
				};

			}
			catch (System.Exception ex)
			{
				RollBackGlobalTransaction();
				return new ResponseService()
				{
					message = "Error:" + ex.ToString(),
					status = 400
				};
			}
		}

		public double? GetPago(Transaction_Contratos contrato)
		{
			double? monto = contrato.Valoracion_empeño_dolares;
			int? cuotas = contrato.plazo;
			double? tasa = contrato.tasas_interes;
			double? payment = tasa * Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) * monto
			/ (Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) - 1);
			return payment;
		}
		public double? UpdatePago(Transaction_Contratos contrato, int plazo, double? tasaActual)
		{
			double? monto = contrato.saldo;
			int? cuotas = plazo;
			double? tasa = contrato.tasas_interes;
			double? payment = tasa * Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) * monto
			/ (Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) - 1);
			return payment;
		}

		public double InteresCorriente(Tbl_Cuotas cuota, Transaction_Contratos Contrato)
		{
			if (solo_abono == true)
			{
				return 0;
			}
			var cuotasPendientes = Contrato.Tbl_Cuotas
				.Where(c => c.Estado == "PENDIENTE").ToList().Count;
			var cuotasPagadas = Contrato.Tbl_Cuotas
				.Where(c => c.Estado == "CANCELADO").ToList().Count;

			bool fechaPagoMayorFechaActual = cuota?.fecha > DateTime.Now;

			bool cancelarAntesDelPrimerMes = cuotasPagadas == 0
						&& fechaPagoMayorFechaActual
						&& (this.cancelar == true || cuotasPendientes == 1);

			if (cuota != null && ((cancelarAntesDelPrimerMes == true)
				|| (this.reestructurar == true && fechaPagoMayorFechaActual)
				|| (cuotasPendientes > 1 && this.cancelar != true && this.reestructurar != true)))
			{
				return cuota.interes.GetValueOrDefault();
			}


			double saldo_actual_dolares = Contrato.saldo.GetValueOrDefault();
			DateTime fecha = cuota?.fecha.GetValueOrDefault() ?? DateTime.MinValue;
			DateTime fechaActual = DateTime.Now;

			TimeSpan diferencia = fechaActual - fecha;
			double diasDeDiferencia = (int)Math.Floor(diferencia.TotalDays);
			double porcentajeInteres = Contrato.tasas_interes.GetValueOrDefault();

			TimeSpan? diferenciaEntreFechaCreacion = cuota?.fecha.GetValueOrDefault() - fecha;
			double diasDelMes = (diferenciaEntreFechaCreacion.GetValueOrDefault().TotalDays >= 0)
			? diferenciaEntreFechaCreacion.GetValueOrDefault().TotalDays : 0;
			if (diasDelMes <= 0)
			{
				return 0;
			}

			double interesCorriente = saldo_actual_dolares
				* (double)(porcentajeInteres / 30) * diasDeDiferencia + cuota!.interes.GetValueOrDefault();

			return interesCorriente;
		}

		public void CalculateMora()
		{
			var cuotas = new Tbl_Cuotas().Where<Tbl_Cuotas>(
				FilterData.Equal("Estado", EstadoEnum.PENDIENTE),
				FilterData.Less("fecha", DateTime.Now)
			);
			foreach (var cuota in cuotas)
			{
				var montoMora = cuota.total * ((cuota.Transaction_Contratos?.mora / 100) ?? 0.005) * 1;//como el cronjob es diario se va cargando mora cada dia
				if (montoMora > 0)
				{
					cuota.mora += montoMora;
					cuota.Update();
				}
			}
		}
	}
}