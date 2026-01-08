
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
using Business;
namespace DataBaseModel
{
    public class Cat_Proveedor : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Proveedor { get; set; }
        public string? Nombre { get; set; }
        public string? Identificacion { get; set; }
        public string? Estado { get; set; }
        [JsonProp]
        public Datos_Proveedor? Datos_Proveedor { get; set; }
        //[OneToMany(TableName = "Tbl_Compra", KeyColumn = "Id_Proveedor", ForeignKeyColumn = "Id_Proveedor")]
        public List<Tbl_Compra>? Tbl_Compra { get; set; }
    }
    public class Datos_Proveedor
    {
        [PrimaryKey(Identity = true)]
		public int? codigo_cliente { get; set; }
        public string? primer_nombre { get; set; }
        public string? segundo_nombre { get; set; }
        public string? primer_apellido { get; set; }
        public string? segundo_apellidio { get; set; }
        public string? sexo { get; set; }
        public string? correo { get; set; }
        public string? telefono { get; set; }
        public string? direccion { get; set; }
        public string? observaciones { get; set; }
        public int? id_departamento { get; set; }
		public int? id_municipio { get; set; }
        public int? id_tipo_identificacion { get; set; }
        
        public string Nombre_Completo { get { return $"{primer_nombre} {segundo_nombre} {primer_apellido} {segundo_apellidio}"; } }
		[ManyToOne(TableName = "Catalogo_Departamento", KeyColumn = "id_departamento", ForeignKeyColumn = "id_departamento")]
		public Catalogo_Departamento? Catalogo_Departamento { get; set; }
		[ManyToOne(TableName = "Catalogo_Municipio", KeyColumn = "id_municipio", ForeignKeyColumn = "id_municipio")]
		public Catalogo_Municipio? Catalogo_Municipio { get; set; }

        [ManyToOne(TableName = "Catalogo_Tipo_Identificacion", KeyColumn = "id_tipo_identificacion", ForeignKeyColumn = "id_tipo_identificacion")]
		public Catalogo_Tipo_Identificacion? Catalogo_Tipo_Identificacion { get; set; }
		
		
    }
}
