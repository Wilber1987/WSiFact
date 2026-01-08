using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;
using BusinessLogic.Facturacion.Mapping.Querys;
using BusinessLogic.Facturacion.Operations;
using Microsoft.AspNetCore.Mvc;

namespace UI.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class ApiDasboardController : ControllerBase
    {

        [HttpPost]
        [AuthController]
        public List<TransactionReport> GetFacturasHoy() =>
            FacturacionDasboardServices.GetFacturasHoy(HttpContext.Session.GetString("sessionKey"));

        public List<TransactionReport> GetFacturasSemana() =>
            FacturacionDasboardServices.GetFacturasSemana(HttpContext.Session.GetString("sessionKey"));
        [HttpPost]
        [AuthController]
        public List<TransactionReport> GetFacturasMes() =>
            FacturacionDasboardServices.GetFacturasMes(HttpContext.Session.GetString("sessionKey"));
        [HttpPost]
        [AuthController]
        public List<TransactionReport> GetFacturasAnio() =>
            FacturacionDasboardServices.GetFacturasAnio(HttpContext.Session.GetString("sessionKey"));
    }
}