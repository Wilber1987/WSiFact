using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace ClientDataBaseModel {
   public class Catalogo_Profesiones : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? id_profesion { get; set; }
       public string? nombre { get; set; }
      // [OneToMany(TableName = "Catalogo_Clientes", KeyColumn = "id_profesion", ForeignKeyColumn = "id_profesion")]
       public List<Catalogo_Clientes>? Catalogo_Clientes { get; set; }
   }
}
