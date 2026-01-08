using APPCORE;
using APPCORE.Security;
using BusinessLogic.Empresa.Contratos;
using BusinessLogic.Facturacion.Mapping;
using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class ApiTransactionLotesController : ControllerBase
	{
		//Tbl_Lotes
		[HttpPost]
		[AuthController]
		public List<Tbl_Lotes>? getTbl_Lotes(Tbl_Lotes Inst)
		{
			return Inst?.GetLotes(HttpContext.Session.GetString("sessionKey"));
		}		
		[HttpPost]
		[AuthController]
		public IActionResult? findTbl_Lotes(Tbl_Lotes Inst)
		{
			return Ok(Inst?.Find<Tbl_Lotes>());
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? saveTbl_Lotes(Tbl_Lotes Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? updateTbl_Lotes(Tbl_Lotes Inst)
		{
			return Inst?.Update();
		}
		[HttpPost]
		[AuthController]
		public List<Tbl_Lotes>? getTbl_LotesInactivos(Tbl_Lotes Inst)
		{
			return Inst?.GetLotesInactivos(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? InactivarTbl_Lotes(Tbl_Lotes Inst)
		{
			return new Tbl_Lotes { Id_Lote = Inst.Id_Lote, Estado = EstadoEnum.ACTIVO }?.Update();
		}
		//Tbl_Lotes
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? DarDeBaja(Tbl_Transaccion Inst)
		{
			return new Tbl_Lotes().DarDeBaja(HttpContext.Session.GetString("sessionKey"), Inst);
		}

		[HttpPost]
		[AuthController]
		public List<Tbl_Bajas_Almacen>? GetTbl_Bajas_Almacen(Tbl_Bajas_Almacen Inst)
		{
			return Inst?.GetBajas_Almacen(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public Tbl_Bajas_Almacen? FindTbl_Bajas_Almacen(Tbl_Bajas_Almacen Inst)
		{
			return Inst?.FindBajas_Almacen(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? SaveTbl_Bajas_Almacen(Tbl_Bajas_Almacen Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? UpdateTbl_Bajas_Almacen(Tbl_Bajas_Almacen Inst)
		{
			return Inst?.Update();
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? AnularTbl_Bajas_Almacen(Tbl_Transaccion Inst)
		{
			return new Tbl_Bajas_Almacen()?.Anular(HttpContext.Session.GetString("sessionKey"), Inst);
		}

		//MOVIMIENTOS ALMACEN
		[HttpPost]
		[AuthController]
		public List<Tbl_Movimientos_Almacen>? GetTbl_Movimientos_Almacen(Tbl_Movimientos_Almacen Inst)
		{
			return Inst?.GetTbl_Movimientos_Almacen(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public Tbl_Movimientos_Almacen? FindTbl_Movimientos_Almacen(Tbl_Movimientos_Almacen Inst)
		{
			return Inst?.FindTbl_Movimientos_Almacen(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public object? SaveTbl_Movimientos_Almacen(Tbl_Movimientos_Almacen Inst)
		{
			return Inst?.SaveMovimientos_Almacen(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public object? AnularTbl_Movimientos_Almacen(Tbl_Transaccion Inst)
		{
			return new Tbl_Movimientos_Almacen().AnularMovimiento(HttpContext.Session.GetString("sessionKey"), Inst);
		}
		[HttpPost]
		[AuthController]
		public object? UpdateTbl_Movimientos_Almacen(Tbl_Movimientos_Almacen Inst)
		{
			return Inst?.Update();
		}

		//ACTAS DE ENTREGA
		[HttpPost]
		[AuthController]
		public List<Tbl_Acta_Entrega>? GetTbl_Acta_Entrega(Tbl_Acta_Entrega Inst)
		{
			return Inst?.GetTbl_Acta_Entrega(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public Tbl_Acta_Entrega? FindTbl_Acta_Entrega(Tbl_Acta_Entrega Inst)
		{
			return Inst?.FindTbl_Acta_Entrega(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? SaveTbl_Acta_Entrega(Tbl_Acta_Entrega Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public object? UpdateTbl_Acta_Entrega(Tbl_Acta_Entrega Inst)
		{
			return Inst?.Update();
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_LOTES)]
		public ResponseService? SaveReturnTransaction(ReturnTransaction Inst)
		{
			return Inst.Execute(HttpContext.Session.GetString("sessionKey"));
			//return new Tbl_Acta_Entrega()?.Anular(HttpContext.Session.GetString("sessionKey"), Inst);
		}

	}
}
