using Microsoft.Extensions.Configuration;
using DataBaseModel;
namespace CAPA_NEGOCIO.SystemConfig
{
	public class SystemConfig: APPCORE.SystemConfig.SystemConfig
	{
		public SystemConfig()
		{
			configuraciones = new Transactional_Configuraciones().Get<Transactional_Configuraciones>();
			RUC = configuraciones.Find(c => c.Nombre.Equals(GeneralDataEnum.RUC.ToString()))?.Valor ?? RUC;
			EMAIL = configuraciones.Find(c => c.Nombre.Equals(GeneralDataEnum.EMAIL.ToString()))?.Valor ?? EMAIL;
			INFO_TEL = configuraciones.Find(c => c.Nombre.Equals(GeneralDataEnum.INFO_TEL.ToString()))?.Valor ?? INFO_TEL;
			TITULO = configuraciones.Find(c => c.Nombre.Equals(ConfiguracionesThemeEnum.TITULO.ToString()))?.Valor ?? TITULO;
			SUB_TITULO = configuraciones.Find(c => c.Nombre.Equals(ConfiguracionesThemeEnum.SUB_TITULO.ToString()))?.Valor ?? SUB_TITULO;
			NOMBRE_EMPRESA = configuraciones.Find(c => c.Nombre.Equals(ConfiguracionesThemeEnum.NOMBRE_EMPRESA.ToString()))?.Valor ?? NOMBRE_EMPRESA;
			LOGO_PRINCIPAL = configuraciones.Find(c => c.Nombre.Equals(ConfiguracionesThemeEnum.LOGO_PRINCIPAL.ToString()))?.Valor ?? LOGO_PRINCIPAL;
			
			GetPorcentageMinimoPagoApartadoMensual = Transactional_Configuraciones.GetPorcentageMinimoPagoApartadoMensual();
			GetBeneficioVentaArticulo = Transactional_Configuraciones.GetBeneficioVentaArticulo();
			GetPorcentajesApartado = Transactional_Configuraciones.GetPorcentajesApartado();

		}
		public string RUC = "EMPRE-0001";
		public string EMAIL = "correo@correo.net";
		public string INFO_TEL = "000000000";
		public int GetNumeroCuotasQuincenales { get; set; }
		public int GetBeneficioVentaArticulo { get;set; }
		public int GetPorcentajesApartado { get;set; }
		public double GetPorcentageMinimoPagoApartadoMensual { get;set; }
		
		public List<DataBaseModel.Transactional_Configuraciones> configuraciones = new List<DataBaseModel.Transactional_Configuraciones>();

		
	}

}
