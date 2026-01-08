//@ts-check
import { Catalogo_Cuentas } from "../FrontModel/DBODataBaseModel.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { WAppNavigator } from "../WDevCore/WComponents/WAppNavigator.js";
import { ColumChart } from "../WDevCore/WComponents/WChartJSComponents.js";
import { WFilterOptions } from "../WDevCore/WComponents/WFilterControls.js";
import { ComponentsManager, ConvertToMoneyString, WRender } from "../WDevCore/WModules/WComponentsTools.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { WArrayF } from "../WDevCore/WModules/WArrayF.js";
import { PageType, WReportComponent } from "../WDevCore/WComponents/WReportComponent.js";
import { Detail_Movimiento, Detail_Movimiento_ModelComponent } from "../FrontModel/MovimientosCuentas.js";
import { Movimiento, Movimiento_ModelComponent } from "../FrontModel/MovimientosCuentasReportModel.js";

/**
 * @typedef {Object} ComponentConfig
 * * @property {Object} [propierty]
 */
class Gestion_CuentasView extends HTMLElement {
    /**
     * 
     * @param {ComponentConfig} [props] 
     */
    constructor(props) {
        super();
        this.attachShadow({ mode: 'open' });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.shadowRoot?.append(this.CustomStyle);
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
        this.Draw();
    }
    Draw = async () => {
        this.SetOption();
    }

    SetOption = async () => {
        const model = new Catalogo_Cuentas();
        /**@type {Array<Catalogo_Cuentas>} */
        const dataset = await model.Get();
        this.Manager.NavigateFunction("PROPIAS", new GestionCuentaComponent({
            // @ts-ignore
            Dataset: dataset.filter(c => c.tipo_cuenta == "PROPIA")
        }));
    }

    CustomStyle = css`
            .component{
               display: block;
            }    
            .OptionContainer {
                margin-bottom: 20px;
            }       
        `

}
customElements.define('w-gestion_cuentas', Gestion_CuentasView);
export { Gestion_CuentasView };
/**
 * @typedef {Object} WCuentaComponentConfig
 * * @property {Array<Catalogo_Cuentas>} [Dataset]
 */
class GestionCuentaComponent extends HTMLElement {
    /**
     * 
     * @param {WCuentaComponentConfig} Config 
     */
    constructor(Config) {
        super();
        this.Config = Config;
        this.attachShadow({ mode: 'open' });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.shadowRoot?.append(this.CustomStyle);
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
        this.Draw();
    }
    Draw = async () => {
        WRender.SetStyle(this, {
            display: "grid",
            gridTemplateColumns: "150px calc(100% - 170px)",
            gridGap: "20px"
        });
        this.SetOption();
    }


    SetOption() {
        const elements = [];
        this.Config.Dataset?.forEach(cuenta => {
            elements.push({
                name: cuenta.nombre, action: async () => {
                    const detail = await this.detailCuenta(cuenta);
                    this.Manager.NavigateFunction("detalle" + cuenta.id_cuentas, detail);
                }
            });
        });
        this.OptionContainer.append(new WAppNavigator({
            Direction: "column",
            Inicialize: true,
            Elements: elements
        }))
    }

