using Microsoft.AspNetCore.Mvc;
using DataBaseModel;
using Transactions;
using APPCORE.Security;

namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class ApiCuentasController : ControllerBase
	{
		//Movimientos cuentas
		[HttpPost]
		 [AuthController(Permissions.GESTION_MOVIMIENTOS)]
		public List<Detail_Movimiento> getDetail_Movimiento(Detail_Movimiento Inst)
		{
			return Inst.Get<Detail_Movimiento>().OrderBy(p => p.Id_movimiento).ToList(); ;
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_MOVIMIENTOS)]
		public List<Transaction_Movimiento> getTransaction_Movimiento(Transaction_Movimiento Inst)
		{
			return Inst.Get<Transaction_Movimiento>();
		}

		//Movimientos_Cuentas
		[HttpPost]
		[AuthController(Permissions.GESTION_MOVIMIENTOS)]
		public List<Movimientos_Cuentas> getMovimientos_Cuentas(Movimientos_Cuentas Inst)
		{
			return Inst.Get(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_MOVIMIENTOS)]
		public object? saveMovimientos_Cuentas(Movimientos_Cuentas inst)
		{			
			return inst.Save(HttpContext.Session.GetString("sessionKey"));
		}
	}
}
