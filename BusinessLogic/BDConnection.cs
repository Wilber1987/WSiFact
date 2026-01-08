using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using APPCORE.BDCore.Abstracts;
using APPCORE.SystemConfig;
using DataBaseModel;
using Microsoft.Extensions.Configuration;

namespace BusinessLogic.Connection
{
	public class BDConnection
	{
		public BDConnection()
		{
			var configuration = SystemConfig.AppConfiguration();
			SqlCredentials = configuration.GetSection("SQLCredentials");
			SqlCredentialsSeguimiento = configuration.GetSection("SQLCredentialsSeguiminento");
			DataMapperSeguimiento = SqlADOConexion.BuildDataMapper(
				SqlCredentialsSeguimiento["Server"],
				SqlCredentialsSeguimiento["User"],
				SqlCredentialsSeguimiento["Password"],
				SqlCredentialsSeguimiento["Database"]
			);
		}
		//  public WDataMapper? DataMapper = SqlADOConexion.BuildDataMapper("localhost", "sa", "zaxscd", "IPS5Db");
		public WDataMapper? DataMapperSeguimiento { get; set; }
		public IConfigurationSection SqlCredentials { get; private set; }
		public IConfigurationSection SqlCredentialsSeguimiento { get; private set; }

		public bool IniciarMainConecction(bool isDebug = false)
		{
			if (isDebug)
			{
				return SqlADOConexion.IniciarConexion("sa", "zaxscd", ".", "EMPRE_SA");
			}
			//CONEXIONES DE PRODUCCION
			//SqlADOConexion.IniciarConexion("empresa", "Wmatus09%", "tcp:empresociedadanonima.database.windows.net", "EMPRE_SA");

			return SqlADOConexion.IniciarConexion(
				SqlCredentials["User"],
				SqlCredentials["Password"],
				SqlCredentials["Server"],
				SqlCredentials["Database"]
			);//SIASMOP USAV
		}
	}
}