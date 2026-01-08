//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
// @ts-ignore
import { ModelProperty } from "../../../WDevCore/WModules/CommonModel.js";
import { Detalle_Compra } from "../Detalle_Compra.js";
import { Cat_Producto_ModelComponent } from './Cat_Producto_ModelComponent.js';
class Detalle_Compra_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityFacturacion');
        Object.assign(this, props);
    }
    /**@type {ModelProperty}*/ Id_Detalle_Compra = { type: 'number', primary: true };
    /**@type {ModelProperty}*/ Cantidad = { type: 'number' };
    /**@type {ModelProperty}*/ Precio_Unitario = { type: 'MONEY' };
    /**@type {ModelProperty}*/ SubTotal = {
        type: "OPERATION",
        action: (/**@type {Detalle_Compra} */ cuota) => {
            return ((cuota.Cantidad ?? 0) * (cuota.Precio_Unitario ?? 0)).toFixed(3);
        }
    };
    /**@type {ModelProperty}*/ Aplica_Iva = { type: 'CHECKBOX', require: false, hiddenInTable: true };
    /**@type {ModelProperty}*/ Iva = {
        type: "OPERATION", disabled: true, label: "Iva Cordobas", hidden: true,
        action: (/**@type {Detalle_Compra} */ cuota) => { }
    };
    /**@type {ModelProperty}*/ Total = {
        type: "OPERATION",
        action: (/**@type {Detalle_Compra} */ cuota) => { }
    };
    /**@type {ModelProperty}*/ Presentacion = {
        type: 'select',
        Dataset: ["UND"] // ["KILATE", "UND", "LBS", "KILO", "DOCENA"]
    };
    /**@type {ModelProperty}*/ Cat_Producto = { type: 'WSELECT', ModelObject: () => new Cat_Producto_ModelComponent() };
    /**@type {ModelProperty}*/ Datos_Producto_Lote = { type: 'Model', ModelObject: () => new BasicDatosCompra(), hiddenInTable: true };
}
export { Detalle_Compra_ModelComponent };
class BasicDatosCompra {
    /**@type {ModelProperty}*/ Model = { type: 'text', require: false };
    /**@type {ModelProperty}*/ Serie = { type: 'text', require: false };
}

