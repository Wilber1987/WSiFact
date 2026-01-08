import { EntityClass } from "../WDevCore/WModules/EntityClass.js";

export class ParcialesData extends EntityClass {
    constructor(props) {
        super(props, 'Transactional_Contrato');
        Object.assign(this, props);
    }
    /**@type {Number} */
    numero_contrato;
    /**@type {Number} */
    id_cuota;
    /**@type {Number} */
    pagoParciales;

    /**
    * @returns {Promise<ParcialesData>}
    */
    GetParcialesData = async () => {
        return await this.SaveData("Transactional_Contrato/GetParcialesData", this)
    }
}