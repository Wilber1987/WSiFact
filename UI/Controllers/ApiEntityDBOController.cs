using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using CAPA_NEGOCIO.Services;

using System.Text;
using APPCORE.Security;
using APPCORE;
using Business;

namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class ApiEntityDBOController : ControllerBase
	{
		// private readonly IEmailSender _emailSender;
		// public ApiEntityDBOController(IEmailSender emailSender)
		// {
		//     _emailSender = emailSender;
		// }

		[HttpGet]
		public object? SendMail()
		{
			return MailServices.SendMailContract(new List<String>() { "wilberj1987@gmail.com", "alderhernandez@gmail.com" }, "noreply@noreply", "Usted es un mela", "example.cshtml",
					new
					{
						numero_contrato = 123,
						monto = 1000,
						observaciones = "Ejemplo de observaciones",
						// Otras propiedades...
					} as dynamic
				);
		}


		[HttpPost]
		[AuthController]
		public List<Catalogo_Clasificacion_Interes> getCatalogo_Clasificacion_Interes(Catalogo_Clasificacion_Interes Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Clasificacion_Interes>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Clasificacion_Interes(Catalogo_Clasificacion_Interes inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Clasificacion_Interes(Catalogo_Clasificacion_Interes inst)
		{
			return inst.Update();
		}
		[HttpPost]
		[AuthController]
		public List<Catalogo_Estados_Articulos> getCatalogo_Estados_Articulos(Catalogo_Estados_Articulos Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Estados_Articulos>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Estados_Articulos(Catalogo_Estados_Articulos inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Estados_Articulos(Catalogo_Estados_Articulos inst)
		{
			return inst.Update();
		}
		//Transactional_Valoracion
		[HttpPost]
		[AuthController]
		public List<Transactional_Valoracion> getTransactional_Valoracion(Transactional_Valoracion Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Transactional_Valoracion>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveTransactional_Valoracion(Transactional_Valoracion inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateTransactional_Valoracion(Transactional_Valoracion inst)
		{
			return inst.Update();
		}
		//TODO ELIMINAR A POSTERIOR LO DE LOS AGENTES
		//Catalogo_Agentes
		[HttpPost]
		[AuthController]
		public List<Catalogo_Agentes> getCatalogo_Agentes(Catalogo_Agentes Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Agentes>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Agentes(Catalogo_Agentes inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Agentes(Catalogo_Agentes inst)
		{
			return inst.Update();
		}
		//Catalogo_Clasificacion_Cliente
		[HttpPost]
		[AuthController]
		public List<Catalogo_Clasificacion_Cliente> getCatalogo_Clasificacion_Cliente(Catalogo_Clasificacion_Cliente Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Clasificacion_Cliente>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Clasificacion_Cliente(Catalogo_Clasificacion_Cliente inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Clasificacion_Cliente(Catalogo_Clasificacion_Cliente inst)
		{
			return inst.Update();
		}
		//Catalogo_Clientes
		[HttpPost]
		[AuthController]
		public List<Catalogo_Clientes> getCatalogo_Clientes(Catalogo_Clientes Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Clientes>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Clientes(Catalogo_Clientes inst)
		{
			return inst.SaveClient();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Clientes(Catalogo_Clientes inst)
		{
			return inst.Update();
		}
		//Condicion_Laboral_Cliente
		[HttpPost]
		[AuthController]
		public List<Condicion_Laboral_Cliente> getCondicion_Laboral_Cliente(Condicion_Laboral_Cliente Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Condicion_Laboral_Cliente>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCondicion_Laboral_Cliente(Condicion_Laboral_Cliente inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCondicion_Laboral_Cliente(Condicion_Laboral_Cliente inst)
		{
			return inst.Update();
		}
		//Catalogo_Tipo_Agente
		[HttpPost]
		[AuthController]
		public List<Catalogo_Tipo_Agente> getCatalogo_Tipo_Agente(Catalogo_Tipo_Agente Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Tipo_Agente>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Tipo_Agente(Catalogo_Tipo_Agente inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Tipo_Agente(Catalogo_Tipo_Agente inst)
		{
			return inst.Update();
		}
		//Catalogo_Tipo_Identificacion
		[HttpPost]
		[AuthController]
		public List<Catalogo_Tipo_Identificacion> getCatalogo_Tipo_Identificacion(Catalogo_Tipo_Identificacion Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Tipo_Identificacion>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Tipo_Identificacion(Catalogo_Tipo_Identificacion inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Tipo_Identificacion(Catalogo_Tipo_Identificacion inst)
		{
			return inst.Update();
		}
		//Transaction_Contratos
		[HttpPost]
		[AuthController]
		public List<Transaction_Contratos> getTransaction_Contratos(Transaction_Contratos Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.GetContratos();
		}
		[HttpPost]
        [AuthController]
        public Transaction_Contratos? findTransaction_Contratos(Transaction_Contratos Inst, [FromQuery] SearchData? pageData)
        {
            return Inst.FindAndUpdateContract();
        }
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveTransaction_Contratos(Transaction_Contratos inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateTransaction_Contratos(Transaction_Contratos inst)
		{
			return inst.Update();
		}
		//Detail_Prendas
		[HttpPost]
		[AuthController]
		public List<Detail_Prendas> getDetail_Prendas(Detail_Prendas Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Detail_Prendas>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveDetail_Prendas(Detail_Prendas inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateDetail_Prendas(Detail_Prendas inst)
		{
			return inst.Update();
		}
		//Detail_Prendas_Vehiculos
		[HttpPost]
		[AuthController]
		public List<Detail_Prendas_Vehiculos> getDetail_Prendas_Vehiculos(Detail_Prendas_Vehiculos Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Detail_Prendas_Vehiculos>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveDetail_Prendas_Vehiculos(Detail_Prendas_Vehiculos inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateDetail_Prendas_Vehiculos(Detail_Prendas_Vehiculos inst)
		{
			return inst.Update();
		}
		//Catalogo_Cambio_Divisa
		[HttpPost]
		[AuthController]
		public List<Catalogo_Cambio_Divisa> getCatalogo_Cambio_Divisa(Catalogo_Cambio_Divisa Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Cambio_Divisa>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Cambio_Divisa(Catalogo_Cambio_Divisa inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Cambio_Divisa(Catalogo_Cambio_Divisa inst)
		{
			return inst.Update();
		}
		//Catalogo_Cuentas
		[HttpPost]
		[AuthController]
		public List<Catalogo_Cuentas> getCatalogo_Cuentas(Catalogo_Cuentas Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Cuentas>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Cuentas(Catalogo_Cuentas inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Cuentas(Catalogo_Cuentas inst)
		{
			return inst.Update();
		}
		//Categoria_Cuentas
		[HttpPost]
		[AuthController]
		public List<Categoria_Cuentas> getCategoria_Cuentas(Categoria_Cuentas Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Categoria_Cuentas>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCategoria_Cuentas(Categoria_Cuentas inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCategoria_Cuentas(Categoria_Cuentas inst)
		{
			return inst.Update();
		}
		//Permisos_Cuentas
		[HttpPost]
		[AuthController]
		public List<Permisos_Cuentas> getPermisos_Cuentas(Permisos_Cuentas Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Permisos_Cuentas>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? savePermisos_Cuentas(Permisos_Cuentas inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updatePermisos_Cuentas(Permisos_Cuentas inst)
		{
			return inst.Update();
		}

		//Catalogo_Departamento
		[HttpPost]
		[AuthController]
		public List<Catalogo_Departamento> getCatalogo_Departamento(Catalogo_Departamento Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Departamento>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Departamento(Catalogo_Departamento inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Departamento(Catalogo_Departamento inst)
		{
			return inst.Update();
		}
		//Catalogo_Inversores
		[HttpPost]
		[AuthController]
		public List<Catalogo_Inversores> getCatalogo_Inversores(Catalogo_Inversores Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Inversores>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Inversores(Catalogo_Inversores inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Inversores(Catalogo_Inversores inst)
		{
			return inst.Update();
		}
		//Catalogo_Municipio
		[HttpPost]
		[AuthController]
		public List<Catalogo_Municipio> getCatalogo_Municipio(Catalogo_Municipio Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Municipio>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Municipio(Catalogo_Municipio inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Municipio(Catalogo_Municipio inst)
		{
			return inst.Update();
		}
		//Catalogo_Nacionalidad
		[HttpPost]
		[AuthController]
		public List<Catalogo_Nacionalidad> getCatalogo_Nacionalidad(Catalogo_Nacionalidad Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Nacionalidad>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Nacionalidad(Catalogo_Nacionalidad inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Nacionalidad(Catalogo_Nacionalidad inst)
		{
			return inst.Update();
		}
		//Catalogo_Profesiones
		[HttpPost]
		[AuthController]
		public List<Catalogo_Profesiones> getCatalogo_Profesiones(Catalogo_Profesiones Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Profesiones>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Profesiones(Catalogo_Profesiones inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Profesiones(Catalogo_Profesiones inst)
		{
			return inst.Update();
		}

		//Transaction_Contratos_Inversionistas
		[HttpPost]
		[AuthController]
		public List<Transaction_Contratos_Inversionistas> getTransaction_Contratos_Inversionistas(Transaction_Contratos_Inversionistas Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Transaction_Contratos_Inversionistas>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveTransaction_Contratos_Inversionistas(Transaction_Contratos_Inversionistas inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateTransaction_Contratos_Inversionistas(Transaction_Contratos_Inversionistas inst)
		{
			return inst.Update();
		}

		//Catalogo_Sucursales
		[HttpPost]
		[AuthController]
		public List<Catalogo_Sucursales> getCatalogo_Sucursales(Catalogo_Sucursales Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Sucursales>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Sucursales(Catalogo_Sucursales inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Sucursales(Catalogo_Sucursales inst)
		{
			return inst.Update();
		}
		//Datos_Configuracion
		[HttpPost]
		[AuthController]
		public List<Datos_Configuracion> getDatos_Configuracion(Datos_Configuracion Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Datos_Configuracion>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveDatos_Configuracion(Datos_Configuracion inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateDatos_Configuracion(Datos_Configuracion inst)
		{
			return inst.Update();
		}
		//Catalogo_Categoria
		[HttpPost]
		[AuthController]
		public List<Catalogo_Categoria> getCatalogo_Categoria(Catalogo_Categoria Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Catalogo_Categoria>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveCatalogo_Categoria(Catalogo_Categoria inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateCatalogo_Categoria(Catalogo_Categoria inst)
		{
			return inst.Update();
		}
		//Transaccion_Factura
		[HttpPost]
		[AuthController]
		public List<Transaccion_Factura> getTransaccion_Factura(Transaccion_Factura Inst, [FromQuery] SearchData? pageData)
		{
			return Inst.Where<Transaccion_Factura>(FilterData.Limit(30));
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? saveTransaccion_Factura(Transaccion_Factura inst)
		{
			return inst.Save();
		}
		[HttpPost]
		[AuthController(Permissions.ADMIN_ACCESS)]
		public object? updateTransaccion_Factura(Transaccion_Factura inst)
		{
			return inst.Update();
		}

	}
}
