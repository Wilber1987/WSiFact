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
		public int? Id_recibo { get; set; }
		public int? Consecutivo { get; set; }
		public bool? Temporal { get; set; }
		public int? Numero_contrato { get; set; }
		public double? Monto { get; set; }
		public double? Saldo_actual_cordobas { get; set; }
		public double? Saldo_actual_dolares { get; set; }
		public double? Plazo { get; set; }
		public double? Interes_cargos { get; set; }
		public double? Tasa_cambio { get; set; }
		public double? Tasa_cambio_compra { get; set; }
		public double? Interes_demas_cargos_pagar_cordobas { get; set; }
		public double? Interes_demas_cargos_pagar_dolares { get; set; }
		public double? Abono_capital_cordobas { get; set; }
		public double? Abono_capital_dolares { get; set; }
		public double? Cuota_pagar_cordobas { get; set; }
		public double? Cuota_pagar_dolares { get; set; }
		public double? Mora_cordobas { get; set; }
		public double? Mora_dolares { get; set; }
		public double? Mora_interes_cordobas { get; set; }
		public double? Mora_interes_dolares { get; set; }
		public double? Total_cordobas { get; set; }
		public double? Total_dolares { get; set; }
		public double? Total_parciales { get; set; }
		public DateTime? Fecha_roc { get; set; }
		public double? Paga_cordobas { get; set; }
		public double? Paga_dolares { get; set; }
		public bool? Solo_abono { get; set; }
		public bool? Solo_interes_mora { get; set; }
		public bool? Cancelar { get; set; }
		public bool? Reestructurar { get; set; }
		public double? Reestructurar_value { get; set; }
		public double? Total_apagar_dolares { get; set; }
		public string? Moneda { get; set; }
		public string? Motivo_anulacion { get; set; }
		public bool? Perdida_de_documento { get; set; }
		public double? Monto_dolares { get; set; }
		public double? Monto_cordobas { get; set; }
		public double? Cambio_dolares { get; set; }
		public double? Cambio_cordobas { get; set; }
		public bool? Is_cambio_cordobas { get; set; }
		public bool? Pago_parcial { get; set; }
		public List<Tbl_Cuotas>? CuotasReestructuradas { get; private set; }
		#endregion

		public ResponseService SaveRecibos(string Identify)
		{
			try
			{
				var (user, dbUser) = Business.Security_Users.GetUserData(Identify);
				var contrato = new Transaction_Contratos() { Numero_contrato = this.Numero_contrato }.Find<Transaction_Contratos>();
				var sucursal = new Catalogo_Sucursales() { Id_Sucursal = dbUser?.Id_Sucursal }.Find<Catalogo_Sucursales>();
				if (contrato == null)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Nº contrato no encontrado"
					};
				}
				if (this.Cancelar.HasValue && this.Cancelar.Value
					&& Math.Round((Decimal)this.Paga_dolares.GetValueOrDefault(), 3) < Math.Round((Decimal)contrato.Saldo.GetValueOrDefault(), 3))
				{
					return new ResponseService()
					{
						status = 400,
						message = "Para cancelar es necesario un monto de " + contrato.Saldo
					};
				}
				double monto = this.Paga_dolares.GetValueOrDefault();
				BeginGlobalTransaction();

				var DetallesFacturaRecibos = new List<Detalle_Factura_Recibo>();
				//SE VALIDA SI AL MONTO SE LE VA A DEBITAR LA REESTRUCTURACION Y LA PERDIDA DE DOCUMENTOS                
				monto = CalcularGastosAdicionales(contrato, monto, DetallesFacturaRecibos);
				//respaldos
				var reestructuradoRespaldo = contrato.Reestructurado;
				var Cuota_Anterior = contrato.Cuotafija_dolares;
				var Cuota_Anterior_Cordobas = contrato.Cuotafija_dolares;
				var Monto_Anterior = contrato.Monto;
				var Monto_Anterior_Cordobas = contrato.Valoracion_empeño_cordobas;
				var Plazo_Anterior = contrato.Plazo;
				var id_clasificacion_interes_anterior = contrato.Catalogo_Clientes?.Id_clasificacion_interes;

				var cuotasPendientes = contrato.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == EstadoEnum.PENDIENTE.ToString()).ToList();


				Tbl_Cuotas CuotaActual = cuotasPendientes.Last();
				double? mora = cuotasPendientes?.Select(c => c.Mora).ToList().Sum();
				double? saldo_pendiente = contrato.Saldo;
				double? interesCorriente = InteresCorriente(CuotaActual, contrato);
				double? perdida_de_documento_monto = this.Perdida_de_documento == true ? 1 : 0;
				double? reestructuracion_monto = Reestructurar_value ?? 0;
				double? total_capital_restante = mora
					+ saldo_pendiente
					+ interesCorriente
					+ perdida_de_documento_monto
					+ reestructuracion_monto;

				double? interesPagado = monto > (mora + interesCorriente) ? interesCorriente
					: monto > mora ? monto - mora : 0;
				double? moraPagado = monto > mora ? mora : mora - monto;

				double? abonoCapital = monto > (mora + interesCorriente) ? (monto - mora - interesCorriente) : 0;
				double? saldoRespaldo = contrato.Saldo;
				contrato.Saldo -= abonoCapital;
				if (contrato.Saldo <= 0.5)
				{
					contrato.Saldo = 0;
					contrato.Cancelar(dbUser);

					var contartosActivos = new Transaction_Contratos { Codigo_cliente = contrato.Codigo_cliente }.Where<Transaction_Contratos>(
						FilterData.Equal("estado", Contratos_State.ACTIVO),
						FilterData.Distinc("numero_contrato", contrato.Numero_contrato)
					);
					if (contartosActivos.Count == 0)
					{
						contrato.Catalogo_Clientes?.ActualizarClasificacionInteres();
					}
				}

				if (this.Cancelar == true && contrato.Saldo == 0)
				{
					contrato.Saldo = 0;
					contrato.Cancelar(dbUser);
					cuotasPendientes?.ForEach(cuota =>
					{
						EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
						cuota.Pago_contado = cuota.Abono_capital;
						AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
						"Pago de completo de cuota, en la cancelación de contrato No: " + this.Numero_contrato);
						cuota.Estado = Contratos_State.CANCELADO.ToString();
					});
				}
				else if (Solo_interes_mora == true)//PAGA SOLO INTERES + MORA
				{
					monto = SoloInteresMora(contrato, monto, DetallesFacturaRecibos, null, CuotaActual);
				}
				else if (Pago_parcial == true)//PAGA SOLO INTERES + MORA
				{
					monto = SoloPagoParcial(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
				}
				else if (Solo_abono == true) //PAGA ABONO AL CAPITAL
				{
					monto = AbonoCapital(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, null);
				}
				else if (Reestructurar == true) //PAGA ABONO AL CAPITAL
				{
					monto = SoloInteresMora(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
					if (abonoCapital > 0)
					{
						DetallesFacturaRecibos?.Add(new Detalle_Factura_Recibo()
						{
							Total_cuota = abonoCapital,
							Monto_pagado = abonoCapital,
							Capital_restante = 0,
							Concepto = "Abono al capital en la reestructuración",
							Tasa_cambio = this.Tasa_cambio
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
					Tipo = "RECIBO", //TODO ENUM
					Estado = EstadoEnum.ACTIVO.ToString(),
					Concepto = GetConcepto(),
					Tasa_cambio = this.Tasa_cambio,
					Total = this.Paga_dolares,
					Id_cliente = contrato.Codigo_cliente,
					Id_sucursal = sucursal?.Id_Sucursal,
					Fecha = DateTime.Now,
					Moneda = Moneda,
					Consecutivo = Temporal != true ? getConsecutivo(dbUser) : null,
					Total_cordobas = Paga_cordobas,
					Id_usuario = user.UserId,
					Factura_contrato = BuildFacturaContrato(dbUser, contrato, reestructuradoRespaldo, Cuota_Anterior, Cuota_Anterior_Cordobas, Monto_Anterior, Monto_Anterior_Cordobas, Plazo_Anterior, id_clasificacion_interes_anterior, interesPagado, moraPagado, abonoCapital, saldoRespaldo, cuotasPendiente),
					Detalle_Factura_Recibo = DetallesFacturaRecibos
				};
				if (Temporal != true)
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
						Concepto = "Pago de cuota, contrato No: " + this.Numero_contrato,
						Descripcion = "Pago de cuota, contrato No: " + this.Numero_contrato,
						Moneda = this.Moneda?.ToUpper(),
						Monto = this.Moneda?.ToUpper() == "DOLARES" ? this.Paga_dolares : this.Paga_cordobas,
						Tasa_cambio = this.Tasa_cambio,
						//tasa_cambio_compra = this.tasa_cambio_compra,
						Is_transaction = true,
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
					message = Temporal == true ? "Factura temporal" : "Factura registrada correctamente",
					body = Temporal == true ? new RecibosTemplateServices().GenerateReciboHtmlTemplate(factura) : factura
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
				numero_contrato = this.Numero_contrato,
				cuotas_pactadas = contrato.Tbl_Cuotas.Count(),
				cuotas_pendientes = cuotasPendiente.Count(),
				saldo_anterior = saldoRespaldo,
				saldo_actual = contrato.Saldo,
				abono_capital = abonoCapital,
				interes_pagado = interesPagado,
				mora_pagado = moraPagado,
				id_clasificacion_interes_anterior = id_clasificacion_interes_anterior,
				reestructurado_anterior = reestructuradoRespaldo,
				mora = this.Mora_dolares,
				interes_demas_cargos_pagar = this.Interes_demas_cargos_pagar_dolares,
				proximo_pago_pactado = cuotasPendiente.Count > 0 ? cuotasPendiente[0].Fecha : null,
				//total_parciales = this.total_parciales,//todo preguntar a EMPRESA 
				tipo = null,
				tipo_cuenta = null,
				total = this.Total_dolares,
				tasa_cambio = this.Tasa_cambio,
				id_cliente = contrato.Codigo_cliente,
				id_sucursal = dbUser?.Id_Sucursal,
				reestructuracion = this.Reestructurar == true ? 1 : 0,
				perdida_de_documento = this.Perdida_de_documento == true ? 1 : 0,
				total_pagado = this.Total_apagar_dolares,
				cancel_with_perdida = this.Cancelar == true && this.Perdida_de_documento == true,
				Datos_Reestructuracion = this.Reestructurar == true ? new Datos_Reestructuracion
				{
					Cuotas_reestructuradas = CuotasReestructuradas,
					Cuota_Anterior = Cuota_Anterior,
					Cuota_Anterior_Cordobas = Cuota_Anterior_Cordobas,
					Nuevo_Cuota = CuotasReestructuradas.FirstOrDefault()?.Total,
					Nueva_Cuota_Cordobas = CuotasReestructuradas[0].Total * Tasa_cambio,

					Monto_Anterior = Monto_Anterior,
					Nuevo_Monto = contrato.Saldo,
					Monto_Anterior_Cordobas = Monto_Anterior_Cordobas,
					Nuevo_Monto_Cordobas = contrato.Saldo * Tasa_cambio,
					Plazo_Anterior = Plazo_Anterior,
					Nuevo_Plazo = Convert.ToInt32(Plazo)
				} : null,
				Solo_Interes_Mora = Solo_interes_mora
			};
		}

		private double SoloPagoParcial(Transaction_Contratos contrato, double monto, List<Detalle_Factura_Recibo> DetallesFacturaRecibos, List<Tbl_Cuotas>? cuotasPendientes, Tbl_Cuotas? CuotaActual)
		{
			double montoPago = monto;
			EstadoAnteriorCuota estadoAnteriorCuotaActual = CloneCuota(CuotaActual);
			CuotaActual.Fecha_pago = DateTime.Now;
			//VERIFICA MORA PENDIENTE
			if (monto >= CuotaActual.Mora && CuotaActual.Mora > 0)
			{
				monto -= CuotaActual.Mora.GetValueOrDefault();
				CuotaActual.Mora = 0;
			}
			else if (CuotaActual.Mora > 0)
			{
				CuotaActual.Mora -= monto;
				monto = 0;
			}
			//VERIFICA INTERES PENDIENTE
			if (monto >= CuotaActual.Interes && CuotaActual.Interes > 0)
			{
				monto -= CuotaActual.Interes.GetValueOrDefault();
				CuotaActual.Interes = 0;
			}
			else if (CuotaActual.Interes > 0)
			{
				CuotaActual.Interes -= monto;
				monto = 0;
			}
			//ABONA AL CAPITAL EL RESTANTE
			if (monto > 0 && contrato.Saldo > 0)
			{
				monto = AbonoCapital(contrato, monto, DetallesFacturaRecibos, cuotasPendientes, CuotaActual);
			}
			CuotaActual?.Update();
			DetallesFacturaRecibos.Add(new Detalle_Factura_Recibo()
			{
				Id_cuota = CuotaActual!.Id_cuota,
				Total_cuota = montoPago,
				Monto_pagado = montoPago,
				Capital_restante = CuotaActual.Capital_restante,
				Concepto = $"Pago parcial de interes + mora de cuota correspondiente a la cuota {CuotaActual?.Fecha?.ToString("dd-MM-yyyy")} del contrato No: " + this.Numero_contrato,
				Tasa_cambio = this.Tasa_cambio,
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
			if (Solo_interes_mora == true)
			{
				return "Pago de interés + mora de contrato No: " + this.Numero_contrato?.ToString("D9");
			}
			if (Solo_abono == true)
			{
				return "Pago de abono al capital de contrato No: " + this.Numero_contrato?.ToString("D9");
			}
			if (Reestructurar == true)
			{
				return "Pago de interés + mora + reestructuración de contrato No: " + this.Numero_contrato?.ToString("D9");
			}
			if (Cancelar == true)
			{
				return "Pago de Cancelación de contrato No: " + this.Numero_contrato?.ToString("D9");
			}
			if (Pago_parcial == true)
			{
				return "Pago parcial de contrato No: " + this.Numero_contrato?.ToString("D9");
			}
			return "Pago de cuota contrato No: " + this.Numero_contrato?.ToString("D9");
		}

		private double SoloInteresMora(Transaction_Contratos contrato, double monto,
		List<Detalle_Factura_Recibo> DetallesFacturaRecibos,
		List<Tbl_Cuotas>? cuotasPendientes,
		Tbl_Cuotas? CuotaActual)
		{
			EstadoAnteriorCuota estadoAnteriorCuotaActual = CloneCuota(CuotaActual);
			CuotaActual.Fecha_pago = DateTime.Now;
			CuotaActual.Pago_contado = monto;
			monto = 0;
			CuotaActual.Estado = Contratos_State.CANCELADO.ToString();
			if (cuotasPendientes == null)//si es solo un recibo de pago de interes mora el estado de las cuotas debe incluir a las cuotas con capital cancelado 
			{
				cuotasPendientes = contrato.Tbl_Cuotas.Where(c => c.Estado?.ToUpper() == EstadoEnum.PENDIENTE.ToString()
						|| c.Estado?.ToUpper() == Contratos_State.CAPITAL_CANCELADO.ToString()).ToList();
			}


			AgregarCuotaDetalle(CuotaActual, DetallesFacturaRecibos, estadoAnteriorCuotaActual,
			$"Pago de interes + mora de cuota correspondiente a la cuota {CuotaActual?.Fecha?.ToString("dd-MM-yyyy")} del contrato No: " + this.Numero_contrato);
			CuotaActual?.Update();

			Tbl_Cuotas? CuotaFinal = cuotasPendientes.First();//DADO QUE LAS CUOTAS VIENEN EN ORDEN DESC SE TOMA LA PRIMERA
			EstadoAnteriorCuota estadoAnteriorCuotaFinal = CloneCuota(CuotaFinal);
			CuotaFinal.Abono_capital += CuotaActual?.Abono_capital;
			CuotaFinal.Interes = CuotaFinal.Abono_capital * contrato.Tasas_interes;
			CuotaFinal.Total = CuotaFinal.Interes + CuotaFinal.Abono_capital;
			CuotaFinal.Estado = EstadoEnum.PENDIENTE.ToString();



			Tbl_Cuotas? CuotaAnterior = CuotaActual;
			cuotasPendientes?.OrderBy(c => c.Id_cuota).ToList()?.ForEach(cuota =>
			{
				if (cuota.Id_cuota == CuotaActual?.Id_cuota) return;
				if (cuota.Id_cuota == CuotaFinal?.Id_cuota) return;
				EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
				cuota.Abono_capital = CuotaAnterior?.Abono_capital;
				cuota.Interes = CuotaAnterior?.Interes;
				cuota.Pago_contado = 0;
				cuota.Estado = EstadoEnum.PENDIENTE.ToString();
				AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
					$"Actualización de datos de pago de la cuota {CuotaActual?.Fecha?.ToString("dd-MM-yyyy")} del contrato No: "
					+ this.Numero_contrato);
				cuota.Update();
			});
			//AGREGO EL DETALLE DE LA MODIFICACION
			AgregarCuotaDetalle(CuotaFinal, DetallesFacturaRecibos, estadoAnteriorCuotaFinal,
					$"Actualización de datos de pago de la cuota {CuotaFinal?.Fecha?.ToString("dd-MM-yyyy")} del contrato No: "
					+ this.Numero_contrato);

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
					if (cuota.Id_cuota == CuotaActual?.Id_cuota) return;
					if (monto <= 0) return;
					EstadoAnteriorCuota estadoAnterior = CloneCuota(cuota);
					cuota.Fecha_pago = DateTime.Now;
					if (monto >= cuota.Abono_capital && monto > 0)
					{
						cuota.Pago_contado = cuota.Abono_capital;
						cuota.Abono_capital = 0;
						cuota.Total = 0;
						monto -= cuota.Pago_contado.GetValueOrDefault();
						cuota.Estado = Contratos_State.CAPITAL_CANCELADO.ToString();//se usa cuando se cancela una cuota por via de pago adicional de capital 
						cuota.Interes = 0;
					}
					else
					{
						cuota.Pago_contado = monto;
						cuota.Abono_capital += -monto;
						monto = 0;
						cuota.Interes = cuota.Abono_capital * contrato?.Tasas_interes;
						cuota.Total = cuota.Interes + cuota.Abono_capital;
					}
					AgregarCuotaDetalle(cuota, DetallesFacturaRecibos, estadoAnterior,
						"Abono al capital del contrato No: " + this.Numero_contrato);
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
				Id_cuota = cuota.Id_cuota,
				//total_cuota = cuota.pago_contado,
				//monto_pagado = cuota.pago_contado,
				//capital_restante = cuota.capital_restante,
				Concepto = mensaje,
				Tasa_cambio = this.Tasa_cambio,
				EstadoAnterior = estadoAnterior,
				Tbl_Cuotas = cuota
			});
		}

		private double CancelarCuotaActual(double monto, Tbl_Cuotas CuotaActual, List<Detalle_Factura_Recibo> detallesFacturaRecibos)
		{
			EstadoAnteriorCuota estadoAnterior = CloneCuota(CuotaActual);
			CuotaActual.Fecha_pago = DateTime.Now;
			if (monto >= CuotaActual.Total && monto > 0)
			{
				CuotaActual.Pago_contado = CuotaActual.Total;
				monto -= (double)CuotaActual.Total;
				CuotaActual.Estado = Contratos_State.CANCELADO.ToString();
			}
			else
			{
				CuotaActual.Pago_contado = monto;
				monto = 0;
			}

			AgregarCuotaDetalle(CuotaActual, detallesFacturaRecibos, estadoAnterior,
			"Pago de cuota del contrato No: " + this.Numero_contrato);
			CuotaActual.Update();
			return monto;
		}

		private EstadoAnteriorCuota CloneCuota(Tbl_Cuotas CuotaActual)
		{
			return new EstadoAnteriorCuota()
			{
				fecha_pago = CuotaActual.Fecha_pago,
				pago_contado = CuotaActual.Pago_contado,
				Estado = CuotaActual.Estado,
				total = CuotaActual.Total,
				interes = CuotaActual.Interes,
				abono_capital = CuotaActual.Abono_capital
			};
		}

		private double CalcularGastosAdicionales(Transaction_Contratos? contrato, double monto, List<Detalle_Factura_Recibo>? DetallesFacturaRecibos)
		{
			if (this.Perdida_de_documento == true)
			{
				monto = monto - 1;
				DetallesFacturaRecibos?.Add(
					new Detalle_Factura_Recibo()
					{
						Total_cuota = 1,
						Monto_pagado = 1,
						Concepto = "Pago por tramite de perdida de documentos",
						Tasa_cambio = this.Tasa_cambio
					}
				);
			}
			if (this.Reestructurar == true)
			{
				monto = monto - 1;
				DetallesFacturaRecibos?.Add(
					new Detalle_Factura_Recibo()
					{
						Total_cuota = 1,
						Monto_pagado = 1,
						Capital_restante = 0,
						Concepto = "Pago por tramite de reestructuración de cuota",
						Tasa_cambio = this.Tasa_cambio
					}
				);
			}
			return monto;
		}
		private double CalcularReestructurar(Transaction_Contratos? contrato, double monto, List<Detalle_Factura_Recibo>? DetallesFacturaRecibos)
		{
			CuotasReestructuradas = contrato?.Reestructurar(this.Reestructurar_value);
			return monto;
		}

		public object? AnularFactura(string Identify)
		{
			try
			{
				var (User, dbUser) = Business.Security_Users.GetUserData(Identify);
				var factura = new Transaccion_Factura() { Id_factura = this.Id_recibo }.Find<Transaccion_Factura>();
				var contrato = new Transaction_Contratos() { Numero_contrato = factura?.Factura_contrato?.numero_contrato }.Find<Transaction_Contratos>();
				var FacturasActivas = new Transaccion_Factura()
				{
					Numero_contrato = factura?.Factura_contrato?.numero_contrato
				}.Where<Transaccion_Factura>(
					FilterData.Equal("estado", EstadoEnum.ACTIVO),
					FilterData.Greater("id_factura", this.Id_recibo)
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
				if (factura.Estado != EstadoEnum.ACTIVO.ToString())
				{
					return new ResponseService()
					{
						status = 400,
						message = "Recibo no se encuentra activo"
					};
				}
				factura.Estado = EstadoEnum.ANULADO.ToString();
				factura.Motivo_Anulacion = Motivo_anulacion;
				BeginGlobalTransaction();
				factura.Update();

				if (contrato != null)
				{
					contrato.Saldo = factura?.Factura_contrato?.saldo_anterior;
					contrato.Estado = Contratos_State.ACTIVO;
					contrato.Reestructurado = factura?.Factura_contrato?.reestructurado_anterior;
					var reestructuracionData = factura?.Factura_contrato?.Datos_Reestructuracion;
					if (reestructuracionData != null)
					{
						contrato.Cuotafija = reestructuracionData.Cuota_Anterior_Cordobas;
						contrato.Cuotafija_dolares = reestructuracionData.Cuota_Anterior;
						contrato.Plazo = reestructuracionData.Plazo_Anterior;
						contrato.Monto = reestructuracionData.Monto_Anterior;

						reestructuracionData.Cuotas_reestructuradas?.ForEach(c =>
						{
							c.Delete();
						});
					}
					contrato.Update();
				}

				factura?.Detalle_Factura_Recibo.OrderBy(c => c.Id_cuota).ToList().ForEach(detalle =>
				{
					Tbl_Cuotas? cuota = detalle?.Tbl_Cuotas;
					if (cuota != null)
					{
						cuota.Fecha_pago = detalle?.EstadoAnterior?.fecha_pago;
						cuota.Pago_contado = detalle?.EstadoAnterior?.pago_contado;
						cuota.Estado = detalle?.EstadoAnterior?.Estado;
						cuota.Total = detalle?.EstadoAnterior?.total;
						cuota.Interes = detalle?.EstadoAnterior?.interes;
						cuota.Abono_capital = detalle?.EstadoAnterior?.abono_capital;
						cuota.Update();
					}
				});

				if (contrato?.Catalogo_Clientes?.Id_clasificacion_interes != factura?.Factura_contrato?.id_clasificacion_interes_anterior)
				{
					contrato!.Catalogo_Clientes!.Id_clasificacion_interes = factura?.Factura_contrato?.id_clasificacion_interes_anterior;
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
					? $"Anulación de cuota No: <strong>{factura?.No_factura}</strong> del contrato No:  <strong>${factura?.Factura_contrato?.numero_contrato}</strong>"
					: "Anulación de recibo: " + factura?.No_factura;
				ResponseService response = new Movimientos_Cuentas
				{
					Catalogo_Cuentas_Destino = cuentaDestino,
					Catalogo_Cuentas_Origen = cuentaOrigen,
					Concepto = detalle,
					Descripcion = detalle,
					Moneda = factura?.Moneda?.ToUpper(),
					Monto = factura?.Moneda?.ToUpper() == "DOLARES" ? factura.Total : factura?.Total_cordobas,
					Tasa_cambio = factura?.Tasa_cambio,
					//tasa_cambio_compra = this.tasa_cambio_compra,
					Is_transaction = true,
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
			int? cuotas = contrato.Plazo;
			double? tasa = contrato.Tasas_interes;
			double? payment = tasa * Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) * monto
			/ (Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) - 1);
			return payment;
		}
		public double? UpdatePago(Transaction_Contratos contrato, int plazo, double? tasaActual)
		{
			double? monto = contrato.Saldo;
			int? cuotas = plazo;
			double? tasa = contrato.Tasas_interes;
			double? payment = tasa * Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) * monto
			/ (Math.Pow(1 + tasa.GetValueOrDefault(), cuotas.GetValueOrDefault()) - 1);
			return payment;
		}

		public double InteresCorriente(Tbl_Cuotas cuota, Transaction_Contratos Contrato)
		{
			if (Solo_abono == true)
			{
				return 0;
			}
			var cuotasPendientes = Contrato.Tbl_Cuotas
				.Where(c => c.Estado == "PENDIENTE").ToList().Count;
			var cuotasPagadas = Contrato.Tbl_Cuotas
				.Where(c => c.Estado == "CANCELADO").ToList().Count;

			bool fechaPagoMayorFechaActual = cuota?.Fecha > DateTime.Now;

			bool cancelarAntesDelPrimerMes = cuotasPagadas == 0
						&& fechaPagoMayorFechaActual
						&& (this.Cancelar == true || cuotasPendientes == 1);

			if (cuota != null && ((cancelarAntesDelPrimerMes == true)
				|| (this.Reestructurar == true && fechaPagoMayorFechaActual)
				|| (cuotasPendientes > 1 && this.Cancelar != true && this.Reestructurar != true)))
			{
				return cuota.Interes.GetValueOrDefault();
			}


			double saldo_actual_dolares = Contrato.Saldo.GetValueOrDefault();
			DateTime fecha = cuota?.Fecha.GetValueOrDefault() ?? DateTime.MinValue;
			DateTime fechaActual = DateTime.Now;

			TimeSpan diferencia = fechaActual - fecha;
			double diasDeDiferencia = (int)Math.Floor(diferencia.TotalDays);
			double porcentajeInteres = Contrato.Tasas_interes.GetValueOrDefault();

			TimeSpan? diferenciaEntreFechaCreacion = cuota?.Fecha.GetValueOrDefault() - fecha;
			double diasDelMes = (diferenciaEntreFechaCreacion.GetValueOrDefault().TotalDays >= 0)
			? diferenciaEntreFechaCreacion.GetValueOrDefault().TotalDays : 0;
			if (diasDelMes <= 0)
			{
				return 0;
			}

			double interesCorriente = saldo_actual_dolares
				* (double)(porcentajeInteres / 30) * diasDeDiferencia + cuota!.Interes.GetValueOrDefault();

			return interesCorriente;
		}

		public void CalculateMora()
		{
			var cuotas = new Tbl_Cuotas().Where<Tbl_Cuotas>(
				FilterData.Equal("Estado", EstadoEnum.PENDIENTE.ToString())
			);
			foreach (var cuota in cuotas)
			{
				if (cuota.Fecha < DateTime.Now)
				{
					//var contrato = new Transaction_Contratos() { numero_contrato = cuota.numero_contrato }.Find<Transaction_Contratos>();
					//cuota.mora = cuota.mora + (contrato.mora * cuota.monto);
					cuota.Update();
				}
			}
		}
	}
}