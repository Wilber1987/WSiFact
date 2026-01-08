using APPCORE.Security;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Transactions;
using UI.CAPA_NEGOCIO.Empresa.Services.Recibos;

namespace API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ApiRecibosController : ControllerBase
    {
        //Recibos
        [HttpPost]
        [AuthController(Permissions.GESTION_RECIBOS)]
        public List<Recibos_Transactions> GetRecibos(Recibos_Transactions Inst)
        {
            return Inst.Get<Recibos_Transactions>();
        }
        [HttpPost]
        [AuthController(Permissions.GESTION_RECIBOS)]
        public object saveRecibos(Recibos_Transactions inst)
        {            
            return inst.SaveRecibos(HttpContext.Session.GetString("sessionKey"));
        }
        [HttpPost]
        [AuthController(Permissions.GESTION_RECIBOS)]
        public object? updateRecibos(Recibos_Transactions inst)
        {
            return true;
            //return inst.Update();
        }
        [HttpPost]
        [AuthController(Permissions.GESTION_RECIBOS)]
        public object? anularRecibo(Recibos_Transactions inst)
        {            
            return inst.AnularFactura(HttpContext.Session.GetString("sessionKey"));
        }

        [HttpPost]
        [AuthController(Permissions.GESTION_RECIBOS)]
        public Object? printRecibo(RecibosTemplateServices inst)
        {            
            return inst.PrintRecibo(HttpContext.Session.GetString("sessionKey"));
        }
    }
}