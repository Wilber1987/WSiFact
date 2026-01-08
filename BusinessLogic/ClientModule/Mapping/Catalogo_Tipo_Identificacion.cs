using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace ClientDataBaseModel {
   public class Catalogo_Tipo_Identificacion : EntityClass {
       [PrimaryKey(Identity = true)]
       public int? id_tipo_identificacion { get; set; }
       public string? Descripcion { get; set; }
       public string? Estado { get; set; }
       //[OneToMany(TableName = "Catalogo_Clientes", KeyColumn = "id_tipo_identificacion", ForeignKeyColumn = "id_tipo_identificacion")]
       public List<Catalogo_Clientes>? Catalogo_Clientes { get; set; }
   }
}
