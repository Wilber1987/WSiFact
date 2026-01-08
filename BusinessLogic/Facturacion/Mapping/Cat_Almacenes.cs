
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace DataBaseModel {
   public class Cat_Almacenes : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Almacen { get; set; }
        public string? Descripcion { get; set; }
        public string? Estado { get; set; }
        public int? Id_Sucursal { get; set; }
        //[OneToMany(TableName = "Tbl_Lotes", KeyColumn = "Id_Almacen", ForeignKeyColumn = "Id_Almacen")]
        public List<Tbl_Lotes>? Tbl_Lotes { get; set; }

        public int GetAlmacen(int Id_Sucursal)
        {
            try
            {
                var primerAlmacen = new Cat_Almacenes()
                {
                    Descripcion = "Almacén Sucursal: " + Id_Sucursal
                }.Get<Cat_Almacenes>().FirstOrDefault();

                if (primerAlmacen != null)
                {
                    return primerAlmacen.Id_Almacen ?? 0;
                }
                else
                {
                    var nuevoAlmacen = new Cat_Almacenes()
                    {
                        Descripcion = "Almacén Sucursal: " + Id_Sucursal,
                        Estado = "Activo"
                    };
                    nuevoAlmacen.Save();
                    return nuevoAlmacen.Id_Almacen ?? 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al obtener el almacén: " + ex.Message);
                return 0;
            }
        }
    }
}
