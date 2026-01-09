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
		public int? Id_movimiento { get; set; }
		public string? Descripcion { get; set; }
		public string? Concepto { get; set; }
		public double? Monto { get; set; }
		public double? Tasa_cambio { get; set; }
		public double? Tasa_cambio_compra { get; set; }
		public string? Moneda { get; set; }
		public int? Id_usuario_crea { get; set; }
		public DateTime? Fecha { get; set; }
		public bool? Is_transaction { get; set; }
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
				if (this.Is_transaction == true)
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
					if (Is_transaction != true)
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
				var constOrigen = z.Moneda == "DOLARES" ?
					z.Detail_Movimiento?.Find(x => x.Credito_dolares == 0) :
					z.Detail_Movimiento?.Find(x => x.Credito == 0);
				var constDestino = z.Moneda == "DOLARES" ?
				 	z.Detail_Movimiento?.Find(x => x.Debito_dolares == 0) :
				 	z.Detail_Movimiento?.Find(x => x.Debito == 0);

				return new Movimientos_Cuentas()
				{
					Id_movimiento = z.Id_movimiento,
					Descripcion = z.Descripcion,
					Concepto = z.Concepto,
					Monto = constDestino.Moneda?.ToUpper().Equals("DOLARES") == true ? constDestino?.Credito_dolares : constDestino?.Credito,
					Tasa_cambio = constDestino?.Tasa_cambio,
					Tasa_cambio_compra = constDestino?.Tasa_cambio_compra,
					Moneda = constDestino.Moneda,
					Id_usuario_crea = z.Id_usuario_crea,
					Fecha = z.Fecha,
					Catalogo_Cuentas_Origen = constOrigen?.catalogo_Cuentas,
					Catalogo_Cuentas_Destino = constDestino?.catalogo_Cuentas,
					Id_cuenta_origen = constOrigen?.Id_cuenta,
					Id_cuenta_destino = constDestino?.Id_cuenta,
					Is_transaction = z.Is_transaction
				};
			}
			).ToList();
		}

		public ResponseService SaveMovimiento(Business.Security_Users dbUser)
		{
			//var user = AuthNetCore.User(token);

			var cuentaDestino = new Catalogo_Cuentas()
			{
				Id_cuentas = this.Catalogo_Cuentas_Destino?.Id_cuentas
			}.Find<Catalogo_Cuentas>();

			var cuentaOrigen = new Catalogo_Cuentas()
			{
				Id_cuentas = this.Catalogo_Cuentas_Origen?.Id_cuentas
			}.Find<Catalogo_Cuentas>();

			var permiso_cuenta_origen = new Permisos_Cuentas()
			{
				Id_categoria_cuenta_destino = cuentaOrigen.Categoria_Cuentas.Id_categoria
			}.Find<Permisos_Cuentas>();

			var permiso_cuenta_destino = new Permisos_Cuentas()
			{
				Id_categoria_cuenta_destino = cuentaDestino.Categoria_Cuentas.Id_categoria
			}.Find<Permisos_Cuentas>();

			if (permiso_cuenta_origen != null && (bool)!permiso_cuenta_origen.Permite_debito)
			{
				return new ResponseService()
				{
					status = 400,
					message = cuentaOrigen.Nombre + " no permite débitos hacia la cuenta: " + cuentaDestino.Nombre
				};
			}

			if (permiso_cuenta_destino != null && (bool)!permiso_cuenta_destino.Permite_credito)
			{
				return new ResponseService()
				{
					status = 400,
					message = cuentaDestino.Nombre + " no permite créditos desde la cuenta: " + cuentaOrigen.Nombre
				};
			}

			if (cuentaOrigen != null && cuentaDestino != null)
			{
				cuentaOrigen.Saldo = cuentaOrigen?.Saldo ?? 0;
				cuentaOrigen.Saldo_dolares = cuentaOrigen?.Saldo_dolares ?? 0;
				cuentaDestino.Saldo = cuentaDestino?.Saldo ?? 0;
				cuentaDestino.Saldo_dolares = cuentaDestino?.Saldo_dolares ?? 0;
				if (cuentaOrigen?.Tipo_cuenta == Tipo_Cuenta.PROPIA.ToString())
				{
					var response = new ResponseService()
					{
						status = 403,
						message = $"{this.Catalogo_Cuentas_Origen?.Nombre} no cuenta con saldo suficiente"
					};
					if (Moneda == "DOLARES" && cuentaOrigen.Saldo_dolares < Monto)
					{
						return response;
					}
					else if (Moneda == "CORDOBAS" && cuentaOrigen.Saldo < Monto)
					{
						return response;
					}
				}
				if (this.Catalogo_Cuentas_Origen?.Id_cuentas == this.Catalogo_Cuentas_Destino?.Id_cuentas 
				&& this.Tipo_Movimiento != TipoMovimiento.COMPRA_DE_MONEDA
				&& this.Tipo_Movimiento != TipoMovimiento.VENTA_DE_MONEDA)
				{
					return new ResponseService()
					{
						status = 403,
						message = "La cuenta de origen debe ser distinta a la cuenta de destino"
					};
				}
				if (this.Catalogo_Cuentas_Destino?.Permite_dolares == false && this.Moneda?.ToUpper() == "DOLARES")
				{
					return new ResponseService()
					{
						status = 403,
						message = "La cuenta de destino no permite dolares"
					};
				}
				if (this.Catalogo_Cuentas_Destino?.Permite_cordobas == false && this.Moneda?.ToUpper() == "CORDOBAS")
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
					Descripcion = this.Descripcion,
					Concepto = this.Concepto,
					Id_usuario_crea = dbUser.Id_User,
					Tipo = "pendiente",
					Moneda = this.Moneda?.ToUpper(),
					Tasa_cambio = this.Tasa_cambio,
					//tasa_cambio_compra = this.tasa_cambio_compra,
					Correo_enviado = false,
					Is_transaction = this.Is_transaction,
					Id_cuenta_origen = this.Catalogo_Cuentas_Origen?.Id_cuentas,
					Id_cuenta_destino = this.Catalogo_Cuentas_Destino?.Id_cuentas,
					Id_sucursal = dbUser?.Id_Sucursal,
					Tipo_Movimiento = this.Tipo_Movimiento,
					Detail_Movimiento = new List<Detail_Movimiento>(){
							new Detail_Movimiento(){
								catalogo_Cuentas = this.Catalogo_Cuentas_Origen,
								Debito = this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0,
								Debito_dolares = this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0,
								Credito = 0,
								Credito_dolares = 0,
								Monto_inicial = cuentaOrigen?.Saldo,
								Monto_inicial_dolares = cuentaOrigen?.Saldo_dolares,
								Monto_final = cuentaOrigen?.Saldo - (this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0),
								Monto_final_dolares = cuentaOrigen?.Saldo_dolares - (this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0),
								Tasa_cambio = this.Tasa_cambio,
								Tasa_cambio_compra = this.Tasa_cambio_compra,
								Moneda = this.Moneda?.ToUpper()
							},new Detail_Movimiento(){
								catalogo_Cuentas = this.Catalogo_Cuentas_Destino,
								Debito = 0,
								Debito_dolares = 0,
								Credito =  this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0,
								Credito_dolares = this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0,
								Monto_inicial = cuentaDestino?.Saldo,
								Monto_inicial_dolares = cuentaDestino?.Saldo_dolares,
								Monto_final = cuentaDestino?.Saldo + (this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0),
								Monto_final_dolares = cuentaDestino?.Saldo_dolares + (this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0),
								Tasa_cambio = this.Tasa_cambio,
								Tasa_cambio_compra = this.Tasa_cambio_compra,
								Moneda = this.Moneda?.ToUpper()
							}
						}
				};
				cuentaOrigen.Saldo = cuentaOrigen.Saldo - (this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0);
				cuentaOrigen.Saldo_dolares = cuentaOrigen.Saldo_dolares - (this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0);
				cuentaDestino.Saldo = cuentaDestino.Saldo + (this.Moneda?.ToUpper() == "CORDOBAS" ? this.Monto : 0);
				cuentaDestino.Saldo_dolares = cuentaDestino.Saldo_dolares + (this.Moneda?.ToUpper() == "DOLARES" ? this.Monto : 0);

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

				var dbUser = new Business.Security_Users { Id_User = item.Id_usuario_crea }.Find<Business.Security_Users>();
				var constOrigen = item.Detail_Movimiento?.Find(x => x.Credito == 0);
				var constDestino = item.Detail_Movimiento?.Find(x => x.Debito == 0);
				var modelo = new
				{
					FechaMovimiento = item.Fecha,
					CuentaOrigen = $"{constOrigen?.catalogo_Cuentas?.Nombre} ({constOrigen?.catalogo_Cuentas?.Id_sucursal?.ToString("D9")}) de la sucursal: {constOrigen?.catalogo_Cuentas?.Catalogo_Sucursales?.Descripcion}",
					CuentaDestino = $"{constDestino?.catalogo_Cuentas?.Nombre} ({constDestino?.catalogo_Cuentas?.Id_sucursal?.ToString("D9")}) de la sucursal: {constDestino?.catalogo_Cuentas?.Catalogo_Sucursales?.Descripcion}",
					TipoMoneda = item.Moneda?.ToUpper() == "DOLARES" ? "$" : "C$",
					Monto = NumberUtility.ConvertToMoneyString(constDestino?.Moneda?.ToUpper().Equals("DOLARES") == true
					? constDestino?.Credito_dolares : constDestino?.Credito),
					Concepto = item.Concepto,
					Usuario = $"{dbUser?.Nombres} ({item.Id_usuario_crea?.ToString("D9")})"
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
					Id_movimiento = item.Id_movimiento
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