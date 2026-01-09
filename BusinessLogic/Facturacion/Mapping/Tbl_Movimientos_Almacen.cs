using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using Business;
using DataBaseModel;

namespace BusinessLogic.Facturacion.Mapping
{
	public class Tbl_Movimientos_Almacen : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Movimiento { get; set; }
		public int? Id_Lote_Original { get; set; }
		public int? Id_Lote_Destino { get; set; }
		public TipoMovimientoEnum? Tipo_Movimiento { get; set; } // Entrada, Salida, etc.
		public double? Cantidad { get; set; }
		public DateTime? Fecha { get; set; }
		public string? Observaciones { get; set; }
		public int? Id_User { get; set; }
		public int? Id_Sucursal { get; set; }
		public EstadoEnum? Estado { get; set; }
		public int? Id_Transaccion { get; set; }

		[ManyToOne(TableName = "Tbl_Transaccion", KeyColumn = "Id_Transaccion", ForeignKeyColumn = "Id_Transaccion")]
		public Tbl_Transaccion? Transaccion { get; set; }

		[ManyToOne(TableName = "Tbl_Lotes", KeyColumn = "Id_Lote", ForeignKeyColumn = "Id_Lote_Original")]
		public Tbl_Lotes? Tbl_Lote_Original { get; set; }

		[ManyToOne(TableName = "Tbl_Lotes", KeyColumn = "Id_Lote", ForeignKeyColumn = "Id_Lote_Destino")]
		public Tbl_Lotes? Tbl_Lote_Destino { get; set; }
		public Cat_Almacenes? Cat_Almacenes { get; set; }

		public ResponseService? SaveMovimientos_Almacen(string? Identify)
		{
			try
			{
				if ((Tbl_Lote_Original == null && Id_Lote_Original == null) || Cantidad == null || Cantidad <= 0)
				{
					return new ResponseService()
					{
						status = 400,
						message = "Id_Lote_Original y Cantidad son requeridos"
					};
				}

				var User = AuthNetCore.User(Identify);
				var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();

				var loteOriginal = new Tbl_Lotes { Id_Lote = this.Tbl_Lote_Original?.Id_Lote }.Find<Tbl_Lotes>();

				if (loteOriginal == null)
				{
					return new ResponseService()
					{
						status = 404,
						message = "Lote original no encontrado"
					};
				}

				if (loteOriginal.Cantidad_Existente < this.Cantidad)
				{
					return new ResponseService()
					{
						status = 403,
						message = $"Cantidad insuficiente en lote original. Existencia: {loteOriginal.Cantidad_Existente}"
					};
				}

				// Crear lote nuevo (destino)
				var loteDestino = new Tbl_Lotes
				{
					Id_Producto = loteOriginal.Id_Producto,
					Precio_Compra = loteOriginal.Precio_Compra,
					Precio_Venta = loteOriginal.Precio_Venta,
					Cantidad_Inicial = this.Cantidad,
					Cantidad_Existente = this.Cantidad,
					Id_Sucursal = Cat_Almacenes?.Id_Sucursal,
					Id_Almacen = Cat_Almacenes?.Id_Almacen,
					Id_User = User.UserId,
					Fecha_Ingreso = DateTime.Now,
					Lote = $"{loteOriginal.Lote}-MV{DateTime.Now.Ticks}", // Identificador nuevo
					Id_Detalle_Compra = loteOriginal.Id_Detalle_Compra,
					Estado = EstadoEnum.ACTIVO,
					EtiquetaLote = loteOriginal.EtiquetaLote,
					Detalles = $"Lote generado por movimiento desde lote #{loteOriginal.Id_Lote}, sucursal #{loteOriginal.Id_Sucursal}"
				};
				BeginGlobalTransaction();
				loteDestino.Save();
				loteOriginal.Cantidad_Existente -= this.Cantidad;
				loteOriginal.Update();
				Tbl_Transaccion? transaction = new Tbl_Transaccion
				{
					Id_Lote = this.Id_Lote_Original,
					Id_User = User.UserId,
					Fecha = DateTime.Now,
					Descripcion = $"Movimiento de existencia del lote #{loteOriginal.Id_Lote} desde sucursal #{loteOriginal.Id_Sucursal} a sucursal #{loteDestino.Id_Sucursal}",
					Estado = EstadoEnum.ACTIVO,
					Tipo = TransactionsType.MOVIMIENTO_DE_EXISTENCIA
				}.Save() as Tbl_Transaccion;

				this.Id_User = User.UserId;
				this.Fecha = DateTime.Now;
				this.Id_Sucursal = dbUser?.Id_Sucursal;
				this.Id_Lote_Destino = loteDestino.Id_Lote;
				this.Estado = EstadoEnum.ACTIVO;
				this.Id_Transaccion = transaction?.Id_Transaccion;
				this.Save();
				CommitGlobalTransaction();
				return new ResponseService()
				{
					status = 200,
					message = "Movimiento registrado correctamente",
					body = new { loteDestino = loteDestino.Id_Lote }
				};
			}
			catch (Exception ex)
			{
				RollBackGlobalTransaction();
				LoggerServices.AddMessageError("Error al registrar movimiento de almacén", ex);
				return new ResponseService()
				{
					status = 500,
					message = "Error interno al guardar movimiento",
					body = ex
				};
			}
		}


