using API.Controllers;
using APPCORE;
using CAPA_NEGOCIO.Services;
using Business;
using DataBaseModel;
using Model;
using Transactions;
using UI.CAPA_NEGOCIO.Empresa.Services.Recibos;
using BusinessLogic.Facturacion.Operations;

namespace UI.CAPA_NEGOCIO.Facturacion.Operations
{
	public class FacturacionServices : TransactionalClass
	{
		public ResponseService? SaveFactura(string? Identity, Tbl_Factura? factura)
		{
			try
			{
				BeginGlobalTransaction();
				var response = DoSaveFactura(Identity, factura);
				if (response.status != 200)
				{
					RollBackGlobalTransaction();
				}
				else
				{
					CommitGlobalTransaction();
				}
				return response;
			}
			catch (System.Exception ex)
			{
				RollBackGlobalTransaction();
				LoggerServices.AddMessageError($"Error al guardar la factura: {ex.Message}", ex);
				return new ResponseService
				{
					status = 500,
					message = ex.Message,
					body = factura
				};
			}

		}

		public ResponseService DoSaveFactura(string? Identity, Tbl_Factura? factura)
		{
			var User = AuthNetCore.User(Identity);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (factura?.Detalle_Factura == null || !factura.Detalle_Factura.Any())
			{
				return new ResponseService
				{
					status = 400,
					message = "La factura debe tener al menos un detalle",
					body = factura
				};
			}
			if (factura.Cliente == null)
			{
				return new ResponseService
				{
					status = 400,
					message = "El cliente es requerido",
					body = factura
				};
			}
			else if (new Catalogo_Clientes { codigo_cliente = factura.Cliente.codigo_cliente ?? -1 }.Find<Catalogo_Clientes>() == null)
			{
				factura.Cliente.Save();
			}
			factura.Id_User = User.UserId;
			factura.Id_Sucursal = dbUser?.Id_Sucursal;
			factura.Id_Cliente = factura.Cliente.codigo_cliente;
			factura.Estado = EstadoEnum.ACTIVO.ToString();
			double totalSubTotal = 0;
			double totalIva = 0;
			double totalFactura = 0;
			double totalDescuento = 0;
			factura.Codigo_venta = GenerateCode();

			foreach (var detalle in factura.Detalle_Factura)
			{
				switch (factura.Tipo)
				{
					case "VENTA":
						detalle.Precio_Venta = detalle.Lote?.EtiquetaLote?.Precio_venta_Contado_dolares;
						break;
					case "APARTADO_MENSUAL":
					case "APARTADO_QUINCENAL":
						detalle.Precio_Venta = detalle.Lote?.EtiquetaLote?.Precio_venta_Apartado_dolares;
						break;
					default:
						break;
				}
				var subtotal = detalle.Cantidad * detalle.Precio_Venta;
				var montoDescuento = subtotal * ((detalle.Descuento ?? 0) / 100);
				var subTotalCalculado = subtotal - montoDescuento;
				var ivaCalculado = subTotalCalculado * 0;
				var totalCalculado = subTotalCalculado + ivaCalculado;



				detalle.Sub_Total = subTotalCalculado;
				detalle.Iva = ivaCalculado;
				detalle.Total = totalCalculado;
				detalle.Monto_Descuento = montoDescuento;

				totalSubTotal += subTotalCalculado ?? 0;
				totalIva += ivaCalculado ?? 0;
				totalFactura += totalCalculado ?? 0;
				totalDescuento += montoDescuento ?? 0;
				var loteOriginal = detalle.Lote?.Find<Tbl_Lotes>();
				if (loteOriginal == null || loteOriginal.Cantidad_Existente < detalle.Cantidad)
				{
					return new ResponseService
					{
						status = 400,
						message = $"No hay suficiente cantidad en el lote {detalle.Lote?.Id_Lote}",
						body = factura
					};
				}
				loteOriginal.Cantidad_Existente -= detalle.Cantidad;
				loteOriginal.Update();
			}

			factura.Iva = totalIva;
			factura.Sub_Total = factura.Tipo == "VENTA" ? totalSubTotal : totalSubTotal - factura.Datos_Financiamiento?.Total_Financiado ?? 0;
			factura.TotalDescuento = totalDescuento;
			factura.Total = factura.Sub_Total + factura.Iva;

			factura.Fecha = DateTime.Now;
			factura.Datos = new DatosFactura
			{
				Nombre_Cliente = factura.Cliente?.Nombre_Completo,
				Nombre_Vendedor = dbUser?.Nombres,
				Direccion_Cliente = factura.Cliente?.direccion,
				Telefono_Cliente = factura.Cliente?.telefono

			};
			Transaction_Contratos? contract = null;
			switch (factura.Tipo)
			{
				case "VENTA":
					if (factura.Monto_dolares < factura.Total)
					{
						return new ResponseService()
						{
							status = 400,
							message = "El monto debe ser equivalente al total"
						};
					}
					factura.Total_Pagado = factura.Total;
					break;
				case "APARTADO_MENSUAL":
				case "APARTADO_QUINCENAL":
					bool isQuincenal = factura.Tipo == "APARTADO_QUINCENAL";
					double porcentajeQuincenal = 1 / Transactional_Configuraciones.GetNumeroCuotasQuincenales(factura!.Monto_dolares + factura.Datos_Financiamiento!.Total_Financiado);
					double porcentajeMensual = Transactional_Configuraciones.GetPorcentageMinimoPagoApartadoMensual() / 100;


					if (isQuincenal && factura.Monto_dolares < Math.Round(totalFactura * porcentajeQuincenal, 2))
					{
						return new ResponseService()
						{
							status = 400,
							message = $"El monto debe ser equivalente como minimo al {Math.Round(porcentajeQuincenal, 2) * 100} % del total"
						};
					}
					else if (!isQuincenal && factura.Monto_dolares < Math.Round(totalFactura * porcentajeMensual, 2))
					{
						return new ResponseService()
						{
							status = 400,
							message = $"El monto debe ser equivalente como minimo al {porcentajeMensual * 100} % del total"
						};
					}
					double valorMinimoApartadoQuincenal = Transactional_Configuraciones.GetValorMinimoApartadoQuincenal();
					if (isQuincenal && totalFactura < valorMinimoApartadoQuincenal)
					{
						return new ResponseService()
						{
							status = 400,
							message = $"El monto de la factura no puede ser menor a {valorMinimoApartadoQuincenal} en apartados quincenales"
						};
					}
					factura.Total_Pagado = factura.Monto_dolares;
					factura.Total_Financiado = factura.Datos_Financiamiento?.Total_Financiado;
					var (contractResponse, contrato) = GenerarContratoFinanciamiento(Identity, factura, isQuincenal);
					if (contractResponse.status != 200)
					{
						return contractResponse;
					}
					else
					{
						factura.Datos_Financiamiento!.Numero_Contrato = contrato!.Transaction_Contratos?.numero_contrato;
						contract = contrato.Transaction_Contratos;
					}
					/* 
					dado que se generara una transaccion de facturacion se iguala el monto de la 
					factura al monto total y el contrato sera equivalente al monto financiado
					*/
					factura.Total_Pagado = totalFactura;
					factura.Total = factura.Total_Pagado;
					break;
				default:
					break;
			}

			factura?.Save();
			//CREATE
			var cuentaOrigen = Catalogo_Cuentas.GetCuentaEgresoFacturas(dbUser);
			var cuentaDestino = Catalogo_Cuentas.GetCuentaIngresoFacturas(dbUser);

			if (cuentaDestino == null || cuentaOrigen == null)
			{
				return new ResponseService()
				{
					status = 400,
					message = "Cuentas no configuradas correctamente"
				};
			}
			string detalleT = $"Venta de producto, factura: {factura?.Id_Factura} al cliente {factura?.Cliente?.Nombre_Completo}";
			ResponseService response = new Movimientos_Cuentas
			{
				Catalogo_Cuentas_Destino = cuentaDestino,
				Catalogo_Cuentas_Origen = cuentaOrigen,
				concepto = detalleT,
				descripcion = detalleT,
				moneda = factura?.Moneda?.ToUpper(),
				monto = factura?.Total,
				tasa_cambio = factura?.Tasa_Cambio,
				//tasa_cambio_compra = factura.Tasa_Cambio_Venta,
				Tipo_Movimiento = TipoMovimiento.INGRESO_POR_PAGO_DE_FACTURACION,
				is_transaction = true,

			}.SaveMovimiento(dbUser);
			if (response.status == 400) return response;
			var responseMC = MesaCambiariaService.GenerarMovimientosCambiariosFacturacion(dbUser, factura);
			if (responseMC.status != 200)
			{
				return responseMC;
			}
			return new ResponseService
			{
				status = 200,
				message = "Factura guardada con éxito",
				body = new
				{
					factura,
					Contract = ContractTemplateService.GetContractContent(contract),
					Transaction_Contratos = contract,
					//Recibo = new RecibosTemplateServices().GenerateReciboHtmlTemplate(contract?.Recibos?[0])
				}
			};
		}



