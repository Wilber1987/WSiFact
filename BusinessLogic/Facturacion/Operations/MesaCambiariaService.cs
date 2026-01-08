using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using APPCORE.Security;
using APPCORE.Services;
using Business;
using DataBaseModel;
using Transactions;

namespace BusinessLogic.Facturacion.Operations
{
    public class MesaCambiariaService
    {
        public static ResponseService GenerarMovimientosCambiariosFacturacion(Business.Security_Users dbUser, Tbl_Factura? factura)
        {
            try
            {
                // ✅ Solo para: factura en USD y cambio entregado en C$
                if (factura?.Moneda?.ToUpper() != "CORDOBAS" && factura?.Is_cambio_cordobas == true)
                {
                    // 👇 Opción simple y segura (usa fecha + milisegundos + ID factura)
                    string secuencia = "FACT-" + factura.Id_Factura.GetValueOrDefault().ToString("D9"); // o usa un contador global
                    string? moneda = factura?.Moneda?.ToUpper();
                    // 2. Determinar cuánto USD se "compra" al cliente (excedente pagado)
                    // Suponemos que el cliente pagó en USD un monto mayor al valor de la factura
                    double montoFacturaUSD = factura?.Total ?? 0;
                    double montoPagadoUSD = factura?.Monto_dolares ?? 0;
                    (bool flowControl, ResponseService value) = GenerarMovimientosCambiarios(dbUser, secuencia, moneda, montoFacturaUSD, montoPagadoUSD);
                    if (!flowControl)
                    {
                        return value;
                    }
                }
                return new ResponseService(200, "Mesa Creada con exito");
            }
            catch (System.Exception ex)
            {

                return new ResponseService(500, "Error, creando mesa Mesa", ex);
            }

        }

        public static ResponseService GenerarMovimientosCambiariosrecibos(Business.Security_Users dbUser, Recibos_Transactions? recibo)
        {
            try
            {
                // ✅ Solo para: factura en USD y cambio entregado en C$
                if (recibo?.moneda?.ToUpper() != "CORDOBAS" && recibo?.Is_cambio_cordobas == true)                {
                    // 👇 Opción simple y segura (usa fecha + milisegundos + ID factura)
                    string secuencia = "FACT-" + recibo.id_recibo.GetValueOrDefault().ToString("D9"); // o usa un contador global
                    string? moneda = recibo?.moneda?.ToUpper();
                    // 2. Determinar cuánto USD se "compra" al cliente (excedente pagado)
                    // Suponemos que el cliente pagó en USD un monto mayor al valor de la factura
                    double montoFacturaUSD = recibo?.total_apagar_dolares ?? 0;
                    double montoPagadoUSD = recibo?.monto_dolares ?? 0;
                    (bool flowControl, ResponseService value) = GenerarMovimientosCambiarios(dbUser, secuencia, moneda, montoFacturaUSD, montoPagadoUSD);
                    if (!flowControl)
                    {
                        return value;
                    }
                }
                return new ResponseService(200, "Mesa Creada con exito");
            }
            catch (System.Exception ex)
            {

                return new ResponseService(500, "Error, creando mesa Mesa", ex);
            }

        }

