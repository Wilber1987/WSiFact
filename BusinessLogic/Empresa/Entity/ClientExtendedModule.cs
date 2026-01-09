using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;


namespace DataBaseModel
{
	public class Catalogo_Clientes : ClientDataBaseModel.Catalogo_Clientes
	{

		public string? Hora { get; set; }
		public string? Descripcion
		{
			get
			{
				return $"{Primer_nombre} {Segundo_nombre} {Primer_apellido} {Segundo_apellidio}";
			}
		}
		public int? Tipoc { get; set; }
		public string? Valor_cliente { get; set; }
		public string? Solo_acreedor { get; set; }
		public double? Promedio { get; set; }
		public int? Id_clasificacion { get; set; }
		public int? Id_clasificacion_interes { get; set; }
		[ManyToOne(TableName = "Catalogo_Clasificacion_Cliente", KeyColumn = "id_clasificacion", ForeignKeyColumn = "id_clasificacion")]
		public Catalogo_Clasificacion_Cliente? Catalogo_Clasificacion_Cliente { get; set; }
		[ManyToOne(TableName = "Catalogo_Clasificacion_Interes", KeyColumn = "id_clasificacion_interes", ForeignKeyColumn = "id_clasificacion_interes")]
		public Catalogo_Clasificacion_Interes? Catalogo_Clasificacion_Interes { get; set; }
		/*[OneToMany(TableName = "Transaction_Contratos", KeyColumn = "codigo_cliente", ForeignKeyColumn = "codigo_cliente")]*/
		public List<Transaction_Contratos>? Transaction_Contratos { get; set; }

		public void ActualizarClasificacionInteres()
		{
			List<Catalogo_Clasificacion_Interes> clasificacion_Interes = new Catalogo_Clasificacion_Interes
			{
				orderData = [OrdeData.Desc("porcentaje")]
			}.Get<Catalogo_Clasificacion_Interes>();
			
			var objetoActual = clasificacion_Interes.FirstOrDefault(o => o.Id_clasificacion_interes == this.Id_clasificacion_interes);
			int indiceActual = clasificacion_Interes.IndexOf(objetoActual);
			if (indiceActual >= 0 && indiceActual < clasificacion_Interes.Count - 1)
			{
				Id_clasificacion_interes = clasificacion_Interes[indiceActual + 1].Id_clasificacion_interes;
				this.Catalogo_Clasificacion_Interes = clasificacion_Interes[indiceActual + 1];
				Update();
			}
		}

		public object? SaveClient()
		{
			if (new Catalogo_Clientes { Identificacion = this.Identificacion }.Find<Catalogo_Clientes>() != null)
			{
				return new ResponseService
				{
					status = 403,
					message = "Identificación en uso"
				};
			}
			return Save();
		}
	}
	public class Condicion_Laboral_Cliente : ClientDataBaseModel.Condicion_Laboral_Cliente
	{
	}
}