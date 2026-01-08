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
        /**@type {ModelProperty} */ this.monto_dolares = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.monto_cordobas = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.cambio_cordobas = undefined;
        // @ts-ignore
        /**@type {ModelProperty} */ this.cambio_dolares = undefined;
        Object.assign(this, props);

    }

    /**@type {ModelProperty} */ numero_contrato = { type: "number", disabled: true, hidden: true };
    /**@type {ModelProperty} */ fecha = {
        type: "date", hidden: true
    };
    /**@type {ModelProperty} */ id_recibo = { type: "number", primary: true };
    /**@type {ModelProperty} */ consecutivo = { type: "number", hidden: true, require: false };
    
    
    /**@type {ModelProperty} */ mora_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ mora_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };   

    
    /**@type {ModelProperty} */ interes_demas_cargos_pagar_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes C$" };
    /**@type {ModelProperty} */ interes_demas_cargos_pagar_dolares = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes $" };
        
    /**@type {ModelProperty} */ mora_interes_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes + Mora C$" };
    /**@type {ModelProperty} */ mora_interes_dolares = { type: "MONEY", hiddenInTable: true, disabled: true, label: "Interes + Mora $" };
    
    /**@type {ModelProperty} */ abono_capital_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ abono_capital_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };
    
    
    /**@type {ModelProperty} */ cuota_pagar_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ cuota_pagar_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };
   
    
    /**@type {ModelProperty} */ total_cordobas = { type: "MONEY", hiddenInTable: true, disabled: true };
    /**@type {ModelProperty} */ total_dolares = { type: "MONEY", hiddenInTable: true, disabled: true };
        
    
    /**@type {ModelProperty} */ perdida_de_documento_monto = { type: "MONEY", disabled: true, defaultValue: 0, require: false };  
    /**@type {ModelProperty} */ reestructurar_monto = { type: "MONEY", disabled: true, defaultValue: 0, require: false };
    /**@type {ModelProperty} */ //total_parciales = { type: "number", hiddenInTable: true, disabled: true };
   
   
    /**@type {ModelProperty} */ fecha_roc = { type: "date", disabled: true, hidden: true };

    /**@type {ModelProperty} */ moneda = { type: "radio", Dataset: ["DOLARES", "CORDOBAS"] };
  
   
    
    /**@type {ModelProperty} */ paga_cordobas = { type: "number", hiddenInTable: true };
    /**@type {ModelProperty} */ paga_dolares = { type: "number", hiddenInTable: true };
   
    
    /**@type {ModelProperty} */ total_apagar_cordobas = { type: "text", disabled: true };   
    /**@type {ModelProperty} */ total_apagar_dolares = { type: "text", disabled: true };

    
    /**@type {ModelProperty} */ reestructurar_value = { type: "number", label: "meses a reestructurar", placeholder: "número de meses ejm. 1", hidden: true, min: 1, require: true };


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
            perdida_de_documento: {
                type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
                    if (recibo.perdida_de_documento == true) {
                        recibo.perdida_de_documento_monto = 1;
                    } else {
                        recibo.perdida_de_documento_monto = 0;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, cancelar: {
                type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
                    if (recibo.cancelar == true) {
                        recibo.pago_parcial = false;
                        recibo.reestructurar = false;
                        recibo.reestructurar_monto = 0;
                        recibo.solo_interes_mora = false;
                        recibo.solo_abono = false;
                        form.ModelObject.paga_dolares.disabled = true;
                        form.ModelObject.reestructurar.disabled = true;
                        form.ModelObject.paga_cordobas.disabled = true;
                        form.ModelObject.reestructurar_value.hidden = true;
                    } else {
                        if (recibo.moneda == "DOLARES") {
                            form.ModelObject.paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.paga_cordobas.disabled = false;
                        }
                        form.ModelObject.reestructurar.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, solo_abono: {
                type: "checkbox", require: false, hidden: !contractData.canSoloAbono,
                action: (recibo, form) => {
                    recibo.cancelar = false;
                    recibo.solo_interes_mora = false;
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, reestructurar: {
                type: "checkbox", hidden: !contractData.canReestructure, require: false,
                action: (recibo, form) => {
                    if (recibo.reestructurar == true) {
                        form.ModelObject.reestructurar_value.hidden = false;
                        //contractData.reestructurar_monto.hidden = false;  
                        recibo.reestructurar_monto = 1;
                    } else {
                        form.ModelObject.reestructurar_value.hidden = true;
                        //contractData.reestructurar_monto.hidden = true; 
                        recibo.reestructurar_monto = 0;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, /*pago_parcial: {
                type: "checkbox", hidden: !contractData.canPagoParcial, require: false,
                action: (recibo, form) => {
                    if (recibo.pago_parcial == true) {
                        recibo.cancelar = false;
                        recibo.reestructurar = false;
                        recibo.reestructurar_monto = 0;
                        recibo.solo_interes_mora = false;
                        recibo.solo_abono = false;
                        if (recibo.moneda == "DOLARES") {
                            form.ModelObject.paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.paga_cordobas.disabled = false;
                        }
                        form.ModelObject.reestructurar.disabled = false;
                        form.ModelObject.reestructurar_value.hidden = true;
                    } else {
                        if (recibo.moneda == "DOLARES") {
                            form.ModelObject.paga_dolares.disabled = false;
                        } else {
                            form.ModelObject.paga_cordobas.disabled = false;
                        }
                        form.ModelObject.reestructurar.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            },*/ /**@type {ModelProperty} */solo_interes_mora: {
                type: "checkbox", require: false, hidden: !contractData.soloInteresMora,
                action: (recibo, form) => {
                    recibo.cancelar = false;
                    recibo.solo_abono = false;
                    if (recibo.solo_interes_mora == true) {
                        form.ModelObject.paga_dolares.disabled = true;
                        form.ModelObject.paga_cordobas.disabled = true;
                    } else {
                        form.ModelObject.paga_dolares.disabled = false;
                        form.ModelObject.paga_cordobas.disabled = false;
                    }
                    this.DefineMaxAndMinInForm(form, contractData);
                }
            }, paga_cordobas: {
                type: 'MONEY', max: contractData.pagoMaximoCordobas?.toFixed(3), default: contractData.pagoActualCordobas, disabled: true,
                min: contractData.pagoMinimoCordobas?.toFixed(3), action: (/**@type {Recibos}*/ ObjectF, form, control) => {                    
                    ObjectF.paga_dolares = Number((control.value / ObjectF.tasa_cambio).toFixed(3));
                    if (parseFloat(control.value) >= contractData.cancelacionValueCordobas) {
                        control.value = contractData.cancelacionValueCordobas?.toFixed(3);
                        ObjectF.solo_abono = false;
                        ObjectF.cancelar = true;
                        ObjectF.paga_cordobas = Number((contractData.cancelacionValueCordobas).toFixed(3));
                        ObjectF.paga_dolares = Number((contractData.cancelacionValue).toFixed(3));
                    }
                    if (parseFloat(control.value) < parseFloat(control.min)) {
                        control.value = parseFloat(control.min).toFixed(3);
                        ObjectF.solo_abono = true;
                        ObjectF.cancelar = false;
                        ObjectF.paga_cordobas = Number(contractData.pagoMinimoCordobas.toFixed(3));
                        ObjectF.paga_dolares = Number(contractData.pagoMinimoDolares.toFixed(3));
                    }
                    form.ModelObject.monto_dolares.action(ObjectF, form);
                }
            }, paga_dolares: {
                type: 'MONEY', max: contractData.pagoMaximoDolares?.toFixed(3), default: contractData.pagoActual,
                min: contractData.pagoMinimoDolares?.toFixed(3), action: (/**@type {Recibos}*/ ObjectF,/**@type {WForm}*/ form, control) => {
                    //console.log(contractData.cancelacionValue);
                    //console.trace()
                    ObjectF.paga_cordobas =  Number((control.value * ObjectF.tasa_cambio).toFixed(3));
                    if (parseFloat(control.value) >= contractData.cancelacionValue) {
                        control.value = contractData.cancelacionValue?.toFixed(3);
                        ObjectF.solo_abono = false;
                        ObjectF.cancelar = true;
                        ObjectF.reestructurar = false;
                        ObjectF.paga_cordobas = Number((contractData.cancelacionValueCordobas).toFixed(3));
                        ObjectF.paga_dolares = Number((contractData.cancelacionValue).toFixed(3));
                    }
                    if (parseFloat(control.value) < parseFloat(control.min)) {
                        control.value = parseFloat(control.min).toFixed(3);
                        ObjectF.solo_abono = true;
                        ObjectF.cancelar = false;
                        ObjectF.paga_cordobas = Number(contractData.pagoMinimoCordobas.toFixed(3));
                        ObjectF.paga_dolares = Number(contractData.pagoMinimoDolares.toFixed(3));
                    }
                    form.ModelObject.monto_dolares.action(ObjectF, form);
                    //form?.DrawComponent();
                }
            }, monto_dolares: {
                type: 'MONEY', defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    ObjectF.monto_cordobas = (ObjectF.monto_dolares * ObjectF.tasa_cambio).toFixed(3);
                    ObjectF.cambio_dolares = (ObjectF.monto_dolares - ObjectF.paga_dolares).toFixed(3);
                    ObjectF.cambio_cordobas = (ObjectF.monto_cordobas - ObjectF.paga_cordobas).toFixed(3);
                    if (ObjectF.moneda == "DOLARES") {
                        ObjectF.cambio_cordobas = ((ObjectF.monto_dolares - ObjectF.paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                    }
                    form?.DrawComponent();
                }
            }, monto_cordobas: {
                type: 'MONEY', defaultValue: 0, hidden: true, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //console.log(ObjectF.monto_dolares, ObjectF.paga_dolares);
                    ObjectF.monto_dolares = (ObjectF.monto_cordobas / ObjectF.tasa_cambio).toFixed(3);
                    ObjectF.cambio_dolares = (ObjectF.monto_dolares - ObjectF.paga_dolares).toFixed(3);
                    ObjectF.cambio_cordobas = (ObjectF.monto_cordobas - ObjectF.paga_cordobas).toFixed(3);
                    if (ObjectF.moneda == "DOLARES") {
                        ObjectF.cambio_cordobas = ((ObjectF.monto_dolares - ObjectF.paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                    }
                    form?.DrawComponent();
                }
            }, cambio_dolares: {
                type: 'MONEY', disabled: true, require: false, defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //console.log(ObjectF.monto_dolares);
                    //return ConvertToMoneyString(ObjectF.cambio_dolares = ObjectF.monto_dolares - ObjectF.paga_dolares);
                }
            }, cambio_cordobas: {
                type: 'MONEY', disabled: true, require: false, defaultValue: 0, action: (/**@type {Recibos}*/ ObjectF, form) => {
                    //return ConvertToMoneyString(ObjectF.cambio_cordobas = ObjectF.monto_cordobas - ObjectF.paga_cordobas);
                }
            }, moneda: {
                type: "radio", Dataset: ["DOLARES", "CORDOBAS"], action: (/**@type {Recibos}*/ ObjectF, form) => {
                    if (ObjectF.moneda == "DOLARES") {
                        form.ModelObject.monto_dolares.hidden = false;
                        form.ModelObject.monto_cordobas.hidden = true;

                        form.ModelObject.paga_cordobas.disabled = true;
                        form.ModelObject.paga_dolares.disabled = false;

                        form.ModelObject.Is_cambio_cordobas.hidden = false;
                        ObjectF.Is_cambio_cordobas = false;
                        ObjectF.cambio_cordobas = ((ObjectF.monto_dolares - ObjectF.paga_dolares) * contractData.tasasCambio[0].Valor_de_compra).toFixed(3);
                        form?.DrawComponent();
                    } else {
                        form.ModelObject.monto_dolares.hidden = true;
                        form.ModelObject.monto_cordobas.hidden = false;

                        form.ModelObject.paga_cordobas.disabled = false;
                        form.ModelObject.paga_dolares.disabled = true;

                        form.ModelObject.Is_cambio_cordobas.hidden = true;
                        ObjectF.Is_cambio_cordobas = false;
                        ObjectF.cambio_cordobas = (ObjectF.monto_cordobas - ObjectF.paga_cordobas).toFixed(3);
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
        form.FormObject.paga_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.total_apagar_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.total_apagar_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.paga_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.monto_dolares = contractData.pagoActual?.toFixed(3);
        form.FormObject.monto_cordobas = contractData.pagoActualCordobas?.toFixed(3);
        form.FormObject.interes_demas_cargos_pagar_dolares = contractData.InteresCorriente?.toFixed(3);
        form.FormObject.interes_demas_cargos_pagar_cordobas = contractData.InteresCorriente_Cordobas.toFixed(3);
        
        form.FormObject.mora_interes_cordobas = (parseFloat(form.FormObject.mora_cordobas) + contractData.InteresCorriente_Cordobas).toFixed(3);
        form.FormObject.mora_interes_dolares = (parseFloat(form.FormObject.mora_dolares) + contractData.InteresCorriente).toFixed(3);
        //model
        form.ModelObject.paga_dolares.max = contractData.pagoMaximoDolares?.toFixed(3);
        form.ModelObject.paga_dolares.min = contractData.pagoMinimoDolares?.toFixed(3);
        form.ModelObject.paga_cordobas.max = contractData.pagoMaximoCordobas?.toFixed(3);
        form.ModelObject.paga_cordobas.min = contractData.pagoMinimoCordobas?.toFixed(3);

        form.DrawComponent();
    }
    /**@type {ModelProperty} */ cancelar = { type: "checkbox", hiddenInTable: true, require: false };    
    

     /**@type {ModelProperty} */ perdida_de_documento = {
        type: "checkbox", hiddenInTable: true, require: false, action: (recibo, form) => {
            if (recibo.perdida_de_documento == true) {
                recibo.perdida_de_documento_monto = 1;
            } else {
                recibo.perdida_de_documento_monto = 0;
            }
            form.DrawComponent();
        }
    };
    /**@type {ModelProperty} */ solo_abono = { type: "checkbox", hiddenInTable: true, require: false };

    /**@type {ModelProperty} */ solo_interes_mora = {
        type: "checkbox", require: false,
        label: "Solo interés+mora",
        action: (recibo, form) => { }
    };
    /**@type {ModelProperty} */ reestructurar = {
        type: "checkbox", hidden: true, require: false,
        action: (recibo, form) => {
            if (recibo.reestructurar == true) {
                this.reestructurar_value.hidden = false;
                //this.reestructurar_monto.hidden = false;  
                recibo.reestructurar_monto = 1;
            } else {
                this.reestructurar_value.hidden = true;
                //this.reestructurar_monto.hidden = true; 
                recibo.reestructurar_monto = 0;
            }
            form.DrawComponent();
        }
    };
    /**@type {ModelProperty} */ temporal = { type: "checkbox", require: false };
    /**@type {ModelProperty} */ Is_cambio_cordobas = { type: "checkbox", require: false, label: "dar cambio en córdobas", hidden: false };

}
export { Recibos_ModelComponent };
