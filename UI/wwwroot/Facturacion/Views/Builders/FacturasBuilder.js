//@ts-check

import { Transaction_Contratos } from "../../../FrontModel/Model.js";
import { DateTime } from "../../../WDevCore/WModules/Types/DateTime.js";
import { ConvertToMoneyString, html, WRender } from "../../../WDevCore/WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../../../WDevCore/WModules/WOrtograficValidation.js";
import { css } from "../../../WDevCore/WModules/WStyledRender.js";
import { Detalle_Compra } from "../../FrontModel/Detalle_Compra.js";
import { Detalle_Factura } from "../../FrontModel/Detalle_Factura.js";
import { DocumentsData } from "../../FrontModel/DocumentsData.js";
import { Tbl_Compra } from "../../FrontModel/Tbl_Compra.js";
import { Tbl_Factura } from "../../FrontModel/Tbl_Factura.js";

export class FacturasBuilder {
    /**
     * @param { Tbl_Factura } factura
     * @param {DocumentsData} documentsData
     * @returns {HTMLElement}
     */
    static BuildFactura(factura, documentsData) {
        return FacturasBuilder.BuildFacturaVenta(documentsData, factura);
    }
    /**
     * @param {{factura: Tbl_Factura, Contract: String,  Recibo: String, Transaction_Contratos: Transaction_Contratos}} response
     * @param {DocumentsData} documentsData
     * @returns {HTMLElement}
     */
    static BuildFacturaRecibo(response, documentsData) {
        if (response.factura.Tipo == "APARTADO_MENSUAL" || response.factura.Tipo == "APARTADO_QUINCENAL") {
            return FacturasBuilder.BuildFacturaApartadoMensual(documentsData, response);
        }
        //if () {
            //return FacturasBuilder.BuildFacturaApartado(documentsData, response);
        //}
        return FacturasBuilder.BuildFacturaVenta(documentsData, response.factura);
    }
    /**
     * @param {{factura: Tbl_Factura, Contract: String, Recibo: String, Transaction_Contratos: Transaction_Contratos}} response
     * @param {DocumentsData} documentsData
     * @returns {HTMLElement}
     */
    static BuildFacturaApartado(documentsData, response) {
        return html`<div style="font-family: Arial, sans-serif;" class="recibo recibo-${response.Transaction_Contratos.tipo}">
            ${this.style.cloneNode(true)}
            ${response.Recibo}
        </div>`;
    }
    /**
     * @param {{factura: Tbl_Factura, Contract: String, Recibo: String, Transaction_Contratos: Transaction_Contratos}} response
     * @param {DocumentsData} documentsData
     * @returns {HTMLElement}
     */
    static BuildFacturaApartadoMensual(documentsData, response) {
        return html`<div style="font-family: Arial, sans-serif;" class="recibo-${response.Transaction_Contratos.tipo}">
            ${this.style.cloneNode(true)}
            ${FacturasBuilder.BuildFacturaVenta(documentsData, response.factura)}
            ${response.Recibo}
        </div>`;
    }

