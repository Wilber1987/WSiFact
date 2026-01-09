import { EntityClass } from "../WDevCore/WModules/EntityClass.js";

export class ParcialesData extends EntityClass {
    constructor(props) {
        super(props, 'Transactional_Contrato');
        Object.assign(this, props);
    }
    /**@type {Number} */
    Numero_contrato;
    /**@type {Number} */
    Id_cuota;
    /**@type {Number} */
    PagoParciales;

    /**
    * @returns {Promise<ParcialesData>}
    */
    GetParcialesData = async () => {
        return await this.SaveData("Transactional_Contrato/GetParcialesData", this)
    }
}