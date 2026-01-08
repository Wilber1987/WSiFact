using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using APPCORE;
using CAPA_NEGOCIO.Util;
using Business;
using DataBaseModel;

namespace BusinessLogic.Facturacion.Mapping
{
	public class Tbl_Bajas_Almacen : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Baja { get; set; }
		public int? Id_Lote { get; set; }
		public MotivosBajasEnum? Motivo_Baja { get; set; }
		public double? Cantidad { get; set; }
		public DateTime? Fecha { get; set; }
		public string? Observaciones { get; set; }
		public int? Id_User { get; set; }
		public int? Id_Sucursal { get; set; }
		public int? Id_Transaccion { get; set; }
		public EstadoEnum? Estado { get; set; }		
		public bool IsAnulable { get 
		{
		    return Estado != EstadoEnum.ANULADO && Estado != EstadoEnum.INACTIVO && !DateUtil.IsAffterNDays(Fecha, 1);
		}}

		[ManyToOne(TableName = "Tbl_Transaccion", KeyColumn = "Id_Transaccion", ForeignKeyColumn = "Id_Transaccion")]
		public Tbl_Transaccion? Transaccion { get; set; }

		[ManyToOne(TableName = "Tbl_Lotes", KeyColumn = "Id_Lote", ForeignKeyColumn = "Id_Lote")]
		public Tbl_Lotes? Tbl_Lotes { get; set; }

		public object? Anular(string? Identify, Tbl_Transaccion inst)
		{
			try
			{
				var User = AuthNetCore.User(Identify);
				var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();

				var BajaOriginal = new Tbl_Bajas_Almacen { Id_Transaccion = inst?.Id_Transaccion }.Find<Tbl_Bajas_Almacen>();
				Tbl_Lotes? loteOriginal = new Tbl_Lotes { Id_Lote = BajaOriginal?.Id_Lote }.Find<Tbl_Lotes>();
				Tbl_Transaccion? transactionOriginal = new Tbl_Transaccion
				{
					Id_Transaccion = BajaOriginal?.Id_Transaccion
				}.Find<Tbl_Transaccion>();

				loteOriginal!.Cantidad_Existente += BajaOriginal?.Cantidad;
				transactionOriginal!.Id_User = User.UserId;				
				BajaOriginal!.Estado = EstadoEnum.ANULADO;
				transactionOriginal!.Estado = EstadoEnum.ANULADO;
				transactionOriginal!.Descripcion += " TRANSACCIÓN ANULADA:" + inst?.Descripcion;

				BeginGlobalTransaction();
				
				loteOriginal.Update();
				transactionOriginal.Update();
				BajaOriginal.Update();
				CommitGlobalTransaction();
				return new ResponseService()
				{
					status = 200,
					message = "Baja revertida exitosamente"
				};
			}
			catch (Exception ex)
			{
				RollBackGlobalTransaction();
				LoggerServices.AddMessageError("Error en revertir la baja", ex);
				return new ResponseService()
				{
					status = 500,
					message = "Error en revertir la baja",
					body = ex
				};
			}

		}

		public Tbl_Bajas_Almacen? FindBajas_Almacen(string? Identify)
		{
			var User = AuthNetCore.User(Identify);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (User.isAdmin)
			{
				return Find<Tbl_Bajas_Almacen>();
			}
			else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
			{
				Id_Sucursal = dbUser?.Id_Sucursal;
				return Find<Tbl_Bajas_Almacen>();
			}
			else
			{
				return Find<Tbl_Bajas_Almacen>(
					FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal));
			}
		}
		public List<Tbl_Bajas_Almacen> GetBajas_Almacen(string? Identify)
		{
			var User = AuthNetCore.User(Identify);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (User.isAdmin)
			{
				return Get<Tbl_Bajas_Almacen>();
			}
			else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
			{
				Id_Sucursal = dbUser?.Id_Sucursal;
				return Where<Tbl_Bajas_Almacen>();
			}
			else
			{
				return Where<Tbl_Bajas_Almacen>(
					FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal)
				);
			}
		}
	}

	public enum MotivosBajasEnum
	{
		ARTICULO_DAÑADO
	}
}