using APPCORE;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Business {
   public class Catalogo_Departamento : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? id_departamento { get; set; }
       public string? nombre { get; set; }
       public int? id_nacionalidad { get; set; }
       public int? ponderacion { get; set; }
       public int? puntaje { get; set; }
       public string? clasificacion { get; set; }
       [ManyToOne(TableName = "Catalogo_Nacionalidad", KeyColumn = "id_nacionalidad", ForeignKeyColumn = "id_nacionalidad")]
       public Catalogo_Nacionalidad? Catalogo_Nacionalidad { get; set; }
   }
}
