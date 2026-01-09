using DataBaseModel;
using System.Text;
using System.Reflection;
using Model;

using iText.Kernel.Pdf;
using iText.Html2pdf;
using iText.Layout;
using iText.Layout.Element;
using System.Globalization;
using Org.BouncyCastle.Bcpg;
using APPCORE;
using APPCORE.Services;

namespace CAPA_NEGOCIO.Services
{
	public class ContractTemplateService
	{

		


		public static void generaPDF(Transaction_Contratos model)
		{
			try
			{
				string renderedHtml = GetContractContent(model);
				//LoggerServices.AddMessageInfo("FIN DE RENDER 2");
				// Generar el PDF
				var pdfFilePath = Path.Combine(System.IO.Path.GetFullPath("./wwwroot/Contracts"), "output.pdf");
				GeneratePdfFromHtml(renderedHtml, pdfFilePath);
				//LoggerServices.AddMessageInfo("FIN DE GENERATE");
			}
			catch (System.Exception ex)
			{
				LoggerServices.AddMessageInfo("ERROR DE GENERATE:" + ex);
				throw;
			}
		}

		public static string GetContractContent(Transaction_Contratos model)
		{
			if (model == null)
			{
				return "";
			}
			string templateContent = ContractsTemplates.ContractEmpeno;
			if (model.Tipo.Equals(Contratos_Type.EMPENO_VEHICULO))
			{
				templateContent = ContractsTemplates.ContractEmpenoVehiculo;
			}
			else if (model.Tipo.Equals(Contratos_Type.PRESTAMO))
			{
				templateContent = ContractsTemplates.ContractPrestamo;
			}
			else if (model.Tipo.Equals(Contratos_Type.APARTADO_MENSUAL))
			{
				templateContent = ContractsTemplates.ContractEmpeno;
			}
			else if (model.Tipo.Equals(Contratos_Type.APARTADO_QUINCENAL))
			{
				templateContent = ContractsTemplates.ContractQuincenal;
			}
			DateTime? fechaPrimeraCuota = model.Tbl_Cuotas?.Select(c => c.Fecha).ToList().Min();
			DateTime? fechaUltimaCuota = model.Tbl_Cuotas?.Select(c => c.Fecha).ToList().Max();
			var configuraciones_theme = new Transactional_Configuraciones().GetTheme();
			var configuraciones_generales = new Transactional_Configuraciones().GetGeneralData();

			//var configuraciones = new Transactional_Configuraciones().GetIntereses();
			templateContent = templateContent.Replace("{{Cuotafija}}", NumberUtility.ConvertToMoneyString(model.Cuotafija))
				.Replace("{{Numero_contrato}}", model.Numero_contrato?.ToString("D9"))
				.Replace("{{datos_apoderado}}", configuraciones_generales.Find(c => c.Nombre.Equals(GeneralDataEnum.APODERADO.ToString()))?.Valor)
				.Replace("{{resumen_datos_apoderado}}", configuraciones_generales.Find(c => c.Nombre.Equals(GeneralDataEnum.DATOS_APODERADO.ToString()))?.Valor)
				.Replace("{{firma}}", configuraciones_generales.Find(c => c.Nombre.Equals(GeneralDataEnum.FIRMA_DIGITAL_APODERADO.ToString()))?.Valor)
				.Replace("{{logo}}", "data:image/png;base64," + configuraciones_theme.Find(c => c.Nombre.Equals(ConfiguracionesThemeEnum.LOGO.ToString()))?.Valor)
				.Replace("{{titulo}}", configuraciones_theme.Find(c => c.Nombre == ConfiguracionesThemeEnum.TITULO.ToString())?.Valor)
				.Replace("{{subtitulo}}", configuraciones_theme.Find(c => c.Nombre == ConfiguracionesThemeEnum.SUB_TITULO.ToString())?.Valor)
				.Replace("{{info_tel}}", configuraciones_theme.Find(c => c.Nombre == ConfiguracionesThemeEnum.INFO_TEL.ToString())?.Valor)
				.Replace("{{Fecha_contrato_label}}", model.Fecha_contrato?.ToString("dddd, d \"del\" \"mes\" \"de\" MMMM \"del\" \"año\" yyyy \"a las\" h:mm tt", new CultureInfo("es-ES")))
				.Replace("{{Fecha_contrato_label_corta}}", model.Fecha_contrato?.ToString("dddd, d \"del\" \"mes\" \"de\" MMMM \"del\" \"año\" yyyy", new CultureInfo("es-ES")))
				.Replace("{{Fecha_primera_cuota}}", fechaPrimeraCuota?.ToString("dddd, d \"del\" \"mes\" \"de\" MMMM \"del\" \"año\" yyyy", new CultureInfo("es-ES")))
				.Replace("{{Fecha_ultima_cuota}}", fechaUltimaCuota?.ToString("dddd, d \"del\" \"mes\" \"de\" MMMM \"del\" \"año\" yyyy", new CultureInfo("es-ES")))
				.Replace("{{Cuotafija_label}}", NumberUtility.NumeroALetras(model.Cuotafija, true, "córdobas"))
				.Replace("{{Cuotafija_dolares}}", NumberUtility.ConvertToMoneyString(model.Cuotafija_dolares))
				.Replace("{{Cuotafija_dolares_label}}", NumberUtility.NumeroALetras(model.Cuotafija_dolares, true, "dólares"))
				.Replace("{{Valoracion_empeño_cordobas}}", NumberUtility.ConvertToMoneyString(model.Valoracion_empeño_cordobas))
				.Replace("{{Valoracion_empeño_cordobas_label}}", NumberUtility.NumeroALetras(model.Valoracion_empeño_cordobas, true, "córdobas"))
				.Replace("{{Valoracion_empeño_dolares}}", NumberUtility.ConvertToMoneyString(model.Valoracion_empeño_dolares))
				.Replace("{{Valoracion_empeño_dolares_label}}", NumberUtility.NumeroALetras(model.Valoracion_empeño_dolares, true, "dólares"));

			var renderedHtml = RenderTemplate(templateContent, model);

			////LoggerServices.AddMessageInfo("FIN DE RENDER");

			//var interes = configuraciones.Select(i => Convert.ToInt32(i.Valor)).ToArray().Sum();
			////LoggerServices.AddMessageInfo("FIN DE GET INTERESE");
			Catalogo_Clientes? cliente = model.Catalogo_Clientes?.Find<Catalogo_Clientes>();
			double valorInteres = model.DesgloseIntereses.GetPorcentageInteresesSGC(AplicaGastosAdministrativos(model));


			//var montoMora = model.Cuotafija * (model?.Mora ?? 0.005) * 1;//como el cronjob es diario se va cargando mora cada dia
			var mora = model.Mora / 100;

			renderedHtml = RenderTemplate(renderedHtml, cliente)
				.Replace("{{municipio}}", cliente.Catalogo_Municipio?.Nombre)
				.Replace("{{departamento}}", cliente.Catalogo_Departamento?.Nombre)
				.Replace("{{tabla_articulos}}", GeneratePrendasTableHtml(model.Detail_Prendas, model.Tipo.Equals(Contratos_Type.EMPENO_VEHICULO)))
				//MORA                
				.Replace("{{Valor_mora}}", "C$ " + NumberUtility.ConvertToMoneyString(model.Cuotafija_dolares * mora * model.Taza_cambio))
				.Replace("{{Valor_mora_label}}", NumberUtility.NumeroALetras(model.Cuotafija_dolares * mora * model.Taza_cambio, true, "córdobas"))

				/*INTERESES*/
				.Replace("{{interes_demas_cargos}}", model.Gestion_crediticia.ToString() ?? "6")
				.Replace("{{interes_demas_cargos_label}}", NumberUtility.NumeroALetras(
					Convert.ToDecimal(model.Gestion_crediticia.ToString() ?? "")))

				.Replace("{{interes_gastos_administrativos}}", AplicaGastosAdministrativos(model) ?
					model.DesgloseIntereses.GASTOS_ADMINISTRATIVOS.ToString() : "0")
				.Replace("{{interes_gastos_administrativos_label}}", NumberUtility.NumeroALetras(AplicaGastosAdministrativos(model) ?
					Convert.ToDecimal(model.DesgloseIntereses.GASTOS_ADMINISTRATIVOS.ToString()) : 0))

				.Replace("{{interes_gastos_legales}}",
					model.DesgloseIntereses.GASTOS_LEGALES.ToString())
				.Replace("{{interes_gastos_legales_label}}", NumberUtility.NumeroALetras(
					Convert.ToDecimal(model.DesgloseIntereses.GASTOS_LEGALES.ToString())))

				.Replace("{{interes_comisiones_label}}", NumberUtility.NumeroALetras(
					Convert.ToDecimal(model.DesgloseIntereses.COMISIONES.ToString())))
				.Replace("{{interes_comisiones}}",
					model.DesgloseIntereses.COMISIONES.ToString())

				.Replace("{{interes_mantenimiento_valor_label}}", NumberUtility.NumeroALetras(
					Convert.ToDecimal(model.DesgloseIntereses.MANTENIMIENTO_VALOR.ToString())))
				.Replace("{{interes_mantenimiento_valor}}",
					model.DesgloseIntereses.MANTENIMIENTO_VALOR.ToString())

				.Replace("{{Interes_inicial_label}}", NumberUtility.NumeroALetras(
					Convert.ToDecimal(model.DesgloseIntereses.INTERES_NETO_CORRIENTE.ToString())))
				.Replace("{{Interes_inicial}}",
					model.DesgloseIntereses.INTERES_NETO_CORRIENTE.ToString())

				.Replace("{{sum_intereses}}", (valorInteres +
					(!AplicaGastosAdministrativos(model) ? 0 :
					Convert.ToDouble(cliente.Catalogo_Clasificacion_Interes?.Porcentaje - 1))).ToString())
				.Replace("{{dias}}", DateTime.Now.Day.ToString())
				.Replace("{{mes}}", DateTime.Now.ToString("MMMM"))
				.Replace("{{anio}}", DateTime.Now.Year.ToString())
				.Replace("{{tbody_amortizacion}}", GenerateCuotesTableHtml(model.Tbl_Cuotas, cliente, model));
			return renderedHtml;
		}

