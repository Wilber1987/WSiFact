using APPCORE.Cron.Jobs;
using CAPA_NEGOCIO.Services;
using DataBaseModel;
using Microsoft.Extensions.Logging;

namespace BackgroundJob.Cron.Jobs
{
    public class SendMailNotificationsSchedulerJob : CronBackgroundJob
    {
        private readonly ILogger<SendMailNotificationsSchedulerJob> _log;

        public SendMailNotificationsSchedulerJob(CronSettings<SendMailNotificationsSchedulerJob> settings, ILogger<SendMailNotificationsSchedulerJob> log)
            : base(settings.CronExpression, settings.TimeZone)
        {
            _log = log;
        }

        protected override Task DoWork(CancellationToken stoppingToken)
        {
            _log.LogInformation(":::::::::::Running...  SendMailNotificationsSchedulerJob at {0}", DateTime.UtcNow);
            //CARGA AUTOMATICA DE CASOS
            try
            {
                //new SMTPCaseServices().sendCaseMailNotifications();
            }
            catch (System.Exception ex)
            {
                _log.LogInformation(":::::::::::ERROR... at {0}", ex);
            }

            return Task.CompletedTask;
        }
    }

    public class SendMovimientoCuentaMailNotificationsSchedulerJob : CronBackgroundJob
    {
        private readonly ILogger<SendMovimientoCuentaMailNotificationsSchedulerJob> _log;

        public SendMovimientoCuentaMailNotificationsSchedulerJob(CronSettings<SendMovimientoCuentaMailNotificationsSchedulerJob> settings, ILogger<SendMovimientoCuentaMailNotificationsSchedulerJob> log)
            : base(settings.CronExpression, settings.TimeZone)
        {
            _log = log;
        }       
        protected override Task DoWork(CancellationToken stoppingToken)
        {
            _log.LogInformation(":::::::::::Running...  SendMovimientoCuentaMailNotificationsSchedulerJob at {0}", DateTime.UtcNow);
            //Envio de mails cada vez que se realice un movimiento entre cuentas
            try
            {
                var movimientos = new Transaction_Movimiento()
                {
                    correo_enviado = false
                }.Get<Transaction_Movimiento>(" correo_enviado = 0");


                foreach (var item in movimientos)
                {
                    var modelo = new
                    {
                        FechaMovimiento = item.fecha,
                        CuentaOrigen = "Cuenta origen",
                        CuentaDestino = "Cuenta destino",
                        TipoMoneda = item.moneda,
                        Monto = 100,
                        Concepto = item.concepto,
                        Usuario = "todo usuario"
                    };
                    //MailServices.SendMailContract(new List<String>() { "wilberj1987@gmail.com", "alderhernandez@gmail.com" }, "noreply@noreply", "Notificación de movimiento entre cuentas", "NotificacionMovimientoCuentas.cshtml", modelo);//todo definir correos a enviar
                    var update = new Transaction_Movimiento()
                    {
                        id_movimiento = item.id_movimiento
                    }.Find<Transaction_Movimiento>();
                    update.correo_enviado = true;
                    update.Update();
                }

            }
            catch (System.Exception ex)
            {
                _log.LogInformation(":::::::::::ERROR... at {0}", ex);
            }

            return Task.CompletedTask;
        }

        private IEnumerable<object> Get<T>()
        {
            throw new NotImplementedException();
        }
    } 
}

