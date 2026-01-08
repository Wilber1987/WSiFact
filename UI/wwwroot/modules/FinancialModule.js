//@ts-check
import { Catalogo_Cambio_Divisa } from "../FrontModel/Catalogo_Cambio_Divisa.js";
import { Detail_Prendas, Tbl_Cuotas, Transaction_Contratos, ValoracionesTransaction } from "../FrontModel/Model.js";
import { ParcialesData } from "../FrontModel/ParcialData.js";
import { Recibos } from "../FrontModel/Recibos.js";

import { WArrayF } from "../WDevCore/WModules/WArrayF.js";


class FinancialModule {
    /**
     * @param {ValoracionesTransaction} contrato 
     * @param {boolean} [withValoraciones]
     * @param {String} [tipo_contrato]
     * @returns {ValoracionesTransaction}
     */
    static calculoAmortizacion = (contrato, withValoraciones = true, tipo_contrato = "EMPEÑO") => {
        if (contrato.Transaction_Contratos.Catalogo_Clientes == undefined
            || contrato.valoraciones == undefined) {
            return new ValoracionesTransaction();
        }
        contrato.Transaction_Contratos = contrato.Transaction_Contratos ?? new Transaction_Contratos();

        if (withValoraciones) {
            contrato.Transaction_Contratos.Detail_Prendas = contrato.valoraciones.map(
            // @ts-ignore
            /**@type {Transactional_Valoracion_ModelComponent}*/valoracion => new Detail_Prendas({
                Descripcion: valoracion.Descripcion,
                modelo: valoracion.Modelo,
                marca: valoracion.Marca,
                serie: valoracion.Serie,
                monto_aprobado_cordobas: valoracion.Valoracion_empeño_cordobas,
                monto_aprobado_dolares: valoracion.Valoracion_empeño_dolares,
                color: "#000",
                en_manos_de: tipo_contrato == "EMPEÑO" ? "ACREEDOR" : "DEUDOR",
                precio_venta: valoracion.Precio_venta_empeño_dolares,
                Catalogo_Categoria: valoracion.Catalogo_Categoria,
                Transactional_Valoracion_ModelComponent: valoracion
            }));
        }

        FinancialModule.CalculeTotales(contrato);

        FinancialModule.crearCuotas(contrato);

        contrato.Transaction_Contratos.total_pagar_cordobas = (WArrayF.SumValAtt(contrato.Transaction_Contratos.Tbl_Cuotas, "total") * contrato.Transaction_Contratos.taza_cambio);
        contrato.Transaction_Contratos.total_pagar_dolares = (WArrayF.SumValAtt(contrato.Transaction_Contratos.Tbl_Cuotas, "total"));
        //console.log(contrato.Transaction_Contratos.total_pagar_cordobas, contrato.Transaction_Contratos.total_pagar_dolares);

        contrato.Transaction_Contratos.interes = (WArrayF.SumValAtt(contrato.Transaction_Contratos.Tbl_Cuotas, "interes"));
        //contrato.Transaction_Contratos.interes_dolares = (WArrayF.SumValAtt(contrato.Transaction_Contratos.Tbl_Cuotas, "interes") / contrato.Transaction_Contratos.taza_cambio);
        return contrato;
    }

    static getPago = (contrato) => {        

        const monto = contrato.Transaction_Contratos.Valoracion_empeño_dolares;
        //console.log(monto);
        const cuotas = contrato.Transaction_Contratos.plazo;
        const tasa = contrato.Transaction_Contratos.tasas_interes;
        if (tasa == 0)  {
            return monto / cuotas;	
        }
        const payment = ((tasa * Math.pow(1 + tasa, cuotas)) * monto) / (Math.pow(1 + tasa, cuotas) - 1);
        //console.log(monto, cuotas, tasa, payment);
        
        return payment;
    }
    static getPagoValoracion = (valoracion) => {
        const monto = valoracion.valor_compra_dolares;
        const cuotas = valoracion.Plazo ?? 0;
        const tasa = (valoracion.Tasa_interes ?? 0) / 100;
        //console.log(monto, cuotas, tasa);
        const payment = ((tasa * Math.pow(1 + tasa, cuotas)) * monto) / (Math.pow(1 + tasa, cuotas) - 1);
        return payment.toString() == "NaN" ? 0 : payment;
    }

