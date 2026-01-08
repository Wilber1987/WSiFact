using API.Controllers;
using APPCORE;
using CAPA_NEGOCIO.SystemConfig;
using Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace DataBaseModel
{
	public class Transactional_Configuraciones : APPCORE.SystemConfig.Transactional_Configuraciones
	{
		public Transactional_Configuraciones GetConfig(String prop)
		{			
			Nombre = prop;
			return Find<Transactional_Configuraciones>();
		}

		public List<Transactional_Configuraciones> GetIntereses()
		{
			return Get<Transactional_Configuraciones>()
				.Where(x => x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.INTERESES.ToString())).ToList();
		}
		public List<Transactional_Configuraciones> GetTheme()
		{
			return Get<Transactional_Configuraciones>()
				.Where(x => x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.THEME.ToString())).ToList();
		}
		public List<Transactional_Configuraciones> GetTypeNumbers()
		{
			return Get<Transactional_Configuraciones>()
				.Where(x => x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.NUMBER.ToString()) 
				|| x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.BENEFICIOS.ToString())).ToList();
		}
		public List<Transactional_Configuraciones> GetBeneficios()
		{
			return Get<Transactional_Configuraciones>()
				.Where(x => x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.BENEFICIOS.ToString())).ToList();
		}

		public List<Transactional_Configuraciones>  GetGeneralData()
		{
			return Get<Transactional_Configuraciones>()
			   .Where(x => x.Tipo_Configuracion.Equals(ConfiguracionesTypeEnum.GENERAL_DATA.ToString())).ToList();
		}
		
		static public int GetBeneficioVentaArticulo()
		{
			return Convert.ToInt32(GetParam(ConfiguracionesThemeEnum.BENEFICIO_VENTA_ARTICULO_COMPRADO, "45", ConfiguracionesTypeEnum.BENEFICIOS).Valor);
		}
		static public int GetPorcentajesApartado()
		{
			return Convert.ToInt32(GetParam(ConfiguracionesThemeEnum.PORCENTAGE_APARTADO, "60", ConfiguracionesTypeEnum.BENEFICIOS).Valor);
		}

		public object? UpdateConfig(string? identity)
		{
			if (!AuthNetCore.HavePermission(APPCORE.Security.Permissions.ADMIN_ACCESS.ToString(), identity))
			{
				throw new Exception("no tienes permisos para configurar la aplicación");
			}
			/*if (Nombre!.Equals(GeneralDataEnum.FIRMA_DIGITAL_APODERADO.ToString()))
			{
				ModelFiles? pic = (ModelFiles?)FileService.upload("profiles\\", new ModelFiles
				{
					Value = Valor,
					Type = "png",
					Name = "profile"
				}).body;
				Valor = pic?.Value?.Replace("wwwroot", "");
			}*/
			return this.Update();
		}			
		
		public static Transactional_Configuraciones GetParam(ConfiguracionesThemeEnum prop, string defaultValor = "", ConfiguracionesTypeEnum TYPE = ConfiguracionesTypeEnum.THEME)
		{

			var find = new Transactional_Configuraciones
			{
				Nombre = prop.ToString(),
			}.Find<Transactional_Configuraciones>();
			if (find == null)
			{
				find = new Transactional_Configuraciones
				{
					Valor = defaultValor,
					Descripcion = prop.ToString(),
					Nombre = prop.ToString(),
					Tipo_Configuracion = TYPE.ToString()
				};
				find.Save();
			}
			return find;
		}        
        public static int GetNumeroCuotasQuincenales(double? value)
        {
            if (value >= 61) 
            {
				return 3;
            } else if (value >= 31)
			{
				return 2;
			} else 
			{
				return 1;
			}
        }

        public static double GetPorcentageMinimoPagoApartadoMensual()
        {
            return Convert.ToInt32(GetParam(ConfiguracionesThemeEnum.PORCENTAGE_MINIMO_DE_PAGO_APARTADO_MENSUAL, "35", ConfiguracionesTypeEnum.BENEFICIOS).Valor);
        }

        internal static double GetValorMinimoApartadoQuincenal()
        {
            return Convert.ToInt32(GetParam(ConfiguracionesThemeEnum.VALOR_MINIMO_APARTADO_QUINCENAL, "10", ConfiguracionesTypeEnum.BENEFICIOS).Valor);
        }
    }

	public enum ConfiguracionesTypeEnum
	{
		INTERESES, BENEFICIOS, THEME, INTERESES_MORA,
		GENERAL_DATA, NUMBER
	}

	public enum ConfiguracionesThemeEnum
	{
		TITULO, SUB_TITULO, NOMBRE_EMPRESA, LOGO_PRINCIPAL,
		LOGO,
		INFO_TEL, 
		BENEFICIO_VENTA_ARTICULO_COMPRADO,
        PORCENTAGE_APARTADO,
        PORCENTAGE_MINIMO_DE_PAGO_APARTADO_MENSUAL,
        VALOR_MINIMO_APARTADO_QUINCENAL
    }

	public enum ConfiguracionesInteresesEnum
	{
		MORA_CONTRATOS_EMP
	}

	public enum InteresesPrestamosEnum
	{
		GASTOS_ADMINISTRATIVOS,
		COMISIONES,
		MANTENIMIENTO_VALOR,
		GASTOS_LEGALES,
		INTERES_NETO_CORRIENTE
	}

	public enum GeneralDataEnum
	{
		APODERADO, FIRMA_DIGITAL_APODERADO,  DATOS_APODERADO,
		APODERADO_VICEPRESIDENTE,
		DATOS_APODERADO_VICEPRESIDENTE,
		FIRMA_DIGITAL_APODERADO_VICEPRESIDENTE,
		CEDULA_APODERADO,
		CEDULA_APODERADO_VICEPRESIDENTE, RUC,
		EMAIL,
		INFO_TEL
	}



	public enum ConfiguracionesBeneficiosEnum
	{
		BENEFICIO_VENTA_ARTICULO_COMPRADO, BENEFICIO_VENTA_ARTICULO_EMPENO
	}
	public enum ConfiguracionesVencimientos
	{
		VENCIMIENTO_VALORACION, VENCIMIENTO_CONTRATO
	}

	public class Config
	{
		public static SystemConfig pageConfig()
		{
			return new SystemConfig();
		}
	}
	
}
