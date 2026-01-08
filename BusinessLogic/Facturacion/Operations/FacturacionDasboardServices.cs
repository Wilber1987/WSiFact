using APPCORE;
using BusinessLogic.Facturacion.Mapping.Querys;

namespace BusinessLogic.Facturacion.Operations
{
    public class FacturacionDasboardServices
    {
        public enum Periodo
        {
            Hoy, Semana, Mes, Anio
        }

        // Método principal reutilizable (privado)
        public static List<TransactionReport> GetFacturasByPeriod(string? identify, Periodo periodo)
        {
            var (User, dbUser) = Business.Security_Users.GetUserData(identify);

            DateTime today = DateTime.Today;
            (DateTime desde, DateTime hasta) = periodo switch
            {
                Periodo.Hoy => (today, today),
                Periodo.Semana => (today.AddDays(-(int)today.DayOfWeek), today), // Lunes a hoy (ajusta si necesitas domingo-inicio)
                Periodo.Mes => (new DateTime(today.Year, today.Month, 1), today),
                Periodo.Anio => (new DateTime(today.Year, 1, 1), today),
                _ => throw new ArgumentOutOfRangeException(nameof(periodo))
            };

            var data = new TransactionReport
            {
                filterData =
                [
                    FilterData.Equal("c.tipo_cuenta", "PROPIA"),
                    FilterData.GreaterEqual("tm.fecha", desde),
                    FilterData.LessEqual("tm.fecha", hasta.AddDays(1).AddTicks(-1)), // cuidado: rango inclusivo
                    //FilterData.Equal("c.id_sucursal", dbUser?.Id_Sucursal ?? 0),
                ]
            }.Get<TransactionReport>();

            return data;
        }

        // Métodos públicos (wrapper)
        public static List<TransactionReport> GetFacturasHoy(string? identify) =>
            GetFacturasByPeriod(identify, Periodo.Hoy);

        public static List<TransactionReport> GetFacturasSemana(string? identify) =>
            GetFacturasByPeriod(identify, Periodo.Semana);

        public static List<TransactionReport> GetFacturasMes(string? identify) =>
            GetFacturasByPeriod(identify, Periodo.Mes);

        public static List<TransactionReport> GetFacturasAnio(string? identify) =>
            GetFacturasByPeriod(identify, Periodo.Anio);
    }
}