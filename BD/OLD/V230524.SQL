ALTER TABLE facturacion.Transaccion_Factura ADD Motivo_Anulacion varchar(500) NULL;


INSERT INTO
    administrative_access.Transactional_Configuraciones (
        Nombre,
        Descripcion,
        Valor,
        Tipo_Configuracion
    )
VALUES
    (
        N'CEDULA_APODERADO',
        N'Cédula del apoderado la empresa',
        N'000-000000.00000U',
        N'GENERAL_DATA'
    );

INSERT INTO
    administrative_access.Transactional_Configuraciones (
        Nombre,
        Descripcion,
        Valor,
        Tipo_Configuracion
    )
VALUES
    (
        N'APODERADO_VICEPRESIDENTE',
        N'Nombre del viceprecidente de la empresa',
        N' Juan José Villavicencio Navarro',
        N'GENERAL_DATA'
    );

INSERT INTO
    administrative_access.Transactional_Configuraciones (
        Nombre,
        Descripcion,
        Valor,
        Tipo_Configuracion
    )
VALUES
    (
        N'DATOS_APODERADO_VICEPRESIDENTE',
        N'Resumen de datos del viceprecidente de la empresa',
        N'....',
        N'GENERAL_DATA'
    );

INSERT INTO
    administrative_access.Transactional_Configuraciones (
        Nombre,
        Descripcion,
        Valor,
        Tipo_Configuracion
    )
VALUES
    (
        N'FIRMA_DIGITAL_APODERADO_VICEPRESIDENTE',
        N'Firma del viceprecidente de la empresa',
        N'',
        N'GENERAL_DATA'
    );



INSERT INTO
    administrative_access.Transactional_Configuraciones (
        Nombre,
        Descripcion,
        Valor,
        Tipo_Configuracion
    )
VALUES
    (
        N'CEDULA_APODERADO_VICEPRESIDENTE',
        N'Cédula del viceprecidente de la empresa',
        N'000-000000.00000U',
        N'GENERAL_DATA'
    );