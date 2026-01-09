
import { Catalogo_Clientes_ModelComponent } from "../ClientModule/FrontModel/Catalogo_Clientes.js";
import { WForm } from "../WDevCore/WComponents/WForm.js";
import { ModelProperty } from "../WDevCore/WModules/CommonModel.js";
import { EntityClass } from "../WDevCore/WModules/EntityClass.js";
import { Detail_Prendas_Vehiculos } from "./Model.js";
import { Tbl_Cuotas_ModelComponent } from "./ModelComponents.js";
class Catalogo_Estados_Articulos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_estado_articulo = { type: 'number', primary: true };
    nombre = { type: 'text' };
    descripcion = { type: 'text', hiddenInTable: true };
    porcentaje_compra = { type: 'number' };
    porcentaje_empeno = { type: 'number' };
}
export { Catalogo_Estados_Articulos }

//TODO ELIMINAR A POSTERIOR LO DE LOS AGENTES
class Catalogo_Agentes extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_agente = { type: 'number', primary: true };
    identificacion = { type: 'text', hiddenFilter: true };
    nombre = { type: 'text', label: "nombres y apellidos" };
    telefono = { type: 'text' };
    fecha = { type: 'date', hiddenFilter: true, hiddenInTable: true };
    direccion = { type: 'textarea', hiddenInTable: true };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
    Catalogo_Tipo_Agente = { type: 'WSELECT', ModelObject: () => new Catalogo_Tipo_Agente() };
}
export { Catalogo_Agentes }

class Catalogo_Clasificacion_Cliente extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_clasificacion = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    porcentaje = { type: 'number' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Clasificacion_Cliente }

class Catalogo_Clasificacion_Interes extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_clasificacion_interes = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    porcentaje = { type: 'number' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Clasificacion_Interes }


class Catalogo_Categoria_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_categoria = { type: 'number', primary: true };
    tipo = { type: 'text' };
    descripcion = { type: 'text', hiddenFilter: true, require: false };
    plazo_limite = { type: 'number' };
    prioridad = { type: 'number', hiddenInTable: true };
}
export { Catalogo_Categoria_ModelComponent }

class Condicion_Laboral_Cliente extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id = { type: 'number', primary: true };
    fecha_ingreso = { type: 'date' };
    ocupacion_cargo = { type: 'text' };
    nombre_empresa = { type: 'text' };
    ingresos_mensuales = { type: 'number' };
    direccion = { type: 'text' };
    /*Catalogo_Clientes = { type: 'WSELECT', ModelObject: () => new Catalogo_Clientes_ModelComponent() };*/
    Catalogo_Departamento = {
        type: 'WSELECT', ModelObject: () => new Catalogo_Departamento(), hiddenFilter: true,
        action: async (editObject, /** @type {WForm} */ Form) => {
            await Catalogo_Departamento.ChargeMunicipios(editObject, Form);


        },
        hiddenInTable: true
    };
    Catalogo_Municipio = { type: 'WSELECT', ModelObject: () => new Catalogo_Municipio() };


    //Catalogo_Departamento = { type: 'WSELECT', ModelObject: () => new Catalogo_Departamento() };
}
export { Condicion_Laboral_Cliente }

class Catalogo_Tipo_Agente extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_Tipo_Agente = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Tipo_Agente }


