//@ts-check
import { Catalogo_Cambio_Divisa } from "../FrontModel/Catalogo_Cambio_Divisa.js";
import { Catalogo_Cambio_Divisa_ModelComponent } from "../FrontModel/DBODataBaseModel.js";

export class DivisasServicesUtil {
    /**
    * @returns {Promise<Catalogo_Cambio_Divisa>}
    */
    static TasaCambio = async () => {
        this.TasasCambioList = await new Catalogo_Cambio_Divisa().Get();
        return this.TasasCambioList[0];
    }
}