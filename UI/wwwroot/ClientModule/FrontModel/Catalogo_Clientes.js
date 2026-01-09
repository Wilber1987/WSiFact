import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";

class Catalogo_Clientes_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Codigo_cliente = { type: 'number', primary: true };
    /**@type {ModelProperty} */ Primer_nombre = { type: 'text' };
    /**@type {ModelProperty} */ Segundo_nombre = { type: 'text', hiddenFilter: true, require: false };
    /**@type {ModelProperty} */ Primer_apellido = { type: 'text' };
    /**@type {ModelProperty} */ Segundo_apellidio = { type: 'text', require: false };
    Catalogo_Tipo_Identificacion = {
        type: 'WSELECT', ModelObject: () => new Catalogo_Tipo_Identificacion_ModelComponent(), label: "Tipo Identificación",
        hiddenFilter: true, hiddenInTable: true
    };
    /**@type {ModelProperty} */ Identificacion = { type: 'text' };
    Sexo = {
        type: 'select',
        Dataset: [{ id: "Masculino", Descripcion: "Masculino" }, { id: "Femenino", Descripcion: "Femenino" }], hiddenInTable: true, hiddenFilter: true
    };
    /**@type {ModelProperty} */ Fecha_nacimiento = { type: 'date', hiddenInTable: true, hiddenFilter: true, hiddenInTable: true };
    /**@type {ModelProperty} */ Id_departamento = { type: 'number', hiddenInTable: true, hiddenFilter: true, hidden: true };
    /**@type {ModelProperty} */ Id_municipio = { type: 'number', hiddenInTable: true, hiddenFilter: true, hidden: true };
    /**@type {ModelProperty} */ Correo = { type: 'text', hiddenInTable: true, hiddenFilter: true, require: false };
    /**@type {ModelProperty} */ Operadora_celular = { type: 'select', Dataset: ["Tigo", "Claro"], hiddenInTable: true, hiddenFilter: true };
    /**@type {ModelProperty} */ Telefono = { type: 'tel', hiddenInTable: true, hiddenFilter: true };
    /**@type {ModelProperty} */ Direccion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    /**@type {ModelProperty} */ Hora = { type: 'text', hiddenInTable: true, hiddenFilter: true, hidden: true };
    /**@type {ModelProperty} */ Fecha = { type: 'date', hiddenInTable: true, hiddenFilter: true, hidden: true };
    /**@type {ModelProperty} */ Observaciones = { type: 'text', hiddenInTable: true, hiddenFilter: true, hidden: true };
    /**@type {ModelProperty} */ Estado_civil = { type: 'select', Dataset: ["Soltero", "Casado", "Unión libre", "Viudo"], hiddenInTable: true, hiddenFilter: true };
}
export { Catalogo_Clientes_ModelComponent }

class Catalogo_Tipo_Identificacion_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Id_tipo_identificacion = { type: 'number', primary: true };
    /**@type {ModelProperty} */ Descripcion = { type: 'text' };
    /**@type {ModelProperty} */ Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Tipo_Identificacion_ModelComponent }


class Catalogo_Tipo_Identificacion extends EntityClass {
    /**
     * @param {Partial<Catalogo_Tipo_Identificacion>} [props]
     */
    constructor(props) {
        super(props, 'EntityDbo');
        Object.assign(this, props);
    }
    /**@type {number?}*/ Id_tipo_identificacion = null;
    /**@type {string?}*/ Descripcion = null;
    /**@type {string?}*/ Estado = null; // "ACTIVO" | "INACTIVO"
}
export { Catalogo_Tipo_Identificacion }

class Catalogo_Clientes extends EntityClass {
    /**
     * @param {Partial<Catalogo_Clientes>} [props]
     */
    constructor(props) {
        super(props, 'EntityDbo');
        Object.assign(this, props);
    }
    /**@type {number?}*/ Codigo_cliente = null;
    /**@type {string?}*/ Primer_nombre = null;
    /**@type {string?}*/ Segundo_nombre = null;
    /**@type {string?}*/ Primer_apellido = null;
    /**@type {string?}*/ Segundo_apellidio = null;
    /**@type {Catalogo_Tipo_Identificacion?}*/ Catalogo_Tipo_Identificacion = null;
    /**@type {string?}*/ Identificacion = null;
    /**@type {string?}*/ Sexo = null; // "Masculino" | "Femenino"
    /**@type {Date|string?}*/ Fecha_nacimiento = null;
    /**@type {number?}*/ Id_departamento = null;
    /**@type {number?}*/ Id_municipio = null;
    /**@type {string?}*/ Correo = null;
    /**@type {string?}*/ Operadora_celular = null; // "Tigo" | "Claro"
    /**@type {string?}*/ Telefono = null;
    /**@type {string?}*/ Direccion = null;
    /**@type {string?}*/ Hora = null;
    /**@type {Date|string?}*/ Fecha = null;
    /**@type {string?}*/ Observaciones = null;
    /**@type {string?}*/ Estado_civil = null; // "Soltero" | "Casado" | "Unión libre" | "Viudo"
}
export { Catalogo_Clientes }