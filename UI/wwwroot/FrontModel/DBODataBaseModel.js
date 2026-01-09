
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
    Id_estado_articulo = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Descripcion = { type: 'text', hiddenInTable: true };
    Porcentaje_compra = { type: 'number' };
    Porcentaje_empeno = { type: 'number' };
}
export { Catalogo_Estados_Articulos }

//TODO ELIMINAR A POSTERIOR LO DE LOS AGENTES
class Catalogo_Agentes extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_agente = { type: 'number', primary: true };
    Identificacion = { type: 'text', hiddenFilter: true };
    Nombre = { type: 'text', label: "nombres y apellidos" };
    Telefono = { type: 'text' };
    Fecha = { type: 'date', hiddenFilter: true, hiddenInTable: true };
    Direccion = { type: 'textarea', hiddenInTable: true };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
    Catalogo_Tipo_Agente = { type: 'WSELECT', ModelObject: () => new Catalogo_Tipo_Agente() };
}
export { Catalogo_Agentes }

class Catalogo_Clasificacion_Cliente extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_clasificacion = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    Porcentaje = { type: 'number' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Clasificacion_Cliente }

class Catalogo_Clasificacion_Interes extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_clasificacion_interes = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
    Porcentaje = { type: 'number' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
}
export { Catalogo_Clasificacion_Interes }


class Catalogo_Categoria_ModelComponent extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_categoria = { type: 'number', primary: true };
    Tipo = { type: 'text' };
    Descripcion = { type: 'text', hiddenFilter: true, require: false };
    Plazo_limite = { type: 'number' };
    Prioridad = { type: 'number', hiddenInTable: true };
}
export { Catalogo_Categoria_ModelComponent }

class Condicion_Laboral_Cliente extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id = { type: 'number', primary: true };
    Fecha_ingreso = { type: 'date' };
    Ocupacion_cargo = { type: 'text' };
    Nombre_empresa = { type: 'text' };
    Ingresos_mensuales = { type: 'number' };
    Direccion = { type: 'text' };
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
    Numero_contrato = { type: "number", primary: true };
    Catalogo_Clientes = { type: 'WSELECT', ModelObject: () => new Catalogo_Clientes_ModelComponent() };
    Fecha_contrato = { type: "date", hiddenFilter: true };
    Fecha_cancelar = { type: "date", hiddenInTable: true, hiddenFilter: true };
    Monto = { type: "MONEY", label: "monto $", hiddenInTable: true, hiddenFilter: true };
    Interes = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "interés $" };
    Mora = { type: "PERCENTAGE", hiddenInTable: true, hiddenFilter: true };
    Estado = { type: "Select", Dataset: ["ACTIVO", "CANCELADO", "ANULADO", "VENCIDO"] };
    Fecha_vencimiento = { type: "date", hiddenFilter: true };
    Codigo_cliente = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Saldo = { type: "MONEY", label: "saldo $", hiddenFilter: true, hiddenInTable: true };
    Abonos = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Tipo = { type: "text", hiddenFilter: true };
    Entregado = { type: "text", hiddenInTable: true, hiddenFilter: true };
    Interes_actual = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Observaciones = { type: "text", hiddenInTable: true, hiddenFilter: true };
    Iva = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Descuento = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Tasa_cambio = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "tasa cambio C$" };
    Tasa_cambio_compra = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "tasa cambio compra C$" };
    Id_agente = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Plazo = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Cuotafija = { type: "MONEY", hiddenInTable: true, hiddenFilter: true, label: "cuota fija C$" };
    Cuotafija_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Tasa_hoy = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Motivo_anulacion = { type: "text", hiddenInTable: true, hiddenFilter: true };
    Valoracion_compra_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_compra_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_empeño_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Valoracion_empeño_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Tasas_interes = { type: "number", hiddenInTable: true, hiddenFilter: true };
    Gestion_crediticia = { type: "PERCENTAGE", hiddenInTable: true, hiddenFilter: true };

    Fecha = { type: "date", hidden: true, hiddenFilter: true };
    Total_pagar_cordobas = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Total_pagar_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    //interes_dolares = { type: "MONEY", hiddenInTable: true, hiddenFilter: true };
    Id_User = { type: "number", hidden: true, hiddenFilter: true };
    Reestructurado = { type: "number", hiddenFilter: true };
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
    Numero_prenda = { type: 'number', primary: true };
    Numero_contrato_OLD = { type: 'number', hidden: true };
    Descripcion = { type: 'text' };
    Tipo = { type: 'text', hidden: true };
    Marca = { type: 'text' };
    Serie = { type: 'text', require: true };
    Modelo = { type: 'text' };
    Monto_aprobado_cordobas = { type: 'money', label: "Monto aprob. cordobas", disabled: true };
    Monto_aprobado_dolares = { type: 'money', label: "Monto aprob. dolares", disabled: true };
    Iva = { type: 'text', hidden: true };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"], hiddenInTable: true };
    Precio_venta = { type: 'money', hiddenInTable: true, hidden: true };
    En_manos_de = { type: 'select', Dataset: ["ACREEDOR", "DEUDOR"], hiddenInTable: true };
    Color = { type: 'text' };
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
    Capacidad_cilindros = { type: 'text' };
    Cantidad_cilindros = { type: 'text' };
    Cantidad_pasajeros = { type: 'text' };
    Year_vehiculo = { type: 'number' };
    Montor = { type: 'text', label: "N° Motor" };
    Chasis = { type: 'text' };
    Placa = { type: 'text' };
    Circuacion = { type: 'text' };
    Defectuoso = { type: 'text', hidden: true };
    Fecha_aut_descuento = { type: 'date', hidden: true };
    Defecto = { type: 'text', hidden: true };
    Porcentage_descuento_maximo = { type: 'number', hidden: true };
    Fecha_seguro = { type: 'date', label: "Fecha Vencimiento Seguro" };
    Combustible = { type: 'text' };
    Uso = { type: 'select', Dataset: ["PRIVADO", "PARTICULAR"], hiddenInTable: true };
    Servicio = { type: 'select', Dataset: ["PRIVADO", "PARTICULAR"], hiddenInTable: true };

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
    Id_cuentas = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Saldo = { type: 'number', disabled: true, hiddenInTable: true, require: false };
    Saldo_dolares = { type: 'number', disabled: true, hiddenInTable: true, require: false };
    Permite_dolares = { type: "checkbox", require: false, defaultValue: true };
    Permite_cordobas = { type: "checkbox", require: false, defaultValue: true };
    Tipo_cuenta = { type: 'select', Dataset: ['PROPIA', 'PAGO', 'EXTERNA'] };
    Catalogo_Sucursales = { type: 'WSELECT', ModelObject: () => new Catalogo_Sucursales_ModelComponent() };
    Categoria_Cuentas = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
}
export { Catalogo_Cuentas }