    /**
    * @param {DocumentsData}  documentsData
    * @param {Tbl_Factura}  factura
    * @returns {any}
    */
    static BuildFacturaVenta(documentsData, factura) {
        return html`<div style="font-family: Arial, sans-serif;" class="recibo">
           ${this.style.cloneNode(true)}
            <div style="margin-top: 5px; display: flex; height: 90px">
                ${documentsData.Header}
                <div style="text-align: center; margin-bottom: 5px; width: 300px">
                    <p>RUC: ${localStorage.getItem("RUC")}</p>
                    <p style="width:100%; display: flex">
                        <label style="flex: 1"> Factura No.</label> 
                        <label style="flex: 1">${factura.Id_Factura}</label>
                    </p>
                    <p>${factura.Codigo_venta}</p>
                    <table class="marco" style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                        <tr>
                            <td style="padding: 2px 5px;">Día</td>
                            <td style="padding: 2px 5px;">Mes</td>
                            <td style="padding: 2px 5px;">Año</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getDay() + 1}</td>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getMonth() + 1}</td>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getFullYear()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px 5px;">Hora:</td>
                            <td style="padding: 2px 5px;  text-align: right;" colspan="2">${new DateTime(factura.Fecha).GetFullHour() + 1}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <h1 style="text-align: center; font-size: 16px, margin: 5px 0px">FACTURA</h1>
            <div style="margin-top: 5px; display: flex;">
                <table style="flex:2" class="">
                    <tr><td class="marcogris">Nombre:</td> <td class="underline">${factura.Datos.Nombre_Cliente}</td></tr>
                    <tr><td class="marcogris">Dirección:</td> <td class="underline">${factura.Datos.Direccion_Cliente}</td></tr>
                    <tr><td class="marcogris">Vendedor:</td> <td class="underline">${factura.Datos.Nombre_Vendedor} </td></tr>
                </table> 
                <table style="padding: 2px 5px;"> 
                    <tr>
                        <td class="marcogris">Teléfono/cli:</td> 
                        <td class="underline" style="width: 80px">${factura.Datos.Telefono_Cliente}</td>
                    </tr>
                </table>
            </div>
            <div style="margin-top: 5px;" class="marco">
                <strong>Observaciones:</strong> 
                <p>${factura.Observaciones || 'Ninguna'}</p>
            </div>
            </table>
            ${this.CreateTableDetail(factura)}
            <div style="margin-top: 5px; display: flex; justify-content: space-between;">   
                <div style="margin-top: 5px; display: flex;">
                    <div style="margin: 5px; border: #ccc solid 1px; flex:1; text-align: center">
                        <div style="height: 20px;"></div>
                        <hr/>
                        <p>Autorizado por Administración y/o vendedor</p>
                    </div>
                    <div style="margin: 5px; border: #ccc solid 1px; flex:1; text-align: center">
                        <div style="height: 20px;"></div>
                        <hr/>
                        <p>Recibi Conforme: <br/> por Administración y/o vendedor</p>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 5px;">
                    <p><strong>Total a pagar $:</strong> ${factura.Total.toFixed(2)}</p>
                    <!-- <p><strong>IVA:</strong> ${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")} ${factura.Iva.toFixed(2)}</p> -->
                    <p><strong>Tasa de cambio:</strong> ${factura.Tasa_Cambio.toFixed(2)}</p>
                    <p><strong>Total a pagar C$:</strong> ${(factura.Total * factura.Tasa_Cambio).toFixed(2)}</p>
                </div>
            </div>
            <p style="text-align: center; margin-top: 32px; font-size: 14px;">NO SE ACEPTAN DEVOLUCIONES.</p>
            <p style="text-align: center; margin-top: 32px; font-size: 12px;">Nota: Este recibo es válido unicamente con las firmas autorizadas y sello de EMPRESA.</p>
        </div>`;
    }

