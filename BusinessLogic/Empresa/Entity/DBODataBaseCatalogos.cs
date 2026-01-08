using API.Controllers;
using APPCORE;
using BusinessLogic.Facturacion.Mapping;
using Business;
using ClientDataBaseModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace DataBaseModel
{
	public class Catalogo_Estados_Articulos : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_estado_articulo { get; set; }
		public string? nombre { get; set; }
		public string? descripcion { get; set; }
		public double? porcentaje_compra { get; set; }
		public double? porcentaje_empeno { get; set; }
		// [OneToMany(TableName = "Transactional_Valoracion", KeyColumn = "id_estado_articulo", ForeignKeyColumn = "id_estado")]
		// public List<Transactional_Valoracion>? Transactional_Valoracion { get; set; }
	}


	//TODO ELIMINAR A POSTERIOR LO DE LOS AGENTES
	public class Catalogo_Agentes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_agente { get; set; }
		public string? identificacion { get; set; }
		public string? nombre { get; set; }
		public string? telefono { get; set; }
		public string? direccion { get; set; }
		public DateTime? fecha { get; set; }
		public int? Id_Tipo_Agente { get; set; }
		public string? Estado { get; set; }
		[ManyToOne(TableName = "Catalogo_Tipo_Agente", KeyColumn = "Id_Tipo_Agente", ForeignKeyColumn = "Id_Tipo_Agente")]
		public Catalogo_Tipo_Agente? Catalogo_Tipo_Agente { get; set; }
		//[OneToMany(TableName = "Transaction_Contratos", KeyColumn = "id_agente", ForeignKeyColumn = "id_agente")]
		public List<Transaction_Contratos>? Transaction_Contratos { get; set; }
	}
	public class Catalogo_Clasificacion_Cliente : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_clasificacion { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
		public double? porcentaje { get; set; }

		//[OneToMany(TableName = "Catalogo_Clientes", KeyColumn = "id_clasificacion", ForeignKeyColumn = "id_clasificacion")]
		public List<Catalogo_Clientes>? Catalogo_Clientes { get; set; }
	}

	public class Catalogo_Clasificacion_Interes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_clasificacion_interes { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
		public double? porcentaje { get; set; }

		//[OneToMany(TableName = "Catalogo_Clientes", KeyColumn = "id_clasificacion", ForeignKeyColumn = "id_clasificacion")]
		public List<Catalogo_Clientes>? Catalogo_Clientes { get; set; }
	}
	public class Catalogo_Tipo_Agente : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Tipo_Agente { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
	}
	public class Catalogo_Tipo_Identificacion : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_tipo_identificacion { get; set; }
		public string? Descripcion { get; set; }
		public string? Estado { get; set; }
	}

	public enum Categoria_CuentasEnum
	{
		CAJA_1,
		CAJA_2,
		CAJA_CHICA,
		CAJA_GENERAL,
		BANCO,
		FACTURAS_CONTRATOS,
		FACTURAS_VENTAS,
		OBLIGACIONES,
		EMPEÑOS,
		PRESTAMOS,
		DESEMBOLSO_CONTRATOS,
		INGRESOS_EMPENOS,
        PAGOS_FACTURAS_CLIENTES,
        PAGOS_FACTURAS_PROVEEDORES,
        INGRESO_COMPRA_DOLARES
    }

	public class Catalogo_Cuentas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_cuentas { get; set; }
		public string? nombre { get; set; }
		public string? tipo_cuenta { get; set; }
		public double? saldo { get; set; }
		public double? saldo_dolares { get; set; }
		public bool? permite_cordobas { get; set; }
		public bool? permite_dolares { get; set; }
		public int? id_sucursal { get; set; }
		public string? Categoria
		{
			get
			{
				return this.Categoria_Cuentas?.descripcion;
			}
		}
		[ManyToOne(TableName = "Catalogo_Sucursales", KeyColumn = "Id_Sucursal", ForeignKeyColumn = "id_sucursal")]
		public Catalogo_Sucursales? Catalogo_Sucursales { get; set; }
		public int? id_categoria { get; set; }
		[ManyToOne(TableName = "Categoria_Cuentas", KeyColumn = "id_categoria", ForeignKeyColumn = "id_categoria")]
		public Categoria_Cuentas? Categoria_Cuentas { get; set; }
		//externa, propia, pago
		[JsonProp]
		public List<Transaccion_Permitida>? Transacciones_Permitidas { get; set; }
		private static Catalogo_Cuentas? GetCuenta(Security_Users dbUser,
		Categoria_CuentasEnum categoria,
		string type)
		{
			int? idCategoria = GetId_categoria(categoria);
			Catalogo_Cuentas? cuenta = null;
			if (idCategoria != null)
			{
				cuenta = new Catalogo_Cuentas
				{
					id_sucursal = dbUser.Id_Sucursal
				}.Find<Catalogo_Cuentas>(FilterData.Equal("id_categoria", idCategoria));
			}
			cuenta = CrearCuentaSiNoExiste(dbUser, idCategoria, cuenta, categoria, type);
			return cuenta;
		}

		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA DE DONDE LA EMPRESA SACA EL DINERO DESEMBOLSA PARA PAGAR LOS CONTRATOS, PROPIA*/
		public static Catalogo_Cuentas? GetCuentaEgresoContratos(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_GENERAL, "PROPIA");
		}
		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA PAGA EL DESEMBOLSA PARA PAGAR LOS CONTRATOS, NORMALMENTE LOS CLIENTES, EXTERNA*/
		public static Catalogo_Cuentas? GetCuentaRegistoContratos(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.DESEMBOLSO_CONTRATOS, "EXTERNA");
		}
		
		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA QUE VIENE EL DINERO DE LOS RESIVOS, NORMALMENTE LOS CLIENTES, EXTERNA
			* SI UN CLIENTE HACE UN PAGO QUE DEBE SER ANULADO EL DINERO DEBE REGRESAR A EL
		*/
		public static Catalogo_Cuentas? GetCuentaEgresoRecibos(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.INGRESOS_EMPENOS, "EXTERNA");
		}
		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA EL DINERO QUE INGRESA DE LOS RECIBIOS
			* SI UN CLIENTE HACE UN PAGO EL DINERO QUE PAGA SE REGISTRARA EN ESTA CUENTA
		*/
		public static Catalogo_Cuentas? GetCuentaIngresoRecibos(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_1, "PROPIA");
		}

		/*
			* LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA QUE VIENE EL DINERO DE LAS FACTURAS,
			 NORMALMENTE LOS CLIENTES, EXTERNA
			* SI UN CLIENTE HACE UN PAGO QUE DEBE SER ANULADO EL DINERO DEBE REGRESAR A EL
		*/
		public static Catalogo_Cuentas? GetCuentaEgresoFacturas(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.PAGOS_FACTURAS_CLIENTES, "EXTERNA");
		}
		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA EL DINERO QUE INGRESA DE LOS RECIBIOS
			* SI UN CLIENTE HACE UN PAGO EL DINERO QUE PAGA SE REGISTRARA EN ESTA CUENTA
		*/
		public static Catalogo_Cuentas? GetCuentaIngresoFacturas(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_1, "PROPIA");
		}

			/*
			* LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA QUE VIENE 
				EL DINERO DE LAS FACTURAS QUE SE PAGAN A LOS PROVEEDORES, NORMALMENTE LOS CLIENTES, PROPIA
			* SI UN PROVEEDOR SE LE HACE UNA FACTURA QUE DEBE SER ANULADO EL DINERO DEBE REGRESAR A ESTA CUENTA
		*/
		public static Catalogo_Cuentas? GetCuentaEgresoFacturasProveedor(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_1, "PROPIA");
		}
		/*LA CUENTA QUE DEBE TOMAR ES LA CUENTA A DONDE LA EMPRESA REGISTRA EL DINERO QUE SE LE PAGA
			A LOS PROVEEDORES
			* SI UN PROVEEDORE VENDE UN PRODUCTO EL DINERO QUE SE LE PAGA SE REGISTRARA EN ESTA CUENTA
		*/
		public static Catalogo_Cuentas? GetCuentaIngresoFacturasProveedor(Security_Users dbUser)
		{
			return GetCuenta(dbUser, Categoria_CuentasEnum.PAGOS_FACTURAS_PROVEEDORES, "EXTERNA");
		}

		
        internal static Catalogo_Cuentas? GetCuentaCajaDolares(Security_Users dbUser)
        {
            return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_1, "PROPIA");
        }

        internal static Catalogo_Cuentas? GetCuentaCajaCordobas(Security_Users dbUser)
        {
            return GetCuenta(dbUser, Categoria_CuentasEnum.CAJA_1, "PROPIA");
        }


		private static Catalogo_Cuentas? CrearCuentaSiNoExiste(Security_Users dbUser, int? idCategoria,
		 Catalogo_Cuentas? cuenta,
		  Categoria_CuentasEnum categoria_CuentasEnum, string tipo_cuenta)
		{
			if (idCategoria == null)
			{
				Categoria_Cuentas? categoria_Cuentas = (Categoria_Cuentas?)new Categoria_Cuentas
				{
					descripcion = categoria_CuentasEnum.ToString()
				}.Save();
				idCategoria = categoria_Cuentas?.id_categoria;
			}
			if (cuenta == null)
			{
				cuenta = (Catalogo_Cuentas?)new Catalogo_Cuentas
				{
					id_sucursal = dbUser.Id_Sucursal,
					permite_dolares = true,
					permite_cordobas = true,
					saldo = 0,
					saldo_dolares = 0,
					id_categoria = idCategoria,
					nombre = categoria_CuentasEnum.ToString(),
					tipo_cuenta = tipo_cuenta
				}.Save();
			}
			return cuenta;
		}

		private static int? GetId_categoria(Categoria_CuentasEnum categoria_CuentasEnum)
		{
			return new Categoria_Cuentas { descripcion = categoria_CuentasEnum.ToString() }.Find<Categoria_Cuentas>()?.id_categoria;
		}

        internal static Catalogo_Cuentas? GetCuentaIngresoCompraDolares(Security_Users dbUser)
        {
            return GetCuenta(dbUser, Categoria_CuentasEnum.INGRESO_COMPRA_DOLARES, "EXTERNA");
        }
    }

	public class Transaccion_Permitida
	{
		public TipoMovimientoEnum MyProperty { get; set; }
	}

	public class Categoria_Cuentas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_categoria { get; set; }
		public string? descripcion { get; set; }
	}

	public class Permisos_Cuentas : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_permiso { get; set; }
		public int? id_categoria_cuenta_origen { get; set; }
		[ManyToOne(TableName = "Categoria_Cuentas", KeyColumn = "id_categoria", ForeignKeyColumn = "id_categoria_cuenta_origen")]
		public Categoria_Cuentas? Categoria_Cuentas_Origen { get; set; }
		public int? id_categoria_cuenta_destino { get; set; }
		[ManyToOne(TableName = "Categoria_Cuentas", KeyColumn = "id_categoria", ForeignKeyColumn = "id_categoria_cuenta_destino")]
		public Categoria_Cuentas? Categoria_Cuentas_Destino { get; set; }
		public bool? permite_debito { get; set; }
		public bool? permite_credito { get; set; }
	}

	public enum Tipo_Cuenta
	{
		PROPIA, EXTERNA, PAGO
	}
	public class Catalogo_Categoria : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_categoria { get; set; }
		public string? tipo { get; set; }
		public string? descripcion { get; set; }
		public int? plazo_limite { get; set; }
		public int? prioridad { get; set; }
		public bool? isEditable { get; set; }
	}


	public class Catalogo_Inversores : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_inversor { get; set; }
		public string? nombre { get; set; }
		public string? direccion { get; set; }
		public int? id_municipio { get; set; }
		public string? estado_civil { get; set; }
		public string? identificacion { get; set; }
		public string? telefono { get; set; }
		public int? id_nacionalidad { get; set; }
		[ManyToOne(TableName = "Catalogo_Municipio", KeyColumn = "id_municipio", ForeignKeyColumn = "id_municipio")]
		public Catalogo_Municipio? Catalogo_Municipio { get; set; }
		[ManyToOne(TableName = "Catalogo_Nacionalidad", KeyColumn = "id_nacionalidad", ForeignKeyColumn = "id_nacionalidad")]
		public Catalogo_Nacionalidad? Catalogo_Nacionalidad { get; set; }
		// [OneToMany(TableName = "Transaction_Contratos_Inversionistas", KeyColumn = "id_inversor", ForeignKeyColumn = "id_inversor")]
		// public List<Transaction_Contratos_Inversionistas>? Transaction_Contratos_Inversionistas { get; set; }
	}

	public class Catalogo_Profesiones : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? id_profesion { get; set; }
		public string? nombre { get; set; }
		//[OneToMany(TableName = "Catalogo_Clientes", KeyColumn = "id_profesion", ForeignKeyColumn = "id_profesion")]
		//public List<Catalogo_Clientes>? Catalogo_Clientes { get; set; }
	}

}
