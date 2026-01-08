
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace DataBaseModel {
    public class Cat_Marca : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Marca { get; set; }
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public string? Estado { get; set; }
        //[OneToMany(TableName = "Cat_Producto", KeyColumn = "Id_Marca", ForeignKeyColumn = "Id_Marca")]
        public List<Cat_Producto>? Cat_Producto { get; set; }
    }
}
