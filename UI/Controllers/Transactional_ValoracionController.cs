using APPCORE.Security;
using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model;
using System.Collections.Generic;
namespace API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class Transactional_ValoracionController : ControllerBase
    {
        [HttpPost]
        [AuthController(Permissions.GESTION_EMPEÑOS)]
        public List<Transactional_Valoracion> GuardarValoraciones(ContractServices Inst)
        {
            return new Transactional_Valoracion().GuardarValoraciones(Inst.valoraciones);
        }
    }
}
