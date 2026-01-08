using APPCORE.Security;
using CAPA_NEGOCIO.SystemConfig;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class SecurityController : ControllerBase
	{
		[HttpPost]
		public object Login(UserModel Inst)
		{
			HttpContext.Session.SetString("sessionKey", Guid.NewGuid().ToString());
			return AuthNetCore.loginIN(Inst.mail, Inst.password, HttpContext.Session.GetString("sessionKey"));
		}
		public object LogOut()
		{
			return AuthNetCore.ClearSeason(HttpContext.Session.GetString("sessionKey"));
		}
		public bool Verification()
		{
			return AuthNetCore.Authenticate(HttpContext.Session.GetString("sessionKey"));
		}
	   
		public static bool Auth(string identfy)
		{
			return AuthNetCore.Authenticate(identfy);
		}
		public static bool IsAdmin(string identfy)
		{
			return AuthNetCore.HavePermission(Permissions.ADMIN_ACCESS.ToString(), identfy);
		}       
		public static bool HavePermission(string permission, string identfy)
		{
			return AuthNetCore.HavePermission(permission, identfy);
		}
		public static bool HavePermission(string? identfy, params Permissions[] permission)
        {            
            return AuthNetCore.HavePermission(identfy, permission);
        }   
		public object RecoveryPassword(UserModel Inst)
		{
			return AuthNetCore.RecoveryPassword(Inst.mail, SystemConfig.GetSMTPDefaultConfig());     
		}

	}
}