    static CalculeTotales(contrato) {
        contrato.Transaction_Contratos.Valoracion_compra_cordobas = contrato.Transaction_Contratos.Valoracion_compra_cordobas ?? FinancialModule.round(WArrayF.SumValAtt(contrato.Transaction_Contratos.Detail_Prendas.map(p => p.Transactional_Valoracion_ModelComponent), "Valoracion_compra_cordobas"));
        contrato.Transaction_Contratos.Valoracion_compra_dolares = contrato.Transaction_Contratos.Valoracion_compra_dolares ??  FinancialModule.round(WArrayF.SumValAtt(contrato.Transaction_Contratos.Detail_Prendas.map(p => p.Transactional_Valoracion_ModelComponent), "Valoracion_compra_dolares"));
        contrato.Transaction_Contratos.Valoracion_empeño_cordobas = contrato.Transaction_Contratos.Valoracion_empeño_cordobas ?? FinancialModule.round(WArrayF.SumValAtt(contrato.Transaction_Contratos.Detail_Prendas.map(p => p.Transactional_Valoracion_ModelComponent), "Valoracion_empeño_cordobas"));
        contrato.Transaction_Contratos.Valoracion_empeño_dolares = contrato.Transaction_Contratos.Valoracion_empeño_dolares ?? FinancialModule.round(WArrayF.SumValAtt(contrato.Transaction_Contratos.Detail_Prendas.map(p => p.Transactional_Valoracion_ModelComponent), "Valoracion_empeño_dolares"));
        //contrato.Transaction_Contratos.taza_interes_cargos = contrato.Transaction_Contratos.taza_interes_cargos ?? 0.09
        contrato.Transaction_Contratos.tasas_interes = contrato.Transaction_Contratos.tasas_interes ??
            (parseFloat(contrato.Transaction_Contratos?.Catalogo_Clientes?.Catalogo_Clasificacion_Interes?.porcentaje)
                + contrato.Transaction_Contratos?.taza_interes_cargos) / 100;
        contrato.Transaction_Contratos.plazo = contrato.Transaction_Contratos.plazo ?? 1;
        contrato.Transaction_Contratos.fecha = new Date(contrato.Transaction_Contratos.fecha);
        contrato.Transaction_Contratos.Catalogo_Clientes = contrato.Transaction_Contratos.Catalogo_Clientes;
        //contrato.fecha = new Date(contrato.Transaction_Contratos.fecha)
        contrato.Transaction_Contratos.Tbl_Cuotas = new Array();
        contrato.Transaction_Contratos.gestion_crediticia = contrato.Transaction_Contratos.gestion_crediticia ?? contrato.Transaction_Contratos.Catalogo_Clientes?.Catalogo_Clasificacion_Interes?.porcentaje ?? 6;
    }

