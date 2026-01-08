import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";

class Catalogo_Clientes extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    codigo_cliente = { type: 'number', primary: true };
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
    fecha_nacimiento = { type: 'date', hiddenInTable: true, hiddenFilter: true, hiddenInTable: true };
    id_departamento = { type: 'number', hiddenInTable: true, hiddenFilter: true, hidden: true };
    id_municipio = { type: 'number', hiddenInTable: true, hiddenFilter: true, hidden: true };
    //id_tipo_identificacion = { type: 'number', hiddenInTable: true, hiddenFilter: true, hidden: true };
    correo = { type: 'text', hiddenInTable: true, hiddenFilter: true, require: false };
    operadora_celular = { type: 'select', Dataset: ["Tigo", "Claro"], hiddenInTable: true, hiddenFilter: true };
    telefono = { type: 'tel', hiddenInTable: true, hiddenFilter: true };
    direccion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    hora = { type: 'text', hiddenInTable: true, hiddenFilter: true, hidden: true };
    fecha = { type: 'date', hiddenInTable: true, hiddenFilter: true, hidden: true };
    observaciones = { type: 'text', hiddenInTable: true, hiddenFilter: true, hidden: true };
    estado_civil = { type: 'select', Dataset: ["Soltero", "Casado", "Unión libre", "Viudo"], hiddenInTable: true, hiddenFilter: true };
    
}
export { Catalogo_Clientes }

class Catalogo_Tipo_Identificacion extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_tipo_identificacion = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Tipo_Identificacion }