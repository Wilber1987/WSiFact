//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Tbl_Compra_ModelComponent } from './Tbl_Compra_ModelComponent.js'
class Cat_Proveedor_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
    /**@type {ModelProperty}*/ Id_Proveedor = { type: 'number', primary: true };
    /**@type {ModelProperty}*/ Nombre = { type: 'text' };
    /**@type {ModelProperty}*/ Estado = { type: 'text' };
    /**@type {ModelProperty}*/ Identificacion = { type: 'text' };
    /**@type {ModelProperty}*/ Datos_Proveedor = { type: 'model', hidden: true };
    /**@type {ModelProperty}*/ Tbl_Compra = { type: 'MasterDetail', ModelObject: () => new Tbl_Compra_ModelComponent() };
}
export { Cat_Proveedor_ModelComponent }