    /**
     * @param {ValoracionesTransaction} contrato
     */
    static crearCuotas(contrato) {
        contrato.Transaction_Contratos.cuotafija_dolares = this.getPago(contrato);
        contrato.Transaction_Contratos.cuotafija = contrato.Transaction_Contratos.cuotafija_dolares * contrato.Transaction_Contratos.taza_cambio;
        // @ts-ignore
        let capital = (parseFloat(contrato.Transaction_Contratos.Valoracion_empeño_dolares));
        for (let index = 0; index < contrato.Transaction_Contratos.plazo; index++) {
            // @ts-ignore
            const abono_capital = (parseFloat(contrato.Transaction_Contratos.cuotafija_dolares)
                - (capital * contrato.Transaction_Contratos.tasas_interes));
            //console.log(abono_capital);
            const cuota = new Tbl_Cuotas({
                // @ts-ignore
                fecha: contrato.Transaction_Contratos.fecha.modifyMonth(index + 1),
                // @ts-ignore
                total: contrato.Transaction_Contratos.cuotafija_dolares.toFixed(3),
                // @ts-ignore
                interes: (capital * contrato.Transaction_Contratos.tasas_interes).toFixed(3),
                // @ts-ignore
                abono_capital: abono_capital.toFixed(3),
                // @ts-ignore
                capital_restante: (index == contrato.Transaction_Contratos.plazo - 1 ? 0 : (capital - abono_capital)).toFixed(3),
                // @ts-ignore
                tasa_cambio: contrato.Transaction_Contratos.taza_cambio
            });
            capital = parseFloat((capital - abono_capital).toFixed(3));
            contrato.Transaction_Contratos.Tbl_Cuotas.push(cuota);
        }
    }
    /**
     * 
     * @param {number} value 
     * @returns {number}
     */
    static round(value) {
        return value//Math.round(value);
    }
    //CALCULOS DE CONTRACTDATA
    /**
    * @param {Transaction_Contratos} selectContrato 
    * @param {ContractData} contractData
    */
    static UpdateContractData(selectContrato, contractData) {
        contractData.cuotasPendientes = selectContrato.Tbl_Cuotas
            .sort((a, b) => a.id_cuota - b.id_cuota)
            .filter(c => c.Estado?.toUpperCase() == "PENDIENTE");
        contractData.cuotasPagadas = selectContrato.Tbl_Cuotas
            .sort((a, b) => a.id_cuota - b.id_cuota)
            .filter(c => c.Estado?.toUpperCase() == "CANCELADO");

        contractData.countPagadas = contractData.cuotasPagadas.length;
        contractData.countPendientes = contractData.cuotasPendientes.length;


        //TODO BORRAR CICLO DE MORA FORZADA 
        selectContrato.Tbl_Cuotas?.filter(cuota => cuota.Estado == "PENDIENTE")?.forEach(cuota => {
            // Obtenemos la fecha de pago
            const fechaPago = new Date(cuota.fecha);
            fechaPago.setHours(0, 0, 0, 0);            
            // Obtenemos la fecha actual
            const ahora = new Date();
            ahora.setHours(23, 59, 0, 0);        
            // Calculamos la diferencia en días calendario usando los componentes de la fecha
            // @ts-ignore
            const diferenciaDias = Math.floor((ahora - fechaPago) / (1000 * 60 * 60 * 24));
        
            // Si la diferencia es negativa, ajustamos a cero
            const diasEnMoraFinal = Math.max(diferenciaDias, 0);
            
            if (diasEnMoraFinal > 0 && contractData.diasMora < diasEnMoraFinal) {
                contractData.diasMora = diasEnMoraFinal;
            }
        });
        
        // @ts-ignore
        const CuotaActual = contractData.cuotasPendientes[0];
        const mora = WArrayF.SumValAtt(contractData.cuotasPendientes, "mora");
        contractData.MoraActual = mora ?? 0;
        const saldo_pendiente = selectContrato.saldo;
        const interesCorriente = FinancialModule.CalcInteresCorriente(CuotaActual, contractData);
        contractData.InteresCorriente = interesCorriente ?? 0;
        contractData.InteresCorriente_Cordobas = interesCorriente * contractData.tasasCambio[0].Valor_de_venta;
        const perdida_de_documento = contractData.Recibo.perdida_de_documento_monto ?? 0;
        const reestructuracion = contractData.Recibo.reestructurar ?? 0;
        const total_capital_restante = mora + saldo_pendiente + interesCorriente + perdida_de_documento + reestructuracion;

        contractData.cancelacionValue = mora + saldo_pendiente + interesCorriente + perdida_de_documento + reestructuracion;
        contractData.cancelacionValueCordobas = contractData.cancelacionValue * contractData.tasasCambio[0].Valor_de_venta;
        if (contractData.Recibo.cancelar == true) {
            contractData.pagoMinimoDolares = total_capital_restante;
            contractData.pagoMaximoDolares = total_capital_restante;
            contractData.pagoActual = total_capital_restante;
        } else if (contractData.Recibo.reestructurar == true) {
            contractData.pagoMinimoDolares = interesCorriente + mora + reestructuracion + perdida_de_documento;
            contractData.pagoMaximoDolares = total_capital_restante;
            contractData.pagoActual = interesCorriente + mora + reestructuracion + perdida_de_documento;
        } else if (contractData.Recibo.solo_interes_mora == true) {
            contractData.pagoMinimoDolares = interesCorriente + mora + perdida_de_documento;
            contractData.pagoMaximoDolares = interesCorriente + mora + perdida_de_documento;
            contractData.pagoActual = contractData.pagoMinimoDolares;
        } else if (contractData.Recibo.solo_abono == true || contractData.Recibo.pago_parcial == true) {
            contractData.pagoMinimoDolares = 1 + perdida_de_documento;
            contractData.pagoMaximoDolares = total_capital_restante;
            contractData.pagoActual = contractData.pagoMinimoDolares;
        } else {
            contractData.pagoMinimoDolares = interesCorriente;
            contractData.pagoMaximoDolares = total_capital_restante;
            contractData.pagoActual = CuotaActual.abono_capital + interesCorriente + mora + reestructuracion + perdida_de_documento;
        }
        if (contractData.pagoActual > contractData.pagoMaximoDolares) {
            contractData.pagoMaximoDolares = contractData.pagoActual;
        }
        contractData.pagoMinimoCordobas = contractData.pagoMinimoDolares * contractData.tasasCambio[0].Valor_de_venta;
        contractData.pagoMaximoCordobas = contractData.pagoMaximoDolares * contractData.tasasCambio[0].Valor_de_venta;
        contractData.pagoActualCordobas = contractData.pagoActual * contractData.tasasCambio[0].Valor_de_venta;
        console.log(contractData);

    }
    /**
   * @param {Tbl_Cuotas} cuota 
   * @param {ContractData} contractData 
   * @returns {Number}
   */
    static CalcInteresCorriente(cuota, contractData) {
        //this.countPagadas =  this.cuotasPagadas.length;
        //this.countPendientes = this.cuotasPendientes.length;
        //console.log(contractData.cuotasPendientes, contractData.cuotasPagadas);
        /**@type {Number} */
        const saldo_actual_dolares = contractData.Contrato.saldo;
        /**@type {Date} */
        const fechaActual = contractData.Fecha;
        fechaActual.setHours(23, 59, 0, 0);
        // @ts-ignore
        //const diasDelMesDePago = new Date(contractData.cuota?.fecha).getDate();

        const fechaPagoMayorFechaActual = new Date(cuota?.fecha) > fechaActual;

        const cancelarAntesDelPrimerMes = contractData.countPagadas == 0
            && fechaPagoMayorFechaActual
            && (contractData.Recibo.cancelar == true || contractData.countPendientes == 1);

        if (cancelarAntesDelPrimerMes
            || (//contractData.countPagadas > 0 && 
                contractData.countPendientes > 1
                && contractData.Recibo.cancelar != true
                && contractData.Recibo.reestructurar != true)
            || (contractData.Recibo.reestructurar == true && fechaPagoMayorFechaActual)) {
            return cuota.interes;
        }
        /**@type {Date} */ // @ts-ignore
        const fechaEnQueIniciaPeriodo = new Date(cuota?.fecha);
        fechaEnQueIniciaPeriodo.setHours(0, 0, 0, 0);
        if (fechaActual < fechaEnQueIniciaPeriodo) {
            return 0;
        }
        // @ts-ignore
        //const diferencia = fechaActual - fechaEnQueIniciaPeriodo;
        // Calculamos la diferencia en días calendario usando los componentes de la fecha
        const diferenciaDias = Math.floor((fechaActual - fechaEnQueIniciaPeriodo) / (1000 * 60 * 60 * 24));
        //console.log(diferencia);
        const diasDeInteresesFinal = Math.max(diferenciaDias, 0);

        /**@type {Number} */
       // const diasDeDiferencia = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        /**@type {Number} */
        const porcentajeInteres = contractData.Contrato.tasas_interes;
        //console.log(diasDeDiferencia, porcentajeInteres);
        // @ts-ignore
        //const diferenciaEntreFechaCreacion = new Date(cuota?.fecha) - fechaEnQueIniciaPeriodo;
        ///**@type {Number} */
        // const diasDelMes = (diferenciaEntreFechaCreacion / (1000 * 60 * 60 * 24)) >= 0 ? (diferenciaEntreFechaCreacion / (1000 * 60 * 60 * 24)) : 1;

        /**@type {Number} */
        const procentageDiario = porcentajeInteres / 30;
        //console.log(saldo_actual_dolares, procentageDiario, porcentajeInteres, diasDelMes, saldo_actual_dolares * procentageDiario, diasDeDiferencia);
        /**@type {Number} */
        const interesCorriente = (saldo_actual_dolares * procentageDiario * diasDeInteresesFinal) + cuota.interes;
        //console.log(interesCorriente);
        /**@type {Number} */
        const parciales = contractData.parciales?.pagoParciales != undefined && contractData.parciales?.pagoParciales > 0 ? contractData.parciales?.pagoParciales : 0;
        return interesCorriente - parciales;
    }

