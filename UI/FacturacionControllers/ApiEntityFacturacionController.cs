
using APPCORE;
using BusinessLogic.Facturacion.Mapping;
using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using UI.CAPA_NEGOCIO.Facturacion.Operations;
namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class ApiEntityFacturacionController : ControllerBase
	{
		//Tbl_Factura
		[HttpPost]
		[AuthController]
		public List<Tbl_Factura>? getTbl_Factura(Tbl_Factura Inst)
		{
			return Inst?.Get<Tbl_Factura>();
		}
		[HttpPost]
		[AuthController]
		public Tbl_Factura? findTbl_Factura(Tbl_Factura Inst)
		{
			return Inst?.Find<Tbl_Factura>();
		}
		[HttpPost]
        [AuthController]
        public ResponseService? FindFacturaContrato(Tbl_Factura Inst)
        {
            return FacturacionServices.FindFacturaContrato(Inst);
        }
        [HttpPost]
        [AuthController]
        public ResponseService? AnularFactura(Tbl_Factura Inst)
        {
            return new FacturacionServices().AnularFactura(Inst, HttpContext.Session.GetString("sessionKey"));
        }
		[HttpPost]
		[AuthController]
		public object? saveTbl_Factura(Tbl_Factura Inst)
		{
			return new FacturacionServices().SaveFactura(HttpContext.Session.GetString("sessionKey"),Inst);
		}
		[HttpPost]
		[AuthController]
		public object? updateTbl_Factura(Tbl_Factura Inst)
		{
			return Inst?.Update();
		}
		//Cat_Producto
		[HttpPost]
		[AuthController]
		public List<Cat_Producto>? getCat_Producto(Cat_Producto Inst)
		{
			return Inst?.Get<Cat_Producto>();
		}
		[HttpPost]
		[AuthController]
		public Cat_Producto? findCat_Producto(Cat_Producto Inst)
		{
			return Inst?.Find<Cat_Producto>();
		}
		[HttpPost]
		[AuthController]
		public object? saveCat_Producto(Cat_Producto Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateCat_Producto(Cat_Producto Inst)
		{
			return Inst?.Update();
		}
		//Cat_Marca
		[HttpPost]
		[AuthController]
		public List<Cat_Marca>? getCat_Marca(Cat_Marca Inst)
		{
			return Inst?.Get<Cat_Marca>();
		}
		[HttpPost]
		[AuthController]
		public Cat_Marca? findCat_Marca(Cat_Marca Inst)
		{
			return Inst?.Find<Cat_Marca>();
		}
		[HttpPost]
		[AuthController]
		public object? saveCat_Marca(Cat_Marca Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateCat_Marca(Cat_Marca Inst)
		{
			return Inst?.Update();
		}
		//Cat_Categorias
		[HttpPost]
		[AuthController]
		public List<Cat_Categorias>? getCat_Categorias(Cat_Categorias Inst)
		{
			return Inst?.Get<Cat_Categorias>();
		}
		[HttpPost]
		[AuthController]
		public Cat_Categorias? findCat_Categorias(Cat_Categorias Inst)
		{
			return Inst?.Find<Cat_Categorias>();
		}
		[HttpPost]
		[AuthController]
		public object? saveCat_Categorias(Cat_Categorias Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateCat_Categorias(Cat_Categorias Inst)
		{
			return Inst?.Update();
		}        
		//Transaccion_Factura
		[HttpPost]
		[AuthController]
		public List<Transaccion_Factura>? getTransaccion_Factura(Transaccion_Factura Inst)
		{
			return Inst?.Get<Transaccion_Factura>();
		}
		[HttpPost]
		[AuthController]
		public Transaccion_Factura? findTransaccion_Factura(Transaccion_Factura Inst)
		{
			return Inst?.Find<Transaccion_Factura>();
		}
		[HttpPost]
		[AuthController]
		public object? saveTransaccion_Factura(Transaccion_Factura Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateTransaccion_Factura(Transaccion_Factura Inst)
		{
			return Inst?.Update();
		}
		//Cat_Proveedor
		[HttpPost]
		[AuthController]
		public List<Cat_Proveedor>? getCat_Proveedor(Cat_Proveedor Inst)
		{
			return Inst?.Get<Cat_Proveedor>();
		}
		[HttpPost]
		[AuthController]
		public Cat_Proveedor? findCat_Proveedor(Cat_Proveedor Inst)
		{
			return Inst?.Find<Cat_Proveedor>();
		}
		[HttpPost]
		[AuthController]
		public object? saveCat_Proveedor(Cat_Proveedor Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateCat_Proveedor(Cat_Proveedor Inst)
		{
			return Inst?.Update();
		}
		//Tbl_Compra
		[HttpPost]
		[AuthController]
		public List<Tbl_Compra>? getTbl_Compra(Tbl_Compra Inst)
		{
			return Inst?.Get<Tbl_Compra>();
		}
		[HttpPost]
		[AuthController]
		public Tbl_Compra? findTbl_Compra(Tbl_Compra Inst)
		{
			return Inst?.Find<Tbl_Compra>();
		}
		[HttpPost]
		[AuthController]
		public object? saveTbl_Compra(Tbl_Compra Inst)
		{
			//return Inst?.Save();
			return Inst?.SaveCompra(HttpContext.Session.GetString("sessionKey"));
		}
		[HttpPost]
		[AuthController]
		public object? updateTbl_Compra(Tbl_Compra Inst)
		{
			return Inst?.Update();
		}
		[HttpPost]
		[AuthController]
		public object? anularCompra(Tbl_Compra Inst)
		{            
			return Inst?.AnularCompra(HttpContext.Session.GetString("sessionKey"));
		}
		//Cat_Almacenes
		[HttpPost]
		[AuthController]
		public List<Cat_Almacenes>? getCat_Almacenes(Cat_Almacenes Inst)
		{
			return Inst?.Get<Cat_Almacenes>();
		}
		[HttpPost]
		[AuthController]
		public Cat_Almacenes? findCat_Almacenes(Cat_Almacenes Inst)
		{
			return Inst?.Find<Cat_Almacenes>();
		}
		[HttpPost]
		[AuthController]
		public object? saveCat_Almacenes(Cat_Almacenes Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateCat_Almacenes(Cat_Almacenes Inst)
		{
			return Inst?.Update();
		}
		
		//Detalle_Compra
		[HttpPost]
		[AuthController]
		public List<Detalle_Compra>? getDetalle_Compra(Detalle_Compra Inst)
		{
			return Inst?.Get<Detalle_Compra>();
		}
		[HttpPost]
		[AuthController]
		public Detalle_Compra? findDetalle_Compra(Detalle_Compra Inst)
		{
			return Inst?.Find<Detalle_Compra>();
		}
		[HttpPost]
		[AuthController]
		public object? saveDetalle_Compra(Detalle_Compra Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateDetalle_Compra(Detalle_Compra Inst)
		{
			return Inst?.Update();
		}
		//Detalle_Factura
		[HttpPost]
		[AuthController]
		public List<Detalle_Factura>? getDetalle_Factura(Detalle_Factura Inst)
		{
			return Inst?.Get<Detalle_Factura>();
		}
		[HttpPost]
		[AuthController]
		public Detalle_Factura? findDetalle_Factura(Detalle_Factura Inst)
		{
			return Inst?.Find<Detalle_Factura>();
		}
		[HttpPost]
		[AuthController]
		public object? saveDetalle_Factura(Detalle_Factura Inst)
		{
			return Inst?.Save();
		}
		[HttpPost]
		[AuthController]
		public object? updateDetalle_Factura(Detalle_Factura Inst)
		{
			return Inst?.Update();
		}
		
		
		
		
	}
}
