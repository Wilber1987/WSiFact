
using BackgroundJob.Cron.Jobs;
using APPCORE.Cron.Jobs;
using Microsoft.AspNetCore.ResponseCompression;
using BusinessLogic.Connection;
using System.Text.Json.Serialization;
using DataBaseModel;
using CAPA_NEGOCIO.SystemConfig;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddControllers()
	.AddJsonOptions(JsonOptions => JsonOptions.JsonSerializerOptions.PropertyNamingPolicy = null)// retorna los nombres reales de las propiedades
	.AddJsonOptions(options => options.JsonSerializerOptions.WriteIndented = false)// Desactiva la indentación
	.AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));


builder.Services.AddResponseCompression(options =>
{
	options.EnableForHttps = true; // Activa la compresión también para HTTPS
	options.Providers.Add<GzipCompressionProvider>(); // Usar Gzip
	options.Providers.Add<BrotliCompressionProvider>(); // Usar Brotli (más eficiente)
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
	options.Level = System.IO.Compression.CompressionLevel.Fastest; // Puedes ajustar la compresión
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
	options.Level = System.IO.Compression.CompressionLevel.Fastest; // Nivel de compresión para Brotli
});


builder.Services.AddControllersWithViews();
builder.Services.AddSession(options =>
{
	options.IdleTimeout = TimeSpan.FromMinutes(40);
});
//TODO ACTIVAR CROMEJOB

builder.Services.AddCronJob<DailyCronJob>(options =>
{
	// Corre cada minuto
	//options.CronExpression = "0 0 13 1/1 * ? *";//ejecucion diaria a las 1 de la mañana
	options.CronExpression = "0 12 * * *";//12 md
	//options.CronExpression = "* * * * *";//cada minuto
	options.TimeZone = TimeZoneInfo.Local;
});

var app = builder.Build();
new BDConnection().IniciarMainConecction(app.Environment.IsDevelopment());
SystemConfig.isDebug = app.Environment.IsDevelopment();
Transactional_Configuraciones.GetPorcentageMinimoPagoApartadoMensual();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Error");
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseDefaultFiles();
app.UseResponseCompression(); // Usa la compresión en la aplicación

app.UseRouting();

app.UseAuthorization();
app.UseSession();

app.MapRazorPages();
app.MapControllers();

app.Run();