    /**
    * @param {ContractData} contractData
    * @param {Object} reestructureConfig
    * @returns {ContractData}
    */
    static BuildContractData(contractData, reestructureConfig) {
        //console.log(Contrato);
        const categoria = contractData.Contrato.Detail_Prendas[0].Catalogo_Categoria;
        const plazo = contractData.Contrato.plazo;
        const fecha = new Date(contractData.Contrato.fecha_cancelar);
        let canReestructure = false;

        // @ts-ignore
        let fechaVencida = categoria.plazo_limite > plazo && new Date() >= fecha.subtractDays(parseInt(reestructureConfig?.Valor ?? 0));
        //console.log(fechaVencida, new Date(), fecha.subtractDays(parseInt(reestructureConfig?.Valor ?? 0)));
        if (categoria.descripcion != "vehiculos" && fechaVencida) { //TODO REPARAR FECHA QUITAR ESOS 32 DIAS
            canReestructure = true;
        }
        //console.log(Contrato.Tbl_Cuotas);
        const existeMora = contractData.Contrato.Tbl_Cuotas?.filter(c => c.Estado == "PENDIENTE" && c.mora != null && c.mora > 0).length > 0;

        contractData.canReestructure = canReestructure
        contractData.canPagoParcial = fechaVencida
        contractData.min = 1
        // @ts-ignore
        contractData.max = categoria.plazo_limite - plazo
        contractData.canSoloAbono = !existeMora
        contractData.soloInteresMora = !canReestructure;

        return contractData;

    }

}
export { FinancialModule }
class PagosInfo {
    constructor() {

    }
}
export { PagosInfo }
class ContractData {
    constructor(transaction_Contratos = new Transaction_Contratos()) {
        this.canReestructure = false;
        this.canSoloAbono = true;
        this.soloInteresMora = true;
        this.min = 0;
        this.max = 0;
        this.InfoPagos = new PagosInfo();
        this.Contrato = transaction_Contratos;
        this.Recibo = new Recibos();
        this.parciales = new ParcialesData();
        this.countPagadas = 0;
        this.countPendientes = 0;
        this.diasMora = 0;
        this.cancelacionValue = 0;
        this.cancelacionValueCordobas = 0;
        this.pagoMinimoDolares = 0;
        this.pagoMaximoDolares = 0;
        this.pagoActual = 0;
        this.pagoMinimoCordobas = 0;
        this.pagoMaximoCordobas = 0;
        this.pagoActualCordobas = 0;
        this.countPagadas = 0;
        this.countPendientes = 0;
        this.MoraActual = 0;
        this.InteresCorriente = 0;
        /**@type {Array<Tbl_Cuotas>} */
        this.cuotasPendientes = [];
        /**@type {Array<Catalogo_Cambio_Divisa>} */
        this.tasasCambio = [];
        this.canPagoParcial = false;
        /**@type {Array<Tbl_Cuotas>} */
        this.cuotasPagadas = [];
        /**@type {Tbl_Cuotas} */
        this.proximaCuota = new Tbl_Cuotas();
        /**@type {Tbl_Cuotas} */
        this.ultimaCuota = new Tbl_Cuotas();
        this.Fecha = new Date();
        this.InteresCorriente_Cordobas = 0;
    }
}
export { ContractData }