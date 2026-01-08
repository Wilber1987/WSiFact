using CAPA_NEGOCIO.Services;
using DataBaseModel;
using Microsoft.AspNetCore.Mvc;

using API.Controllers;
using APPCORE.Security;
using APPCORE;

namespace UI.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class PdfController : ControllerBase
    {
        [HttpPost]
        [AuthController]
        public ResponseService GeneratePdfContract(Transaction_Contratos Inst)
        {
            try
            {
                var model = Inst.Find<Transaction_Contratos>();
                ContractTemplateService.generaPDF(model);
                return new ResponseService()
                {
                    message = "success",
                    value = "../Contracts/output.pdf"
                };
            }
            catch (System.Exception ex)
            {
                return new ResponseService()
                {
                    status = 500,
                    message = "success",
                    value = "../Contracts/output.pdf",
                    body = ex
                };
            }

        }
    }
}