		private (ResponseService, ContractServices?) GenerarContratoFinanciamiento(string? Identity, Tbl_Factura factura, bool isQuincenal = false)
		{
			var contrato = new ContractServices();
			// @ts-ignore
			

			contrato.Transaction_Contratos = new Transaction_Contratos
			{
				tasas_interes = isQuincenal ? 0 : GetTasaInteresContratoMensual(),
				fecha = DateTime.Now,
				plazo = factura.Datos_Financiamiento?.Plazo ?? 1,
				taza_cambio = factura.Tasa_Cambio_Venta,
				taza_cambio_compra = factura.Tasa_Cambio_Venta,
				Catalogo_Clientes = GetCliente(factura.Id_Cliente),
				tipo = isQuincenal ? Contratos_Type.APARTADO_QUINCENAL : Contratos_Type.APARTADO_MENSUAL,
				gestion_crediticia = 0,
				monto = factura.Datos_Financiamiento?.Total_Financiado,
				saldo = factura.Datos_Financiamiento?.Total_Financiado,
				Valoracion_empeño_dolares = factura.Datos_Financiamiento?.Total_Financiado,
				Valoracion_empeño_cordobas = factura.Datos_Financiamiento?.Total_Financiado_Cordobas,
				cuotafija = factura.Datos_Financiamiento?.Cuota_Fija_Cordobas,
				cuotafija_dolares = factura.Datos_Financiamiento?.Cuota_Fija_Dolares,
				observaciones = factura.Observaciones,
				Detail_Prendas = factura.Detalle_Factura?.Select(detalle =>
				{
					var valoracion = detalle.Lote?.Cat_Producto;
					return new Detail_Prendas
					{
						Descripcion = valoracion?.Descripcion,
						modelo = valoracion?.Modelo,
						marca = valoracion?.Cat_Marca?.Nombre,
						//serie = valoracion?.Serie,
						monto_aprobado_cordobas = detalle?.Precio_Venta,
						monto_aprobado_dolares = detalle?.Precio_Venta_Dolares ,
						color = "-",
						en_manos_de = EnManosDe.ACREEDOR,
						precio_venta = detalle?.Precio_Venta,
						Catalogo_Categoria = valoracion?.Cat_Categorias
					};
				}).ToList()
			};
			contrato.Transaction_Contratos.Tbl_Cuotas = contrato.Transaction_Contratos.CrearCuotas(factura.Total_Financiado ?? 0, factura.Datos_Financiamiento?.Plazo ?? 1, false, isQuincenal);
			var response = contrato.DoSaveContract(Identity);
			if (response.status != 200) return (contrato.DoSaveContract(Identity), contrato);
			return (response, contrato);
		}

