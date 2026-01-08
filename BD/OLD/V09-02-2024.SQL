EXEC EMPRE_SA.sys.sp_rename N'EMPRE_SA.dbo.Detail_Prendas.pprenda',
N'monto_aprobado_cordobas',
'COLUMN';

ALTER TABLE
    EMPRE_SA.dbo.Detail_Prendas
ADD
    monto_aprobado_dolares float NULL;

INSERT INTO
    EMPRE_SA.dbo.Categoria_Cuentas (descripcion)
VALUES
(N'EMPEÑOS');

INSERT INTO
    EMPRE_SA.dbo.Categoria_Cuentas (descripcion)
VALUES
(N'PRESTAMOS');

INSERT INTO
    EMPRE_SA.dbo.Catalogo_Cuentas (
        nombre,
        tipo_cuenta,
        id_sucursal,
        id_categoria,
        saldo,
        saldo_dolares,
        permite_dolares,
        permite_cordobas
    )
VALUES
(N'EMPEÑO DE ARTICULOS', N'PAGO', 1, 9, 0, 0, 1, 1);

--pendientes

ALTER TABLE EMPRE_SA.facturacion.Transaccion_Factura ADD total_cordobas float NULL;
ALTER TABLE EMPRE_SA.facturacion.Transaccion_Factura ADD Moneda varchar(100) NULL;
INSERT INTO EMPRE_SA.administrative_access.Transactional_Configuraciones
(Nombre, Descripcion, Valor, Tipo_Configuracion)
VALUES(N'LOGO', N'Logo de encabezado de página', NULL, N'THEME');

EXEC EMPRE_SA.sys.sp_rename N'EMPRE_SA.dbo.Catalogo_Cambio_Dolar', N'Catalogo_Cambio_Divisa', 'OBJECT';
ALTER TABLE EMPRE_SA.dbo.Catalogo_Cambio_Divisa ADD Moneda varchar(250) NULL;
UPDATE Catalogo_Cambio_Divisa set Moneda = 'DOLAR'


ALTER TABLE EMPRE_SA.dbo.Tbl_Cuotas ADD Estado nvarchar(100) NULL;

UPDATE EMPRE_SA.dbo.Tbl_Cuotas
SET Estado=N'PENDIENTE'

UPDATE EMPRE_SA.administrative_access.Transactional_Configuraciones
SET Nombre=N'INTERES_NETO_CORRIENTE', Descripcion=N'Gestiones crediticias', Valor=N'1', Tipo_Configuracion=N'INTERESES'
WHERE Id_Configuracion=9;


ALTER TABLE EMPRE_SA.dbo.Transaction_Contratos ADD DesgloseIntereses nvarchar(MAX) NULL;
UPDATE EMPRE_SA.[security].Security_Users
SET  Estado=N'ACTIVO', Id_Sucursal=1

UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'CAJA 1'
WHERE id_categoria=1;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'CAJA 2'
WHERE id_categoria=2;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'CAJA_CHICA'
WHERE id_categoria=3;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'CAJA_GENERAL'
WHERE id_categoria=4;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'BANCO'
WHERE id_categoria=5;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'FACTURAS_CONTRATOS'
WHERE id_categoria=6;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'FACTURAS_VENTAS'
WHERE id_categoria=7;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'OBLIGACIONES'
WHERE id_categoria=8;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'EMPEÑOS'
WHERE id_categoria=9;
UPDATE EMPRE_SA.dbo.Categoria_Cuentas
SET descripcion=N'PRESTAMOS'
WHERE id_categoria=10;

DELETE FROM EMPRE_SA.dbo.Categoria_Cuentas
WHERE id_categoria=1009;
DELETE FROM EMPRE_SA.dbo.Categoria_Cuentas
WHERE id_categoria=1010;