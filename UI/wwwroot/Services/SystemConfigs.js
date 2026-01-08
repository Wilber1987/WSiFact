//@ts-check

import { Transactional_Configuraciones } from "../Admin/ADMINISTRATIVE_ACCESSDataBaseModel.js";


export class SystemConfigs {
    /**@type {Array<Transactional_Configuraciones>} */
    static #Configuraciones;
    /**
    * @returns {Promise<Array<Transactional_Configuraciones>>}
    */
    static Get = async () => {       
        this.#Configuraciones = await new Transactional_Configuraciones().getConfiguraciones_Configs();
        return this.#Configuraciones;
    }

    /**
    * @returns {Promise<Transactional_Configuraciones|undefined>}
    */
    static FindByName = async (name) => {
        if ( this.#Configuraciones == undefined) {
            await this.Get()
        }
        return this.#Configuraciones?.find(c => c.Nombre == name);
    }




}