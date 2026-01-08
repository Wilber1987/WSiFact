import { EntityClass } from "../WDevCore/WModules/EntityClass.js";
export class Transactional_Configuraciones extends EntityClass {

    constructor(props) {
        super(props, 'EntityAdministrative_Access');
        Object.assign(this, props);
    }
    /**@type {Number?} */Id_Configuracion = null;
    /**@type {String?} */Nombre = null;
    /**@type {String?} */Descripcion = null;
    /**@type {String?} */Valor = null;
    /**@type {String?} */Tipo_Configuracion = null;
    getConfiguraciones_Intereses = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Intereses");
    }
    getConfiguraciones_Beneficios = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Beneficios");
    }
    /**
    * @returns {Promise<Array<Transactional_Configuraciones>>}
    */
    getConfiguraciones_Configs = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Configs");
    }
    GetConfigs = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Theme");
    }
}

export class Transactional_Configuraciones_ModelComponent extends EntityClass {

    constructor(props) {
        super(props, 'EntityAdministrative_Access');
        Object.assign(this, props);
    }
    Id_Configuracion = { type: 'number', primary: true };
    Nombre = { type: 'text', disabled: true };
    Descripcion = { type: 'text', disabled: true };
    Valor = { type: 'text' };
    Tipo_Configuracion = { type: 'text', disabled: true };
    getConfiguraciones_Intereses = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Intereses");
    }
    getConfiguraciones_Beneficios = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Beneficios");
    }
    /**
    * @returns {Promise<Array<Transactional_Configuraciones>>}
    */
    getConfiguraciones_Configs = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Configs");
    }
    GetConfigs = async () => {
        return await this.GetData("ApiEntityAdministrative_Access/getConfiguraciones_Theme");
    }
}