		public static bool AplicaGastosAdministrativos(Transaction_Contratos model)
		{
			return !model.Tipo.Equals(Contratos_Type.APARTADO_MENSUAL) && !model.Tipo.Equals(Contratos_Type.APARTADO_QUINCENAL);
		}
		public static bool AplicaGastosIntereses(Transaction_Contratos model)
		{
			return !model.Tipo.Equals(Contratos_Type.APARTADO_QUINCENAL);
		}

		public static string RenderTemplate(string templateContent, object model)
		{
			PropertyInfo[] properties = model.GetType().GetProperties();
			string renderedTemplate = templateContent;
			foreach (PropertyInfo property in properties)
			{
				string propertyName = property.Name;
				object propertyValue = property.GetValue(model, null);
				string placeholder = "{{" + propertyName + "}}";
				if (propertyValue != null)
				{
					renderedTemplate = renderedTemplate.Replace(placeholder, propertyValue.ToString());
				}
				else
				{
					renderedTemplate = renderedTemplate.Replace(placeholder, "");
				}
			}
			return renderedTemplate;
		}

		static void GeneratePdfFromHtml(string html, string outputPath)
		{
			using (FileStream outputStream = new FileStream(outputPath, FileMode.Create))
			{
				using (var writer = new PdfWriter(outputStream))
				{
					using (var pdfDocument = new PdfDocument(writer))
					{
						// Crear el documento PDF a partir del HTML
						HtmlConverter.ConvertToPdf(html, pdfDocument, new ConverterProperties());

						Console.WriteLine("PDF generado con éxito en: " + outputPath);
					}
				}
			}
		}

