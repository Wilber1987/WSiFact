import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";
import { ConvertToMoneyString } from "../WDevCore/WModules/WComponentsTools.js";

class Tbl_Cuotas_ModelComponent {
    constructor(props) {
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */
    Fecha = { type: "date", label: "FECHA" };
    /**@type {ModelProperty} */
    Interes = { type: "money", label: "IDCP $" };
    /**@type {ModelProperty} */
    Abono_capital = { type: "money", label: "ABONO AL CAPITAL $" };
    /**@type {ModelProperty} */
    Total = { type: "money", label: "CUOTA A PAGAR $" };
    /**@type {ModelProperty} */
    Total_cordobas = {
        type: "OPERATION", label: "CUOTA A PAGAR CORDOBAS", action: (/**@type {Tbl_Cuotas} */ cuota) => {
            return ConvertToMoneyString(cuota.Total * cuota.Tasa_cambio);
        }
    };
    /**@type {ModelProperty} */
    Capital_restante = { type: "money", label: "MONTO RESTANTE $" };
    /**@type {ModelProperty} */
    Estado = { type: "text" };
}
export { Tbl_Cuotas_ModelComponent }