    /**
     * @param {DocumentsData} documentsData
     * @param {Tbl_Compra} factura
     * @returns {HTMLElement}
     */
    static BuildFacturaCompra(documentsData, factura) {
        //documentsData.Header.appendChild(html`<h1>RUC: ${localStorage.getItem("RUC")}</h1>`)
        return html`<div style="font-family: Arial, sans-serif;" class="recibo">
            ${this.style.cloneNode(true)}
            <div style="margin-top: 5px; display: flex; height: 90px">
                ${documentsData.Header}
                <div style="text-align: center; margin-bottom: 5px; width: 300px">  
                    <table class="marco" style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                         <tr>
                            <td style="padding: 2px 5px;">Compraventa No.:</td>
                            <td style="padding: 2px 5px;  text-align: right;" colspan="2">${factura.Id_Compra?.toString()?.padStart(9, '0')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px 5px;">Hora:</td>
                            <td style="padding: 2px 5px;  text-align: right;" colspan="2">${new DateTime(factura.Fecha).GetFullHour() + 1}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px 5px;">Día</td>
                            <td style="padding: 2px 5px;">Mes</td>
                            <td style="padding: 2px 5px;">Año</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getDay() + 1}</td>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getMonth() + 1}</td>
                            <td style="padding: 2px 5px;">${new DateTime(factura.Fecha).getFullYear()}</td>
                        </tr>                       
                    </table>   
                </div>
            </div>
            <h1 style="text-align: center; font-size: 16px, margin: 5px 0px">COMPRAVENTA</h1> 
            <div style="margin-top: 5px; display: flex; height: 80px">
                <table style="flex:2" class="">
                    <tr><td class="marcogris">Nombre:</td> <td class="underline">${factura.Cat_Proveedor.Nombre}</td></tr>
                    <tr><td class="marcogris">Cédula:</td> <td class="underline">${factura.Cat_Proveedor.Identificacion}</td></tr>
                    <tr><td class="marcogris">Comprador:</td> <td class="underline">${factura.Datos_Compra.Nombre_Comprador} </td></tr>
                </table>         
                <table style="padding: 2px 5px;"> 
                    <tr><td class="marcogris">Teléfono/cli:</td> <td class="underline" style="width: 80px">${factura.Cat_Proveedor.Datos_Proveedor.telefono}</td></tr>
                    <tr class="marco"><td>TC:</td><td>${factura.Tasa_Cambio.toFixed(2)}</td></tr>               
                </table>  
            </div>              
            ${this.CreateTableDetailCompra(factura)}
            <div class="marcogris">
                <strong>Observaciones:</strong> 
                <p>${factura.Observaciones || 'Ninguna'}</p>
            </div>     
            <div class="marco" style="display: flex;; justify-content: space-between;">                  
                <div style="margin-top: 5px; display: flex;; flex-direction:column; flex: 3">
                    <div style="margin-top: 0px; display: flex; font-size: 9px">
                        <p style="margin-top: 0px;font-size: 9px">Sirva mi firma en este documento como declaración de dominio y dueño titular de los bienes aqui descritos, por no tener
                            factura, pero por poseción en mis manos me declaró dueño absoluto, como indica la ley 936 en su articulo 11.
                        </p>
                    </div>
                    <div style="margin-top: 5px; display: flex;">
                        <div style="margin: 5px; border: #ccc solid 1px; flex:1; text-align: center">
                            <div style="height: 20px;"></div>
                            <hr/>
                            <p>Autorizado por Administración y/o comprador</p>
                        </div>
                        <div style="margin: 5px; border: #ccc solid 1px; flex:1; text-align: center">
                            <div style="height: 20px;"></div>
                            <hr/>
                            <p>Entregué Conforme por vendedor</p>
                        </div>
                    </div>                    
                </div>
                <div style="text-align: right; margin-top: 5px; flex: 1" class="total-container">               
                    <p><strong>Total C$:</strong> ${(factura.Total * factura.Tasa_Cambio).toFixed(2)}</p>
                    <p><strong>Total $:</strong> ${factura.Total.toFixed(2)}</p>
                </div>
            </div>
            <p style="text-align: center; font-size: 14px;">NO SE ACEPTAN DEVOLUCIONES.</p>
            <p style="text-align: center; font-size: 12px;">Nota: Este recibo es válido unicamente con las firmas autorizadas y sello de EMPRESA.</p>
        </div>`;
    }


