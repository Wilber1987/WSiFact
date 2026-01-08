
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace Business {
   public class Catalogo_Municipio : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? id_municipio { get; set; }
       public string? nombre { get; set; }
       public int? id_departamento { get; set; }
       [ManyToOne(TableName = "Catalogo_Departamento", KeyColumn = "id_departamento", ForeignKeyColumn = "id_departamento")]
       public Catalogo_Departamento? Catalogo_Departamento { get; set; }
   }
}
