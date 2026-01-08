using API.Controllers;
using APPCORE;
using APPCORE.Security;
using APPCORE.Services;
using CAPA_NEGOCIO.Services;
using DataBaseModel;
using Microsoft.Diagnostics.Tracing.Parsers.MicrosoftWindowsWPF;

namespace Transactions
{
	public class Movimientos_Cuentas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_movimiento { get; set; }
		public string? descripcion { get; set; }
		public string? concepto { get; set; }
		public double? monto { get; set; }
		public double? tasa_cambio { get; set; }
		public double? tasa_cambio_compra { get; set; }
		public string? moneda { get; set; }
		public int? id_usuario_crea { get; set; }
		public DateTime? fecha { get; set; }
		public bool? is_transaction { get; set; }
		//public bool? is_anulacion { get; set; }

		public int? Id_cuenta_origen { get; set; }
		public Catalogo_Cuentas? Catalogo_Cuentas_Origen { get; set; }
		public int? Id_cuenta_destino { get; set; }
		public Catalogo_Cuentas? Catalogo_Cuentas_Destino { get; set; }
        public TipoMovimiento? Tipo_Movimiento { get; set; }

        public object? Save(string token)
		{
			try
			{
				BeginGlobalTransaction();
				if (this.is_transaction == true)
				{
					return new ResponseService()
					{
						status = 400,
						message = "No se permite anular un movimiento asociado a una transacción"
					};
				}
				var  (user, dbUser) =  Business.Security_Users.GetUserData(token);
				ResponseService response = SaveMovimiento(dbUser);
				if (response.status == 200)
				{
					CommitGlobalTransaction();
					if (is_transaction != true)
					{
						SendNotification((Transaction_Movimiento)response.body);
					}
				}
				else
				{
					RollBackGlobalTransaction();
				}

				return response;
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

		public List<Movimientos_Cuentas> Get(string token)
		{
			if (!AuthNetCore.HavePermission(Permissions.ADMIN_ACCESS.ToString(), token))
			{
				var user = AuthNetCore.User(token);
				var dbUser = new Business.Security_Users { Id_User = user.UserId }.Find<Business.Security_Users>();
				this.filterData.Add(FilterData.Equal("id_sucursal", dbUser.Id_Sucursal));
			}
			return new Transaction_Movimiento()
			{
				filterData = this.filterData
			}.Get<Transaction_Movimiento>().Select(z =>
			{
				var constOrigen = z.moneda == "DOLARES" ?
					z.Detail_Movimiento?.Find(x => x.credito_dolares == 0) :
					z.Detail_Movimiento?.Find(x => x.credito == 0);
				var constDestino = z.moneda == "DOLARES" ?
				 	z.Detail_Movimiento?.Find(x => x.debito_dolares == 0) :
				 	z.Detail_Movimiento?.Find(x => x.debito == 0);

				return new Movimientos_Cuentas()
				{
					id_movimiento = z.id_movimiento,
					descripcion = z.descripcion,
					concepto = z.concepto,
					monto = constDestino.moneda?.ToUpper().Equals("DOLARES") == true ? constDestino?.credito_dolares : constDestino?.credito,
					tasa_cambio = constDestino?.tasa_cambio,
					tasa_cambio_compra = constDestino?.tasa_cambio_compra,
					moneda = constDestino.moneda,
					id_usuario_crea = z.id_usuario_crea,
					fecha = z.fecha,
					Catalogo_Cuentas_Origen = constOrigen?.catalogo_Cuentas,
					Catalogo_Cuentas_Destino = constDestino?.catalogo_Cuentas,
					Id_cuenta_origen = constOrigen?.id_cuenta,
					Id_cuenta_destino = constDestino?.id_cuenta,
					is_transaction = z.is_transaction
				};
			}
			).ToList();
		}

		public ResponseService SaveMovimiento(Business.Security_Users dbUser)
		{
			//var user = AuthNetCore.User(token);

			var cuentaDestino = new Catalogo_Cuentas()
			{
				id_cuentas = this.Catalogo_Cuentas_Destino?.id_cuentas
			}.Find<Catalogo_Cuentas>();

			var cuentaOrigen = new Catalogo_Cuentas()
			{
				id_cuentas = this.Catalogo_Cuentas_Origen?.id_cuentas
			}.Find<Catalogo_Cuentas>();

			var permiso_cuenta_origen = new Permisos_Cuentas()
			{
				id_categoria_cuenta_destino = cuentaOrigen.Categoria_Cuentas.id_categoria
			}.Find<Permisos_Cuentas>();

			var permiso_cuenta_destino = new Permisos_Cuentas()
			{
				id_categoria_cuenta_destino = cuentaDestino.Categoria_Cuentas.id_categoria
			}.Find<Permisos_Cuentas>();

			if (permiso_cuenta_origen != null && (bool)!permiso_cuenta_origen.permite_debito)
			{
				return new ResponseService()
				{
					status = 400,
					message = cuentaOrigen.nombre + " no permite débitos hacia la cuenta: " + cuentaDestino.nombre
				};
			}

			if (permiso_cuenta_destino != null && (bool)!permiso_cuenta_destino.permite_credito)
			{
				return new ResponseService()
				{
					status = 400,
					message = cuentaDestino.nombre + " no permite créditos desde la cuenta: " + cuentaOrigen.nombre
				};
			}

			if (cuentaOrigen != null && cuentaDestino != null)
			{
				cuentaOrigen.saldo = cuentaOrigen?.saldo ?? 0;
				cuentaOrigen.saldo_dolares = cuentaOrigen?.saldo_dolares ?? 0;
				cuentaDestino.saldo = cuentaDestino?.saldo ?? 0;
				cuentaDestino.saldo_dolares = cuentaDestino?.saldo_dolares ?? 0;
				if (cuentaOrigen?.tipo_cuenta == Tipo_Cuenta.PROPIA.ToString())
				{
					var response = new ResponseService()
					{
						status = 403,
						message = $"{this.Catalogo_Cuentas_Origen?.nombre} no cuenta con saldo suficiente"
					};
					if (moneda == "DOLARES" && cuentaOrigen.saldo_dolares < monto)
					{
						return response;
					}
					else if (moneda == "CORDOBAS" && cuentaOrigen.saldo < monto)
					{
						return response;
					}
				}
				if (this.Catalogo_Cuentas_Origen?.id_cuentas == this.Catalogo_Cuentas_Destino?.id_cuentas 
				&& this.Tipo_Movimiento != TipoMovimiento.COMPRA_DE_MONEDA
				&& this.Tipo_Movimiento != TipoMovimiento.VENTA_DE_MONEDA)
				{
					return new ResponseService()
					{
						status = 403,
						message = "La cuenta de origen debe ser distinta a la cuenta de destino"
					};
				}
				if (this.Catalogo_Cuentas_Destino?.permite_dolares == false && this.moneda?.ToUpper() == "DOLARES")
				{
					return new ResponseService()
					{
						status = 403,
						message = "La cuenta de destino no permite dolares"
					};
				}
				if (this.Catalogo_Cuentas_Destino?.permite_cordobas == false && this.moneda?.ToUpper() == "CORDOBAS")
				{
					return new ResponseService()
					{
						status = 403,
						message = "La cuenta de destino no permite cordobas"
					};
				}
				//var dbUser = new Business.Security_Users { Id_User = user.UserId }.Find<Business.Security_Users>();
				var encabezado = new Transaction_Movimiento()
				{
					descripcion = this.descripcion,
					concepto = this.concepto,
					id_usuario_crea = dbUser.Id_User,
					tipo = "pendiente",
					moneda = this.moneda?.ToUpper(),
					tasa_cambio = this.tasa_cambio,
					//tasa_cambio_compra = this.tasa_cambio_compra,
					correo_enviado = false,
					is_transaction = this.is_transaction,
					Id_cuenta_origen = this.Catalogo_Cuentas_Origen?.id_cuentas,
					Id_cuenta_destino = this.Catalogo_Cuentas_Destino?.id_cuentas,
					id_sucursal = dbUser?.Id_Sucursal,
					Tipo_Movimiento = this.Tipo_Movimiento,
					Detail_Movimiento = new List<Detail_Movimiento>(){
							new Detail_Movimiento(){
								catalogo_Cuentas = this.Catalogo_Cuentas_Origen,
								debito = this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0,
								debito_dolares = this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0,
								credito = 0,
								credito_dolares = 0,
								monto_inicial = cuentaOrigen?.saldo,
								monto_inicial_dolares = cuentaOrigen?.saldo_dolares,
								monto_final = cuentaOrigen?.saldo - (this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0),
								monto_final_dolares = cuentaOrigen?.saldo_dolares - (this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0),
								tasa_cambio = this.tasa_cambio,
								tasa_cambio_compra = this.tasa_cambio_compra,
								moneda = this.moneda?.ToUpper()
							},new Detail_Movimiento(){
								catalogo_Cuentas = this.Catalogo_Cuentas_Destino,
								debito = 0,
								debito_dolares = 0,
								credito =  this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0,
								credito_dolares = this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0,
								monto_inicial = cuentaDestino?.saldo,
								monto_inicial_dolares = cuentaDestino?.saldo_dolares,
								monto_final = cuentaDestino?.saldo + (this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0),
								monto_final_dolares = cuentaDestino?.saldo_dolares + (this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0),
								tasa_cambio = this.tasa_cambio,
								tasa_cambio_compra = this.tasa_cambio_compra,
								moneda = this.moneda?.ToUpper()
							}
						}
				};
				cuentaOrigen.saldo = cuentaOrigen.saldo - (this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0);
				cuentaOrigen.saldo_dolares = cuentaOrigen.saldo_dolares - (this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0);
				cuentaDestino.saldo = cuentaDestino.saldo + (this.moneda?.ToUpper() == "CORDOBAS" ? this.monto : 0);
				cuentaDestino.saldo_dolares = cuentaDestino.saldo_dolares + (this.moneda?.ToUpper() == "DOLARES" ? this.monto : 0);

				cuentaDestino.Update();
				cuentaOrigen.Update();
				object? result = encabezado.Save();
				return new ResponseService()
				{
					status = 200,
					message = "Movimiento registrado correctamente",
					body = result
				};
			}
			return new ResponseService()
			{
				status = 400,
				message = "Cuentas invalidas"
			};
		}
		public void SendNotification(Transaction_Movimiento item)
		{
			try
			{

				var dbUser = new Business.Security_Users { Id_User = item.id_usuario_crea }.Find<Business.Security_Users>();
				var constOrigen = item.Detail_Movimiento?.Find(x => x.credito == 0);
				var constDestino = item.Detail_Movimiento?.Find(x => x.debito == 0);
				var modelo = new
				{
					FechaMovimiento = item.fecha,
					CuentaOrigen = $"{constOrigen?.catalogo_Cuentas?.nombre} ({constOrigen?.catalogo_Cuentas?.id_sucursal?.ToString("D9")}) de la sucursal: {constOrigen?.catalogo_Cuentas?.Catalogo_Sucursales?.Descripcion}",
					CuentaDestino = $"{constDestino?.catalogo_Cuentas?.nombre} ({constDestino?.catalogo_Cuentas?.id_sucursal?.ToString("D9")}) de la sucursal: {constDestino?.catalogo_Cuentas?.Catalogo_Sucursales?.Descripcion}",
					TipoMoneda = item.moneda?.ToUpper() == "DOLARES" ? "$" : "C$",
					Monto = NumberUtility.ConvertToMoneyString(constDestino?.moneda?.ToUpper().Equals("DOLARES") == true
					? constDestino?.credito_dolares : constDestino?.credito),
					Concepto = item.concepto,
					Usuario = $"{dbUser?.Nombres} ({item.id_usuario_crea?.ToString("D9")})"
				};
				MailServices.SendMailContract(new List<String>() {
					"wilberj1987@gmail.com",
					//"alderhernandez@gmail.com" 
					},
					"noreply@noreply",
					"Notificación de movimiento entre cuentas",
					NotificacionTemplate,
					modelo
				);//todo definir correos a enviar
				var update = new Transaction_Movimiento()
				{
					id_movimiento = item.id_movimiento
				}.Find<Transaction_Movimiento>();
			}
			catch (System.Exception ex)
			{
				LoggerServices.AddMessageError("ERROR ENVIENDO EL CORREO: ", ex);
			}
		}
		static readonly string NotificacionTemplate = @"<!DOCTYPE html>
			<html lang='es'>
			<head>
				<meta charset='UTF-8'>
				<meta name='viewport' content='width=device-width, initial-scale=1.0'>
				<title>Notificación de Movimiento entre Cuentas</title>
			</head>
			<body>
				<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;'>
					<h2 style='color: #333;'>Notificación de Movimiento entre Cuentas</h2>
					<p><strong>Fecha del movimiento:</strong> {{FechaMovimiento}}</p>        
					<p><strong>Cuenta de origen:</strong> {{CuentaOrigen}}</p>
					<p><strong>Cuenta de destino:</strong> {{CuentaDestino}}</p>        
					<p><strong>Monto:</strong> <span style='color: black; background-color: yellow;'>{{TipoMoneda}} {{Monto}}</span></p>
					<p><strong>Concepto:</strong> {{Concepto}}</p>
					<p><strong>Usuario que realizó el movimiento:</strong> {{Usuario}}</p>
				</div>
			</body>
			</html>";
	}

    public enum TipoMovimiento
    {
        COMPRA_DE_MONEDA,
        VENTA_DE_MONEDA,
        REEMBOLSO_POR_CONTRATO_ANULADO,
        DESEMBOLSO_POR_CONTRATO,
        INGRESO_POR_PAGO_DE_RECIBO,
        DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_RECIBO,
        DESEMBOLSO_POR_ANULACION_DE_PAGO_DE_FACTURACION,
        INGRESO_POR_PAGO_DE_FACTURACION,
		PAGO, //PAGO GENERAL, POR EJEMPLO CUANDO SE PAGA LA LUZ O ALQUILERES
		INGRESO,//INGRESO GENERAL
		EGRESO,//EGRESO GENERAL
		MOVIMIENTO_CUENTA, //PARA EJEMPLIFICAR MOVIMIENTOS DE CAJA
        DESEMBOLSO_POR_COMPRA,
        REEMBOLSO_POR_COMPRA_ANULADA
    }
}