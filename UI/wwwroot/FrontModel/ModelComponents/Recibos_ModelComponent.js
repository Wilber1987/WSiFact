//@ts-check
import { WForm } from "../../WDevCore/WComponents/WForm.js";
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { ContractData, FinancialModule } from "../../modules/FinancialModule.js";
import { Recibos } from "../Recibos.js";
class Recibos_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'Recibos');
        // @ts-ignore
        /**@type {ModelProperty} */ this.Monto_dolares = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.Monto_cordobas = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.Cambio_cordobas = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.Cambio_dolares = undefined;
        Object.assign(this, props);

    }

    /**@type {ModelProperty} */ Numero_contrato = { type: "number", disabled: true, hidden: true };
    /**@type {ModelProperty} */ Fecha = {
        type: "date", hidden: true
    };
    /**@type {ModelProperty} */ Id_recibo = { type: "number", primary: true };
    /**@type {ModelProperty} */ Consecutivo = { type: "number", hidden: true, require: false };


    /**@type {ModelProperty} */ Mora_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ Mora_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };


    /**@type {ModelProperty} */ Interes_demas_cargos_pagar_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes C$" };
    /**@type {ModelProperty} */ Interes_demas_cargos_pagar_dolares = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes $" };

    /**@type {ModelProperty} */ Mora_interes_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes + Mora C$" };
    /**@type {ModelProperty} */ Mora_interes_dolares = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes + Mora $" };

    /**@type {ModelProperty} */ Abono_capital_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ Abono_capital_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };


    /**@type {ModelProperty} */ Cuota_pagar_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ Cuota_pagar_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };


    /**@type {ModelProperty} */ Total_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ Total_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };


    /**@type {ModelProperty} */ Perdida_de_documento_monto = { type: "MONEY", disabled: true, defaultValue: 0, require: false };
    /**@type {ModelProperty} */ Reestructurar_monto = { type: "MONEY", disabled: true, defaultValue: 0, require: false };
    /**@type {ModelProperty} */ //Total_parciales = { type: "number", hiddenInTable: true, disabled: true };


    /**@type {ModelProperty} */ Fecha_roc = { type: "date", disabled: true, hidden: true };

    /**@type {ModelProperty} */ Moneda = { type: "radio", Dataset: ["DOLARES", "CORDOBAS"] };



    /**@type {ModelProperty} */ Paga_cordobas = { type: "number", hiddenInTable: true };
    /**@type {ModelProperty} */ Paga_dolares = { type: "number", hiddenInTable: true };


    /**@type {ModelProperty} */ Total_apagar_cordobas = { type: "text", disabled: true };
    /**@type {ModelProperty} */ Total_apagar_dolares = { type: "text", disabled: true };


    /**@type {ModelProperty} */ Reestructurar_value = { type: "number", label: "meses a reestructurar", placeholder: "número de meses ejm. 1", hidden: true, min: 1, require: true };


    VerRecibo = async () => {
        return await this.SaveData("PDF/GeneratePdfContract", this)
    }

    /**
   * @param {ContractData} contractData 
   * @returns {Recibos_ModelComponent}
   */
    static BuildRecibosModel(contractData) {
        //console.log(contractData.pagoMaximoCordobas);
        return new Recibos_ModelComponent({
            Perdida_de_documento: {
                type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
                    if (recibo.Perdida_de_documento == true) {
                        recibo.Perdida_de_documento_monto = 1;
                    } else {
                        recibo.Perdida_de_documento_monto = 0;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, Cancelar: {
                type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
                    if (recibo.Cancelar == true) {
                        recibo.Pago_parcial = false;
                        recibo.Reestructurar = false;
                        recibo.Reestructurar_monto = 0;
                        recibo.Solo_interes_mora = false;
                        recibo.Solo_abono = false;
                        form.ModelObject.Paga_dolares.disabled = true;
                        form.ModelObject.Reestructurar.disabled = true;
                        form.ModelObject.Paga_cordobas.disabled = true;
                        form.ModelObject.Reestructurar_value.hidden = true;
                    } else {
                        if (recibo.Moneda == "DOLARES") {
                            form.ModelObject.Paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.Paga_cordobas.disabled = false;
                        }
                        form.ModelObject.Reestructurar.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, Solo_abono: {
                type: "checkbox", require: false, hidden: !contractData.canSoloAbono,
                action: (recibo, form) => {
                    recibo.Cancelar = false;
                    recibo.Solo_interes_mora = false;
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, Reestructurar: {
                type: "checkbox", hidden: !contractData.canReestructure, require: false,
                action: (recibo, form) => {
                    if (recibo.Reestructurar == true) {
                        form.ModelObject.Reestructurar_value.hidden = false;
                        //contractData.Reestructurar_monto.hidden = false;  
                        recibo.Reestructurar_monto = 1;
                    } else {
                        form.ModelObject.Reestructurar_value.hidden = true;
                        //contractData.Reestructurar_monto.hidden = true; 
                        recibo.Reestructurar_monto = 0;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, /*Pago_parcial: {
                type: "checkbox", hidden: !contractData.canPagoParcial, require: false,
                action: (recibo, form) => {
                    if (recibo.Pago_parcial == true) {
                        recibo.Cancelar = false;
                        recibo.Reestructurar = false;
                        recibo.Reestructurar_monto = 0;
                        recibo.Solo_interes_mora = false;
                        recibo.Solo_abono = false;
                        if (recibo.Moneda == "DOLARES") {
                            form.ModelObject.Paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.Paga_cordobas.disabled = false;
                        }
                        form.ModelObject.Reestructurar.disabled = false;
                        form.ModelObject.Reestructurar_value.hidden = true;
                    } else {
                        if (recibo.Moneda == "DOLARES") {
                            form.ModelObject.Paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.Paga_cordobas.disabled = false;
                        }
                        form.ModelObject.Reestructurar.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            },*/ /**@type {ModelProperty} */Solo_interes_mora: {
                type: "checkbox", require: false, hidden: !contractData.soloInteresMora,
                action: (recibo, form) => {
                    recibo.Cancelar = false;
                    recibo.Solo_abono = false;
                    if (recibo.Solo_interes_mora == true) {
                        form.ModelObject.Paga_dolares.disabled = true;
                        form.ModelObject.Paga_cordobas.disabled = true;
                    } else {
                        form.ModelObject.Paga_dolares.disabled = false;
                        form.ModelObject.Paga_cordobas.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, Paga_cordobas: {
                type: 'MONEY', max: contractData.pagoMaximoCordobas?.toFixed(3), default: contractData.pagoActualCordobas, disabled: true,
                min: contractData.pagoMinimoCordobas?.toFixed(3), action: (/**@type {Recibos}*/ ObjectF, form, control) => {
                    ObjectF.Paga_dolares = Number((control.value / ObjectF.Tasa_cambio).toFixed(3));
                    if (parseFloat(control.value) >= contractData.cancelacionValueCordobas) {
                        control.value = contractData.cancelacionValueCordobas?.toFixed(3);
                        ObjectF.Solo_abono = false;
                        ObjectF.Cancelar = true;
                        ObjectF.Paga_cordobas = Number((contractData.cancelacionValueCordobas).toFixed(3));
                        ObjectF.Paga_dolares = Number((contractData.cancelacionValue).toFixed(3));
                    }
                    if (parseFloat(control.value) < parseFloat(control.min)) {
                        control.value = parseFloat(control.min).toFixed(3);
                        ObjectF.Solo_abono = true;
                        ObjectF.Cancelar = false;
                        ObjectF.Paga_cordobas = Number(contractData.pagoMinimoCordobas.toFixed(3));
                        ObjectF.Paga_dolares = Number(contractData.pagoMinimoDolares.toFixed(3));
                    }
                    form.ModelObject.Monto_dolares.action(ObjectF, form);
                }
            }, Paga_dolares: {
                type: 'MONEY', max: contractData.pagoMaximoDolares?.toFixed(3), default: contractData.pagoActual,
                min: contractData.pagoMinimoDolares?.toFixed(3), action: (/**@type {Recibos}*/ ObjectF,/**@type {WForm}*/ form, control) => {
                    //console.log(contractData.cancelacionValue);
                    //console.trace()
                    ObjectF.Paga_cordobas = Number((control.value * ObjectF.Tasa_cambio).toFixed(3));
                    if (parseFloat(control.value) >= contractData.cancelacionValue) {
                        control.value = contractData.cancelacionValue?.toFixed(3);
                        ObjectF.Solo_abono = false;
                        ObjectF.Cancelar = true;
                        ObjectF.Reestructurar = false;
                        ObjectF.Paga_cordobas = Number((contractData.cancelacionValueCordobas).toFixed(3));
                        ObjectF.Paga_dolares = Number((contractData.cancelacionValue).toFixed(3));
                    }
                    if (parseFloat(control.value) < parseFloat(control.min)) {
                        control.value = parseFloat(control.min).toFixed(3);
                        ObjectF.Solo_abono = true;
                        ObjectF.Cancelar = false;
                        ObjectF.Paga_cordobas = Number(contractData.pagoMinimoCordobas.toFixed(3));
                        ObjectF.Paga_dolares = Number(contractData.pagoMinimoDolares.toFixed(3));
                    }
                    form.ModelObject.Monto_dolares.action(ObjectF, form);
                    //form?.DrawComponent();
                }
            }, Monto_dolares: {
                type: 'MONEY', defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    ObjectF.Monto_cordobas = (ObjectF.Monto_dolares * ObjectF.Tasa_cambio).toFixed(3);
                    ObjectF.Cambio_dolares = (ObjectF.Monto_dolares - ObjectF.Paga_dolares).toFixed(3);
                    ObjectF.Cambio_cordobas = (ObjectF.Monto_cordobas - ObjectF.Paga_cordobas).toFixed(3);
                    if (ObjectF.Moneda == "DOLARES") {
                        ObjectF.Cambio_cordobas = ((ObjectF.Monto_dolares - ObjectF.Paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                    }
                    form?.DrawComponent();
                }
            }, Monto_cordobas: {
                type: 'MONEY', defaultValue: 0, hidden: true, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //console.log(ObjectF.Monto_dolares, ObjectF.Paga_dolares);
                    ObjectF.Monto_dolares = (ObjectF.Monto_cordobas / ObjectF.Tasa_cambio).toFixed(3);
                    ObjectF.Cambio_dolares = (ObjectF.Monto_dolares - ObjectF.Paga_dolares).toFixed(3);
                    ObjectF.Cambio_cordobas = (ObjectF.Monto_cordobas - ObjectF.Paga_cordobas).toFixed(3);
                    if (ObjectF.Moneda == "DOLARES") {
                        ObjectF.Cambio_cordobas = ((ObjectF.Monto_dolares - ObjectF.Paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                    }
                    form?.DrawComponent();
                }
            }, Cambio_dolares: {
                type: 'MONEY', disabled: true, require: false, defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //console.log(ObjectF.Monto_dolares);
                    //return ConvertToMoneyString(ObjectF.Cambio_dolares = ObjectF.Monto_dolares - ObjectF.Paga_dolares);
                }
            }, Cambio_cordobas: {
                type: 'MONEY', disabled: true, require: false, defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //return ConvertToMoneyString(ObjectF.Cambio_cordobas = ObjectF.Monto_cordobas - ObjectF.Paga_cordobas);
                }
            }, Moneda: {
                type: "radio", Dataset: ["DOLARES", "CORDOBAS"], action: (/**@type {Recibos}*/ ObjectF, form) => {
                    if (ObjectF.Moneda == "DOLARES") {
                        form.ModelObject.Monto_dolares.hidden = false;
                        form.ModelObject.Monto_cordobas.hidden = true;

                        form.ModelObject.Paga_cordobas.disabled = true;
                        form.ModelObject.Paga_dolares.disabled = false;

                        form.ModelObject.Is_cambio_cordobas.hidden = false;
                        ObjectF.Is_cambio_cordobas = false;
                        ObjectF.Cambio_cordobas = ((ObjectF.Monto_dolares - ObjectF.Paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                        form?.DrawComponent();
                    } else {
                        form.ModelObject.Monto_dolares.hidden = true;
                        form.ModelObject.Monto_cordobas.hidden = false;

                        form.ModelObject.Paga_cordobas.disabled = false;
                        form.ModelObject.Paga_dolares.disabled = true;

                        form.ModelObject.Is_cambio_cordobas.hidden = true;
                        ObjectF.Is_cambio_cordobas = false;
                        ObjectF.Cambio_cordobas = (ObjectF.Monto_cordobas - ObjectF.Paga_cordobas).toFixed(3);
                        form?.DrawComponent();
                    }
                }
            }
        });
    }
    /**
    * @param {WForm} form 
    * @param {ContractData} contractData 
    */
    static DefineMaxAndMinInForm(form, contractData) {
        FinancialModule.UpdateContractData(contractData.Contrato, contractData);
        form.FormObject.Paga_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.Total_apagar_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.Total_apagar_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.Paga_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.Monto_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.Monto_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.Interes_demas_cargos_pagar_dolares = contractData.InteresCorriente?.toFixed(3);
        form.FormObject.Interes_demas_cargos_pagar_cordobas = contractData.InteresCorriente_Cordobas.toFixed(3);

        form.FormObject.Mora_interes_cordobas = (parseFloat(form.FormObject.Mora_cordobas) + contractData.InteresCorriente_Cordobas).toFixed(3);
        form.FormObject.Mora_interes_dolares = (parseFloat(form.FormObject.Mora_dolares) + contractData.InteresCorriente).toFixed(3);
        //model
        form.ModelObject.Paga_dolares.max = contractData.pagoMaximoDolares?.toFixed(3);
        form.ModelObject.Paga_dolares.min = contractData.pagoMinimoDolares?.toFixed(3);
        form.ModelObject.Paga_cordobas.max = contractData.pagoMaximoCordobas?.toFixed(3);
        form.ModelObject.Paga_cordobas.min = contractData.pagoMinimoCordobas?.toFixed(3);

        form.DrawComponent();
    }
    /**@type {ModelProperty} */ Cancelar = { type: "checkbox", hiddenInTable: true, require: false };


     /**@type {ModelProperty} */ Perdida_de_documento = {
        type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
            if (recibo.Perdida_de_documento == true) {
                recibo.Perdida_de_documento_monto = 1;
            } else {
                recibo.Perdida_de_documento_monto = 0;
            }
            form.DrawComponent();
        }
    };
    /**@type {ModelProperty} */ Solo_abono = { type: "checkbox", hiddenInTable: true, require: false };

    /**@type {ModelProperty} */ Solo_interes_mora = {
        type: "checkbox", require: false,
        label: "Solo interés+mora",
        action: (recibo, form) => { }
    };
    /**@type {ModelProperty} */ Reestructurar = {
        type: "checkbox", hidden: true, require: false,
        action: (recibo, form) => {
            if (recibo.Reestructurar == true) {
                this.Reestructurar_value.hidden = false;
                //this.Reestructurar_monto.hidden = false;  
                recibo.Reestructurar_monto = 1;
            } else {
                this.Reestructurar_value.hidden = true;
                //this.Reestructurar_monto.hidden = true; 
                recibo.Reestructurar_monto = 0;
            }
            form.DrawComponent();
        }
    };
    /**@type {ModelProperty} */ Temporal = { type: "checkbox", require: false };
    /**@type {ModelProperty} */ Is_cambio_cordobas = { type: "checkbox", require: false, label: "dar cambio en córdobas", hidden: false };

}
export { Recibos_ModelComponent };
