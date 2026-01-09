using APPCORE;
using Business;

namespace ClientDataBaseModel
{
	public class Catalogo_Clientes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Codigo_cliente { get; set; }
		public string? Primer_nombre { get; set; }
		public string? Segundo_nombre { get; set; }
		public string? Primer_apellido { get; set; }
		public string? Segundo_apellidio { get; set; }
		public int? Id_tipo_identificacion { get; set; }
		public string? Identificacion { get; set; }
		public string? Sexo { get; set; }
		public DateTime? Fecha_nacimiento { get; set; }
		public int? Id_profesion { get; set; }
		public int? Id_departamento { get; set; }
		public int? Id_municipio { get; set; }
		public string? Correo { get; set; }
		public string? Telefono { get; set; }
		public string? Direccion { get; set; }
		public DateTime? Fecha { get; set; }
		public string? Observaciones { get; set; }
		public string? Estado_civil { get; set; }
		public string? Tipo_firma { get; set; }
		public string? Operadora_celular { get; set; }

		[ManyToOne(TableName = "Catalogo_Departamento", KeyColumn = "id_departamento", ForeignKeyColumn = "id_departamento")]
		public Catalogo_Departamento? Catalogo_Departamento { get; set; }
		[ManyToOne(TableName = "Catalogo_Municipio", KeyColumn = "id_municipio", ForeignKeyColumn = "id_municipio")]
		public Catalogo_Municipio? Catalogo_Municipio { get; set; }
		[ManyToOne(TableName = "Catalogo_Profesiones", KeyColumn = "id_profesion", ForeignKeyColumn = "id_profesion")]
		public Catalogo_Profesiones? Catalogo_Profesiones { get; set; }
		[ManyToOne(TableName = "Catalogo_Tipo_Identificacion", KeyColumn = "id_tipo_identificacion", ForeignKeyColumn = "id_tipo_identificacion")]
		public Catalogo_Tipo_Identificacion? Catalogo_Tipo_Identificacion { get; set; }
		[OneToMany(TableName = "Condicion_Laboral_Cliente", KeyColumn = "codigo_cliente", ForeignKeyColumn = "id_cliente")]
		public List<Condicion_Laboral_Cliente>? Condicion_Laboral_Cliente { get; set; }

		public string Nombre_Completo { get { return $"{Primer_nombre} {Segundo_nombre} {Primer_apellido} {Segundo_apellidio}"; } }
	}
}
