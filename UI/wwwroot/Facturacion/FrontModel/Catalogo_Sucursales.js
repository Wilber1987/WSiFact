//@ts-check
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";


class Catalogo_Sucursales_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {ModelProperty}*/ Id_Sucursal = { type: 'number', primary: true };
    /**@type {ModelProperty}*/ Nombre = { type: 'text' };
    /**@type {ModelProperty}*/ Descripcion = { type: 'text', hiddenInTable: true };
    /**@type {ModelProperty}*/ Direccion = { type: 'text' };
}
export { Catalogo_Sucursales_ModelComponent }

class Catalogo_Sucursales extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {Number}*/ Id_Sucursal;
    /**@type {String}*/ Nombre;
    /**@type {String}*/ Descripcion;
    /**@type {String}*/ Direccion;
}
export { Catalogo_Sucursales }