
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace DataBaseModel {
    public class Cat_Categorias : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Categoria { get; set; }
        public string? Descripcion { get; set; }
        public string? Estado { get; set; }
        //[OneToMany(TableName = "Cat_Producto", KeyColumn = "Id_Categoria", ForeignKeyColumn = "Id_Categoria")]
        public List<Cat_Producto>? Cat_Producto { get; set; }
    }
}