    static CreateTableDetail(factura) {
        return WRender.Create({
            tagName: "table", class: "marco", style: "width: 100%; border-collapse: collapse; margin-top: 5px;", children: [
                WRender.Create({
                    tagName: "thead", children: [
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Descripción" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Marca" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Model" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Serie" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Pre/Cont." },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Desct." },
                        { tagName: "th", style: "padding: 5px; text-align: right;", innerHTML: `Sub Total ${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")}` },
                    ]
                }),
                { tagName: "tbody", children: this.BuildFacturaDetail(factura) }
            ]
        });
    }

    static BuildFacturaDetail(factura) {
        return factura.Detalle_Factura.map((/**@type {Detalle_Factura} */ detalle) => WRender.Create({
            tagName: "tr", children: [
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle.Lote?.Datos_Producto?.Descripcion || 'N/A'}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle.Lote?.Datos_Producto?.Marca ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle.Lote?.Datos_Producto?.Modelo ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle.Lote?.Datos_Producto?.Serie ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px; text-align: right",
                    innerText: `${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")} ${ConvertToMoneyString(detalle.Precio_Venta)}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px; text-align: right",
                    innerText: `${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")} ${ConvertToMoneyString(detalle.Descuento)}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px; text-align: right",
                    innerText: `${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")} ${ConvertToMoneyString(detalle.Total)}`
                })
            ]
        }));
    }
    static CreateTableDetailCompra(factura) {
        return WRender.Create({
            tagName: "table", class: "marco", style: "width: 100%; border-collapse: collapse;", children: [
                WRender.Create({
                    tagName: "thead", children: [
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Descripción" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Marca" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Model" },
                        { tagName: "th", style: "padding: 5px;", innerHTML: "Serie" },
                        { tagName: "th", style: "padding: 5px; text-align: right;", innerHTML: `Sub Total ${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")}` },
                    ]
                }),
                { tagName: "tbody", children: this.BuildFacturaDetailCompra(factura) }
            ]
        });
    }

    static BuildFacturaDetailCompra(/**@type {Tbl_Compra} */ factura) {
        return factura.Detalle_Compra.map((/**@type {Detalle_Compra} */ detalle) => WRender.Create({
            tagName: "tr", children: [
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle?.Cat_Producto.Descripcion || 'N/A'}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle?.Cat_Producto?.Cat_Marca?.Descripcion ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle?.Datos_Producto_Lote?.Modelo ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${detalle?.Datos_Producto_Lote?.Serie ?? "-"}`
                }),
                WRender.Create({
                    tagName: "td", style: "padding: 5px;",
                    innerText: `${WOrtograficValidation.es(factura.Moneda ?? "DOLARES")} ${detalle.Total.toFixed(2)}`
                })
            ]
        }));
    }
    static style = css`

        .header-table td div {
            /* margin-bottom: 10px; */
            /* width: 100%; */
            font-size: 16px;
            color: #0001af;
        }
        table {
            border-collapse: collapse;
        }
        .underline {
            border-bottom: solid 1px #505050;
            min-width: calc(100% - 50px);
            padding: 0 5px;
        }

        .factura-container {
            border: 1px solid #505050;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }              
        .total-container p, .marcogris {
            background-color: #eee;
            border: solid 1px #505050;
            margin: 0;
            padding: 5px;
        }
        .marco {
            border: solid 1px #505050;
            margin: 5px 0px;
        }
        .recibo, .contract {
            width: 200mm; /* A4 width - 10*/            
            background-color: white;
            margin: 10px 0;
            padding: 20px;
            box-sizing: border-box;
             
        }
        .recibo *{
            font-size: 11px;
            color: #000;
        }
        .recibo p {
            margin: 0px;
            padding: 3px;
        }

        .recibo {
            overflow: hidden;
            page-break-after: always;  /* Ensure each .page-container starts on a new page*/
        } 
        .recibo-APARTADO_QUINCENAL {
            height: auto;
            margin: auto;
            display: block;
            width: auto;
            margin-bottom: 10px;
        }
        
        .marco td, .marco th {
            border: solid 1px #505050;
        }
        .marco th {
            background-color: #eee;
            border: solid 1px #505050;
            color: #0001af;
        }
        .recibo h1 {
            color: #0001af;  
            margin: 0px;  
        }
        .contract {
            page-break-after: always;        
        }
        @media print {
            * {
                -webkit-print-color-adjust: exact;  
            }
            .recibo, .contract {           
                background-color: white;
                margin: 0px 0;
                padding: 0px;
                
            }
        }
    `
}