		public static string GeneratePrendasTableHtml(List<Detail_Prendas> listaDatos, bool isVehiculo)
		{
			if (isVehiculo)
			{
				return VehiculosPrendasTable(listaDatos);
			}
			return BasicPrendasTable(listaDatos);
		}

		public static string VehiculosPrendasTable(List<Detail_Prendas> listaDatos)
		{
			StringBuilder htmlBuilder = new StringBuilder();
			// Abrir la etiqueta de la tabla con atributos de estilo para bordes y ancho 100%
			htmlBuilder.Append("<table style=\"font-size:9px;border-collapse: collapse; width: 100%; max-width: 100%;\">");
			// Encabezados de la tabla (opcional)
			htmlBuilder.Append("<tr>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">VEHÍCULO</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">COLOR</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">CAP/CILINDRO</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">CANT/CILINDRO</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">CANT/PASAJEROS</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">AÑO</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">MARCA</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">MODELO</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">N° MOTOR</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">CHASIS</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">PLACA</th>");
			htmlBuilder.Append("<th style=\"font-size:7px; text-align: center; padding: 4px; border: 1px solid black;\">N° DE CIRCULACIÓN</th>");
			// Agregar más encabezados según tus necesidades
			htmlBuilder.Append("</tr>");
			// Contenido de la tabla
			foreach (var dato in listaDatos)
			{
				htmlBuilder.Append("<tr>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Descripcion}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Color}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Capacidad_cilindros}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Cantidad_cilindros}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Cantidad_pasajeros}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Year_vehiculo}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Marca}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Modelo}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Montor}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Chasis}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Placa}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px; min-width: 8%; word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Detail_Prendas_Vehiculos?.Circuacion}</td>");
				// Agregar más columnas según las propiedades de tu objeto DatosTabla
				htmlBuilder.Append("</tr>");
			}

			// Cerrar la etiqueta de la tabla
			htmlBuilder.Append("</table>");
			return htmlBuilder.ToString();
		}

		public static string BasicPrendasTable(List<Detail_Prendas> listaDatos)
		{
			StringBuilder htmlBuilder = new StringBuilder();
			// Abrir la etiqueta de la tabla con atributos de estilo para bordes y ancho 100%
			htmlBuilder.Append("<table class='table' style=\"font-size:9px;border-collapse: collapse; width: 100%;\">");
			// Encabezados de la tabla (opcional)
			htmlBuilder.Append("<tr>");
			htmlBuilder.Append("<th style=\"font-size:9px; text-align: center; padding: 4px; border: 1px solid black;\">Bienes</th>");
			htmlBuilder.Append("<th style=\"font-size:9px; text-align: center; padding: 4px; border: 1px solid black;\">Color</th>");
			htmlBuilder.Append("<th style=\"font-size:9px; text-align: center; padding: 4px; border: 1px solid black;\">Marca</th>");
			htmlBuilder.Append("<th style=\"font-size:9px; text-align: center; padding: 4px; border: 1px solid black;\">Serie</th>");
			htmlBuilder.Append("<th style=\"font-size:9px; text-align: center; padding: 4px; border: 1px solid black;\">Modelo</th>");
			// Agregar más encabezados según tus necesidades
			htmlBuilder.Append("</tr>");
			// Contenido de la tabla
			foreach (var dato in listaDatos)
			{
				htmlBuilder.Append("<tr>");
				htmlBuilder.Append($"<td style=\"font-size:9px;word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Descripcion}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px;word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Color}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px;word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Marca}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px;word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Serie}</td>");
				htmlBuilder.Append($"<td style=\"font-size:9px;word-break: break-all; padding: 4px; border: 1px solid black;\">{dato.Modelo}</td>");
				// Agregar más columnas según las propiedades de tu objeto DatosTabla
				htmlBuilder.Append("</tr>");
			}

			// Cerrar la etiqueta de la tabla
			htmlBuilder.Append("</table>");
			return htmlBuilder.ToString();
		}

		public static string GenerateCuotesTableHtml(List<Tbl_Cuotas> listaDatos, Catalogo_Clientes cliente, Transaction_Contratos contrato)
		{
			bool aplicaInteres = contrato.Tipo !=  Contratos_Type.APARTADO_QUINCENAL;
			List<Tbl_Cuotas>? objListOrder = listaDatos?.OrderBy(order => order.Fecha).ToList();
			StringBuilder htmlBuilder = new StringBuilder();
			// Abrir la etiqueta de la tabla con atributos de estilo para bordes y ancho 100%
			htmlBuilder.Append("<tbody>");
			// Contenido de la tabla
			//double valorInteres = configuraciones.Select(c => Convert.ToDouble(c.Valor)).ToList().Sum() / 100;
			int index = 1;
			objListOrder?.ForEach(dato =>
			{
				htmlBuilder.Append("<tr>");
				htmlBuilder.Append($"<td class=\"desc\" colspan=\"2\">{dato.Fecha?.ToString("dddd, d \"del\" \"mes\" \"de\" MMMM \"del\" \"año\" yyyy", new CultureInfo("es-ES"))}</td>");

				if (aplicaInteres)
				{
					var interesNeto = dato.Interes / contrato.Tasas_interes * (contrato.DesgloseIntereses?.INTERES_NETO_CORRIENTE / 100);
					var demasCargos = dato.Interes - interesNeto;

					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(interesNeto * dato.Tasa_cambio)}</td>");
					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(interesNeto)}</td>");

					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(demasCargos * dato.Tasa_cambio)}</td>");
					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(demasCargos)}</td>");


					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Interes * dato.Tasa_cambio)}</td>");
					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Interes)}</td>");


					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Abono_capital * dato.Tasa_cambio)}</td>");
					htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Abono_capital)}</td>");
				}
				else
				{
					htmlBuilder.Append($"<td class=\"val\">{index}</td>");
				}
				htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Total * dato.Tasa_cambio)}</td>");
				htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Total)}</td>");
				htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Capital_restante * dato.Tasa_cambio)}</td>");
				htmlBuilder.Append($"<td class=\"val\">{NumberUtility.ConvertToMoneyString(dato.Capital_restante)}</td>");


				// Agregar más columnas según las propiedades de tu objeto DatosTabla
				htmlBuilder.Append("</tr>");
				index++;
			});
			// Cerrar la etiqueta de la tabla
			htmlBuilder.Append("</tbody>");
			return htmlBuilder.ToString();
		}
	}


}