using APPCORE;
using Business;

namespace ClientDataBaseModel
{
	public class Catalogo_Clientes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? codigo_cliente { get; set; }
		public string? primer_nombre { get; set; }
		public string? segundo_nombre { get; set; }
		public string? primer_apellido { get; set; }
		public string? segundo_apellidio { get; set; }
		public int? id_tipo_identificacion { get; set; }
		public string? identificacion { get; set; }
		public string? sexo { get; set; }
		public DateTime? fecha_nacimiento { get; set; }
		public int? id_profesion { get; set; }
		public int? id_departamento { get; set; }
		public int? id_municipio { get; set; }
		public string? correo { get; set; }
		public string? telefono { get; set; }
		public string? direccion { get; set; }
		public DateTime? fecha { get; set; }
		public string? observaciones { get; set; }
		public string? estado_civil { get; set; }
		public string? tipo_firma { get; set; }
		public string? operadora_celular { get; set; }

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

		public string Nombre_Completo { get { return $"{primer_nombre} {segundo_nombre} {primer_apellido} {segundo_apellidio}"; } }
	}
}
