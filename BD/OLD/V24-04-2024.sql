CREATE TABLE EMPRE_SA.facturacion.Configuracion_Factura (
	Id_Configuracion int IDENTITY(1,1) NOT NULL,
    Descripcion nvarchar(250),
	Auto_Debito int default false,
	Estado NVARCHAR(10) NULL	
);

INSERT INTO EMPRE_SA.facturacion.Configuracion_Factura (Descripcion, Auto_Debito, Estado)
VALUES ('Permite debitar automáticamente el saldo tras facturar automáticamente', 1, 'ACTIVO');

ALTER TABLE EMPRE_SA.facturacion.Tbl_Lotes ADD Datos_Producto nvarchar(MAX) NULL;
ALTER TABLE EMPRE_SA.facturacion.Tbl_Lotes ADD Detalles nvarchar(500) NULL;

CREATE TABLE facturacion.[Tbl_Transaccion] (
    [Id_Transaccion] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Cantidad] [float] NULL,
    [Id_Lote] [int] NULL,
	[Id_User] [int] NULL,
    [Tipo] [nvarchar](50) NULL,
    [Descripcion] [nvarchar](max) NULL
);

ALTER TABLE facturacion.Tbl_Transaccion
ADD CONSTRAINT FK_Tbl_Transaccion_Tbl_Lotes
FOREIGN KEY (Id_Lote)
REFERENCES facturacion.Tbl_Lotes(Id_Lote);

ALTER TABLE EMPRE_SA.dbo.Transaction_Movimiento ADD id_sucursal int NULL;
ALTER TABLE EMPRE_SA.dbo.Transaction_Movimiento ADD Id_cuenta_origen int NULL;
ALTER TABLE EMPRE_SA.dbo.Transaction_Movimiento ADD Id_cuenta_destino int NULL;


