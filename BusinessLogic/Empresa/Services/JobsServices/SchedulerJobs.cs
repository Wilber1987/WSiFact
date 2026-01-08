using APPCORE.Cron.Jobs;
using CAPA_NEGOCIO.Services;
using DataBaseModel;
using Model;
using Transactions;
using Microsoft.Extensions.Logging;

namespace BackgroundJob.Cron.Jobs
{
    public class DailyCronJob : CronBackgroundJob
    {
        private readonly ILogger<DailyCronJob> _log;

        public DailyCronJob(CronSettings<DailyCronJob> settings, ILogger<DailyCronJob> log)
            : base(settings.CronExpression, settings.TimeZone)
        {
            _log = log;
        }

        protected override Task DoWork(CancellationToken stoppingToken)
        {
            _log.LogInformation(":::::::::::Running...  DailyCronJob at {0}", DateTime.UtcNow);
            try
            {
                new Recibos_Transactions().CalculateMora();
            }
            catch (System.Exception ex)
            {
                _log.LogInformation(":::::::::::ERROR  CALCULANDO MORA... at {0}", ex);
            }
            try
            {
                new ContractServices().Vencimientos();
            }
            catch (System.Exception ex)
            {
                _log.LogInformation(":::::::::::ERROR  EN VENCIMIENTO DE CONTRATOS... at {0}", ex);
            }
            return Task.CompletedTask;
        }

        private IEnumerable<object> Get<T>()
        {
            throw new NotImplementedException();
        }
    }
}

