//@ts-check
import { Catalogo_Tipo_Identificacion } from "../../ClientModule/FrontModel/Catalogo_Clientes.js";
import { Catalogo_Departamento, Catalogo_Municipio } from "../../FrontModel/DBODataBaseModel.js";
import { WForm } from "../../WDevCore/WComponents/WForm.js";
// @ts-ignore
import { ModelProperty } from "../../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";


export class Catalogo_Clientes_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */  codigo_cliente = { type: 'number', primary: true };
    primer_nombre = { type: 'text' };
    segundo_nombre = { type: 'text', hiddenFilter: true, require: false };
    primer_apellido = { type: 'text' };
    segundo_apellidio = { type: 'text', require: false };
    Catalogo_Tipo_Identificacion = {
        type: 'WSELECT', ModelObject: () => new Catalogo_Tipo_Identificacion(), label: "Tipo Identificación",
        hiddenFilter: true, hiddenInTable: true
    };
    identificacion = { type: 'text' };
    sexo = {
        type: 'select',
        Dataset: [{ id: "Masculino", Descripcion: "Masculino" }, { id: "Femenino", Descripcion: "Femenino" }], hiddenInTable: true, hiddenFilter: true
    };
    correo = { type: 'text', hiddenInTable: true, hiddenFilter: true, require: false };
    telefono = { type: 'tel', hiddenInTable: true, hiddenFilter: true, require: false };
    direccion = { type: 'text', hiddenInTable: true, hiddenFilter: true, require: false };

    Catalogo_Departamento = {
        type: 'WSELECT', require: false, ModelObject: () => new Catalogo_Departamento(), hiddenFilter: true,
        action: async (editObject, /** @type {WForm} */ Form) => {
            await Catalogo_Departamento.ChargeMunicipios(editObject, Form);
        },
        hiddenInTable: true
    };

    Catalogo_Municipio = {
        type: 'WSELECT', require: false, ModelObject: () => new Catalogo_Municipio(), hiddenFilter: true,
        action: async (editObject, /** @type {WForm} */ Form) => {
            const findObject = this.Catalogo_Departamento.Dataset.find(d => d.id_departamento == editObject.Catalogo_Municipio.id_departamento);
            editObject.Catalogo_Departamento = findObject;
            Form.shadowRoot.querySelector("#ControlValueCatalogo_Departamento").selectedItems = [findObject]
            Form.shadowRoot.querySelector("#ControlValueCatalogo_Departamento").Draw();
        },
        hiddenInTable: true
    };


}