        private static (bool flowControl, ResponseService value) GenerarMovimientosCambiarios(Business.Security_Users dbUser,
            string secuencia,
            string? moneda,
            double montoFacturaUSD,
            double montoPagadoUSD)
        {
            // 1. Obtener tasas vigentes (usa la fecha de la factura o NOW)
            var divisa = new Catalogo_Cambio_Divisa().GetDivisa(MonedaEnum.DOLAR);
            if (divisa == null || divisa.Valor_de_compra <= 0)
                return (flowControl: false, value: new ResponseService { status = 400, message = "Tasa de compra no disponible" });
            double tasaCompra = divisa.Valor_de_compra!.Value;

            // Mejor aún: combinar con ticks o random corto
            string fechaStr = DateTime.Now.ToString("yyyyMMdd");
            string randomPart = (DateTime.Now.Ticks % 1000).ToString("000");
            string referenciaCambiaria = $"CAMB-{fechaStr}-({secuencia})-{randomPart}";

            if (montoPagadoUSD < montoFacturaUSD)
                return (flowControl: false, value: new ResponseService { status = 400, message = "Monto pagado insuficiente para dar cambio" });

            double excedenteUSD = montoPagadoUSD - montoFacturaUSD;

            // Si no hay excedente, no hay operación cambiaria
            if (excedenteUSD <= 0.001) // tolerancia para redondeo
                return (flowControl: false, value: new ResponseService { status = 200, message = "No hay operación cambiaria" });

            // 3. Calcular monto en C$ entregado como cambio
            double cambioEnCordobas = excedenteUSD * tasaCompra;

            // 4. Definir cuentas para operaciones cambiarias (⚠️ clave: cuentas específicas)
            //     Puedes parametrizar o reutilizar, pero idealmente tener:
            //     - Cuenta "Caja USD"   → donde ingresan los USD comprados
            //     - Cuenta "Caja C$"    → de donde salen los C$ entregados
            //     Si no existen, puedes usar las mismas cuentas actuales, pero con distinto concepto.

            var cuentaCajaUSD = Catalogo_Cuentas.GetCuentaCajaDolares(dbUser);   // ← DEBES IMPLEMENTAR
            var cuentaCajaCordobas = Catalogo_Cuentas.GetCuentaCajaCordobas(dbUser); // ← DEBES IMPLEMENTAR

            var cuentaIngresoCompraUSD = Catalogo_Cuentas.GetCuentaIngresoCompraDolares(dbUser);   // ← DEBES IMPLEMENTAR

            if (cuentaCajaUSD == null || cuentaCajaCordobas == null)
                return (flowControl: false, value: new ResponseService { status = 400, message = "Cuentas de caja cambiaria no configuradas" });

            string conceptoBase = $"Mesa cambiaria - {referenciaCambiaria}";

            // ✅ Movimiento A: COMPRA de USD → ingresan USD a caja USD
            var responseCompra = new Movimientos_Cuentas
            {
                Catalogo_Cuentas_Origen = cuentaIngresoCompraUSD, // (opcional: puede ser una cuenta "neutra", o caja C$ ya que se entrega C$)
                Catalogo_Cuentas_Destino = cuentaCajaUSD,
                concepto = "Compra de USD (cambio)", // tipo de operación cambiaria
                descripcion = $"{conceptoBase} - Compra de {excedenteUSD:F2} USD a tasa de cambio C$ {tasaCompra:F2}",
                moneda = moneda ?? "DOLARES",
                monto = excedenteUSD,
                tasa_cambio = tasaCompra,
                is_transaction = true,
                Tipo_Movimiento = TipoMovimiento.COMPRA_DE_MONEDA
            }.SaveMovimiento(dbUser); // ignorar error? o acumular
            if(responseCompra.status != 200 )
            {
                return (false, responseCompra);
            }

            // ✅ Movimiento B: VENTA de C$ → salen C$ de caja C$
            var responseVenta =new Movimientos_Cuentas
            {
                Catalogo_Cuentas_Origen = cuentaCajaCordobas,
                Catalogo_Cuentas_Destino = cuentaIngresoCompraUSD, // o cuenta "cliente virtual", pero mejor usar cuentas reales
                concepto = "Venta de C$ (cambio)",
                descripcion = $"{conceptoBase} - Entrega de cambio: {cambioEnCordobas:F2} C$ por {excedenteUSD:F2} USD",
                moneda = "CORDOBAS",
                monto = cambioEnCordobas,
                tasa_cambio = tasaCompra,
                is_transaction = true,
                Tipo_Movimiento = TipoMovimiento.VENTA_DE_MONEDA
            }.SaveMovimiento(dbUser);
            if(responseVenta.status != 200 )
            {
                return (false, responseVenta);
            }
            return (flowControl: true, value: new ResponseService(200, "movimientos cambiarios ejecutados"));
        }
    }
}