		private double? GetTasaInteresContratoMensual()
		{
			var Intereses = new Transactional_Configuraciones().GetIntereses();
			return Intereses
					.Where(x => !x.Nombre!.Equals(InteresesPrestamosEnum.GASTOS_ADMINISTRATIVOS.ToString()))?
					.Select(I => Convert.ToDouble(I.Valor)).Sum() / 100;
		}

		private static Catalogo_Clientes? GetCliente(int? id_Cliente)
		{
			return new Catalogo_Clientes { codigo_cliente = id_Cliente ?? -1 }.Find<Catalogo_Clientes>();
		}

		private string? GenerateCode()
		{
			return "";
		}

		public static ResponseService? FindFacturaContrato(Tbl_Factura factura)
		{
			Transaction_Contratos? contract = new Transaction_Contratos { numero_contrato = factura?.Datos_Financiamiento?.Numero_Contrato }.Find<Transaction_Contratos>();
			string contractData = contract != null ? ContractTemplateService.GetContractContent(contract) : "";
			Transaccion_Factura? transaccion_Factura = null;
			if (factura?.Datos_Financiamiento?.Id_recibo != null)
			{
				transaccion_Factura = new Transaccion_Factura { id_factura = factura?.Datos_Financiamiento?.Id_recibo }.Find<Transaccion_Factura>();
			}

			return new ResponseService
			{
				status = 200,
				message = "Factura guardada con éxito",
				body = new
				{
					factura,
					Contract = contractData,
					Transaction_Contratos = contract,
					Recibo = new RecibosTemplateServices().GenerateReciboHtmlTemplate(transaccion_Factura)

				}
			};
		}