		public object? AnularMovimiento(string? Identify, Tbl_Transaccion inst)
		{
			try
			{
				var User = AuthNetCore.User(Identify);
				var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
				// Buscar movimiento original a través del ID de transacción
				var movimientoOriginal = new Tbl_Movimientos_Almacen { Id_Transaccion = inst?.Id_Transaccion }
					.Find<Tbl_Movimientos_Almacen>();
				if (movimientoOriginal == null)
				{
					return new ResponseService(404, "Movimiento no encontrado");
				}
				// Obtener transacción original
				var transactionOriginal = new Tbl_Transaccion
				{
					Id_Transaccion = movimientoOriginal.Id_Transaccion
				}.Find<Tbl_Transaccion>();

				var loteOriginal = new Tbl_Lotes { Id_Lote = movimientoOriginal.Id_Lote_Original }.Find<Tbl_Lotes>();
				var loteDestino = new Tbl_Lotes { Id_Lote = movimientoOriginal.Id_Lote_Destino }.Find<Tbl_Lotes>();

				if (loteOriginal == null || loteDestino == null)
				{
					return new ResponseService(404, "Lote original o destino no encontrado");
				}

				if (movimientoOriginal.Cantidad > loteDestino.Cantidad_Existente)
				{
					return new ResponseService(404,
						"El movimiento no puede ser revertido ya que las existencias fueron usadas en alguna transacción");
				}

				// Revertir cantidades
				loteOriginal.Cantidad_Existente += movimientoOriginal.Cantidad;
				loteDestino.Cantidad_Existente -= movimientoOriginal.Cantidad;

				// Anular transacción y movimiento
				movimientoOriginal.Estado = EstadoEnum.ANULADO;
				transactionOriginal!.Estado = EstadoEnum.ANULADO;
				transactionOriginal.Descripcion += " TRANSACCIÓN ANULADA: " + inst?.Descripcion;
				transactionOriginal.Id_User = User.UserId;
				
				BeginGlobalTransaction();
				loteOriginal.Update();
				loteDestino.Update();
				transactionOriginal.Update();
				movimientoOriginal.Update();
				CommitGlobalTransaction();
				return new ResponseService(200, "Movimiento anulado correctamente");
			}
			catch (Exception ex)
			{
				RollBackGlobalTransaction();
				LoggerServices.AddMessageError("Error al anular movimiento", ex);
				return new ResponseService(500, "Error al anular movimiento", ex);
			}
		}


		public Tbl_Movimientos_Almacen? FindTbl_Movimientos_Almacen(string? Identify)
		{
			var User = AuthNetCore.User(Identify);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (User.isAdmin)
			{
				return Find<Tbl_Movimientos_Almacen>();
			}
			else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
			{
				Id_Sucursal = dbUser?.Id_Sucursal;
				return Find<Tbl_Movimientos_Almacen>();
			}
			else
			{
				return Find<Tbl_Movimientos_Almacen>(
					FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal));
			}
		}

		public List<Tbl_Movimientos_Almacen>? GetTbl_Movimientos_Almacen(string? Identify)
		{
			var User = AuthNetCore.User(Identify);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (User.isAdmin)
			{
				return Get<Tbl_Movimientos_Almacen>();
			}
			else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
			{
				Id_Sucursal = dbUser?.Id_Sucursal;
				return Where<Tbl_Movimientos_Almacen>();
			}
			else
			{
				return Where<Tbl_Movimientos_Almacen>(
					FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal)
				);
			}
		}


	}

	public enum TipoMovimientoEnum
	{
		ENTRADA, SALIDA, TRASLADO
	}
}