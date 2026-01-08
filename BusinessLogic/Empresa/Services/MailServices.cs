using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using APPCORE.Services;

namespace CAPA_NEGOCIO.Services
{
    public class MailServices
    {
        static MailConfig config = new MailConfig()
        {
            HOST = "smtp.gmail.com",
            PASSWORD = "nbixjsqrnhkblxag",
            USERNAME = "alderhernandez@gmail.com"
        };        
        public static async void SendMailContract<T>(List<string> toMails, string from, string subject, string templatePage, T model)
        {            
               // var templatePage = templatePage; //Path.Combine(System.IO.Path.GetFullPath("../UI/Pages/Mails"), path);
                /*******modelo de prueba *****/               
               await SMTPMailServices.SendMail(
                    "reply@noreply.com",
                    toMails,
                    subject,
                    ContractTemplateService.RenderTemplate(templatePage, model), null,null,
                    config
                );
        }
    }
}
