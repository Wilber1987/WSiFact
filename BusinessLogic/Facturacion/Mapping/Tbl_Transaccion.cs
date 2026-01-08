using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;


namespace DataBaseModel
{
    public class Tbl_Transaccion : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_Transaccion { get;  set; }
        public double? Cantidad { get; set; }
        public int? Id_Lote { get;  set; }
        public TransactionsType? Tipo { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? Fecha { get; set; }
        public EstadoEnum? Estado { get; set; }
        public int? Id_User { get;  set; }
        
    }
}