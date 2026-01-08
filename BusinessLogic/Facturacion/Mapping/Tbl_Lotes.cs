using API.Controllers;
using APPCORE;
using BusinessLogic.Facturacion.Mapping;
using Business;

namespace DataBaseModel
{
	public class Tbl_Lotes : EntityClass
	{
		[PrimaryKey(Identity = true)]
		public int? Id_Lote { get; set; }
		public int? Id_Producto { get; set; }
		public double? Precio_Venta { get; set; }
		public double? Precio_Compra { get; set; }
		public double? Cantidad_Inicial { get; set; }
		public double? Cantidad_Existente { get; set; }
		public int? Id_Sucursal { get; set; }
		public int? Id_User { get; set; }
		public DateTime? Fecha_Ingreso { get; set; }
		public int? Id_Almacen { get; set; }
		public string? Lote { get; set; }
		public int? Id_Detalle_Compra { get; set; }
		public string? Name { get { return Datos_Producto?.Descripcion ?? "-"; } }
		public string? Detalles { get; set; }
		public bool IsActivo
		{
			get
			{
				return Cantidad_Existente > 0;
			}
		}
		[JsonProp]
		public Transactional_Valoracion? Datos_Producto { get; set; }
		[JsonProp]
		public EtiquetaLote? EtiquetaLote { get; set; }

		[ManyToOne(TableName = "Cat_Almacenes", KeyColumn = "Id_Almacen", ForeignKeyColumn = "Id_Almacen")]
		public Cat_Almacenes? Cat_Almacenes { get; set; }
		[ManyToOne(TableName = "Detalle_Compra", KeyColumn = "Id_Detalle_Compra", ForeignKeyColumn = "Id_Detalle_Compra")]
		public Detalle_Compra? Detalle_Compra { get; set; }
		public List<Tbl_Transaccion>? lotes { get; set; }
		public EstadoEnum? Estado { get; set; }

		public static string GenerarLote(string? code = null)
		{

			string fechaLote = DateTime.Now.ToString("yyyyMMdd");
			string caracteresPermitidos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			Random random = new Random();
			string parteAleatoria = new string(Enumerable.Repeat(caracteresPermitidos, 3)
					.Select(s => s[random.Next(s.Length)]).ToArray());
			string codigoLote = (code ?? parteAleatoria) + "-" + fechaLote;
			return codigoLote;
		}

		public object? DarDeBaja(string identify, Tbl_Transaccion transaccion)
		{
			try
			{
				if (transaccion.Id_Lote == null || transaccion.Cantidad == null || transaccion.Descripcion == null)
				{
					return new ResponseService()
					{
						status = 403,
						message = "Lote, Canitidad y Descripcion son requeridos"
					};
				}
				Tbl_Lotes? loteOriginal = new Tbl_Lotes { Id_Lote = transaccion.Id_Lote }.Find<Tbl_Lotes>();
				var User = AuthNetCore.User(identify);
				var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
				if (loteOriginal == null || loteOriginal.Cantidad_Existente < transaccion.Cantidad)
				{
					return new ResponseService()
					{
						status = 403,
						message = loteOriginal == null ? "Lote no encontrado" : $"La cantidad debe ser menor a la existencia, actual del lote {loteOriginal.Cantidad_Existente}"
					};
				}
				loteOriginal.Cantidad_Existente -= transaccion.Cantidad;
				transaccion.Id_User = User.UserId;
				transaccion.Tipo = TransactionsType.BAJA_DE_EXISTENCIA;


				BeginGlobalTransaction();
				loteOriginal.Update();
				transaccion.Save();
				new Tbl_Bajas_Almacen
				{
					Id_Lote = loteOriginal.Id_Lote,
					Motivo_Baja = MotivosBajasEnum.ARTICULO_DAÑADO,
					Cantidad = transaccion.Cantidad,
					Fecha = DateTime.Now,
					Observaciones = transaccion.Descripcion,
					Id_User = User.UserId,
					Estado = EstadoEnum.ACTIVO,
					Id_Transaccion = transaccion.Id_Transaccion,
					Id_Sucursal = dbUser?.Id_Sucursal
				}.Save();
				CommitGlobalTransaction();
				return new ResponseService()
				{
					status = 200,
					message = "Baja exitosa"
				};
			}
			catch (System.Exception ex)
			{
				RollBackGlobalTransaction();
				LoggerServices.AddMessageError("Error en dar de baja", ex);
				return new ResponseService()
				{
					status = 500,
					message = "Error en dar de baja",
					body = ex
				};
			}

		}

