using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using APPCORE.Security;
using System.Collections.Generic;

namespace API.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ApiEntitySECURITYController : ControllerBase
    {
        #region SECURITY
        [HttpPost]
        [AdminAuth]
        public Object getSecurity_Permissions(Security_Permissions inv) { return inv.Get<Security_Permissions>(); }
        [HttpPost]
        [AdminAuth]
        public Object? getSecurity_Roles(Security_Roles inv) { return inv.GetRoles(); }
        [HttpPost]
        [AdminAuth]
        public Object getSecurity_Users(Security_Users inv) { return inv.GetUsers(); }

        [HttpPost]
        [AdminAuth]
        public Object? saveSecurity_Permissions(Security_Permissions inv) { return inv.Save(); }
        [HttpPost]
        [AdminAuth]
        public Object saveSecurity_Roles(Security_Roles inv) { return inv.SaveRole(); }
        [HttpPost]
        [AdminAuth]
        public Object saveSecurity_Users(Security_Users inv) { return inv.SaveUser(HttpContext.Session.GetString("sessionKey")); }

        [HttpPost]
        [AdminAuth]
        public Object updateSecurity_Permissions(Security_Permissions inv) { return inv.Update("Id_Permission"); }

        #endregion
    }
}