class Categoria_Cuentas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_categoria = { type: "number", primary: true };
    Descripcion = { type: "text" };
}
export { Categoria_Cuentas }

class Permisos_Cuentas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_permiso = { type: "number", primary: true };
    Categoria_Cuentas_Origen = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
    Categoria_Cuentas_Destino = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };
    Permite_debito = { type: "checkbox", require: false };
    Permite_credito = { type: "checkbox", require: false };
    //Categoria_Cuentas = { type: 'WSELECT', ModelObject: () => new Categoria_Cuentas() };//todo eliminar
}
export { Permisos_Cuentas }

class Catalogo_Departamento extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_departamento = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Ponderacion = { type: 'number', hiddenInTable: true, hiddenFilter: true };
    Puntaje = { type: 'number', hiddenInTable: true, hiddenFilter: true };
    Clasificacion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    Catalogo_Nacionalidad = { type: 'WSELECT', ModelObject: () => new Catalogo_Nacionalidad(), hiddenInTable: true };

    static async ChargeMunicipios(editObject, /** @type {WForm} */ Form) {
        const municipios = await new Catalogo_Municipio({
            FilterData: [{
                PropName: "Id_departamento", FilterType: "in", Values: [editObject.Catalogo_Departamento.Id_departamento.toString()]
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
        Form.Controls.Catalogo_Municipio.selectedItems = municipios[0] ? [municipios[0]] : [];
        Form.Controls.Catalogo_Municipio.Draw();
    }
}
export { Catalogo_Departamento }
class Catalogo_Inversores extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_inversor = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Identificacion = { type: 'text' };
    Telefono = { type: 'tel' };
    Stado_civil = { type: 'select', Dataset: ["Soltero", "Casado"], hiddenInTable: true, hiddenFilter: true };
    Direccion = { type: 'text', hiddenInTable: true, hiddenFilter: true };
    Catalogo_Municipio = { type: 'WSELECT', ModelObject: () => new Catalogo_Municipio(), hiddenInTable: true, hiddenFilter: true };
    Catalogo_Nacionalidad = { type: 'WSELECT', ModelObject: () => new Catalogo_Nacionalidad(), hiddenInTable: true, hiddenFilter: true };
}
export { Catalogo_Inversores }
class Catalogo_Municipio extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_municipio = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Catalogo_Departamento = { type: 'WSELECT', ModelObject: () => new Catalogo_Departamento() };
}
export { Catalogo_Municipio }
class Catalogo_Nacionalidad extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_nacionalidad = { type: 'number', primary: true };
    Nombre = { type: 'text' };
    Nacionalidad = { type: 'text' };
    Ponderacion = { type: 'number', hiddenFilter: true };
    Puntaje = { type: 'number', hiddenFilter: true };
    Clasificacion = { type: 'text' };
}
export { Catalogo_Nacionalidad }
class Catalogo_Profesiones extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_profesion = { type: 'number', primary: true };
    Nombre = { type: 'text' };
}
export { Catalogo_Profesiones }
class id_tipo_transaccion extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_tipo_transaccion = { type: 'number', primary: true };
    Descripcion = { type: 'text' };
}
export { id_tipo_transaccion }
class Transaction_Contratos_Inversionistas extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Numero_cont = { type: 'number', primary: true };
    Fecha = { type: 'date' };
    Taza = { type: 'number' };
    Monto_inicial = { type: 'number' };
    Nombre_sustituto = { type: 'text' };
    Identificacion_sustituto = { type: 'text' };
    Direccion_sustituto = { type: 'text' };
    Departamento_sus = { type: 'text' };
    Municipio_sustituto = { type: 'text' };
    Fecha_pago = { type: 'date' };
    Fecha_ultimo_pago = { type: 'date' };
    Saldo = { type: 'number' };
    Montointeres = { type: 'number' };
    Interes = { type: 'number' };
    Fecha_restructura = { type: 'date' };
    Catalogo_Inversores = { type: 'WSELECT', ModelObject: () => new Catalogo_Inversores() };
}
export { Transaction_Contratos_Inversionistas }
class Transaction_Egresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Numero_egreso = { type: 'number', primary: true };
    Monto = { type: 'number' };
    Fecha = { type: 'date' };
    Descripcion = { type: 'text' };
    Nombre = { type: 'text' };
    Banco = { type: 'text' };
    Anulado = { type: 'text' };
    Observaciones = { type: 'text' };
    Tc = { type: 'number' };
    Dolar = { type: 'number' };
    Fanulado = { type: 'date' };
}
export { Transaction_Egresos }

