import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";
import { ConvertToMoneyString } from "../WDevCore/WModules/WComponentsTools.js";

class Tbl_Cuotas_ModelComponent {
    constructor(props) {
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */
    fecha = { type: "date",  label: "FECHA" };   
    /**@type {ModelProperty} */
    interes = { type: "money", label: "IDCP $"  };    
    /**@type {ModelProperty} */
    abono_capital = { type: "money", label: "ABONO AL CAPITAL $" };
    /**@type {ModelProperty} */
    total = { type: "money",  label: "CUOTA A PAGAR $" };
    /**@type {ModelProperty} */
    total_cordobas = { type: "OPERATION",  label: "CUOTA A PAGAR CORDOBAS", action: (/**@type {Tbl_Cuotas} */ cuota)=>{
        return ConvertToMoneyString(cuota.total * cuota.tasa_cambio);
    } };
    /**@type {ModelProperty} */
    capital_restante = { type: "money", label: "MONTO RESTANTE $" };
    /**@type {ModelProperty} */
    Estado = { type: "text"};
}
export { Tbl_Cuotas_ModelComponent }