using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers;

namespace Business
{
    public class Security_Users : APPCORE.Security.Security_Users
    {
        public int? Id_Sucursal { get; set; }
        public static (UserModel?, Business.Security_Users?) GetUserData(string? Identify)
        {
            var user = AuthNetCore.User(Identify);
            var dbUser = new Business.Security_Users { Id_User = user.UserId }.Find<Security_Users>();
            return (user, dbUser);
        }
    }
}