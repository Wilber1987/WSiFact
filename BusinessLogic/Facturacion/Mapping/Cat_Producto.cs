
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace DataBaseModel
{
    public class Cat_Producto : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Producto { get; set; }
        public string? Descripcion { get; set; }
        public int? Id_Categoria { get; set; }
        public int? Id_Marca { get; set; }
        [ManyToOne(TableName = "Cat_Marca", KeyColumn = "Id_Marca", ForeignKeyColumn = "Id_Marca")]
        public Cat_Marca? Cat_Marca { get; set; }
        [ManyToOne(TableName = "Cat_Categorias", KeyColumn = "Id_Categoria", ForeignKeyColumn = "Id_Categoria")]
        public Cat_Categorias? Cat_Categorias { get; set; }
        //[OneToMany(TableName = "Detalle_Compra", KeyColumn = "Id_Producto", ForeignKeyColumn = "Id_Producto")]
        public List<Detalle_Compra>? Detalle_Compra { get; set; }
        //[OneToMany(TableName = "Detalle_Factura", KeyColumn = "Id_Producto", ForeignKeyColumn = "Id_Producto")]
        public List<Detalle_Factura>? Detalle_Factura { get; set; }

        public static void SetProductData(Cat_Producto? productParam)
        {
            Cat_Producto? producto = productParam?.Find<Cat_Producto>();            
            if (producto != null)
            {
               productParam?.Save();
            }  
            
        }
    }
}
