using APPCORE;
using Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace ClientDataBaseModel {
   public class Condicion_Laboral_Cliente : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? id { get; set; }
       public int? id_cliente { get; set; }
       public DateTime? fecha_ingreso { get; set; }
       public string? ocupacion_cargo { get; set; }
       public double? ingresos_mensuales { get; set; }
       public string? direccion { get; set; }
       public int? id_municipio { get; set; }
       public int? id_departamento { get; set; }
       public string? nombre_empresa { get; set; }
       [ManyToOne(TableName = "Catalogo_Clientes", KeyColumn = "codigo_cliente", ForeignKeyColumn = "id_cliente")]
       public Catalogo_Clientes? Catalogo_Clientes { get; set; }
       [ManyToOne(TableName = "Catalogo_Departamento", KeyColumn = "id_departamento", ForeignKeyColumn = "id_departamento")]
       public Catalogo_Departamento? Catalogo_Departamento { get; set; }
       [ManyToOne(TableName = "Catalogo_Municipio", KeyColumn = "id_municipio", ForeignKeyColumn = "id_municipio")]
       public Catalogo_Municipio? Catalogo_Municipio { get; set; }
   }
}
