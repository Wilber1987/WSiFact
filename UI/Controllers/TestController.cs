using APPCORE.Security;
using DataBaseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
// using System.Drawing;
// using System.Drawing.Imaging;
// using System.IO;
// using Tesseract;
//using SkiaSharp;
namespace API.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class TestController : ControllerBase
	{
		// [HttpPost]
		// public object ImageTest(Reconocimiento inst)
		// {
		// 	try
		// 	{
		// 		// Decodificar la imagen base64
		// 		SKBitmap image = Base64ToImage(inst.image);

		// 		// Extraer texto de la imagen usando OCR
		// 		string extractedText = ExtractTextFromImage(image);

		// 		// Analizar el texto extraído para obtener los datos específicos
		// 		CardInfo cardInfo = ParseCardInfo(extractedText);

		// 		return Ok(cardInfo);
		// 	}
		// 	catch (Exception ex)
		// 	{
		// 		return BadRequest(ex.Message);
		// 	}
		// 	//return true;
		// }

		// //static readonly HttpClient client = new HttpClient();
		// [HttpPost]
		// public async Task<object> ImageTest2(Reconocimiento inst)
		// {
		// 	try
		// 	{
		// 		HttpClient client = new HttpClient();
		// 		// URL de la imagen que deseas procesar
		// 		string base64Image = inst.image;

		// 		// Realiza la solicitud POST a la API de OCR
		// 		var response = await client.PostAsJsonAsync("https://api.ocr.space/parse/image", new { base64Image });

		// 		// Asegúrate de que la respuesta sea exitosa
		// 		response.EnsureSuccessStatusCode();

		// 		// Lee la respuesta y extrae el contenido
		// 		string responseBody = await response.Content.ReadAsStringAsync();
		// 		var parsedJson = JObject.Parse(responseBody);

		// 		// Imprime el texto reconocido
		// 		Console.WriteLine(parsedJson["ParsedResults"][0]["ParsedText"]);
		// 		return parsedJson;
		// 	}
		// 	catch (HttpRequestException e)
		// 	{
		// 		Console.WriteLine("\nException Caught!");
		// 		Console.WriteLine("Message :{0} ", e.Message);
		// 		throw;
		// 	}
		// }


		// private SKBitmap Base64ToImage(string base64String)
		// {
		// 	byte[] imageBytes = Convert.FromBase64String(base64String);
		// 	using (var ms = new MemoryStream(imageBytes))
		// 	{
		// 		return SKBitmap.Decode(ms);
		// 	}
		// }

		// // Aplicar preprocesamiento de imágenes
		// private SKBitmap PreprocessImage(SKBitmap image)
		// {
		// 	// Aplicar filtro Gaussiano para reducir el ruido
		// 	using (var surface = SKSurface.Create(new SKImageInfo(image.Width, image.Height)))
		// 	{
		// 		using (var canvas = surface.Canvas)
		// 		{
		// 			canvas.DrawBitmap(image, 0, 0);
		// 			using (var paint = new SKPaint())
		// 			{
		// 				paint.ImageFilter = SKImageFilter.CreateBlur(2, 2);
		// 				canvas.DrawBitmap(image, 0, 0, paint);
		// 			}
		// 			surface.Snapshot().PeekPixels().ReadPixels(image.Info, image.GetPixels(), image.RowBytes, 0, 0);
		// 		}
		// 	}
		// 	return image;
		// }

		// // Extracción de la fotografía
		// private SKBitmap ExtractPhoto(SKBitmap image)
		// {
		// 	// Implementa algoritmos de detección de contornos o reconocimiento de rostros
		// 	// para identificar la región de la fotografía en la imagen y extraerla
		// 	// Esta es solo una implementación de ejemplo, puedes usar bibliotecas como OpenCV
		// 	// para realizar esta tarea de manera más efectiva
		// 	// Aquí asumimos que la fotografía está en una región específica de la imagen
		// 	int x = 100;
		// 	int y = 100;
		// 	int width = 200;
		// 	int height = 200;

		// 	SKBitmap photo = new SKBitmap(width, height);
		// 	using (var surface = SKSurface.Create(new SKImageInfo(width, height)))
		// 	{
		// 		using (var canvas = surface.Canvas)
		// 		{
		// 			canvas.DrawBitmap(image, new SKRect(x, y, x + width, y + height), new SKRect(0, 0, width, height));
		// 			surface.Snapshot().PeekPixels().ReadPixels(photo.Info, photo.GetPixels(), photo.RowBytes, 0, 0);
		// 		}
		// 	}
		// 	return photo;
		// }

		// // Actualizar ExtractTextFromImage con preprocesamiento y depuración
		// private string ExtractTextFromImage(SKBitmap image)
		// {
		// 	// Aplicar preprocesamiento de imágenes
		// 	SKBitmap processedImage = PreprocessImage(image);

		// 	using (var ms = new MemoryStream())
		// 	{
		// 		using (var skImage = SKImage.FromBitmap(processedImage))
		// 		using (var skData = skImage.Encode(SKEncodedImageFormat.Png, 100))
		// 		{
		// 			skData.SaveTo(ms);
		// 		}

		// 		ms.Seek(0, SeekOrigin.Begin);

		// 		// Asegurarse de que el directorio tessdata esté configurado correctamente
		// 		string tessDataPath = Path.Combine(Directory.GetCurrentDirectory(), "tessdata");

		// 		using (var engine = new TesseractEngine(tessDataPath, "spa", EngineMode.Default))
		// 		{
		// 			using (var img = Pix.LoadFromMemory(ms.ToArray()))
		// 			{
		// 				using (var page = engine.Process(img))
		// 				{
		// 					// Depurar el texto extraído
		// 					string extractedText = page.GetText();
		// 					Console.WriteLine(extractedText);
		// 					return extractedText;
		// 				}
		// 			}
		// 		}
		// 	}
		// }



		// private CardInfo ParseCardInfo(string extractedText)
		// {
		// 	var lines = extractedText.Split('\n');
		// 	var cardInfo = new CardInfo();

		// 	foreach (var line in lines)
		// 	{
		// 		if (line.Contains("Nombre:"))
		// 		{
		// 			cardInfo.Nombre = line.Replace("Nombre:", "").Trim();
		// 		}
		// 		else if (line.Contains("Apellidos:"))
		// 		{
		// 			cardInfo.Apellidos = line.Replace("Apellidos:", "").Trim();
		// 		}
		// 	}

		// 	return cardInfo;
		// }

		// public class CardInfo
		// {
		// 	public string Nombre { get; set; }
		// 	public string Apellidos { get; set; }
		// 	public string Fotografia { get; set; } // This would be a path to the saved image
		// }


	}

	public class Reconocimiento
	{
		public string image { get; set; }
	}
}
