using System;
using System.Collections.Generic;
using DataBaseModel;
using Model;

public class AmortizationModule
{
   /* public static ContractServices CalculateAmortization(ContractServices contrato, bool withValoraciones = true, string tipoContrato = "EMPEÑO")
    {
        if (contrato.Transaction_Contratos.Catalogo_Clientes == null || contrato.valoraciones == null)
        {
            return new ContractServices();
        }

        contrato.Transaction_Contratos ??= new Transaction_Contratos();

        if (withValoraciones)
        {
            contrato.Transaction_Contratos.Detail_Prendas = contrato.valoraciones.ConvertAll(valoracion => new Detail_Prendas
            {
                Descripcion = valoracion.Descripcion,
                modelo = valoracion.Modelo,
                marca = valoracion.Marca,
                serie = valoracion.Serie,
                monto_aprobado_cordobas = valoracion.Valoracion_empeño_cordobas,
                monto_aprobado_dolares = valoracion.Valoracion_empeño_dolares,
                color = "#000",
                en_manos_de = tipoContrato == "EMPEÑO" ? "ACREEDOR" : "DEUDOR",
                precio_venta = valoracion.Precio_venta_empeño_dolares,
                Catalogo_Categoria = valoracion.Catalogo_Categoria,
                Transactional_Valoracion = valoracion
            });
        }

        contrato.Transaction_Contratos.Valoracion_compra_cordobas = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.detail_Prendas.ConvertAll(p => p.transactional_Valoracion), "Valoracion_compra_cordobas"));
        contrato.Transaction_Contratos.Valoracion_compra_dolares = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.detail_Prendas.ConvertAll(p => p.transactional_Valoracion), "Valoracion_compra_dolares"));
        contrato.Transaction_Contratos.Valoracion_empeño_cordobas = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.detail_Prendas.ConvertAll(p => p.transactional_Valoracion), "Valoracion_empeño_cordobas"));
        contrato.Transaction_Contratos.Valoracion_empeño_dolares = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.detail_Prendas.ConvertAll(p => p.transactional_Valoracion), "Valoracion_empeño_dolares"));

        contrato.Transaction_Contratos.tasas_interes = (float.Parse(contrato.Transaction_Contratos?.catalogo_clientes?.catalogo_clasificacion_interes?.porcentaje) + contrato.Transaction_Contratos?.taza_interes_cargos) / 100;
        contrato.Transaction_Contratos.plazo = contrato.Transaction_Contratos.plazo ?? 1;
        contrato.Transaction_Contratos.fecha = DateTime.Parse(contrato.Transaction_Contratos.fecha);
        contrato.Transaction_Contratos.Catalogo_clientes = contrato.Transaction_Contratos.catalogo_clientes;

        contrato.Transaction_Contratos.tbl_cuotas = new List<Tbl_Cuotas>();
        contrato.Transaction_Contratos.gestion_crediticia = contrato.Transaction_Contratos.catalogo_clientes?.catalogo_clasificacion_interes?.porcentaje ?? 6;

        CreateInstallments(contrato);

        contrato.Transaction_Contratos.total_pagar_cordobas = (Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.tbl_cuotas, "total")) * contrato.Transaction_Contratos.taza_cambio);
        contrato.Transaction_Contratos.total_pagar_dolares = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.tbl_cuotas, "total"));

        contrato.Transaction_Contratos.interes = Round(WArrayF.SumValAtt(contrato.Transaction_Contratos.tbl_cuotas, "interes"));

        return contrato;
    }

    public static float GetPayment(ContractServices contrato)
    {
        float monto = contrato.Transaction_Contratos.Valoracion_empeño_dolares;
        int cuotas = contrato.Transaction_Contratos.plazo ?? 0;
        float tasa = contrato.Transaction_Contratos.tasas_interes;

        float payment = ((tasa * (float)Math.Pow(1 + tasa, cuotas)) * monto) / ((float)Math.Pow(1 + tasa, cuotas) - 1);

        return payment;
    }

    public static float GetPaymentValoracion(ContractServices valoracion)
    {
        float monto = valoracion.valor_compra_dolares;
        int cuotas = valoracion.plazo ?? 0;
        float tasa = (valoracion.tasa_interes ?? 0) / 100;

        float payment = ((tasa * (float)Math.Pow(1 + tasa, cuotas)) * monto) / ((float)Math.Pow(1 + tasa, cuotas) - 1);

        return float.IsNaN(payment) ? 0 : payment;
    }

    public static void CreateInstallments(ContractServices contrato)
    {
        contrato.Transaction_Contratos.cuotafija_dolares = GetPayment(contrato);
        contrato.Transaction_Contratos.cuotafija = contrato.Transaction_Contratos.cuotafija_dolares * contrato.Transaction_Contratos.taza_cambio;

        float capital = float.Parse(contrato.Transaction_Contratos.Valoracion_empeño_dolares);

        for (int index = 0; index < contrato.Transaction_Contratos.plazo; index++)
        {
            float abonoCapital = float.Parse(contrato.Transaction_Contratos.cuotafija_dolares) - (capital * contrato.Transaction_Contratos.tasas_interes);

            Tbl_Cuotas cuota = new Tbl_Cuotas
            {
                fecha = contrato.Transaction_Contratos.fecha.AddMonths(index + 1),
                total = float.Parse(contrato.Transaction_Contratos.cuotafija_dolares).ToString("F3"),
                interes = (capital * contrato.Transaction_Contratos.tasas_interes).ToString("F3"),
                abono_capital = abonoCapital.ToString("F3"),
                capital_restante = (index == contrato.Transaction_Contratos.plazo - 1 ? 0 : (capital - abonoCapital)).ToString("F3"),
                tasa_cambio = contrato.Transaction_Contratos.taza_cambio
            };

            capital = float.Parse((capital - abonoCapital).ToString("F3"));
            contrato.Transaction_Contratos.tbl_cuotas.Add(cuota);
        }
    }

    public static float Round(float value)
    {
        return value; // Math.Round(value);
    }*/
}