class Transaction_Contratos_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    numero_contrato = { type: "number", primary: true };
    Catalogo_Clientes = { type: 'WSELECT', ModelObject: () => new Catalogo_Clientes_ModelComponent() };
    fecha_contrato = { type: "date", hiddenFilter: true };
    fecha_cancelar = { type: "date", hiddenInTable: true, hiddenFilter: true };
    monto = { type: "MONEY", label: "monto $", hiddenInTable: true, hiddenFilter: true };
    interes = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "interés $" };
    mora = { type: "PERCENTAGE", hiddenInTable: true, hiddenFilter: true };
    estado = { type: "Select", Dataset: ["ACTIVO", "CANCELADO", "ANULADO", "VENCIDO"] };
    fecha_vencimiento = { type: "date", hiddenFilter: true };
    codigo_cliente = { type: "number", hiddenInTable: true, hiddenFilter: true };
    saldo = { type: "MONEY", label: "saldo $", hiddenFilter: true, hiddenInTable: true };
    abonos = { type: "number", hiddenInTable: true, hiddenFilter: true };
    tipo = { type: "text", hiddenFilter: true };
    entregado = { type: "text", hiddenInTable: true, hiddenFilter: true };
    interes_actual = { type: "number", hiddenInTable: true, hiddenFilter: true };
    observaciones = { type: "text", hiddenInTable: true, hiddenFilter: true };
    iva = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    descuento = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    taza_cambio = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "tasa cambio C$" };
    taza_cambio_compra = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "tasa cambio compra C$" };
    id_agente = { type: "number", hiddenInTable: true, hiddenFilter: true };
    plazo = { type: "number", hiddenInTable: true, hiddenFilter: true };
    cuotafija = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "cuota fija C$" };
    cuotafija_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    tasa_hoy = { type: "number", hiddenInTable: true, hiddenFilter: true };
    motivo_anulacion = { type: "text", hiddenInTable: true, hiddenFilter: true };
    Valoracion_compra_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_compra_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_empeño_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_empeño_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    tasas_interes = { type: "number", hiddenInTable: true, hiddenFilter: true };
    gestion_crediticia = { type: "PERCENTAGE", hiddenInTable: true, hiddenFilter: true };

    fecha = { type: "date", hidden: true, hiddenFilter: true };
    total_pagar_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    total_pagar_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    //interes_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Id_User = { type: "number", hidden: true, hiddenFilter: true };
    reestructurado = { type: "number", hiddenFilter: true };
    //Catalogo_Agentes = { type: 'WSELECT', ModelObject: () => new Catalogo_Agentes(), hiddenInTable: true, hiddenFilter: true };
    Detail_Prendas = { type: 'MasterDetail', ModelObject: () => new Detail_Prendas_ModelComponent(), hiddenFilter: true };
    Tbl_Cuotas = { type: 'MasterDetail', ModelObject: () => new Tbl_Cuotas_ModelComponent(), hiddenFilter: true };
    Recibos = { type: 'MasterDetail', ModelObject: () => new Transaccion_Factura(), hiddenFilter: true };
    Notas = { type: 'MasterDetail', ModelObject: () => new Notas_de_contrato(), hiddenFilter: true };
}
export { Transaction_Contratos_ModelComponent }

class Notas_de_contrato {
    Fecha = { type: "date" };
    Descripcion = { type: "richtext" };
}

export { Notas_de_contrato }

