using APPCORE.Security;
using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model;
using System.Collections.Generic;
using static Model.ContractServices;
namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class Transactional_ContratoController : ControllerBase
	{
		[HttpPost]
		[AuthController(Permissions.GESTION_EMPEÑOS)]
		public object SaveDataContract(ContractServices Inst)
		{
			return Inst.SaveDataContract(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_EMPEÑOS)]
		public object SaveContract(ContractServices Inst)
		{
			return Inst.SaveContract(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController(Permissions.GESTION_EMPEÑOS)]
		public object AnularContract(Transaction_Contratos Inst)
		{
			return Inst.Anular(HttpContext.Session.GetString("sessionKey"));
		}

		[HttpPost]
		[AuthController(Permissions.GESTION_EMPEÑOS)]
		public object GetDataContract()
		{
			return new ContractServices().GetDataContract(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
        [AuthController(Permissions.GESTION_EMPEÑOS)]
        public object GetParcialesData(ParcialesData parcialesData)
        {
            return new ContractServices().GetParcialesData(parcialesData);
        }
	}
}
