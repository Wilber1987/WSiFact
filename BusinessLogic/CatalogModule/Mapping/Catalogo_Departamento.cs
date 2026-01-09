using APPCORE;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Business {
   public class Catalogo_Departamento : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? Id_departamento { get; set; }
       public string? Nombre { get; set; }
       public int? Id_nacionalidad { get; set; }
       public int? Ponderacion { get; set; }
       public int? Puntaje { get; set; }
       public string? Clasificacion { get; set; }
       [ManyToOne(TableName = "Catalogo_Nacionalidad", KeyColumn = "id_nacionalidad", ForeignKeyColumn = "id_nacionalidad")]
       public Catalogo_Nacionalidad? Catalogo_Nacionalidad { get; set; }
   }
}