		public ResponseService? AnularFactura(Tbl_Factura factura, string? Identity)
		{
			var User = AuthNetCore.User(Identity);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			try
			{
				BeginGlobalTransaction();
				if (factura?.Datos_Financiamiento?.Numero_Contrato != null)
				{
					Transaction_Contratos? contract = new Transaction_Contratos
					{
						numero_contrato = factura?.Datos_Financiamiento?.Numero_Contrato,
						motivo_anulacion = factura?.Motivo_Anulacion
					};
					ResponseService? response = contract?.Anular(Identity);
					if (response?.status != 200)
					{
						RollBackGlobalTransaction();
						return response;
					}
				}
				if (factura?.Datos_Financiamiento?.Id_recibo != null)
				{
					new Recibos_Transactions
					{
						id_recibo = factura?.Datos_Financiamiento?.Id_recibo,
						motivo_anulacion = factura?.Motivo_Anulacion
					}.AnularFactura(Identity);
				}
				factura!.Estado = EstadoEnum.ANULADO.ToString();
				factura?.Save();
				//ANULAR
				var cuentaOrigen = Catalogo_Cuentas.GetCuentaIngresoFacturas(dbUser);
				var cuentaDestino = Catalogo_Cuentas.GetCuentaEgresoFacturas(dbUser);
				if (cuentaDestino == null || cuentaOrigen == null)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Cuentas no configuradas correctamente"
					};
				}
				string detalleT = $"Snulacion de venta de producto, factura: {factura?.Id_Factura}, cliente: {factura?.Cliente?.Nombre_Completo}";
				ResponseService responseM = new Movimientos_Cuentas
				{
					Catalogo_Cuentas_Destino = cuentaOrigen,
					Catalogo_Cuentas_Origen = cuentaDestino,
					concepto = detalleT,
					descripcion = detalleT,
					moneda = factura?.Moneda?.ToUpper(),
					monto = factura?.Total,
					tasa_cambio = factura?.Tasa_Cambio,
					is_transaction = true,
					Tipo_Movimiento = TipoMovimiento.DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_FACTURACION

				}.SaveMovimiento(dbUser);
				if (responseM.status == 400)
				{
					RollBackGlobalTransaction();
					return responseM;
				}
				CommitGlobalTransaction();
				return new ResponseService
				{
					status = 200,
					message = "Factura anulada con éxito"
				};
			}
			catch (System.Exception)
			{
				RollBackGlobalTransaction();
				throw;
			}
		}
	}
}