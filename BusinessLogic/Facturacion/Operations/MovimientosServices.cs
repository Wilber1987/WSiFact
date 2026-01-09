using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using BusinessLogic.Facturacion.Mapping;
using Business;
using DataBaseModel;
using DocumentFormat.OpenXml.Office2010.Excel;

namespace BusinessLogic.Facturacion.Operations
{
    public class MovimientosServices: TransactionalClass
    {
        public ResponseService? SaveMovimiento(string? Identity, Tbl_Movimientos_Almacen movimiento) 
        {
            try
			{
				BeginGlobalTransaction();
				var response = DoSaveMovimiento(Identity, movimiento);
				if (response!.status != 200)
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
					body = movimiento
				};
			}
        }

        private ResponseService? DoSaveMovimiento(string? Identity, Tbl_Movimientos_Almacen movimiento)
        {
            var User = AuthNetCore.User(Identity);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();			
			var loteOriginal = new Tbl_Lotes { Id_Lote = movimiento.Id_Lote_Original }.Find<Tbl_Lotes>();
			var almacenDestino = new Cat_Almacenes { Id_Almacen = movimiento.Tbl_Lote_Destino?.Id_Almacen }.Find<Cat_Almacenes>();
			var nuevoLote = new Tbl_Lotes()
			{
				Precio_Venta = loteOriginal?.Precio_Venta,
				Precio_Compra = loteOriginal?.Precio_Compra,
				Cantidad_Inicial =  movimiento.Cantidad,
				Cantidad_Existente =  movimiento.Cantidad,
				Id_Sucursal = dbUser?.Id_Sucursal,
				Id_User = dbUser?.Id_User,
				Fecha_Ingreso = DateTime.Now,
				Detalles = loteOriginal?.Detalles,
				Id_Detalle_Compra = loteOriginal?.Id_Detalle_Compra,
				Id_Almacen = movimiento.Tbl_Lote_Destino?.Id_Almacen,
				Lote = loteOriginal?.Lote,
				EtiquetaLote = loteOriginal?.EtiquetaLote
			}.Save() as Tbl_Lotes;
			loteOriginal!.Cantidad_Existente = loteOriginal.Cantidad_Existente - movimiento.Cantidad;
			loteOriginal.Update();
			
			var NewTransaction = new Tbl_Transaccion
			{
			    Cantidad = movimiento.Cantidad,
			    Tipo = TransactionsType.MOVIMIENTO_DE_EXISTENCIA,
			    Descripcion = $"Movimiento de {loteOriginal?.Cat_Almacenes?.Descripcion} lote a {almacenDestino?.Descripcion}",
			    Id_Lote = movimiento.Id_Lote_Destino,
			}.Save() as Tbl_Transaccion;
			
			movimiento.Id_Transaccion = NewTransaction?.Id_Transaccion;
			movimiento.Id_Sucursal = dbUser?.Id_Sucursal;
			movimiento.Id_User = User.UserId;
			movimiento.Estado = EstadoEnum.ACTIVO;
			movimiento.Tipo_Movimiento = TipoMovimientoEnum.TRASLADO;
			movimiento.Save();
			return new ResponseService
			{
			    status = 200,
			    message = "Movimiento guardado con éxito",
			    body = movimiento
			};
        }
    }
}