class Detail_Prendas_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    numero_prenda = { type: 'number', primary: true };
    numero_contrato_OLD = { type: 'number', hidden: true };
    Descripcion = { type: 'text' };
    Tipo = { type: 'text', hidden: true };
    marca = { type: 'text' };
    serie = { type: 'text', require: true };
    modelo = { type: 'text' };
    monto_aprobado_cordobas = { type: 'money', label: "Monto aprob. cordobas", disabled: true };
    monto_aprobado_dolares = { type: 'money', label: "Monto aprob. dolares", disabled: true };
    iva = { type: 'text', hidden: true };
    estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"], hiddenInTable: true };
    precio_venta = { type: 'money', hiddenInTable: true, hidden: true };
    en_manos_de = { type: 'select', Dataset: ["ACREEDOR", "DEUDOR"], hiddenInTable: true };
    color = { type: 'text' };
    Catalogo_Categoria = {
        hiddenInTable: true,
        type: 'WSELECT', ModelObject: () => new Catalogo_Categoria_ModelComponent(), action: (ObjectF, form, InputControl, prop) => {

        }
    };
    /**@type {ModelProperty} */
    Detail_Prendas_Vehiculos = {
        type: 'Model',
        hidden: (element) => { return element.Detail_Prendas_Vehiculos == null || element.Detail_Prendas_Vehiculos == undefined },
        ModelObject: () => new Detail_Prendas_Vehiculos_ModelComponent(),
        EntityModel: () => new Detail_Prendas_Vehiculos()
    };

}
export { Detail_Prendas_ModelComponent }
class Detail_Prendas_Vehiculos_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    capacidad_cilindros = { type: 'text' };
    cantidad_cilindros = { type: 'text' };
    cantidad_pasajeros = { type: 'text' };
    year_vehiculo = { type: 'number' };
    montor = { type: 'text', label: "N° Motor" };
    chasis = { type: 'text' };
    placa = { type: 'text' };
    circuacion = { type: 'text' };
    defectuoso = { type: 'text', hidden: true };
    fecha_aut_descuento = { type: 'date', hidden: true };
    defecto = { type: 'text', hidden: true };
    porcentage_descuento_maximo = { type: 'number', hidden: true };
    fecha_seguro = { type: 'date', label: "Fecha Vencimiento Seguro" };
    combustible = { type: 'text' };
    uso = { type: 'select', Dataset: ["PRIVADO", "PARTICULAR"], hiddenInTable: true };
    servicio = { type: 'select', Dataset: ["PRIVADO", "PARTICULAR"], hiddenInTable: true };

}
export { Detail_Prendas_Vehiculos_ModelComponent }

class Catalogo_Cambio_Divisa_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDbo');
        Object.assign(this, props);
    }
    /**@type {ModelProperty}*/ Id_cambio = { type: 'number', primary: true, hiddenFilter: true };
    /**@type {ModelProperty}*/ Fecha = { type: 'date' };
    /**@type {ModelProperty}*/ Valor_de_compra = { type: 'number', hiddenFilter: true };
    /**@type {ModelProperty}*/ Valor_de_venta = { type: 'number', hiddenFilter: true };
}
export { Catalogo_Cambio_Divisa_ModelComponent }

class Catalogo_Cuentas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_cuentas = { type: 'number', primary: true };
    nombre = { type: 'text' };
    saldo = { type: 'number', disabled: true, hiddenInTable: true, require: false };
    saldo_dolares = { type: 'number', disabled: true, hiddenInTable: true, require: false };
    permite_dolares = { type: "checkbox", require: false, defaultValue: true };
    permite_cordobas = { type: "checkbox", require: false, defaultValue: true };
    tipo_cuenta = { type: 'select', Dataset: ['PROPIA', 'PAGO', 'EXTERNA'] };
    Catalogo_Sucursales = { type: 'WSELECT', ModelObject: () => new Catalogo_Sucursales_ModelComponent() };
    Categoria_Cuentas = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
}
export { Catalogo_Cuentas }

class Categoria_Cuentas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_categoria = { type: "number", primary: true };
    descripcion = { type: "text" };
}
export { Categoria_Cuentas }

class Permisos_Cuentas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_permiso = { type: "number", primary: true };
    Categoria_Cuentas_Origen = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
    Categoria_Cuentas_Destino = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
    permite_debito = { type: "checkbox", require: false };
    permite_credito = { type: "checkbox", require: false };
    //Categoria_Cuentas = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };//todo eliminar
}
export { Permisos_Cuentas }

