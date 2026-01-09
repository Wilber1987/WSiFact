//@ts-check
import { Catalogo_Cambio_Divisa } from "../FrontModel/Catalogo_Cambio_Divisa.js";
import { Catalogo_Cambio_Divisa_ModelComponent, Catalogo_Cuentas } from "../FrontModel/DBODataBaseModel.js";
import { Movimientos_Cuentas_ModelComponent } from "../FrontModel/MovimientosCuentas.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../WDevCore/StyleModules/WStyleComponents.js";
import { ModalMessage } from "../WDevCore/WComponents/ModalMessage.js";
import { WAlertMessage } from "../WDevCore/WComponents/WAlertMessage.js";
import { WModalForm } from "../WDevCore/WComponents/WModalForm.js";
import { WTableComponent } from "../WDevCore/WComponents/WTableComponent.js";
import { ComponentsManager, WRender } from "../WDevCore/WModules/WComponentsTools.js";
import { css } from "../WDevCore/WModules/WStyledRender.js";
import { Gestion_CuentasView } from "./Gestion_CuentasView.js";
class Gestion_movimientos_CuentasView extends HTMLElement {
    constructor() {
        super();
        this.Draw();
    }
    Draw = async () => {
        const model = new Movimientos_Cuentas_ModelComponent();
        const dataset = await model.Get();

        const tasa = await new Catalogo_Cambio_Divisa_ModelComponent().Get();
        model.Tasa_cambio.defaultValue = tasa[0].Valor_de_compra;
        /**@type {Catalogo_Cambio_Divisa} */
        const tasaActual = tasa[0];
        this.Cuentas = await new Catalogo_Cuentas().Get();
        this.append(this.CustomStyle);
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "main-container", id: 'TabContainer' });
        //this.MainComponent = WRender.Create({ className: "main-container", children: [] })

        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.TableComponent = new WTableComponent({
            ModelObject: model, Dataset: dataset, WSelectAddObject: false, Options: {
                Filter: true,
                Print: true,

                //Add: true, UrlAdd: "guardarMovimiento",
                //Edit: true, UrlUpdate: "editarMovimiento",
                //Search: true, //UrlSearch: "../application/controllers/Vehiculos_Controller.php/get" + Model.constructor.name,
                UserActions: [
                    {
                        name: "Anular movimiento", rendered: (/** @type {Movimientos_Cuentas_ModelComponent} */ movimiento) => {
                            //console.log(movimiento.is_transaction, movimiento.is_transaction == true);
                            // @ts-ignore
                            return movimiento.is_transaction == true;
                        },
                        action: (movimiento) => {
                            /*if (movimiento.is_transaction) {
                                return false;
                            }*/
                            const modelContrapartida = new Movimientos_Cuentas_ModelComponent();
                            modelContrapartida.Catalogo_Cuentas_Destino.Dataset = [movimiento.Catalogo_Cuentas_Origen];
                            modelContrapartida.Catalogo_Cuentas_Origen.Dataset = [movimiento.Catalogo_Cuentas_Destino];
                            const MovimientoContrapartida = {
                                Catalogo_Cuentas_Origen: movimiento.Catalogo_Cuentas_Destino,
                                Catalogo_Cuentas_Destino: movimiento.Catalogo_Cuentas_Origen,
                                monto: movimiento.Monto.toFixed(2).toString(),
                                Tasa_cambio: movimiento.Tasa_cambio.toFixed(2).toString(),
                                Tasa_cambio_compra: movimiento.Tasa_cambio_compra.toFixed(2).toString(),
                                Total: movimiento.Total?.toFixed(2).toString(),
                                Descripcion: movimiento.Descripcion,
                                Concepto: "Anulación de movimiento",
                                Is_transaction: movimiento.Is_transaction
                            };
                            // @ts-ignore
                            modelContrapartida.Catalogo_Cuentas_Destino.ModelObject = undefined;
                            // @ts-ignore
                            modelContrapartida.Catalogo_Cuentas_Origen.ModelObject = undefined;
                            modelContrapartida.Monto.disabled = true;
                            //modelContrapartida.total.disabled = true;
                            this.append(new WModalForm({
                                EditObject: MovimientoContrapartida,
                                ObjectOptions: {
                                    Url: "/Api/ApiEntityDBO/saveMovimientos_Cuentas", SaveFunction: (param) => {
                                        this.TableComponent.Dataset.push(param);
                                        this.TableComponent.DrawTable();
                                    }
                                },
                                title: "Anulación movimiento", ModelObject: modelContrapartida, AutoSave: true
                            }))
                        }
                    }
                ]
            }
        })
        const ObjectOptions = {
            SaveFunction: (param, response) => {
                console.log(response)
                WAlertMessage.Warning(response.message);
            }
        }



        this.Manager?.NavigateFunction("tablaMovimientos", new Gestion_CuentasView())

        //this.MainComponent.shadowRoot?.prepend(this.FilterOptions);
        //window.addEventListener('load', async () => { MainBody.append(new Gestion_CuentasView()) })

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Movimientos Cuentas',
            onclick: () => {
                this.Manager?.NavigateFunction("tablaMovimientos")
            }
        }))
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Detalles Movimientos',
            onclick: () => {
                this.Manager?.NavigateFunction("tablaMovimientosDetalles", this.TableComponent)
            }
        }))

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Secundary', innerText: 'Registrar movimiento interno',
            onclick: () => {
                const modelExterno = new Movimientos_Cuentas_ModelComponent();
                modelExterno.Tasa_cambio.defaultValue = tasa[0].Valor_de_venta;
                modelExterno.Catalogo_Cuentas_Origen.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA");
                modelExterno.Catalogo_Cuentas_Origen.action = (entity, form) => {
                    modelExterno.Catalogo_Cuentas_Destino.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA"
                        && x.Id_cuentas != entity.Catalogo_Cuentas_Origen.Id_cuentas);
                    entity.Fecha = new Date();
                    form.DrawComponent();
                }
                const cuentaPrimaria = this.Cuentas?.find(x => x.Tipo_cuenta == "PROPIA"
                    && x.Id_cuentas);

                modelExterno.Catalogo_Cuentas_Destino.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA"
                    && x.Id_cuentas != cuentaPrimaria.Id_cuentas);
                //modelExterno.tasa_cambio_compra = model.tasa_cambio_compra;
                this.append(new WModalForm({ title: "Movimiento a cuenta", ModelObject: modelExterno, AutoSave: true, ObjectOptions: ObjectOptions }))
            }
        }))


        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Registrar nuevo ingreso',
            onclick: () => {
                const modelExterno = new Movimientos_Cuentas_ModelComponent();
                modelExterno.Tasa_cambio.defaultValue = tasa[0].Valor_de_venta;
                console.log(modelExterno);
                modelExterno.Catalogo_Cuentas_Origen.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta != "PROPIA");
                modelExterno.Catalogo_Cuentas_Destino.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA");

                //modelExterno.tasa_cambio_compra = model.tasa_cambio_compra;
                this.append(new WModalForm({ title: "Ingreso", ModelObject: modelExterno, AutoSave: true, ObjectOptions: this.ObjectOptionsModal }))
            }
        }))

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Tertiary', innerText: 'Registrar nuevo egreso',
            onclick: () => {
                const modelExterno = new Movimientos_Cuentas_ModelComponent();
                modelExterno.Tasa_cambio.defaultValue = tasa[0].Valor_de_compra;
                modelExterno.Catalogo_Cuentas_Origen.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA");
                modelExterno.Catalogo_Cuentas_Destino.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta != "PROPIA");

                // @ts-ignore
                //modelExterno.tasa_cambio = tasaActual.Valor_de_compra;
                this.append(new WModalForm({ title: "Egreso", ModelObject: modelExterno, AutoSave: true, ObjectOptions: this.ObjectOptionsModal }))
            }
        }))

        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Fourth', innerText: 'Realizar Pago',
            onclick: () => {
                const modelExterno = new Movimientos_Cuentas_ModelComponent();
                modelExterno.Tasa_cambio.defaultValue = tasa[0].Valor_de_compra;
                modelExterno.Catalogo_Cuentas_Origen.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PROPIA");
                modelExterno.Catalogo_Cuentas_Destino.Dataset = this.Cuentas?.filter(x => x.Tipo_cuenta == "PAGO");
                // @ts-ignore
                //modelExterno.tasa_cambio = tasaActual.Valor_de_venta;
                this.append(new WModalForm({
                    title: "Egreso",
                    ModelObject: modelExterno,
                    AutoSave: true,
                    ObjectOptions:
                        this.ObjectOptionsModal
                }))
            }
        }))
        //this.Manager?.NavigateFunction("tabla", this.MainComponent)
        this.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
    }
    ObjectOptionsModal = {
        SaveFunction: async (profile, response) => {
            this.append(ModalMessage(response.message))
            if (response.status == 200) {
                const dataset = await new Movimientos_Cuentas_ModelComponent().Get();
                this.TableComponent.Dataset = dataset;
                this.TableComponent.DrawTable();
            }
        }
    }
    CustomStyle = css`
        .component{
           display: block;
        }    
        .OptionContainer {
            margin-bottom: 20px;
            display: flex;
        }       
    `

}
customElements.define('w-gestion_movimientos_cuentas', Gestion_movimientos_CuentasView);
// @ts-ignore
window.addEventListener('load', async () => { MainBody.append(new Gestion_movimientos_CuentasView()) })