class Transaction_Ingresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Numero_ingreso = { type: 'number', primary: true };
    Monto = { type: 'number' };
    Fecha = { type: 'date' };
    Descripcion = { type: 'text' };
    Nombre = { type: 'text' };
    Que = { type: 'number' };
    Anulado = { type: 'text' };
    Observaciones = { type: 'text' };
    Tzcambio = { type: 'number' };
    Total = { type: 'number' };
    Fanulado = { type: 'date' };
}
export { Transaction_Ingresos }
class Transaction_Ingresos_Egresos extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id_transaccion = { type: 'number', primary: true };
    Monto_dolares = { type: 'number' };
    Tasa_cambio = { type: 'number' };
    Monto_total = { type: 'number' };
    Descripcion = { type: 'text' };
    Nombre = { type: 'text' };
    Que = { type: 'number' };
    Fecha_anulado = { type: 'date' };
    Banco = { type: 'text' };
    Estado = { type: 'select', Dataset: ["ACTIVO", "INACTIVO"] };
    Numero_original = { type: 'number' };
    Fecha = { type: 'date' };
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
    /**@type {ModelProperty}*/
    Catalogo_Clientes = { type: 'WSELECT', ModelObject: () => new Catalogo_Clientes_ModelComponent(), ForeignKeyColumn: "id_cliente", hiddenInTable: true };
    Id_factura = { type: "number", primary: true, label: "Número recibo" };
    Consecutivo = { type: "text" };
    Tipo = { type: "text", hidden: true };
    Concepto = { type: "text", hiddenFilter: true };
    Tasa_cambio = { type: "money", label: "tasa_cambio C$", hiddenFilter: true };
    Moneda = { type: "text", label: "Moneda", hiddenFilter: true };
    Total = { type: "money", hiddenFilter: true };
    Estado = { type: "select", Dataset: ["ANULADO", "ACTIVO"] };
    Id_cliente = { type: "number", hidden: true };
    Id_sucursal = { type: "number", hidden: true };
    Fecha = { type: "date" };
    Detalle_Factura_Recibo = { type: 'MasterDetail', label: "Cuotas Pagadas", label: "Detalle recibos", ModelObject: () => new Detalle_Factura_Recibo(), hiddenFilter: true };
    Factura_contrato = { type: 'model', label: "Datos del contrato al momento del pago", ModelObject: () => new Factura_contrato() };
    /**@type {Boolean}*/ IsAnulable;

}
export { Transaccion_Factura }

class Factura_contrato {
    constructor(props) {
        Object.assign(this, props);
    }
    Numero_contrato = { type: "number" };
    Cuotas_pendientes = { type: "number" };
    Saldo_anterior = { type: "money" };
    Saldo_actual = { type: "money" };
    Mora = { type: "money" };
    Interes_demas_cargos_pagar = { type: "money" };
    Abono_capital = { type: "money" };
    Total = { type: "money" };
    Tasa_cambio = { type: "number" };

}
export { Factura_contrato }

class Detalle_Factura_Recibo extends EntityClass {
    constructor(props) {
        super(props, 'EntityDBO');
        Object.assign(this, props);
    }
    Id = { type: "number", primary: true };
    Id_factura = { type: "number", hidden: true };
    Id_cuota = { type: "number", hidden: true };
    Concepto = { type: "text" };
    Total_cuota = { type: "money" };
    Monto_pagado = { type: "money", hidden: true };
    Capital_restante = { type: "money", hidden: true };

    Tasa_cambio = { type: "money" };
}
export { Detalle_Factura_Recibo }
