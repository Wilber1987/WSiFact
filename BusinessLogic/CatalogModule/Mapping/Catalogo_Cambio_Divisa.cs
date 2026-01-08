using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Business
{
    public class Catalogo_Cambio_Divisa : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public int? Id_cambio { get; set; }
        public DateTime? Fecha { get; set; }
        public double? Valor_de_compra { get; set; }
        public double? Valor_de_venta { get; set; }
        public MonedaEnum? Moneda { get; set; }
        public Catalogo_Cambio_Divisa? GetDivisa(MonedaEnum? moneda = MonedaEnum.DOLAR)
        {
            return new Catalogo_Cambio_Divisa{ Moneda = moneda }.Get<Catalogo_Cambio_Divisa>()[0];
        }
    }

    public enum MonedaEnum
    {
        DOLAR
    } 
}