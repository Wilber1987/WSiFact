
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace Business {
   public class Catalogo_Sucursales : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Sucursal { get; set; }
		public int? Id_municipio { get; set; }
		public string? Nombre { get; set; }
		public string? Descripcion { get; set; }
		public string? Direccion { get; set; }
		[OneToOne(TableName = "Datos_Configuracion", KeyColumn = "Id_Sucursal", ForeignKeyColumn = "Id_Sucursal")]
		public Datos_Configuracion? Datos_Configuracion { get; set; }
		[ManyToOne(TableName = "Catalogo_Municipio", KeyColumn = "id_municipio", ForeignKeyColumn = "id_municipio")]
		public Catalogo_Municipio? Catalogo_Municipio { get; set; }
	}
	public class Datos_Configuracion : EntityClass
	{
		[PrimaryKey(Identity = false)]
		public int? Id_Sucursal { get; set; }
		public string? Encabezado { get; set; }
		public bool? AutoDebito { get; set; }
		public int? Consecutivo { get; set; }
		public Datos_Configuracion? FindConfig()
		{
			Datos_Configuracion? config = Find<Datos_Configuracion>();
			if (config == null)
			{
				config = (Datos_Configuracion?)new Datos_Configuracion
				{
					AutoDebito = false,
					Consecutivo = 0,
					Encabezado = null,
					Id_Sucursal = Id_Sucursal
				}.Save();
			}
			return config;
		}
	}
}