    /**
        * @param {Catalogo_Cuentas} cuenta
        * @returns {Promise<HTMLElement>}
     */
    async detailCuenta(cuenta) {
        let displayType = "dolares";
        const model = new Movimiento_ModelComponent();
        const detail = WRender.Create({ className: "detail" });
        const filterModel = new Detail_Movimiento_ModelComponent({
            id_movimiento: undefined,
            id_cuenta: cuenta.id_cuentas,
            debito: undefined,
            credito: undefined,
            debito_dolares: undefined,
            credito_dolares: undefined,
            monto_inicial: undefined,
            monto_final: undefined,
            monto_inicial_dolares: undefined,
            monto_final_dolares: undefined
        })
        filterModel.fecha.defaultValue = Date.now();
        //console.log(filterModel.fecha.defaultValue);

        /*const movimientosMap = movimientos.map(c => ({
            // @ts-ignore
            Caso: c.debito == 0 ? "Credito" : "Debito",
            Mes: c.fecha.getMonthFormatEs(),
            val: 1
        }));
        //TODO REVISAR COLUMNS CART
        this.columChartMovimientos = new ColumChart({
            Title: "Movimientos",
            // @ts-ignore
            TypeChart: "Line",
            Dataset: movimientosMap,
            EvalValue: "val",
            AttNameEval: "Caso",
            groupParams: ["Mes"]
        });*/
        const detalleCuenta = WRender.Create({
            className: "detalle-cuenta",
            children: [
                WRender.CreateStringNode(`<div>${cuenta.nombre}</div>`),
                // @ts-ignore
                WRender.CreateStringNode(`<div class="monto-cuenta"> Monto C$: ${ConvertToMoneyString(cuenta.saldo ?? 0)}</div>`),
                // @ts-ignore
                WRender.CreateStringNode(`<div class="monto-cuenta"> Monto $: ${ConvertToMoneyString(cuenta.saldo_dolares ?? 0)}</div>`),
                WRender.Create({
                    tagName: 'input', type: 'button', className: 'Btn-Mini', value: 'Movimientos $', onclick: async () => {
                        displayType = "dolares";
                        model.debito.Currency = "USD";
                        model.credito.Currency = "USD";
                        model.saldo.Currency = "USD";
                        //model.credito.Currency = "USD";
                        filterOptions.filterFunction();
                        //this.buildDetailMovimientos(movimientos, detalle, fecha, debito, creadito, saldo, displayType);
                    }
                }),
                WRender.Create({
                    tagName: 'input', type: 'button', className: 'Btn-Mini', value: 'Movimientos C$', onclick: async () => {
                        displayType = "cordobas";
                        model.debito.Currency = "NIO";
                        model.credito.Currency = "NIO";
                        model.saldo.Currency = "NIO";
                        filterOptions.filterFunction();
                        //this.buildDetailMovimientos(movimientos, detalle, fecha, debito, creadito, saldo, displayType);

                    }
                })
            ]
        });
        const report = new WReportComponent({
            ModelObject: model,
            Dataset: [],
            PageType: PageType.OFICIO_HORIZONTAL,
            exportXls: true,
            GroupParams: ["month", "day"],
            exportPdf: true,
            exportPdfApi: true,
            EvalParams: ["debito", "credito"]
        });
        const filterOptions = new WFilterOptions({
            Dataset: [],
            ModelObject: filterModel,
            AutoSetDate: true,
            UseEntityMethods: true,
            Display: true,
            FilterFunction: (DFilt) => {
                report.Config.Dataset = this.MapMovimientos(DFilt, displayType);
                report.Draw();
            }
        });
        filterOptions.filterFunction();
        detail.append(detalleCuenta, filterOptions, report);
        return detail;
    }

    CustomStyle = css`
        .component{
           display: block;
        } 
        .detail {
            display: flex;
            flex-direction: column;
            grid-template-columns: auto auto auto auto auto;
            row-gap: 20px;
            font-size: 12px;
        }
        .detalle-cuenta {
            border-radius: 10px;
            padding: 10px;
            border: solid 1px #b3b3b3;
            display: flex;
            align-items: center;
            font-weight: bold;
            text-transform: uppercase; 
            grid-column: span 5;  
            gap: 20px;   
        }  

        .fecha ,
        .debito ,
        .credito, .detalle, .saldo {
            position: relative;
            flex: 1;
            text-align: left;
        } 
        .header  {
            color: #000;
            border-bottom: solid 2px #0c3b79; 
            padding: 10px;   
            margin-bottom: 10px;
            font-weight: bold;
        }
        .debito {
            text-align: right !important;
            color: red !important;     
        }
        .debito::before {
            position: absolute;
            left: 10px;
            content: "-"        
        }
        .credito {
            text-align: right !important;
            color: green !important;
        }
        .credito::before {
            position: absolute;
            left: 10px;
            content: "+"        
        }
        .saldo {
            text-align: right !important;
        }
        .fecha-label ,.debito-label ,
        .creadito-label, .detail-label, .saldo-label  {
            margin-bottom: 10px
        }

        .debito-label ,  .creadito-label, .saldo-label  {
            display: flex;
            justify-content: space-between;
        }
        w-colum-chart, w-filter-option {
            grid-column: span 5;
        }
        .total {
            font-weight: bold;
            padding-top: 10px;
        }
        .summary {
            border-top: solid 8px #3498db;
            font-weight: bold;        
        }
    `

    MapMovimientos(movimientos, displayType) {
        return movimientos.filter(m => m.moneda.toLowerCase() == displayType)
            .map(m => new Movimiento(m, displayType));
    }
}
customElements.define('w-component', GestionCuentaComponent);
export { GestionCuentaComponent };

