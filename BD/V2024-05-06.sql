drop table  EMPRE_SA.dbo.Tbl_Acta_Entrega

CREATE TABLE EMPRE_SA.dbo.Tbl_Acta_Entrega (
	Id_Acta_Entrega int IDENTITY(0,1) PRIMARY KEY,
	Fecha datetime NULL,
	Observaciones nvarchar(MAX) NULL,
	numero_contrato int NULL,
	numero_prenda int NULL,
    Id_Sucursal INT,
    Id_Transaccion INT,
	Estado nvarchar(100) NULL,
	CONSTRAINT Tbl_Acta_Entrega_FK FOREIGN KEY (numero_contrato) REFERENCES EMPRE_SA.dbo.Transaction_Contratos(numero_contrato),
	CONSTRAINT Tbl_Acta_Entrega_FK_1 FOREIGN KEY (numero_prenda) REFERENCES EMPRE_SA.dbo.Detail_Prendas(numero_prenda),
	CONSTRAINT Tbl_Acta_Entrega_FK_2 FOREIGN KEY (Id_Sucursal) REFERENCES EMPRE_SA.dbo.Catalogo_Sucursales(Id_Sucursal),
    CONSTRAINT Tbl_Acta_Entrega_FK_3 FOREIGN KEY (Id_Transaccion) REFERENCES EMPRE_SA.facturacion.Tbl_Transaccion(Id_Transaccion)
	
);


drop table facturacion.Tbl_Movimientos_Almacen

CREATE TABLE facturacion.Tbl_Movimientos_Almacen (
    Id_Movimiento INT IDENTITY(1,1) PRIMARY KEY,
    Id_Lote_Original INT,
    Id_Lote_Destino INT,
    Tipo_Movimiento NVARCHAR(20), -- Entrada, Salida, Transferencia
    Cantidad FLOAT,
    Id_Transaccion INT,
    Fecha DATETIME DEFAULT GETDATE(),
    Observaciones NVARCHAR(MAX) NULL,    
    Estado  NVARCHAR(100),
    Id_User INT NULL,
    Id_Sucursal INT,
    FOREIGN KEY (Id_Lote_Original) REFERENCES facturacion.Tbl_Lotes(Id_Lote),
    FOREIGN KEY (Id_Lote_Destino) REFERENCES facturacion.Tbl_Lotes(Id_Lote),
    CONSTRAINT Tbl_mov_Entrega_FK_3 FOREIGN KEY (Id_Transaccion) REFERENCES EMPRE_SA.facturacion.Tbl_Transaccion(Id_Transaccion)
);

drop table facturacion.Tbl_Bajas_Almacen

CREATE TABLE facturacion.Tbl_Bajas_Almacen (
    Id_Baja INT IDENTITY(1,1) PRIMARY KEY,
    Id_Lote INT,
    Id_Sucursal INT,
    Motivo_Baja  NVARCHAR(100),
    Estado  NVARCHAR(100),
    Id_Transaccion INT,
    Cantidad FLOAT,
    Fecha DATETIME DEFAULT GETDATE(),
    Observaciones NVARCHAR(MAX) NULL,
    Id_User INT NULL,
    FOREIGN KEY (Id_Lote) REFERENCES facturacion.Tbl_Lotes(Id_Lote),
    CONSTRAINT Tbl_baja_Entrega_FK_2 FOREIGN KEY (Id_Sucursal) REFERENCES EMPRE_SA.dbo.Catalogo_Sucursales(Id_Sucursal),
    CONSTRAINT Tbl_baja_Entrega_FK_3 FOREIGN KEY (Id_Transaccion) REFERENCES EMPRE_SA.facturacion.Tbl_Transaccion(Id_Transaccion)
);


ALTER TABLE EMPRE_SA.facturacion.Tbl_Transaccion ADD Estado varchar(100) NULL;

ALTER TABLE EMPRE_SA.facturacion.Tbl_Lotes ADD Estado nvarchar(100) ;

ALTER TABLE EMPRE_SA.facturacion.Tbl_Lotes ADD Estado nvarchar(100);
update  EMPRE_SA.facturacion.Tbl_Lotes set Estado = 'ACTIVO'