		public List<Tbl_Lotes>? GetLotes(string? Identify)
		{
			var Estado = EstadoEnum.ACTIVO;
			return GetLotes(Identify, Estado);
		}

		private List<Tbl_Lotes> GetLotes(string? Identify, EstadoEnum Estado)
		{
			var User = AuthNetCore.User(Identify);
			var dbUser = new Business.Security_Users { Id_User = User.UserId }.Find<Security_Users>();
			if (User.isAdmin)
			{
				return Where<Tbl_Lotes>(
					FilterData.Greater("Cantidad_Existente", 0),
					FilterData.Equal("Estado", Estado)
				);
			}
			else if (AuthNetCore.HavePermission(Identify, APPCORE.Security.Permissions.GESTION_LOTES))
			{
				Id_Sucursal = dbUser?.Id_Sucursal;
				return Where<Tbl_Lotes>(
					FilterData.Greater("Cantidad_Existente", 0),
					FilterData.Equal("Estado", Estado)
				);
			}
			else
			{
				return Where<Tbl_Lotes>(
					FilterData.Equal("Id_Sucursal", dbUser?.Id_Sucursal),
					FilterData.Greater("Cantidad_Existente", 0),
					FilterData.Equal("Estado", Estado)
				);
			}
		}

		public List<Tbl_Lotes>? GetLotesInactivos(string? Identify)
		{
			var Estado = EstadoEnum.INACTIVO;
			return GetLotes(Identify, Estado);
		}


		public static void GenerarLoteAPartirDePrenda(Detail_Prendas prenda,
		Transactional_Configuraciones beneficioVentaE,
		Security_Users? dbUser,
		Transaction_Contratos contrato, bool isActive = true)
		{
			double? mora = prenda.Transactional_Valoracion?.Tasa_interes * 2 / 100;
			double? precio_venta_empeño = (prenda.Transactional_Valoracion?.Valoracion_empeño_dolares)
				* (mora + 1)
				* (Convert.ToDouble(beneficioVentaE.Valor) / 100 + 1);
			Cat_Producto producto = new Cat_Producto
			{
				Descripcion = prenda.Descripcion,
				Cat_Marca = new Cat_Marca
				{
					Nombre = prenda.marca,
					Descripcion = prenda.marca,
					Estado = EstadoEnum.ACTIVO.ToString()
				},
				Cat_Categorias = new Cat_Categorias
				{
					Descripcion = prenda.Catalogo_Categoria?.descripcion,
					Estado = EstadoEnum.ACTIVO.ToString()
				}
			};
			Cat_Producto.SetProductData(producto);
			Tbl_Lotes.SaveLoteByPrenda(prenda, dbUser, precio_venta_empeño, producto, contrato, isActive);
		}
		public static void SaveLoteByPrenda(Detail_Prendas prenda,
			Security_Users? dbUser,
			double? precio_venta_empeño,
			Cat_Producto producto,
			Transaction_Contratos contrato,
			bool isActive = true)
		{
			string codigo = Tbl_Lotes.GenerarLote(contrato.numero_contrato.GetValueOrDefault().ToString());
			int porcentajesUtilidad = Transactional_Configuraciones.GetBeneficioVentaArticulo();
			int porcentajesApartado = Transactional_Configuraciones.GetPorcentajesApartado();
			int Ncuotas = Transactional_Configuraciones.GetNumeroCuotasQuincenales(precio_venta_empeño.GetValueOrDefault());

			new Tbl_Lotes()
			{
				Precio_Venta = precio_venta_empeño,
				Precio_Compra = prenda.Transactional_Valoracion?.Valoracion_empeño_dolares,
				Cantidad_Inicial = 1,
				Cantidad_Existente = 1,
				Id_Sucursal = dbUser?.Id_Sucursal,
				Id_User = dbUser?.Id_User,
				Fecha_Ingreso = DateTime.Now,
				Datos_Producto = prenda.Transactional_Valoracion,
				Detalles = $"{prenda.Transactional_Valoracion?.Descripcion},\n{GetLoteDesc(prenda.Transactional_Valoracion)},\n Existencia perteneciente a vencimineto de contrato No. {contrato.numero_contrato.GetValueOrDefault():D9}",
				Id_Almacen = new Cat_Almacenes().GetAlmacen(dbUser?.Id_Sucursal ?? 0),
				Lote = codigo,
				Id_Producto = producto.Id_Producto,
				Estado = isActive ? EstadoEnum.ACTIVO : EstadoEnum.INACTIVO,
				EtiquetaLote = new EtiquetaLote
				{
					Tipo = "CV",
					Articulo = GetLoteDesc(prenda.Transactional_Valoracion),
					Codigo = codigo,
					PorcentajesUtilidad = porcentajesUtilidad,
					PorcentajesApartado = porcentajesApartado,
					PorcentajeAdicional = 0,
					N_Cuotas = Ncuotas,
					Precio_compra_dolares = prenda.Transactional_Valoracion?.Valoracion_empeño_dolares,
				}
			}.Save();
		}