class Catalogo_Departamento extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_departamento = { type: 'number', primary: true };
    nombre = { type: 'text' };
    ponderacion = { type: 'number', hiddenInTable: true, hiddenFilter: true };
    puntaje = { type: 'number', hiddenInTable: true, hiddenFilter: true };
    clasificacion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    Catalogo_Nacionalidad = { type: 'WSELECT', ModelObject: () => new Catalogo_Nacionalidad(), hiddenInTable: true };

    static async ChargeMunicipios(editObject, /** @type {WForm} */ Form) {
        const municipios = await new Catalogo_Municipio({
            FilterData: [{
                PropName: "id_departamento", FilterType: "in", Values: [editObject.Catalogo_Departamento.id_departamento.toString()]
            }]
        }).Get();
        Form.ModelObject.Catalogo_Municipio.Dataset = municipios;
        if (municipios.length == 0) {
            Form.ModelObject.Catalogo_Municipio.require = false;
        } else {
            Form.ModelObject.Catalogo_Municipio.require = true;
        }
        //this.Tbl_Servicios_editObject.disabled = false;
        editObject.Catalogo_Municipio = municipios[0];
        Form.Controls.Catalogo_Municipio.Dataset = municipios;
        Form.Controls.Catalogo_Municipio.selectedItems = municipios[0] ?  [municipios[0]] : [];
        Form.Controls.Catalogo_Municipio.Draw();
    }
}
export { Catalogo_Departamento }
class Catalogo_Inversores extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_inversor = { type: 'number', primary: true };
    nombre = { type: 'text' };
    identificacion = { type: 'text' };
    telefono = { type: 'tel' };
    stado_civil = { type: 'select', Dataset: ["Soltero", "Casado"], hiddenInTable: true, hiddenFilter: true };
    direccion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    Catalogo_Municipio = { type: 'WSELECT', ModelObject: () => new Catalogo_Municipio(), hiddenInTable: true, hiddenFilter: true };
    Catalogo_Nacionalidad = { type: 'WSELECT', ModelObject: () => new Catalogo_Nacionalidad(), hiddenInTable: true, hiddenFilter: true };
}
export { Catalogo_Inversores }
class Catalogo_Municipio extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_municipio = { type: 'number', primary: true };
    nombre = { type: 'text' };
    Catalogo_Departamento = { type: 'WSELECT', ModelObject: () => new Catalogo_Departamento() };
}
export { Catalogo_Municipio }
class Catalogo_Nacionalidad extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_nacionalidad = { type: 'number', primary: true };
    nombre = { type: 'text' };
    nacionalidad = { type: 'text' };
    ponderacion = { type: 'number', hiddenFilter: true };
    puntaje = { type: 'number', hiddenFilter: true };
    clasificacion = { type: 'text' };
}
export { Catalogo_Nacionalidad }
class Catalogo_Profesiones extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_profesion = { type: 'number', primary: true };
    nombre = { type: 'text' };
}
export { Catalogo_Profesiones }
class id_tipo_transaccion extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_tipo_transaccion = { type: 'number', primary: true };
    descripcion = { type: 'text' };
}
export { id_tipo_transaccion }
class Transaction_Contratos_Inversionistas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    numero_cont = { type: 'number', primary: true };
    fecha = { type: 'date' };
    taza = { type: 'number' };
    monto_inicial = { type: 'number' };
    nombre_sustituto = { type: 'text' };
    identificacion_sustituto = { type: 'text' };
    direccion_sustituto = { type: 'text' };
    departamento_sus = { type: 'text' };
    municipio_sustituto = { type: 'text' };
    fecha_pago = { type: 'date' };
    fecha_ultimo_pago = { type: 'date' };
    saldo = { type: 'number' };
    montointeres = { type: 'number' };
    interes = { type: 'number' };
    fecha_restructura = { type: 'date' };
    Catalogo_Inversores = { type: 'WSELECT', ModelObject: () => new Catalogo_Inversores() };
}
export { Transaction_Contratos_Inversionistas }
class Transaction_Egresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    numero_egreso = { type: 'number', primary: true };
    monto = { type: 'number' };
    fecha = { type: 'date' };
    descripcion = { type: 'text' };
    nombre = { type: 'text' };
    banco = { type: 'text' };
    anulado = { type: 'text' };
    observaciones = { type: 'text' };
    tc = { type: 'number' };
    dolar = { type: 'number' };
    fanulado = { type: 'date' };
}
export { Transaction_Egresos }

