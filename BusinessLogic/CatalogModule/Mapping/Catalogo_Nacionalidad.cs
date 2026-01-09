
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace Business {
   public class Catalogo_Nacionalidad : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? Id_nacionalidad { get; set; }
       public string? Nombre { get; set; }
       public string? Nacionalidad { get; set; }
       public int? Ponderacion { get; set; }
       public int? Puntaje { get; set; }
       public string? Clasificacion { get; set; }
   }
}