		public static string GetLoteDesc(Transactional_Valoracion transactional_Valoracion)
		{
			return $"{transactional_Valoracion?.Descripcion}\n Marca: {transactional_Valoracion?.Marca}\n Modelo: {transactional_Valoracion?.Modelo}\n Serie: {transactional_Valoracion?.Modelo ?? "-"} ";
		}
	}




	public class EtiquetaLote
	{
		public EtiquetaLote()
		{
			//this.TasaCambio = new Catalogo_Cambio_Divisa().Get<Catalogo_Cambio_Divisa>().First();
			//this.Intereses = new Transactional_Configuraciones().GetIntereses();
		}

		public string? Articulo { get; set; }
		public string? Tipo { get; set; }
		public double? Precio_compra_dolares { get; set; }
		public int? N_Cuotas { get; set; }
		public string? Codigo { get; set; }
		public DateTime? Enviado_Liquidacion { get; set; }
		public double? PorcentajesUtilidad { get; set; }
		public double? PorcentajesApartado { get; set; }
		public double? PorcentajeAdicional { get; set; }
		public Catalogo_Cambio_Divisa? TasaCambio { get; }
		public List<Transactional_Configuraciones>? Intereses { get; }

		//public double? Precio_venta_Contado_cordobas { }
		public double? Precio_venta_Contado_dolares
		{
			get
			{
				return Precio_compra_dolares + (Precio_compra_dolares * ((PorcentajesUtilidad + PorcentajeAdicional) / 100));
			}
		}
		//public double? Precio_venta_Apartado_cordobas { get;  set; }
		public double? Precio_venta_Apartado_dolares
		{
			get
			{
				return Precio_compra_dolares + (Precio_compra_dolares * ((PorcentajesApartado + PorcentajeAdicional) / 100));
			}
		}
		//public double? Apartado_quincenal_cordobas { get; set; }
		public double? Cuota_apartado_quincenal_dolares { get { return Precio_venta_Apartado_dolares / N_Cuotas; } }
		//public double? Apartado_mensual_cordobas { get; set; }
		public double? Cuota_apartado_mensual_dolares
		{
			get;
			//{
			//return Precio_compra_dolares * Transactional_Configuraciones.GetPorcentageMinimoPagoApartadoMensual();
			/*return CuotasModule.GetPago(Precio_venta_Apartado_dolares,
				N_Cuotas,
				Intereses.Sum(i => Convert.ToDouble(i.Valor)));*/
			//}
			set;
		}
		/*[OnDeserialized]
		public void OnDeserializedMethod(StreamingContext context)
		{
			// Recalcula las propiedades calculadas
			var _0 = Precio_venta_Contado_dolares;
			var _1 = Precio_venta_Apartado_dolares;
			var _2 = Cuota_apartado_quincenal_dolares;
			var _3 = Cuota_apartado_mensual_dolares;
		}*/

	}

	public enum TransactionsType
	{
		BAJA_DE_EXISTENCIA,
		MOVIMIENTO_DE_EXISTENCIA
	}
}
