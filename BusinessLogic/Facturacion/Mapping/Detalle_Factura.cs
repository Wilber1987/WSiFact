
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APPCORE;
namespace DataBaseModel {
	public class Detalle_Factura : EntityClass
		{
				[PrimaryKey(Identity = true)]
				public int? Id_DetalleFactura { get; set; }
				public int? Id_Factura { get; set; }
				public int? Id_Producto { get; set; }
				public double? Cantidad { get; set; }
				public double? Precio_Venta { get; set; }
				public double? Iva { get; set; }
				public double? Total { get; set; }
				public int? Id_Lote { get; set; }
				public double? Descuento { get; set; }
				public double? Sub_Total { get; set; }				
				public double? Monto_Descuento { get;  set; }
				
				//[ManyToOne(TableName = "Tbl_Factura", KeyColumn = "Id_Factura", ForeignKeyColumn = "Id_Factura")]
				public Tbl_Factura? Tbl_Factura { get; set; }
				
				[ManyToOne(TableName = "Tbl_Lotes", KeyColumn = "Id_Lote", ForeignKeyColumn = "Id_Lote")]
				public Tbl_Lotes? Lote { get; set; }
		}
}