class Transaction_Ingresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    numero_ingreso = { type: 'number', primary: true };
    monto = { type: 'number' };
    fecha = { type: 'date' };
    descripcion = { type: 'text' };
    nombre = { type: 'text' };
    que = { type: 'number' };
    anulado = { type: 'text' };
    observaciones = { type: 'text' };
    tzcambio = { type: 'number' };
    total = { type: 'number' };
    fanulado = { type: 'date' };
}
export { Transaction_Ingresos }
class Transaction_Ingresos_Egresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id_transaccion = { type: 'number', primary: true };
    monto_dolares = { type: 'number' };
    tasa_cambio = { type: 'number' };
    monto_total = { type: 'number' };
    descripcion = { type: 'text' };
    nombre = { type: 'text' };
    que = { type: 'number' };
    fecha_anulado = { type: 'date' };
    banco = { type: 'text' };
    estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
    numero_original = { type: 'number' };
    fecha = { type: 'date' };
    Catalogo_Cuentas = { type: 'WSELECT', ModelObject: () => new Catalogo_Cuentas() };
}
export { Transaction_Ingresos_Egresos }
class Catalogo_Sucursales_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_Sucursal = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Descripcion = { type: 'text', hiddenInTable: true };
    Direccion = { type: 'text' };
    Catalogo_Municipio = { type: 'WSELECT', ModelObject: () => new Catalogo_Municipio(), hiddenInTable: true };

}
export { Catalogo_Sucursales_ModelComponent }

class Datos_Configuracion extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Encabezado = { type: 'text' };
    AutoDebito = { type: 'checkbox' };
    Catalogo_Sucursales = { type: 'WSELECT', ModelObject: () => new Catalogo_Sucursales_ModelComponent() };
}
export { Datos_Configuracion }





class Transaccion_Factura extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    /**@type {ModelProperty}*/
    Catalogo_Clientes = { type: 'WSELECT', ModelObject: () => new Catalogo_Clientes_ModelComponent(), ForeignKeyColumn: "id_cliente", hiddenInTable: true };
    id_factura = { type: "number", primary: true, label: "Número recibo" };
    Consecutivo = { type: "text" };
    tipo = { type: "text", hidden: true };
    concepto = { type: "text", hiddenFilter: true };
    tasa_cambio = { type: "money", label: "tasa_cambio C$", hiddenFilter: true };
    Moneda = { type: "text", label: "Moneda", hiddenFilter: true };
    total = { type: "money", hiddenFilter: true };
    estado = { type: "select", Dataset: ["ANULADO", "ACTIVO"] };
    id_cliente = { type: "number", hidden: true };
    id_sucursal = { type: "number", hidden: true };
    fecha = { type: "date" };
    Detalle_Factura_Recibo = { type: 'MasterDetail', label: "Cuotas Pagadas", label: "Detalle recibos", ModelObject: () => new Detalle_Factura_Recibo(), hiddenFilter: true };
    Factura_contrato = { type: 'model', label: "Datos del contrato al momento del pago", ModelObject: () => new Factura_contrato() };
    /**@type {Boolean}*/ IsAnulable;

}
export { Transaccion_Factura }

class Factura_contrato {
    constructor(props) {
        Object.assign(this, props);
    }
    numero_contrato = { type: "number" };
    cuotas_pendientes = { type: "number" };
    saldo_anterior = { type: "money" };
    saldo_actual = { type: "money" };
    mora = { type: "money" };
    interes_demas_cargos_pagar = { type: "money" };
    abono_capital = { type: "money" };
    total = { type: "money" };
    tasa_cambio = { type: "number" };

}
export { Factura_contrato }

class Detalle_Factura_Recibo extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    id = { type: "number", primary: true };
    id_factura = { type: "number", hidden: true };
    id_cuota = { type: "number", hidden: true };
    concepto = { type: "text" };
    total_cuota = { type: "money" };
    monto_pagado = { type: "money", hidden: true };
    capital_restante = { type: "money", hidden: true };

    tasa_cambio = { type: "money" };
}
export { Detalle_Factura_Recibo }
